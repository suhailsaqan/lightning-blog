import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";

const TextEditor = dynamic(
  () => import("../../components/draftEditor/draftEditor"),
  { ssr: false }
);

export type Props = {
  slug: string;
};

export default function Draft({ slug }: Props) {
  const { data: session } = useSession();

  return (
    <Layout>
      <TextEditor slug={slug} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const { slug } = context.params;

  return {
    props: { slug },
  };
};
