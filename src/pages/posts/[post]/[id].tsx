import { GetServerSideProps } from "next";
import { parseISO } from "date-fns";
import PostLayout from "../../../components/PostLayout";
import { getSession } from "next-auth/react";

export type Props = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  author: string;
  description?: string;
  text: string;
};

export default function Post({
  title,
  date,
  slug,
  tags,
  author,
  description = "",
  text,
}: Props) {
  return (
    <PostLayout
      title={title}
      date={parseISO(date)}
      slug={slug}
      tags={tags}
      author={author}
      description={description}
    >
      {text}
    </PostLayout>
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

  const { post, id } = context.params;

  const url = `http://${context.req.headers.host}/api/v1/post?slug=${post}&id=${id}`;
  const resp = await fetch(url);

  const res = await resp.json();

  const tags = [];

  const { title, date, author, description, text } = res;

  return {
    props: { title, date, tags, author, description, text },
  };
};
