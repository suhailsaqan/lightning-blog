import {
  ContentBlock,
  ContentState,
  DraftEditorCommand,
  EditorState,
  genKey,
  KeyBindingUtil,
  RichUtils,
  SelectionState,
} from "draft-js";
import { OrderedMap } from "immutable";

import {
  Block,
  continuousBlocks,
  HANDLED,
  KEY_COMMA,
  KEY_COMMANDS,
  KEY_EIGHT,
  KEY_K,
  KEY_ONE,
  KEY_PERIOD,
  KEY_TAB,
  KEY_THREE,
  KEY_TWO,
  KEY_UP,
  NOT_HANDLED,
  StringToTypeMap,
} from "../util/constants";
import {
  addNewBlockAt,
  getCurrentBlock,
  removeBlock,
  resetBlockWithType,
} from "../util/helpers";
import { DraftPlugin, PluginFunctions } from "../plugins_editor/PluginsEditor";
import isSoftNewlineEvent from "draft-js/lib/isSoftNewlineEvent";
import * as React from "react";
import { BlockType } from "../typings";

const { changeType, showLinkInput, unlink } = KEY_COMMANDS;

function onTab(
  ev: React.KeyboardEvent<{}>,
  { getEditorState, setEditorState }: PluginFunctions
) {
  const editorState = getEditorState();
  const newEditorState = RichUtils.onTab(ev, editorState, 2);
  if (newEditorState !== editorState) {
    setEditorState(newEditorState);
  }
}

function onUpArrow(
  ev: React.KeyboardEvent<{}>,
  { getEditorState, setEditorState }: PluginFunctions
) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) {
    return;
  }

  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  if (!selection.isCollapsed()) {
    return;
  }

  const key = selection.getAnchorKey();
  const currentBlock = content.getBlockForKey(key);
  const firstBlock = content.getFirstBlock();

  if (firstBlock.getKey() === key) {
    if (firstBlock.getType().indexOf(Block.ATOMIC) === 0) {
      ev.preventDefault();
      const newBlock = new ContentBlock({
        type: Block.UNSTYLED,
        key: genKey(),
      });
      const newBlockMap = OrderedMap([[newBlock.getKey(), newBlock]]).concat(
        content.getBlockMap()
      );
      const newContent = content.merge({
        blockMap: newBlockMap,
        selectionAfter: selection.merge({
          anchorKey: newBlock.getKey(),
          focusKey: newBlock.getKey(),
          anchorOffset: 0,
          focusOffset: 0,
          isBackward: false,
        }),
      }) as ContentState;
      setEditorState(
        EditorState.push(editorState, newContent, "insert-characters")
      );
    }
  } else if (currentBlock.getType().indexOf(Block.ATOMIC) === 0) {
    const blockBefore = content.getBlockBefore(key);
    if (blockBefore) {
      ev.preventDefault();
      const newSelection = selection.merge({
        anchorKey: blockBefore.getKey(),
        focusKey: blockBefore.getKey(),
        anchorOffset: blockBefore.getLength(),
        focusOffset: blockBefore.getLength(),
        isBackward: false,
      }) as SelectionState;
      setEditorState(EditorState.forceSelection(editorState, newSelection));
    }
  }
}

