import * as React from "react";
import { EditorBlock } from "draft-js";
import { BlockProps } from "../../typings";
import "./TextBlock.module.css";

export const TextBlock = (props: BlockProps) => {
  return <EditorBlock {...props} />;
};
