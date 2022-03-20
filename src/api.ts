export const getInvoice = ({ amount }: { amount: number }) =>
  fetch(`/api/v1/invoice?amount=${amount}`).then((res) => res.json());

export const LndApi = {
  getInvoice: async (value: number, hash: string) => {
    try {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      headers.set("Grpc-Metadata-macaroon", process.env['LND_MACAROON'] || "");

      const response = await fetch(`${process.env['LND_URL']}/v1/invoices`, {
        method: "post",
        headers,
        body: JSON.stringify({
          value,
          memo: "Replit Lightning Tip Invoice",
          description_hash: hash,
        }),
      });

      return await response.json();
    } catch (error) {
      console.log("Error generating invoice from LND", { error });
      throw new Error();
    }
  },
};

export const fetchInfo = () => fetch("/api/v1/info").then((res) => res.json());
