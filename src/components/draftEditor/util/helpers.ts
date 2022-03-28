import {
    ContentBlock,
    ContentState,
    convertFromRaw,
    EditorState,
    genKey,
    RawDraftContentState,
    SelectionState,
    Modifier
} from 'draft-js';
import {List, Map} from 'immutable';
import {Block} from './constants';

export function createEditorState(content: string | RawDraftContentState = null): EditorState {
    if (content === null) {
        return EditorState.createEmpty();
    }

    let contentState: ContentState;

    if (typeof content === 'string') {
        contentState = ContentState.createFromText(content);
    } else {
        contentState = convertFromRaw(content);
    }

    return EditorState.createWithContent(contentState);
}

/**
 * Get block level metadata for a given block type.
 */
export function getDefaultBlockData(blockType: string, initialData: {} = {}): {} {
    switch (blockType) {
        case Block.CODE: {
            return {
                language: '',
            };
        }
        default:
            return initialData;
    }
}

/**
 * Get current data of block which has the cursor.
 */
export function getCurrentBlock(editorState: EditorState): ContentBlock {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    return contentState.getBlockForKey(selectionState.getStartKey());
}

/**
 * Replace an empty block at the current cursor position with a
 * new block of the given type
 */
export function addNewBlock(editorState: EditorState, newType: string, initialData: {} = {}): EditorState {
    const selectionState = editorState.getSelection();
    if (!selectionState.isCollapsed()) {
        return editorState;
    }

    const currentBlock = getCurrentBlock(editorState);
    if (!currentBlock) {
        return editorState;
    }

    if (currentBlock.getLength() === 0) {
        if (currentBlock.getType() === newType) {
            return editorState;
        }

        const contentState = editorState.getCurrentContent();
        const key = selectionState.getStartKey();
        const blockMap = contentState.getBlockMap();
        const newBlock = currentBlock.merge({
            type: newType,
            data: getDefaultBlockData(newType, initialData),
        }) as ContentBlock;
        const newContentState = contentState.merge({
            blockMap: blockMap.set(key, newBlock),
            selectionAfter: selectionState,
        }) as ContentState;

        return EditorState.push(editorState, newContentState, 'change-block-type');
    }

    return editorState;
}

/**
 * Changes the block type of the current block. Merge current data
 * with the new overrides.
 */
export const resetBlockWithType = (editorState: EditorState, newType: string, overrides: {} = {}) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const key = selectionState.getStartKey();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(key);
    const newBlock = block.mergeDeep(overrides, {
        type: newType,
        data: getDefaultBlockData(newType),
    }) as ContentBlock;
    const newContentState = contentState.merge({
        blockMap: blockMap.set(key, newBlock),
        selectionAfter: selectionState.merge({
            anchorOffset: 0,
            focusOffset: 0,
        }),
    }) as ContentState;

    return EditorState.push(editorState, newContentState, 'change-block-type');
};

/**
 *
 */
export const removeBlock = (editorState: EditorState, blockKey: string) => {
    const contentState = editorState.getCurrentContent();
    const afterKey = contentState.getKeyAfter(blockKey);
    const targetRange = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: 0,
        focusKey: afterKey,
        focusOffset: 0
    });
    let newContentState = Modifier.setBlockType(
        contentState,
        targetRange,
        'unstyled'
    );

    newContentState = Modifier.removeRange(newContentState, targetRange, 'backward');

    return EditorState.push(editorState, newContentState, 'remove-range');
};

/**
 * Update block-level metadata of the given `block` to the `newData`
 */
export const updateDataOfBlock = (editorState: EditorState, block: ContentBlock, newData: {}) => {
    const contentState = editorState.getCurrentContent();
    const newBlock = block.merge({
        data: newData,
    }) as ContentBlock;
    const newContentState = contentState.merge({
        blockMap: contentState.getBlockMap().set(block.getKey(), newBlock),
    }) as ContentState;

    return EditorState.push(editorState, newContentState, 'change-block-data');
};

/**
 * Used from [react-rte](https://github.com/sstur/react-rte/blob/master/src/lib/insertBlockAfter.js)
 * by [sstur](https://github.com/sstur)
 */
export const addNewBlockAt = (
    editorState: EditorState,
    pivotBlockKey: string,
    newBlockType = Block.UNSTYLED,
    initialData = {},
    newBlockKey: string = null,
) => {
    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap();
    const block = blockMap.get(pivotBlockKey);
    if (!block) {
        throw new Error(`The pivot key - ${pivotBlockKey} is not present in blockMap.`);
    }

    const blocksBefore = blockMap.toSeq().takeUntil((v) => (v === block));
    const blocksAfter = blockMap.toSeq().skipUntil((v) => (v === block)).rest();

    if (!newBlockKey) {
        newBlockKey = genKey();
    }

    const newBlock = new ContentBlock({
        key: newBlockKey,
        type: newBlockType,
        text: '',
        characterList: List(),
        depth: 0,
        data: Map(getDefaultBlockData(newBlockType, initialData)),
    });

    const newBlockMap = blocksBefore.concat(
        [[pivotBlockKey, block], [newBlockKey, newBlock]],
        blocksAfter
    ).toOrderedMap();

    const selection = editorState.getSelection();

    const newContent = content.merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection.merge({
            anchorKey: newBlockKey,
            anchorOffset: 0,
            focusKey: newBlockKey,
            focusOffset: 0,
            isBackward: false,
        }),
    }) as ContentState;

    return EditorState.push(editorState, newContent, 'split-block');
};

/**
 * Swap two blocks with the given keys
 */
export function swapBlocks(editorState: EditorState, block: ContentBlock, toBlock: ContentBlock): EditorState {
    let newContent = editorState.getCurrentContent();
    let blockMap = newContent.getBlockMap();
    const fromBlockKey = block.getKey();
    const toBlockKey = toBlock.getKey();

    blockMap = blockMap
        .set(fromBlockKey, toBlock.set('key', fromBlockKey) as ContentBlock)
        .set(toBlockKey, block.set('key', toBlockKey) as ContentBlock);
    let newSelection = editorState.getSelection();
    newSelection = newSelection.merge({
        anchorKey: toBlockKey,
        focusKey: toBlockKey,
    }) as SelectionState;

    return EditorState.push(editorState, newContent.merge({
        blockMap,
        selectionAfter: newSelection,
    }) as ContentState, 'change-block-type');
}
