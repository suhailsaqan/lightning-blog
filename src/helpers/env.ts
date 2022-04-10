export const env = {
  max: Number(process.env["MAX"]) || 1000000,
  min: Number(process.env["MIN"]) || 0,
  lightning_memo: process.env.lightning_memo || "Lightning Invoice",
  name: process.env["NAME"] || "Lightning",
  lnauth_url: process.env["LNAUTH_URL"] || "",
};

export const lightning_memo = JSON.stringify([
  ["text/plain", env.lightning_memo],
]);
