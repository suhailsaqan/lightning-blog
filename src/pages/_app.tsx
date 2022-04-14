import "normalize.css";
import "../../public/styles/global.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import NextNProgress from "nextjs-progressbar";
import { Provider } from "next-auth/client";
import { ApolloProvider, gql } from "@apollo/client";
import getApolloClient from "../lib/apollo";
import { MeProvider } from "../components/me";

export default function App({
  Component,
  pageProps: { session, ...props },
}: AppProps) {
  const client = getApolloClient();

  if (typeof window !== "undefined") {
    const { apollo, data } = props;
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

  const { me } = props;

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
      <Provider session={session}>
        <ApolloProvider client={client}>
          <MeProvider me={me}>
            <Head>
              <link rel="shortcut icon" href="/favicon.ico" />
              <title>{process.env["WEBPAGENAME"] || "Lightning Blog"}</title>
            </Head>
            <Component {...props} />
          </MeProvider>
        </ApolloProvider>
      </Provider>
    </>
  );
}
