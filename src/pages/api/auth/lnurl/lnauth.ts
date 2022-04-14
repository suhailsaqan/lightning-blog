import { Request, Response } from "express";
import { middlewares } from "../../../../helpers/express";
import prisma from "../../../../lib/prisma";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { k1 },
  } = req;

  const lnauth = await prisma.lnAuth.findUnique({ where: { k1: String(k1) } });

  if (!lnauth) {
    res.status(400).json({ status: "lnauth not found" });
  } else {
    res.status(200).json(lnauth);
  }
}
