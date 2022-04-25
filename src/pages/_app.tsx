import "normalize.css";
import "../../public/styles/global.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import NextNProgress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider, gql } from "@apollo/client";
import getApolloClient from "../lib/apollo";
import { MeProvider } from "../components/me";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const client = getApolloClient();

  if (typeof window !== "undefined") {
    const { apollo, data } = pageProps;
    if (apollo) {
      client.writeQuery({
        query: gql`
          ${apollo.query}
        `,
        data: data,
        variables: apollo.variables,
      });
    }
  }

  const { me } = pageProps;

  return (
    <>
      <NextNProgress
        color="#000000"
        startPosition={0.3}
        stopDelayMs={200}
        height={2}
        showOnShallow
        options={{ showSpinner: false }}
      />
      <SessionProvider session={pageProps.session}>
        <ApolloProvider client={client}>
          <MeProvider me={me}>
            <Head>
              <link rel="shortcut icon" href="/favicon.ico" />
              <title>{process.env["WEBPAGENAME"] || "Lightning Blog"}</title>
            </Head>
            <Component {...pageProps} />
          </MeProvider>
        </ApolloProvider>
      </SessionProvider>
    </>
  );
}
