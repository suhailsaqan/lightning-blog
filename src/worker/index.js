const PgBoss = require("pg-boss");
const dotenv = require("dotenv");
// dotenv.config({ path: ".." });
const { PrismaClient } = require("@prisma/client");
const { ApolloClient, HttpLink, InMemoryCache } = require("@apollo/client");
const fetch = require("cross-fetch");

async function work() {
  // const boss = new PgBoss(process.env.DATABASE_URL);
  const boss = new PgBoss("https://suhailsaqan.com");
  const models = new PrismaClient();
  const apollo = new ApolloClient({
    link: new HttpLink({
      uri: `${process.env.SELF_URL}/api/graphql`,
      fetch,
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        nextFetchPolicy: "network-only",
      },
      query: {
        fetchPolicy: "network-only",
        nextFetchPolicy: "network-only",
      },
    },
  });

  const args = { boss, models, apollo };

  boss.on("error", (error) => console.error(error));

  await boss.start();

  console.log("working jobs");
}

work();
