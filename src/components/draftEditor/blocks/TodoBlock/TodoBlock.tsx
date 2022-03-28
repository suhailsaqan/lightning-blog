import * as React from "react";
import { EditorBlock } from "draft-js";
import { updateDataOfBlock } from "../../util/helpers";
import { BlockProps } from "../../typings";
import "./TodoBlock.module.css";

export class TodoBlock extends React.PureComponent<BlockProps> {
  public render() {
    const data = this.props.block.getData();
    const checked = data.get("checked") === true;

    return (
      <div className={checked ? "block-todo-completed" : ""}>
        <span contentEditable={false}>
          <input type="checkbox" checked={checked} onChange={this.updateData} />
        </span>
        <EditorBlock {...this.props} />
      </div>
    );
  }

  private updateData = () => {
    const { block, blockProps } = this.props;
    const { setEditorState, getEditorState } = blockProps;
    const data = block.getData();
    const checked = data.has("checked") && data.get("checked") === true;
    const newData = data.set("checked", !checked);
    setEditorState(updateDataOfBlock(getEditorState(), block, newData));
  };
}
