import { UserInputError, AuthenticationError } from "apollo-server-micro";
import { decodeCursor, LIMIT, nextCursorEncoded } from "../../lib/cursor";

export default {
  Query: {
    posts: async (parent, args, { models }) => await models.post.findMany(),
    post: async (parent, { slug }, { models }) => {
      const post = await models.post.findUnique({ where: { slug: slug } });
      return post;
    },
  },

  Mutation: {
    createPost: async (
      parent,
      { uid, title, slug, text, price },
      { me, models }
    ) => {
      return await models.post.create({
        data: {
          uid: uid,
          title: title,
          slug: slug,
          text: text,
          price: Number(price),
        },
      });
    },
    updatePost: async (parent, { slug, text }, { me, models }) => {
      if (!slug) {
        throw new UserInputError("must have slug", { argumentName: "slug" });
      }

      if (!text) {
        throw new UserInputError("link must have text", {
          argumentName: "text",
        });
      }

      return await updatePost(parent, { slug, data: { text } }, { me, models });
    },
  },
};

const updatePost = async (parent, { slug, data }, { me, models }) => {
  const post = await models.post.update({
    where: { slug: slug },
    data,
  });

  return post;
};

// const createPost = async (
//   parent,
//   { title, text, price, slug },
//   { me, models }
// ) => {
//   if (!me) {
//     throw new AuthenticationError("you must be logged in");
//   }

//   const [post] = await serialize(
//     models,
//     models.$queryRaw(
//       `${SELECT} FROM create_post($1, $2, $3, $4, $5, $6) AS "Post"`,
//       title,
//       text,
//       price,
//       slug,
//       Number(me.id)
//     )
//   );
//   return post;
// };
