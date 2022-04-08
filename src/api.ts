import { getHash } from "./util/crypto";
import { encode } from "utf8";

export const getInvoice = ({
  amount,
  slug,
}: {
  amount: number;
  slug: string;
}) =>
  fetch(`/api/v1/invoice?amount=${amount}&slug=${slug}`).then((res) =>
    res.json()
  );

export const createAuth = ({}: {}) =>
  fetch(`/api/v1/auth/lnurl/createauth`, {
    method: "post",
    body: JSON.stringify({}),
  }).then((res) => res.json());

export const lnAuth = ({ k1 }: { k1: string }) =>
  fetch(`/api/v1/auth/lnurl/lnauth?k1=${k1}`).then((res) => res.json());

export const checkInvoice = ({
  slug,
  id,
  invoice,
}: {
  slug: string;
  id: string;
  invoice: string;
}) => fetch(`/api/v1/post?slug=${slug}&id=${id}`).then((res) => res.json());

export const getPostInfo = ({ slug }: { slug: string }) =>
  fetch(`/api/v1/postinfo?slug=${slug}`).then((res) => res.json());

export const LndApi = {
  getInvoice: async (value: number, hash: string) => {
    try {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      headers.set("Grpc-Metadata-macaroon", process.env["LND_MACAROON"] || "");

      const response = await fetch(`${process.env["LND_URL"]}/v1/invoices`, {
        method: "post",
        headers,
        body: JSON.stringify({
          value,
          memo: "Blog Post",
          description_hash: hash,
        }),
      });

      return await response.json();
    } catch (error) {
      console.log("Error generating invoice from LND", { error });
      throw new Error();
    }
  },
  checkInvoice: async (hash: string) => {
    try {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      headers.set("Grpc-Metadata-macaroon", process.env["LND_MACAROON"] || "");

      let shaHash = Buffer.from(hash, "base64").toString("base64");
      shaHash = shaHash.replaceAll("+", "-");
      shaHash = shaHash.replaceAll("/", "_");

      console.log(hash, shaHash);

      const response = await fetch(
        `${process.env["LND_URL"]}/v1/invoice/?r_hash=${shaHash}`,
        {
          method: "get",
          headers,
        }
      );

      const ret = await response.json();

      return await ret;
    } catch (error) {
      console.log("Error checking invoice from LND", { error });
      throw new Error();
    }
  },
  subscribeInvoice: async (hash: string) => {
    try {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      headers.set("Grpc-Metadata-macaroon", process.env["LND_MACAROON"] || "");

      const response = await fetch(
        `${process.env["LND_URL"]}/v1/invoices/subscribe/${hash}`,
        {
          method: "get",
          headers,
        }
      );

      return await response.json();
    } catch (error) {
      console.log("Error subscribing to invoice from LND", { error });
      throw new Error();
    }
  },
};

export const fetchInfo = () => fetch("/api/v1/info").then((res) => res.json());
