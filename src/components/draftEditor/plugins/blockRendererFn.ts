import {QuoteCaptionBlock} from '../blocks/BlockQuoteCaption/BlockQuoteCaption';
import {CaptionBlock} from '../blocks/CaptionBlock/CaptionBlock';
import {AtomicBlock} from '../blocks/AtomicBlock/AtomicBlock';
import {SeparatorBlock} from '../blocks/SeparatorBlock/SeparatorBlock';
import {TextBlock} from '../blocks/TextBlock/TextBlock';
import {Block} from '../util/constants';
import {DraftPlugin, PluginFunctions} from '../plugins_editor/PluginsEditor';
import {ContentBlock} from 'draft-js';
import {BlockType} from '../typings';

export function blockRendererPlugin(): DraftPlugin {
    return {
        blockRendererFn(contentBlock: ContentBlock, pluginFns: PluginFunctions) {
            const {getEditorState} = pluginFns;
            const blockType = contentBlock.getType() as BlockType;

            switch (blockType) {
                case Block.UNSTYLED:
                case Block.PARAGRAPH:
                    return {
                        component: TextBlock,
                    };

                case Block.BLOCKQUOTE_CAPTION:
                    return {
                        component: QuoteCaptionBlock,
                    };

                case Block.CAPTION:
                    return {
                        component: CaptionBlock,
                    };

                case Block.ATOMIC:
                    return {
                        component: AtomicBlock,
                        editable: false,
                        props: {
                            getEditorState,
                        },
                    };

                case Block.BREAK:
                    return {
                        component: SeparatorBlock,
                        editable: false,
                    };

                default:
                    return null;
            }
        }
    };
}
