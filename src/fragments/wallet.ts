import { gql } from "@apollo/client";

export const INVOICE = gql`
  query Invoice($id: ID!) {
    invoice(id: $id) {
      id
      bolt11
      msatsReceived
      cancelled
      confirmedAt
      expiresAt
    }
  }
`;

export const WITHDRAWL = gql`
  query Withdrawl($id: ID!) {
    withdrawl(id: $id) {
      id
      bolt11
      satsPaid
      satsFeePaying
      satsFeePaid
      status
    }
  }
`;

export const CREATE_WITHDRAWL = gql`
  mutation createWithdrawl($invoice: String!, $maxFee: Int!) {
    createWithdrawl(invoice: $invoice, maxFee: $maxFee) {
      id
    }
  }
`;

export const SEND_TO_LNADDR = gql`
  mutation sendToLnAddr($addr: String!, $amount: Int!, $maxFee: Int!) {
    sendToLnAddr(addr: $addr, amount: $amount, maxFee: $maxFee) {
      id
    }
  }
`;
