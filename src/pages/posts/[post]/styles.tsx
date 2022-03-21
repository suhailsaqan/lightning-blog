import styled, { css } from "styled-components";

export const IndexStyles = {
  wrapper: styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `,
  square: styled.div`
    width: 350px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    border-radius: 0px;
    background: white;
  `,
  top: styled.div`
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    width: 100%;
    background: rgb(255 149 0);
    color: white;
    padding: 20px;
    text-align: center;
  `,
  title: styled.h1`
    font-size: 30px;
    margin: 0;
  `,
  bottom: styled.div`
    padding: 24px;
  `,
  info: styled.div`
    width: 100%;
    font-size: 20px;
    color: gray;
    width: 100%;
    text-align: center;
  `,
  copy: styled.div`
    margin: 0 0 8px;
    font-size: 20px;
    color: gray;
    width: 100%;
    text-align: center;
  `,
  copied: styled.div`
    margin: 0 0 8px;
    font-size: 20px;
    color: #686868;
    width: 100%;
    text-align: center;
    color: green;
    font-weight: bolder;
  `,
  copyButton: styled.button`
    width: 100%;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    text-align: center;
    align-items: center;
  `,
};
