import dynamic from "next/dynamic";

import TextEditor from "../components/draftEditor/draftEditor";

// const TextEditor = dynamic(() => import("../components/draftEditor"), {
//   ssr: false,
// });

export default function Draft() {
  return (
    // <Layout>
    <TextEditor />
    // </Layout>
  );
}
