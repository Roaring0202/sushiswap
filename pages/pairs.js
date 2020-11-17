import { Layout, PairTable, SortableTable } from "../components";
import { getApollo, getPairs, pairsQuery, useInterval } from "app/core";

import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function PairsPage() {
  const {
    data: { pairs },
  } = useQuery(pairsQuery);
  useInterval(getPairs, 60000);
  return (
    <Layout>
      <Head>
        <title>Pairs | SushiSwap Analytics</title>
      </Head>
      <PairTable title="Pairs" pairs={pairs} />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  // Pairs
  await getPairs(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PairsPage;
