import {ContentBlock, DraftBlockType, EditorState} from 'draft-js';

export interface BlockPropsInner {
    getEditorState?: () => EditorState;
    setEditorState?: (es: EditorState) => void;
}

export interface BlockProps {
    block: ContentBlock;
    blockProps?: BlockPropsInner;
}

export type BlockType = DraftBlockType | 'block-quote-caption' | 'atomic:image' | 'atomic:break' | 'caption';
