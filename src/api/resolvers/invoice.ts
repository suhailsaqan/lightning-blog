import { randomBytes } from "crypto";
import { bech32 } from "bech32";
import { AuthenticationError } from "apollo-server-micro";

import { toWithError } from "../../helpers";
import { Request, Response } from "express";
import { LndApi } from "../../api";
import { middlewares } from "../../helpers/express";
import { getHash } from "../../util/crypto";
import { env, lightning_memo } from "../../helpers/env";
import { encode } from "utf8";
import { v4 as uuidv4 } from "uuid";

export default {
  Query: {
    postInfo: async (parent, { slug }, { models }) => {
      return await models.post.findUnique({ where: { slug: slug } });
    },
  },
  Mutation: {
    createInvoice: async (parent, { amount, slug }, { models }) => {
      return await invoice(parent, { amount, slug }, { models });
    },
  },
};

const invoice = async (parent, { amount, slug }, { models }) => {
  console.log(`Creating ${amount} sat invoice`);

  const shaHash = getHash(encode(lightning_memo), "base64");

  const [invoice, error] = await toWithError<{ payment_request: string }>(
    LndApi.getInvoice(amount, shaHash)
  );

  if (error || !invoice?.payment_request) {
    console.log("Error creating invoice: ", { error, invoice });
    return;
  }

  const uid = uuidv4();

  const paid = await models.payment.create({
    data: {
      slug: String(slug),
      uid: uid,
      invoice_hash: invoice.r_hash,
      invoice: invoice.payment_request,
    },
  });

  console.log("payment uid:", uid);

  return paid;
};
