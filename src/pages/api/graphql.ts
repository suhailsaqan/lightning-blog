import { ApolloServer } from "apollo-server-micro";
import { PageConfig } from "next";
import { MicroRequest } from "apollo-server-micro/dist/types";
import { ServerResponse } from "http";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import resolvers from "../../api/resolvers";
import models from "../../api/models";
import typeDefs from "../../api/typeDefs";
import { getSession } from "next-auth/client";
// import lnd from "../../api/lnd";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

global.apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  // tracing: true,
  context: async ({ req }) => {
    const session = await getSession({ req });
    console.log("-------------", session);
    return {
      models,
      // lnd,
      me: session ? session.user : null,
    };
  },
});

const startServer = global.apolloServer.start();

export default async function handler(req: MicroRequest, res: ServerResponse) {
  await startServer;
  await global.apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}
