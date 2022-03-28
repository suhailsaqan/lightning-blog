import {
  EditorState,
  genKey,
  Modifier,
  SelectionState,
  ContentState,
} from "draft-js";
import { Block } from "./constants";
import { addNewBlock, addNewBlockAt } from "./helpers";
import { Stack } from "immutable";

export interface UploadImageData {
  src?: string;
  srcSet?: string;
  sizes?: string;
  error?: string;
  data?: {
    [key: string]: string;
  };
}

export interface UploadHelperOptions {
  uploadImage?: (file: File) => Promise<UploadImageData>;
}

export interface StateGetterSetter {
  getEditorState: () => EditorState;
  setEditorState: (state: EditorState) => void;
}

export function uploadHelper(
  { getEditorState, setEditorState }: StateGetterSetter,
  files: File[],
  options: UploadHelperOptions,
  selection?: SelectionState
) {
  let newEditorState: EditorState;
  let src = URL.createObjectURL(files[0]);
  let blockKey: string;

  const editorState = getEditorState();
  const currentSelection = selection || editorState.getSelection();
  const currentBlockKey = currentSelection.getIsBackward()
    ? currentSelection.getFocusKey()
    : currentSelection.getAnchorKey();
  const block = editorState.getCurrentContent().getBlockForKey(currentBlockKey);

  if (
    block &&
    !block.getLength() &&
    block.getType().indexOf(Block.ATOMIC) < 0
  ) {
    // Replace empty block
    blockKey = block.getKey();
    newEditorState = addNewBlock(editorState, Block.IMAGE, {
      src,
      uploading: true,
    });
  } else {
    // Insert after current block
    blockKey = genKey();
    newEditorState = addNewBlockAt(
      editorState,
      currentBlockKey,
      Block.IMAGE,
      {
        src,
        uploading: true,
      },
      blockKey
    );
  }

  // Force selection after image inserting
  newEditorState = EditorState.forceSelection(
    newEditorState,
    new SelectionState({
      focusKey: blockKey,
      anchorKey: blockKey,
      focusOffset: 0,
    })
  );

  setEditorState(newEditorState);

  if (options && options.uploadImage) {
    const contentOnAddingStep = newEditorState.getCurrentContent();

    options.uploadImage(files[0]).then((data) => {
      const state = getEditorState();
      const content = state.getCurrentContent();
      const imageBlock = content.getBlockForKey(blockKey);

      // Create new selection because Modifier.setBlockData() works only with selection,
      // but on long uploading user can select somethings else
      const targetSelection = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: 0,
        focusKey: blockKey,
        focusOffset: 0,
      });
      const oldSelection = state.getSelection();
      let blockData = imageBlock.getData();

      blockData = blockData.merge({
        ...data,
        uploading: false,
      });

      const newContent = Modifier.setBlockData(
        content,
        targetSelection,
        blockData
      );

      // replace history stacks
      const contentForReplacing = Modifier.setBlockData(
        contentOnAddingStep,
        targetSelection,
        blockData
      );
      const decorator = state.getDecorator();
      const stateWithLoadedImage = EditorState.create({
        currentContent: newContent,
        undoStack: replaceStack(
          state.getUndoStack(),
          contentOnAddingStep,
          contentForReplacing
        ),
        redoStack: replaceStack(
          state.getRedoStack(),
          contentOnAddingStep,
          contentForReplacing
        ),
        selection: oldSelection,
        decorator: decorator || null,
      });

      // Return correct selection position
      setEditorState(
        EditorState.forceSelection(stateWithLoadedImage, oldSelection)
      );
    });
  }
}

function replaceStack(
  oldStack: Stack<ContentState>,
  replaceableContent: ContentState,
  newContent: ContentState
): Stack<ContentState> {
  let stack = Stack<ContentState>();

  oldStack.forEach((content) => {
    stack = stack.push(content === replaceableContent ? newContent : content);
  });

  return stack;
}
