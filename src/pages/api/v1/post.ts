import { Request, Response } from "express";
import { middlewares } from "../../../helpers/express";
import prisma from "../../../lib/prisma";
import { toWithError } from "../../../helpers";
import { LndApi } from "../../../api";
// import getHash from "../../../util/crypto";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { slug, id, invoice },
  } = req;

  // const [response, error] = await toWithError<{ settled: boolean }>(
  //   LndApi.checkInvoice(getHash(invoice))
  // );

  const response = { settled: true };

  if (response.settled == true) {
    const paid = await prisma.post.findUnique({
      where: {
        slug: String(slug),
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
