import { gql } from "apollo-server-micro";

export default gql`
  extend type Query {
    postInfo(slug: String!): Post
  }

  extend type Mutation {
    createInvoice(amount: Int!, slug: String!): Invoice!
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

  type Invoice {
    slug: String!
    uid: String!
    invoice_hash: String!
    invoice: String!
  }
`;
