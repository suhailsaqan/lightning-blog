import { Request, Response } from "express";
import { middlewares } from "../../../helpers/express";
import prisma from "../../../lib/prisma";
import { toWithError } from "../../../helpers";
import { LndApi } from "../../../api";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: Request, res: Response) {
  await middlewares(req, res);

  const {
    query: { slug, id },
  } = req;

  const paymentInfo = await prisma.payment.findUnique({
    where: {
      uid: String(id),
    },
  });

  if (paymentInfo) {
    const [invoice, error] = await toWithError<{ invoice: string }>(
      LndApi.checkInvoice(paymentInfo.invoice_hash)
    );

    if (error || !invoice?.payment_request) {
      console.error("Error checking invoice: ", { error, invoice });
      res.status(400).json({ status: "ERROR", reason: "ErrorCheckingInvoice" });
      return;
    }

    if (invoice.settled == true) {
      const post = await prisma.post.findUnique({
        where: {
          slug: String(slug),
        },
      });

      if (post) {
        res.status(200).json(post);
        return;
      } else {
        res.status(400).json({ status: "Post not found" });
        return;
      }
    } else {
      res.status(400).json({ status: "Invoice not paid" });
    }
  } else {
    res.status(400).json({ status: "Payment id not found" });
  }
}
