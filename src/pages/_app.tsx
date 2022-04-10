import "normalize.css";
import { AppProps } from "next/app";
import Head from "next/head";
import "../../public/styles/global.css";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>{process.env["WEBPAGENAME"] || "Lightning Blog"}</title>
      </Head>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
