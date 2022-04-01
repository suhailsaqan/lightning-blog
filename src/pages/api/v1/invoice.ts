import { toWithError } from "../../../helpers";
import { Request, Response } from "express";
import { LndApi } from "../../../api";
import { middlewares } from "../../../helpers/express";
import { getHash } from "../../../util/crypto";
import { env, lightning_memo } from "../../../helpers/env";
import { encode } from "utf8";
import prisma from "../../../lib/prisma";
import { v4 as uuidv4 } from "uuid";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { amount, slug },
  } = req;

  if (!amount || typeof amount !== "string" || isNaN(Number(amount))) {
    res.status(200).json({ status: "ERROR", reason: "Invalid amount" });
    return;
  }

  const value = Number(amount);

  if (value < env.min) {
    res.status(200).json({ status: "ERROR", reason: "Amount below minimum" });
    return;
  }

  if (value > env.max) {
    res.status(200).json({ status: "ERROR", reason: "Amount above maximum" });
    return;
  }

  console.log(`Creating ${value} sat invoice`);

  const shaHash = getHash(encode(lightning_memo), "base64");

  const [invoice, error] = await toWithError<{ payment_request: string }>(
    LndApi.getInvoice(value, shaHash)
  );

  if (error || !invoice?.payment_request) {
    console.log("Error creating invoice: ", { error, invoice });
    res.status(200).json({ status: "ERROR", reason: "ErrorCreatingInvoice" });
    return;
  }

  const uid = uuidv4();

  const paid = await prisma.payment.create({
    data: {
      slug: String(slug),
      uid: uid,
      invoice_hash: Buffer.from(invoice.r_hash).toString("base64"),
      invoice: invoice.payment_request,
    },
  });

  console.log("payment uid:", uid);

  const response = {
    pr: invoice.payment_request,
    slug: paid.slug,
    uid: paid.uid,
  };

  res.status(200).json(response);
}
