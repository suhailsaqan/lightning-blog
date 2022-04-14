import { gql } from "apollo-server-micro";

export default gql`
  extend type Query {
    posts: Posts
    post(slug: String!): Post
  }

  extend type Mutation {
    createPost(
      uid: String!
      title: String!
      text: String
      price: Int
      slug: String!
    ): Post!
    updatePost(text: String, slug: String!): Post!
  }

  type Posts {
    posts: [Post!]
  }

  type Post {
    uid: String!
    createdAt: String
    updatedAt: String
    title: String
    price: Int
    text: String
    slug: String
  }
`;
