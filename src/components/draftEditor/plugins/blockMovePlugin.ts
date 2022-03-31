import * as React from "react";
import { EditorState, DraftEditorCommand } from "draft-js";

import { swapBlocks } from "../util/helpers";
import { DraftPlugin } from "../plugins_editor/PluginsEditor";
import { KEY_DOWN, KEY_UP } from "../util/constants";

type KeyBoardFilterFunc = (
  ev: React.KeyboardEvent<{}> | KeyboardEvent
) => boolean;

function defaultFilterFunction(ev: React.KeyboardEvent<{}>): boolean {
  return ev.ctrlKey && ev.altKey;
}

function moveBlock(
  keyFilterFunction: KeyBoardFilterFunc,
  ev: React.KeyboardEvent<{}>,
  editorState: EditorState,
  setEditorState: (es: EditorState) => void,
  isUp: boolean
): DraftEditorCommand | undefined | false {
  if (!keyFilterFunction(ev)) {
    return;
  }

  const selection = editorState.getSelection();
  if (!selection.isCollapsed()) {
    return;
  }

  const contentState = editorState.getCurrentContent();
  const firstBlock = contentState.getFirstBlock();
  const lastBlock = contentState.getLastBlock();
  const blockToMove = contentState.getBlockForKey(selection.getAnchorKey());

  if (
    (isUp && blockToMove.getKey() !== firstBlock.getKey()) ||
    (!isUp && blockToMove.getKey() !== lastBlock.getKey())
  ) {
    const blockToSwapWith = isUp
      ? contentState.getBlockBefore(blockToMove.getKey())
      : contentState.getBlockAfter(blockToMove.getKey());
    setEditorState(swapBlocks(editorState, blockToMove, blockToSwapWith));

    return false;
  }
}

interface BlockMovePluginOptions {
  keyFilterFunction?: KeyBoardFilterFunc;
}

export function blockMovePlugin(options?: BlockMovePluginOptions): DraftPlugin {
  const keyFilterFunction =
    (options && options.keyFilterFunction) || defaultFilterFunction;

  return {
    keyBindingFn: (
      ev: React.KeyboardEvent<{}>,
      { getEditorState, setEditorState }
    ) => {
      if (ev.which === KEY_UP) {
        return moveBlock(
          keyFilterFunction,
          ev,
          getEditorState(),
          setEditorState,
          true
        );
      }
      if (ev.which === KEY_DOWN) {
        return moveBlock(
          keyFilterFunction,
          ev,
          getEditorState(),
          setEditorState,
          false
        );
      }
    },
  };
}
