import * as React from "react";
import { EditorBlock } from "draft-js";
import { BlockProps } from "../../typings";

import "./CodeBlock.module.css";

export class CodeBlock extends React.Component<BlockProps> {
  public render() {
    const { block } = this.props;
    const lang = block.getData().get("language", "");

    return (
      <div
        className="md-block-code-wrapper"
        data-language={lang}
        spellCheck={false}
      >
        <EditorBlock {...this.props} />
      </div>
    );
  }
}
