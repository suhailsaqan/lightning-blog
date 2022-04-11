import { signIn } from "next-auth/client";
import Button from "react-bootstrap/Button";
import styles from "./login.module.css";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { useRouter } from "next/router";
import LnQR, { LnQRSkeleton } from "./lnqr";
import { useMutation, useQuery } from "react-query";
// import { useMutation } from "@apollo/client";
import { createAuth, lnAuth } from "../api";
import * as axios from "axios";

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
  const mutation = useMutation(lnAuth, {
    // Refetch the data every second
    refetchInterval: 1000,
  });

  useEffect(async () => {
    for (let i = 0; i < 100000; i++) {
      console.log("mutating");
      mutation.mutate({ k1: k1 });
      await new Promise((r) => setTimeout(r, 5000));
    }
  }, []);

  console.log("look here:", mutation.data);

  if (mutation.data && mutation.data.pubkey) {
    console.log(mutation.data);
    signIn("credentials", { ...mutation.data, callbackUrl });
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
  const mutation = useMutation(createAuth);

  useEffect(() => {
    console.log("mutating");
    mutation.mutate();
  }, []);

  if (mutation.error) return <div>error</div>;

  if (!mutation.data) {
    // return <LnQRSkeleton status="generating" />;
    return <p>generating</p>;
  }

  console.log("last: ", mutation.data.data);
  return (
    <LnQRAuth
      k1={mutation.data.data.createauth.k1}
      encodedUrl={mutation.data.data.encodedurl}
      callbackUrl={callbackUrl}
    />
  );
}
