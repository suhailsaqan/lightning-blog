import { gql } from "apollo-server-micro";

import user from "./user";
import lnurl from "./lnurl";
import post from "./post";
import invoice from "./invoice";

const link = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [link, user, lnurl, post, invoice];
