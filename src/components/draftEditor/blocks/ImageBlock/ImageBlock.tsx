import * as React from "react";
import { EditorBlock, EditorState, SelectionState } from "draft-js";
import { getCurrentBlock } from "../../util/helpers";
import { BlockProps } from "../../typings";
import "./ImageBlock.module.css";

export class ImageBlock extends React.PureComponent<BlockProps> {
  public render() {
    const { block } = this.props;
    const data = block.getData();
    const src = data.get("src");
    const srcSet = data.get("srcSet");
    const sizes = data.get("sizes");
    const isLoading = data.get("uploading");
    const errorMessage = data.get("error");

    if (src !== null) {
      return (
        <>
          <div
            className={`md-block-image-inner-container${
              isLoading ? " md-block-image-inner-container--uploading" : ""
            }`}
            onClick={this.focusBlock}
          >
            {errorMessage && (
              <div className="md-block-image-error">{errorMessage}</div>
            )}
            <img
              role="presentation"
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt=""
              className="md-block-image-inner-container-image"
            />
          </div>
          <figcaption className="md-block-image-figcaption">
            <EditorBlock {...this.props} />
          </figcaption>
        </>
      );
    }

    return <EditorBlock {...this.props} />;
  }

  private focusBlock = () => {
    const { block, blockProps } = this.props;
    const { getEditorState, setEditorState } = blockProps;
    const key = block.getKey();
    const editorState = getEditorState();
    const currentBlock = getCurrentBlock(editorState);

    if (currentBlock.getKey() === key) {
      return;
    }

    const newSelection = new SelectionState({
      anchorKey: key,
      focusKey: key,
      anchorOffset: 0,
      focusOffset: 0,
    });

    setEditorState(EditorState.forceSelection(editorState, newSelection));
  };
}
