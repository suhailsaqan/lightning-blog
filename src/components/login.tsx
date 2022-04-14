import { signIn } from "next-auth/client";
import Button from "react-bootstrap/Button";
import styles from "./login.module.css";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { useRouter } from "next/router";
import LnQR, { LnQRSkeleton } from "./lnqr";
import { gql, useMutation, useQuery } from "@apollo/client";

export const EmailSchema = Yup.object({
  email: Yup.string().email("email is no good").required("required"),
});

export default function Login({ providers, callbackUrl, error, Header }) {
  const errors = {
    Signin: "Try signing with a different account.",
    OAuthSignin: "Try signing with a different account.",
    OAuthCallback: "Try signing with a different account.",
    OAuthCreateAccount: "Try signing with a different account.",
    EmailCreateAccount: "Try signing with a different account.",
    Callback: "Try signing with a different account.",
    OAuthAccountNotLinked:
      "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "Check your email address.",
    CredentialsSignin: "Lightning auth failed.",
    default: "Unable to sign in.",
  };

  const [errorMessage, setErrorMessage] = useState(
    error && (errors[error] ?? errors.default)
  );
  const router = useRouter();

  return (
    <div>
      <p className="text-center">LOGIN HERE USING LIGHTING AUTH</p>
      <div className={styles.login}>
        {Header && <Header />}
        {errorMessage && (
          <Alert
            variant="danger"
            onClose={() => setErrorMessage(undefined)}
            dismissible
          >
            {errorMessage}
          </Alert>
        )}
        {router.query.type === "lightning" ? (
          <LightningAuth callbackUrl={callbackUrl} />
        ) : (
          <>
            <Button
              className={`mt-2 ${styles.providerButton}`}
              variant="primary"
              onClick={() =>
                router.push({
                  pathname: router.pathname,
                  query: { ...router.query, type: "lightning" },
                })
              }
            >
              {/* <LightningIcon width={20} height={20} className="mr-3" /> */}
              Login with Lightning
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function LnQRAuth({ k1, encodedUrl, callbackUrl }) {
  const query = gql`
  {
    lnAuth(k1: "${k1}") {
      pubkey
      k1
    }
  }`;
  const { data } = useQuery(query, { pollInterval: 1000 });

  if (data && data.lnAuth.pubkey) {
    signIn("credentials", { ...data.lnAuth, callbackUrl });
  }

  // output pubkey and k1
  return (
    <>
      <LnQR value={encodedUrl} status="waiting for you" />
    </>
  );
}

export function LightningAuth({ callbackUrl }) {
  // query for challenge
  const [createAuth, { data, error }] = useMutation(gql`
    mutation createAuth {
      createAuth {
        k1
        encodedUrl
      }
    }
  `);

  useEffect(createAuth, []);

  if (error) return <div>error</div>;

  if (!data) {
    return <LnQRSkeleton status="generating" />;
  }

  return <LnQRAuth {...data.createAuth} callbackUrl={callbackUrl} />;
}
