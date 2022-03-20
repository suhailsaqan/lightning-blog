import { getIp } from "src/helpers";
import { Request, Response } from "express";
import { getHash } from "src/util/crypto";
import { middlewares } from "src/helpers/express";
import { env, lightning_memo } from "src/helpers/env";
import { Url } from "src/helpers/url";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const ip = getIp(req);
  const ipHash = getHash(ip);

  const { origin } = Url(req);

  const response = {
    callback: `${origin}/api/v1/pay/${ipHash}`,
    maxSendable: env.max * 1000,
    minSendable: env.min * 1000,
    lightning_memo,
    commentAllowed: 0,
    tag: "payRequest",
  };

  res.status(200).json(response);
}
