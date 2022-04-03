// import TextEditor from "../components/draftEditor/draftEditor";
import Layout from "../components/Layout";

import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(
  () => import("../components/draftEditor/draftEditor"),
  { ssr: false }
);

export default function Draft() {
  return (
    <Layout>
      {/* <TextEditor /> */}
      <DynamicComponentWithNoSSR />
    </Layout>
  );
}
