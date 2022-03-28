import * as React from "react";
import { BlockProps } from "../../typings";
import "./AtomicBlock.module.css";

export const AtomicBlock: React.FunctionComponent<BlockProps> = (props) => {
  const content = props.blockProps.getEditorState().getCurrentContent();
  const entity = content.getEntity(props.block.getEntityAt(0));
  const data = entity.getData();
  const type = entity.getType();

  if (type === "image") {
    return (
      <div className="md-block-atomic-wrapper">
        <img role="presentation" src={data.src} alt="" />
        <div className="md-block-atomic-controls">
          <button>&times;</button>
        </div>
      </div>
    );
  }

  return <p>No supported atomic block of type {type}.</p>;
};