export function keyboardPlugin(): DraftPlugin {
  return {
    keyBindingFn(
      ev: React.KeyboardEvent<{}>,
      pluginsFns: PluginFunctions
    ): DraftEditorCommand | void | false {
      if (KeyBindingUtil.hasCommandModifier(ev) && ev.which === KEY_K) {
        if (ev.shiftKey) {
          return unlink();
        }

        return showLinkInput();
      }

      if (ev.altKey && !ev.ctrlKey) {
        if (ev.shiftKey) {
          return;
        }

        switch (ev.which) {
          case KEY_ONE:
            return changeType(Block.OL);
          case KEY_TWO:
            return showLinkInput();
          case KEY_THREE:
            return changeType(Block.H3);
          case KEY_EIGHT:
            return changeType(Block.UL);
          case KEY_COMMA:
            return changeType(Block.CAPTION);
          case KEY_PERIOD:
            return changeType(Block.UNSTYLED);
        }
      }

      switch (ev.which) {
        case KEY_TAB:
          return onTab(ev, pluginsFns);

        case KEY_UP:
          return onUpArrow(ev, pluginsFns);
      }
    },

    handleKeyCommand(
      command: string,
      editorState: EditorState,
      time: number,
      { setEditorState }: PluginFunctions
    ) {
      // if (command === KEY_COMMANDS.showLinkInput()) {
      //   if (!mainProps.disableToolbar && this.toolbar) {
      //     // For some reason, scroll is jumping sometimes for the below code.
      //     // Debug and fix it later.
      //     const isCursorLink = isSelectionInsideLink(editorState);
      //     if (isCursorLink) {
      //       this.editLinkAfterSelection(isCursorLink.blockKey, isCursorLink.entityKey);
      //       return HANDLED;
      //     }
      //     this.toolbar.handleLinkInput(null, true);
      //     return HANDLED;
      //   }
      // }

      const block = getCurrentBlock(editorState);
      const currentBlockType = block.getType();

      if (command.indexOf(`${KEY_COMMANDS.changeType()}`) === 0) {
        let newBlockType = command.split(":")[1];

        if (currentBlockType === Block.ATOMIC) {
          return HANDLED;
        }

        if (
          currentBlockType === Block.BLOCKQUOTE &&
          newBlockType === Block.CAPTION
        ) {
          newBlockType = Block.BLOCKQUOTE_CAPTION;
        } else if (
          currentBlockType === Block.BLOCKQUOTE_CAPTION &&
          newBlockType === Block.CAPTION
        ) {
          newBlockType = Block.BLOCKQUOTE;
        }

        setEditorState(RichUtils.toggleBlockType(editorState, newBlockType));

        return HANDLED;
      }

      if (command.indexOf(`${KEY_COMMANDS.toggleInline()}`) === 0) {
        const inline = command.split(":")[1];
        setEditorState(RichUtils.toggleInlineStyle(editorState, inline));

        return HANDLED;
      }

      if (
        command === "backspace" &&
        currentBlockType === Block.CODE &&
        !block.getText().length
      ) {
        setEditorState(resetBlockWithType(editorState, Block.UNSTYLED));

        return HANDLED;
      }

      if (command === "backspace") {
        const contentState = editorState.getCurrentContent();
        const previousBlock = contentState.getBlockBefore(block.getKey());
        const previousBlockType = previousBlock ? previousBlock.getType() : "";
        const selectionState = editorState.getSelection();
        const position = selectionState.getStartOffset();

        if (previousBlockType === Block.BREAK && position === 0) {
          const previousBlockKey = previousBlock.getKey();
          const newSelection = new SelectionState({
            anchorKey: previousBlockKey,
            focusKey: previousBlockKey,
            anchorOffset: 0,
            focusOffset: 0,
          });

          editorState = removeBlock(editorState, previousBlockKey);
          setEditorState(EditorState.forceSelection(editorState, newSelection));

          return HANDLED;
        }
      }

      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        setEditorState(newState);

        return HANDLED;
      }

      return NOT_HANDLED;
    },

    handleBeforeInput(
      inputString: string,
      editorState: EditorState,
      pluginFns: PluginFunctions
    ) {
      const { setEditorState } = pluginFns;
      const block = getCurrentBlock(editorState);
      const blockType = block.getType();

      if (blockType.indexOf(Block.ATOMIC) === 0) {
        return NOT_HANDLED;
      }

      const selection = editorState.getSelection();
      const blockLength = block.getLength();
      if (selection.getAnchorOffset() > 1 || blockLength > 1) {
        return NOT_HANDLED;
      }

      const blockTo = StringToTypeMap[block.getText()[0] + inputString];
      if (!blockTo) {
        return NOT_HANDLED;
      }

      const finalType = blockTo.split(":");
      // tslint:disable-next-line:no-magic-numbers
      if (finalType.length < 1 || finalType.length > 3) {
        return NOT_HANDLED;
      }

      let fType = finalType[0];
      if (finalType.length === 1) {
        if (blockType === finalType[0]) {
          return NOT_HANDLED;
        }
      } else if (finalType.length === 2) {
        if (blockType === finalType[1]) {
          return NOT_HANDLED;
        }
        if (blockType === finalType[0]) {
          fType = finalType[1];
        }

        // tslint:disable-next-line:no-magic-numbers
      } else if (finalType.length === 3) {
        if (blockType === finalType[2]) {
          return NOT_HANDLED;
        }
        if (blockType === finalType[0]) {
          fType = finalType[1];
        } else {
          fType = finalType[2];
        }
      }

      setEditorState(
        resetBlockWithType(editorState, fType, {
          text: "",
        })
      );

      return HANDLED;
    },

    handleReturn(
      ev: React.KeyboardEvent<{}>,
      editorState: EditorState,
      { setEditorState }: PluginFunctions
    ) {
      const currentBlock = getCurrentBlock(editorState);
      const blockType = currentBlock.getType() as BlockType;

      if (isSoftNewlineEvent(ev)) {
        setEditorState(RichUtils.insertSoftNewline(editorState));

        return HANDLED;
      }

      if (!ev.altKey || !ev.metaKey || !ev.ctrlKey) {
        if (blockType.indexOf(Block.ATOMIC) === 0) {
          setEditorState(addNewBlockAt(editorState, currentBlock.getKey()));

          return HANDLED;
        }

        if (!currentBlock.getLength()) {
          switch (blockType) {
            case Block.UL:
            case Block.OL:
            case Block.BLOCKQUOTE:
            case Block.BLOCKQUOTE_CAPTION:
            case Block.CAPTION:
            case Block.H2:
            case Block.H3:
            case Block.H1:
              setEditorState(resetBlockWithType(editorState, Block.UNSTYLED));

              return HANDLED;
            default:
              return NOT_HANDLED;
          }
        }

        const selection = editorState.getSelection();

        if (
          selection.isCollapsed() &&
          currentBlock.getLength() === selection.getStartOffset()
        ) {
          if (continuousBlocks.indexOf(blockType) < 0) {
            setEditorState(addNewBlockAt(editorState, currentBlock.getKey()));

            return HANDLED;
          }
        }
      }

      return NOT_HANDLED;
    },
  };
}
