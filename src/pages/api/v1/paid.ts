import { Request, Response } from "express";
import { middlewares } from "src/helpers/express";
import prisma from "../../../lib/prisma";
import { toWithError } from "src/helpers";
import { LndApi } from "src/api";
import getHash from "../../../util/crypto";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { slug, id, invoice },
  } = req;

  const [response, error] = await toWithError<{ settled: boolean }>(
    LndApi.checkInvoice(getHash(invoice))
  );

  if (response.settled == true) {
    const paid = await prisma.post.findUnique({
      where: {
        id: id,
        slug: slug,
      },
    });

    if (paid) {
      res.status(200).json({ status: "Success" });
      return;
    }
  } else {
      res.status(200).json({ status: "Fail" });
  }
}
