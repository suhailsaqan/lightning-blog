import { getProviders, getSession, useSession } from "next-auth/react";
import Login from "../components/login";
import { ME } from "../fragments/users";
import { getGetServerSideProps } from "../api/ssrApollo";
import Layout from "../components/Layout";

export default function LoginPage() {
  const { data: session1 } = useSession();
  console.log("Session1:", session1);
  return (
    <Layout>
      <Login />
    </Layout>
  );
}

export async function getServerSideProps({
  req,
  res,
  query: { callbackUrl = null, error = null },
}) {
  const session = await getSession({ req });
  const providers = await getProviders();

  console.log("Session:", session);
  console.log("Providers", providers);

  if (session && res && callbackUrl) {
    res.writeHead(302, {
      Location: callbackUrl,
    });
    res.end();
    return { props: {} };
  }

  return {
    props: {
      providers: providers,
      callbackUrl,
      error,
    },
  };
}
