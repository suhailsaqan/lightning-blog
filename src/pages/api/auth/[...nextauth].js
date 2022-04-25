import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

export default (req, res) => NextAuth(req, res, options);

const options = {
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Add additional session params
      if (user?.id) {
        token.id = user.id;
      }

      // XXX We need to update the user name incase they update it ... kind of hacky
      // better if we use user id everywhere an ignore the username ...
      if (token?.id) {
        const { name } = await prisma.user.findUnique({
          where: { id: token.id },
        });
        token.name = name;
      }
      return token;
    },
    async session({ session, token, user }) {
      // we need to add additional session params here
      session.user.id = token.id;
      session.user.name = token.name;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Lightning",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        pubkey: { label: "publickey", type: "text" },
        k1: { label: "k1", type: "text" },
      },
      async authorize(credentials, req) {
        const { k1, pubkey } = credentials;
        try {
          const lnauth = await prisma.lnAuth.findUnique({ where: { k1: k1 } });
          if (lnauth.pubkey === pubkey) {
            let user = await prisma.user.findUnique({
              where: { pubkey: pubkey },
            });
            if (!user) {
              user = await prisma.user.create({
                data: { name: pubkey.slice(0, 10), pubkey: pubkey },
              });
            }
            await prisma.lnAuth.delete({ where: { k1: k1 } });
            return user;
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  pages: {
    signIn: "/login",
    error: "/draft",
  },
};
