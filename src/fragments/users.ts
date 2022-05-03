import { gql } from "@apollo/client";

export const ME = gql`
  {
    me {
      id
      name
    }
  }
`;

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    createdAt
    name
    nitems
    ncomments
    stacked
    sats
    bio {
      ...ItemFields
      text
    }
  }
`;

export const TOP_USERS = gql`
  query TopUsers($cursor: String, $within: String!, $userType: String!) {
    topUsers(cursor: $cursor, within: $within, userType: $userType) {
      users {
        name
        amount
      }
      cursor
    }
  }
`;

export const USER_FULL = gql`
  ${USER_FIELDS}
  query User($name: String!) {
    user(name: $name) {
      ...UserFields
      bio {
        ...ItemWithComments
      }
    }
  }
`;

export const USER_WITH_COMMENTS = gql`
  ${USER_FIELDS}
  query UserWithComments($name: String!) {
    user(name: $name) {
      ...UserFields
    }
    moreFlatComments(sort: "user", name: $name) {
      cursor
      comments {
        ...CommentFields
      }
    }
  }
`;

export const USER_WITH_POSTS = gql`
  ${USER_FIELDS}
  query UserWithPosts($name: String!) {
    user(name: $name) {
      ...UserFields
    }
    items(sort: "user", name: $name) {
      cursor
      items {
        ...ItemFields
      }
    }
  }
`;
