import {
  AppShell,
  Chart,
  Curves,
  KPI,
  LiquidityProviderList,
  PageHeader,
  PairIcon,
} from "app/components";
import {
  Box,
  Grid,
  Paper,
  Typography,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import {
  currencyFormatter,
  getApollo,
  getPool,
  getPoolHistories,
  getPoolIds,
  getPools,
  poolHistoryQuery,
  poolQuery,
} from "app/core";

import Head from "next/head";
import { POOL_DENY } from "app/core/constants";
import { ParentSize } from "@visx/responsive";
import { deepPurple } from "@material-ui/core/colors";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage() {
  const router = useRouter();

  if (router.isFallback) {
    return <AppShell />;
  }

  const classes = useStyles();

  const theme = useTheme();

  const { id } = router.query;

  const {
    data: { pool },
  } = useQuery(poolQuery, {
    variables: {
      id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    data: { poolHistories },
  } = useQuery(poolHistoryQuery, {
    variables: {
      id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    slpAge,
    slpAgeRemoved,
    userCount,
    slpDeposited,
    slpWithdrawn,
    slpAgeAverage,
    slpBalance,
    pendingSushi,
  } = poolHistories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.timestamp * 1000;

      previousValue.slpAge.push({
        date,
        value: currentValue.slpAge,
      });

      previousValue.slpAgeRemoved.push({
        date,
        value: currentValue.slpAgeRemoved,
      });

      previousValue.slpDeposited.push({
        date,
        value: parseFloat(currentValue.slpDeposited),
      });

      previousValue.slpWithdrawn.push({
        date,
        value: parseFloat(currentValue.slpWithdrawn),
      });

      const average =
        parseFloat(currentValue.slpAge) / parseFloat(currentValue.slpBalance);

      previousValue.slpAgeAverage.push({
        date,
        value: !Number.isNaN(average) ? average : 0,
      });

      previousValue.slpBalance.push({
        date,
        value: parseFloat(currentValue.slpBalance),
      });

      previousValue.userCount.push({
        date,
        value: parseFloat(currentValue.userCount),
      });

      // const pendingSushi =
      //   (currentValue.slpBalance * currentValue.pool.accSushiPerShare) /
      //   1e12 /
      //   1e18;

      // previousValue.pendingSushi.push({
      //   date,
      //   value: parseFloat(pendingSushi),
      // });

      return previousValue;
    },
    {
      slpAge: [],
      slpAgeRemoved: [],
      userCount: [],
      slpDeposited: [],
      slpWithdrawn: [],
      slpAgeAverage: [],
      slpBalance: [],
      pendingSushi: [],
    }
  );

  return (
    <AppShell>
      <Head>
        <title>Pool {id} | SushiSwap Analytics</title>
      </Head>

      <PageHeader mb={3}>
        <Box display="flex" alignItems="center">
          <PairIcon
            base={pool.liquidityPair.token0.id}
            quote={pool.liquidityPair.token1.id}
          />
          <Typography variant="h5" component="h1">
            {pool.liquidityPair.token0.symbol}-
            {pool.liquidityPair.token1.symbol}
          </Typography>
        </Box>
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <KPI
            title="~ SLP Age"
            value={`${(
              parseFloat(pool.slpAge) / parseFloat(pool.balance / 1e18)
            ).toFixed(2)} Days`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI title="Users" value={pool.userCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI
            title="Staked"
            value={`${(pool.balance / 1e18).toFixed(4)} SLP`}
          />
        </Grid>
        {/* <Grid item xs={12} sm={4}>
          <KPI
            title="Fees (24h)"
            value={currencyFormatter.format(
              pool.liquidityPair.volumeUSD * 0.03
            )}
          />
        </Grid> */}
        {/* 
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="Profitability"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[pendingSushi]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid> */}

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="SLP Age & SLP Age Removed"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpAge, slpAgeRemoved]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="SLP Deposited & SLP Withdrawn"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpDeposited, slpWithdrawn]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Chart
            title="~ SLP Age (Days)"
            data={slpAgeAverage}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          />
        </Grid>

        <Grid item xs={12}>
          <Chart
            title="Users"
            data={userCount}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          />
        </Grid>

        <Grid item xs={12}>
          <Chart
            title="SLP Balance"
            data={slpBalance}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          />
        </Grid>
      </Grid>

      <LiquidityProviderList
        pool={pool}
        orderBy="amount"
        title="Top Liquidity Providers"
      />
      {/* <pre>{JSON.stringify(pool, null, 2)}</pre> */}
    </AppShell>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();
  await getPool(id, client);
  await getPoolHistories(id, client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  // const client = getApollo();
  // const { pools } = await getPoolIds(client);
  // const paths = pools.map((pool) => ({
  //   params: { id: pool.id },
  // }));
  return { paths: [], fallback: true };
}

export default PoolPage;
