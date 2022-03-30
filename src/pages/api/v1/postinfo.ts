import { Request, Response } from "express";
import { middlewares } from "../../../helpers/express";
import prisma from "../../../lib/prisma";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { slug },
  } = req;

  const postinfo = await prisma.post.findUnique({
    where: {
      slug: slug,
    },
  });

  if (postinfo) {
    res.status(200).json(postinfo.price);
    return;
  } else {
    res.status(400).json({ status: "Fail", reason: "Post not found" });
    return;
  }
}
