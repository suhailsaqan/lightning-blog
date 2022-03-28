import { Request, Response } from "express";
import { middlewares } from "../../../helpers/express";
import { env } from "../../../helpers/env";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  res.status(200).json({
    max: env.max,
    min: env.min,
    name: env.name,
  });
}
