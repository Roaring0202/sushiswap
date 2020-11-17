import {
  AreaChart,
  BarChart,
  Layout,
  PairTable,
  Search,
  TokenTable,
} from "app/components";
import { Box, Grid, Paper } from "@material-ui/core";
import {
  dayDatasQuery,
  ethPriceQuery,
  getApollo,
  getOneDayEthPrice,
  getPairs,
  getSevenDayEthPrice,
  getTokens,
  pairsQuery,
  tokensQuery,
  useInterval,
} from "app/core";
import { getUnixTime, startOfDay, subMonths } from "date-fns";

import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function IndexPage() {
  const {
    data: { tokens },
  } = useQuery(tokensQuery);

  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  const { data, error } = useQuery(dayDatasQuery, {
    pollInterval: 60000,
    variables: {
      date: getUnixTime(startOfDay(subMonths(Date.now(), 1))),
    },
  });

  // Update every 60 seconds...
  useInterval(
    () =>
      Promise.all([
        getPairs,
        getTokens,
        getOneDayEthPrice,
        getSevenDayEthPrice,
      ]),
    60000
  );

  const [liquidity, volume] = data.dayDatas.reduce(
    (previousValue, currentValue) => {
      const time = new Date(currentValue.date * 1e3).toISOString().slice(0, 10);
      previousValue[0].push({
        time,
        value: parseFloat(currentValue.liquidityUSD),
      });
      previousValue[1].push({
        time,
        value: parseFloat(currentValue.volumeUSD),
      });
      return previousValue;
    },
    [[], []]
  );

  return (
    <Layout>
      <Head>
        <title>Dashboard | SushiSwap Analytics</title>
      </Head>
      <Box mb={3}>
        <Search />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <AreaChart
              title="Liquidity"
              data={liquidity}
              margin={{ top: 100, right: 0, bottom: 0, left: 0 }}
              tooltipDisabled
              overlayEnabled
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <BarChart
              title="Volume"
              data={volume}
              margin={{ top: 100, right: 0, bottom: 0, left: 0 }}
              tooltipDisabled
              overlayEnabled
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <TokenTable title="Top Tokens" tokens={tokens} />
        </Grid>
        <Grid item xs={12}>
          <PairTable title="Top Pairs" pairs={pairs} />
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  // Sushi Swap day data
  await client.query({
    query: dayDatasQuery,
    variables: {
      date: getUnixTime(startOfDay(subMonths(Date.now(), 1))),
    },
  });

  // ethPriceQuery
  await client.query({
    query: ethPriceQuery,
  });

  await getTokens(client);

  await getPairs(client);

  await getOneDayEthPrice(client);

  await getSevenDayEthPrice(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default IndexPage;
