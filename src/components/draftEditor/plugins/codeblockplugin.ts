import * as React from 'react';
import {ContentBlock, DraftEditorCommand, EditorState, KeyBindingUtil, Modifier, RichUtils} from 'draft-js';
import {CodeBlock} from '../blocks/CodeBlock/CodeBlock';
import {getCurrentBlock, updateDataOfBlock} from '../util/helpers';
import {Block, HANDLED, KEY_L, KEY_TAB, NOT_HANDLED} from '../util/constants';
import {DraftPlugin, PluginFunctions} from '../plugins_editor/PluginsEditor';

interface OptionType {
    ignoreCommands?: string[];
    // tslint:disable-next-line:no-magic-numbers
    tabSize?: 2 | 4;
}

function shouldEarlyReturn(block: ContentBlock): boolean {
    return (block.getType() !== Block.CODE);
}

export function codeBlockPlugin(options?: OptionType): DraftPlugin {
    const ignoreCommands = (options && options.ignoreCommands) || ['bold', 'italic', 'underline'];
    const tabSize = (options && options.tabSize) ? options.tabSize : 2;

    return {
        blockRendererFn(block: ContentBlock, {setEditorState, getEditorState}: PluginFunctions) {
            if (shouldEarlyReturn(block)) {
                return null;
            }

            return {
                component: CodeBlock,
                props: {
                    setEditorState,
                    getEditorState,
                },
            };
        },

        blockStyleFn(block: ContentBlock) {
            if (shouldEarlyReturn(block)) {
                return null;
            }

            const data = block.getData();
            const lang = data.get('language', 'no-lang');

            return `md-block md-block-code language-${lang || 'no-lang'}`;
        },

        keyBindingFn(ev: React.KeyboardEvent, {getEditorState, setEditorState}: PluginFunctions): DraftEditorCommand | void | false  {
            const editorState = getEditorState();

            if (shouldEarlyReturn(getCurrentBlock(editorState))) {
                return;
            }

            if (ev.ctrlKey && ev.shiftKey && ev.which === KEY_L) {
                return 'code-block-add-language' as DraftEditorCommand;
            }

            if (ev.which === KEY_TAB) {
                const currentBlock = getCurrentBlock(editorState);
                const selection = editorState.getSelection();

                if (shouldEarlyReturn(currentBlock) || !selection.isCollapsed()) {
                    return null;
                }

                ev.preventDefault();
                let str: string = '';
                for (let i = 0; i < tabSize; i++) {
                    str += ' ';
                }

                const contentState = Modifier.insertText(editorState.getCurrentContent(), selection, str);
                const newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
                setEditorState(EditorState.forceSelection(newEditorState, contentState.getSelectionAfter()));

                return false;
            }
        },

        handleKeyCommand(command: string, editorState: EditorState, time: number, {setEditorState, getProps}: PluginFunctions) {
            const block = getCurrentBlock(editorState);

            if (shouldEarlyReturn(block)) {
                return NOT_HANDLED;
            }

            if (ignoreCommands.indexOf(command) >= 0) {
                return HANDLED;
            }

            if (command === 'code-block-add-language') {
                const data = block.getData();
                const props = getProps();

                if (props.getParentMethods) {
                    props.getParentMethods()
                        .getInput('Enter language for the code block')
                        .then((lang) => {
                            const newData = data.set('language', lang);
                            setEditorState(updateDataOfBlock(editorState, block, newData));
                        }).catch(() => {
                            // TODO
                        });

                    return HANDLED;
                } else {
                    const lang = prompt('Set Language:', data.get('language') || '');

                    if (lang) {
                        const newData = data.set('language', lang);
                        setEditorState(updateDataOfBlock(editorState, block, newData));
                    }

                    return HANDLED;
                }
            }

            return NOT_HANDLED;
        },

        handleReturn(ev: React.KeyboardEvent, editorState: EditorState, {setEditorState}: PluginFunctions) {
            if (shouldEarlyReturn(getCurrentBlock(editorState))) {
                return NOT_HANDLED;
            }

            if (KeyBindingUtil.hasCommandModifier(ev)) {
                return NOT_HANDLED;
            }

            setEditorState(RichUtils.insertSoftNewline(editorState));

            return HANDLED;
        },

        handlePastedText(text: string, html: string, editorState: EditorState, {setEditorState}: PluginFunctions) {
            const currentBlock = getCurrentBlock(editorState);

            if (shouldEarlyReturn(currentBlock)) {
                return NOT_HANDLED;
            }

            const content = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            const insertOrReplace = selection.isCollapsed() ? Modifier.insertText : Modifier.replaceText;
            setEditorState(
                EditorState.push(
                    editorState,
                    insertOrReplace(
                        content,
                        editorState.getSelection(),
                        text
                    ),
                    'insert-characters'
                )
            );

            return HANDLED;
        },
    };
}
