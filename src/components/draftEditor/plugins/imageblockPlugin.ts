import {ContentBlock, EditorState, SelectionState, Modifier} from 'draft-js';

import {Block, HANDLED, NOT_HANDLED} from '../util/constants';
import {ImageBlock} from '../blocks/ImageBlock/ImageBlock';
import {getCurrentBlock} from '../util/helpers';
import {DraftPlugin, PluginFunctions} from '../plugins_editor/PluginsEditor';
import {uploadHelper, UploadHelperOptions} from '../util/uploadImage';

function shouldEarlyReturn(block: ContentBlock): boolean {
    return (block.getType() !== Block.IMAGE);
}

export function imageBlockPlugin(options?: UploadHelperOptions): DraftPlugin {
    return {
        blockRendererFn(block: ContentBlock, {getEditorState, setEditorState}: PluginFunctions) {
            if (!shouldEarlyReturn(block)) {
                return {
                    component: ImageBlock,
                    props: {
                        getEditorState,
                        setEditorState,
                    },
                };
            }
        },

        /**
         * Handle pasting when cursor is in an image block. Paste the text as the
         * caption. Otherwise, let Draft do its thing.
         */
        handlePastedText(text: string, html: string, editorState: EditorState, {setEditorState}: PluginFunctions) {
            const currentBlock = getCurrentBlock(editorState);
            if (currentBlock.getType() === Block.IMAGE) {
                const content = editorState.getCurrentContent();

                setEditorState(EditorState.push(
                    editorState,
                    Modifier.insertText(
                        content,
                        editorState.getSelection(),
                        text
                    ),
                    'change-block-data'
                ));

                return HANDLED;
            }

            return NOT_HANDLED;
        },

        blockStyleFn(block: ContentBlock) {
            if (shouldEarlyReturn(block)) {
                return null;
            }

            return 'md-block md-block--image';
        },

        handleDroppedFiles(selection: SelectionState, files: File[], pluginFns: PluginFunctions) {
            if (!selection.isCollapsed() || !files.length) {
                return NOT_HANDLED;
            }

            const imageFiles = files.filter((file) => file.type.indexOf('image/') === 0);
            if (!imageFiles) {
                return NOT_HANDLED;
            }

            uploadHelper(pluginFns, files, options, selection);

            return HANDLED;
        }
    };
}
