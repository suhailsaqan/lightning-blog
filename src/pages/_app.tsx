import "normalize.css";
import { AppProps } from "next/app";
import Head from "next/head";
// NOTE: Do not move the styles dir to the src.
// They are used by the Netlify CMS preview feature.
import "../../public/styles/global.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Style } from "../../src/styles";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>
          {process.env["WEBPAGENAME"] || "Lightning Blog"}
        </title>
      </Head>
      {/* <Style /> */}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
