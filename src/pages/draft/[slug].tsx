import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";

import dynamic from "next/dynamic";

const TextEditor = dynamic(
  () => import("../../components/draftEditor/draftEditor"),
  { ssr: false }
);

export type Props = {
  slug: string;
};

export default function Draft({ slug }: Props) {
  return (
    <Layout>
      <TextEditor slug={slug} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { slug } = params;

  return {
    props: { slug },
  };
};
