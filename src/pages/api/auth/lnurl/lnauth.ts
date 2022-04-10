import { Request, Response } from "express";
import { middlewares } from "../../../../helpers/express";
import prisma from "../../../../lib/prisma";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { k1 },
  } = req;
  console.log("penis1");
  const lnauth = await prisma.lnAuth.findUnique({ where: { k1: String(k1) } });
  console.log("penis2", lnauth);

  console.log("mutated");

  if (lnauth) {
    res.status(200).json(lnauth);
  } else {
    res.status(400).json({ status: "lnauth not found" });
  }
}
