import * as React from "react";
import { RichUtils, EditorState } from "draft-js";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarButtonInterface } from "./Toolbar";

interface BlockButtonsBar {
  buttons: ToolbarButtonInterface[];
  editorState: EditorState;
  onToggle: (blockType: string) => void;
}

export const BlockButtonsBar: React.FunctionComponent<BlockButtonsBar> = (
  props
) => {
  const { editorState } = props;
  const blockType = RichUtils.getCurrentBlockType(editorState);

  return (
    <div className="md-toolbar-controls md-toolbar-controls-block">
      {props.buttons.map((button) => {
        return (
          <ToolbarButton
            label={button.label}
            key={button.style}
            active={button.style === blockType}
            onToggle={props.onToggle}
            style={button.style}
            description={button.description}
          />
        );
      })}
    </div>
  );
};
