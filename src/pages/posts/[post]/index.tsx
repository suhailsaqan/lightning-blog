import QRcode from "qrcode.react";
import { useState } from "react";
import { useMutation } from "react-query";
import { getInvoice } from "../../../api";
import useCopyClipboard from "../../../util/clipboard";
import styled from "styled-components";
import { IndexStyles } from "./styles";
import { fetchPostContent } from "../../../lib/posts";

const S = {
  separation: styled.div`
    margin: 0 0 16px;
  `,
  line: styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 20px;
  `,
  darkTitle: styled.div`
    color: grey;
  `,
  input: styled.input`
    font-size: 20px;
    padding: 5px;
    height: 38px;
    margin: 8px 0;
    border: 1px solid black;
    background: none;
    border-radius: 4px;
    width: 100%;
  `,
  button: styled.button`
    padding: 0;
    width: 100%;
    height: 38px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #000;

    border: none;
    outline: none;
    color: #ffffff;
    background: #111;
    cursor: pointer;
    position: relative;
    z-index: 0;
    border-radius: 10px;

    :before {
      content: "";
      background: linear-gradient(45deg, #f59542, #f07307, #bf5c06, #8f4200);
      position: absolute;
      top: -2px;
      left: -2px;
      background-size: 400%;
      z-index: -1;
      filter: blur(5px);
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      animation: glowing 20s linear infinite;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      border-radius: 10px;
    }

    :active {
      color: #000;
    }

    :active:after {
      background: transparent;
    }

    :hover:before {
      opacity: 1;
    }

    :after {
      z-index: -1;
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: #111;
      left: 0;
      top: 0;
      border-radius: 10px;
    }

    :disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @keyframes glowing {
      0% {
        background-position: 0 0;
      }
      50% {
        background-position: 400% 0;
      }
      100% {
        background-position: 0 0;
      }
    }
  `,
};

export const Main = ({}: {}) => {
  // const [amount, setAmount] = useState<number>(Math.max(0, min));
  const [isCopied, copy] = useCopyClipboard({ successDuration: 3000 });

  const mutation = useMutation(getInvoice);

  if (mutation.error) {
    return (
      <div>We Ran Into An Error Creating The Invoice. Please Try Again!</div>
    );
  }

  if (mutation.data?.pr) {
    return (
      <>
        <IndexStyles.copyButton onClick={() => copy(mutation.data.pr)}>
          {isCopied ? (
            <IndexStyles.copied>Copied</IndexStyles.copied>
          ) : (
            <IndexStyles.copy>Click To Copy Invoice</IndexStyles.copy>
          )}
          <QRcode value={mutation.data.pr} size={240} />
        </IndexStyles.copyButton>
        <IndexStyles.info>Scan QR Code</IndexStyles.info>
      </>
    );
  }

  return (
    <>
      <S.button
        disabled={mutation.isLoading}
        onClick={() => mutation.mutate({ amount: 1, slug: "hey" })}
      >
        Create an Invoice
      </S.button>
    </>
  );
};

export default function Post({}: Props) {
  // const content = hydrate(source, { components });
  return <Main />;
}
