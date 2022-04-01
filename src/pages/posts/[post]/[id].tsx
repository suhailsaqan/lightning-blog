import { GetServerSideProps } from "next";
import renderToString from "next-mdx-remote/render-to-string";
import { MdxRemote } from "next-mdx-remote/types";
import hydrate from "next-mdx-remote/hydrate";
import matter from "gray-matter";
import { fetchPostContent } from "../../../lib/posts";
import fs from "fs";
import yaml from "js-yaml";
import { parseISO } from "date-fns";
import PostLayout from "../../../components/PostLayout";
import prisma from "../../../lib/prisma";

import InstagramEmbed from "react-instagram-embed";
import YouTube from "react-youtube";
import { TwitterTweetEmbed } from "react-twitter-embed";

export type Props = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  author: string;
  description?: string;
  text: string;
};

// const components = { InstagramEmbed, YouTube, TwitterTweetEmbed };
// const slugToPostContent = ((postContents) => {
//   let hash = {};
//   postContents.forEach((it) => (hash[it.slug] = it));
//   return hash;
// })(fetchPostContent());

export default function Post({
  title,
  date,
  slug,
  tags,
  author,
  description = "",
  text,
}: Props) {
  // const content = hydrate(source, { components });
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

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { post, id } = params;

  const url = `http://${req.headers.host}/api/v1/post?slug=${post}&id=${id}`;
  const resp = await fetch(url);

  const res = await resp.json();

  const tags = [];

  const { title, date, author, description, text } = res;

  return {
    props: { title, date, tags, author, description, text },
  };
};
