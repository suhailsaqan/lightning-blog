import { providers, getSession } from "next-auth/client";
import Login from "../components/login";
import { ME } from "../fragments/users";
import { getGetServerSideProps } from "../api/ssrApollo";

// export const getServerSideProps =

export async function getServerSideProps({
  req,
  res,
  query: { callbackUrl = null, error = null },
}) {
  getGetServerSideProps(ME);
  const session = await getSession({ req });

  console.log(session);

  if (session && res && callbackUrl) {
    res.writeHead(302, {
      Location: callbackUrl,
    });
    res.end();
    return { props: {} };
  }

  return {
    props: {
      providers: await providers({ req, res }),
      // providers: await providers(),
      callbackUrl,
      error,
    },
  };
}

export default Login;
