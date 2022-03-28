/**
 * Returns the `boundingClientRect` of the passed selection.
 */
import {ContentBlock, EditorState, SelectionState} from 'draft-js';
import {getCurrentBlock} from './helpers';
import {Block, ENTITY_TYPE_LINK} from './constants';

export function getSelectionRect(selected: Selection): (ClientRect | null) {
    const _rect = selected.getRangeAt(0).getBoundingClientRect();

    let rect = _rect && _rect.top ? _rect : selected.getRangeAt(0).getClientRects()[0];
    if (!rect) {
        if (selected.anchorNode && (selected.anchorNode as Element).getBoundingClientRect) {
            rect = (selected.anchorNode as Element).getBoundingClientRect();
        } else {
            return null;
        }
    }

    return rect;
}

/**
 * Returns the native selection node.
 */
export function getSelection(root: Window): Selection | null {
    let t = null;
    if (root.getSelection) {
        t = root.getSelection();
    } else if (root.document.getSelection) {
        t = root.document.getSelection();
    }

    return t;
}

/**
 * Recursively finds the DOM Element of the block where the cursor is currently present.
 * If not found, returns null.
 */
export function getSelectedBlockNode(root: Window): HTMLElement | null {
    const selection = root.getSelection();
    if (selection.rangeCount === 0) {
        return null;
    }
    let node = selection.getRangeAt(0).startContainer;

    do {
        if ((node as Element).getAttribute && (node as Element).getAttribute('data-block') === 'true') {
            return (node as HTMLElement);
        }
        node = node.parentNode;

    } while (node !== null);

    return null;
}

export const getSelectedEntityKey = (selection: SelectionState, currentBlock: ContentBlock): string | null => {
    let entityKey: string | null = null;
    let start = selection.getStartOffset();
    let end = selection.getEndOffset();
    if (start === end && start === 0) {
        end = 1;
    } else if (start === end) {
        start -= 1;
    }

    for (let i = start; i < end; i += 1) {
        const currentEntity = currentBlock.getEntityAt(i);
        if (!currentEntity) {
            return null;
        }
        if (i === start) {
            entityKey = currentEntity;
        } else if (entityKey !== currentEntity) {
            return null;
        }
    }

    return entityKey;
};
/**
 * Return selected in one block entity
 */
export const getSelectionForEntity = (editorState: EditorState): SelectionState | null => {
    const selection = editorState.getSelection();
    const currentBlock = getCurrentBlock(editorState);

    let entityKey = getSelectedEntityKey(selection, currentBlock);
    let start = 0;
    let end = 0;

    if (!entityKey) {
        return null;
    }

    currentBlock.findEntityRanges(
        (character) => character.getEntity() === entityKey,
        (startEntity, endEntity) => {
            start = startEntity;
            end = endEntity;
        });

    // Switch end and start, on backwards selection
    if (selection.getIsBackward()) {
        [end, start] = [start, end];
    }

    return selection.merge({
        anchorOffset: start,
        focusOffset: end,
    }) as SelectionState;
};
/**
 * Check whether the cursor is inside one entity with type LINK
 */
export const isSelectionInsideLink = (editorState: EditorState): boolean => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const currentBlock = getCurrentBlock(editorState);

    if (currentBlock && currentBlock.getType().indexOf(Block.ATOMIC) < 0 && currentBlock.getLength() > 0) {
        let start = selection.getStartOffset();
        let end = selection.getEndOffset() - 1;
        if (end < 0) {
            end = 0;
        }

        const entityStartKey = currentBlock.getEntityAt(start);
        const entityEndKey = currentBlock.getEntityAt(end);

        if (entityStartKey !== null && entityEndKey !== null && entityStartKey === entityEndKey) {
            const entity = content.getEntity(entityStartKey);

            if (entity.getType() === ENTITY_TYPE_LINK) {
                return true;
            }
        }
    }

    return false;
};
