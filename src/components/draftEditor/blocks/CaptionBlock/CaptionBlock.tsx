import * as React from "react";
import { EditorBlock } from "draft-js";
import { BlockProps } from "../../typings";

import "./CaptionBlock.module.css";

export const CaptionBlock = (props: BlockProps) => <EditorBlock {...props} />;
