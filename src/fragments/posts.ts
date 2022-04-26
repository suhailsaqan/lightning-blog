import { gql } from "@apollo/client";

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    date
    title
    slug
    description
    text
    published
    price
    user {
      name
      id
    }
  }
`;

export const POSTS = gql`
  ${POST_FIELDS}

  query posts(
    $sub: String
    $sort: String
    $cursor: String
    $name: String
    $within: String
  ) {
    posts(sort: $sort, cursor: $cursor, name: $name, within: $within) {
      cursor
      posts {
        ...PostFields
      }
    }
  }
`;

export const POST = gql`
  ${POST_FIELDS}

  query Post($id: ID!) {
    post(id: $id) {
      ...PostFields
      text
    }
  }
`;

export const POST_FULL = gql`
  ${POST_FIELDS}
  query Post($slug: String!) {
    post(slug: $slug) {
      ...PostFields
      prior
      position
      text
    }
  }
`;
