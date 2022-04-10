import Layout from "../components/Layout";

import dynamic from "next/dynamic";

const TextEditor = dynamic(
  () => import("../components/draftEditor/draftEditor"),
  { ssr: false }
);

export default function Draft() {
  return (
    <Layout>
      <TextEditor />
    </Layout>
  );
}
