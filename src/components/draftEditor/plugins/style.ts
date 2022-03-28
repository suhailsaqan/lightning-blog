import {Map} from 'immutable';
import {Block, INLINE_STYLE_HIGHLIGHT} from '../util/constants';
import {DraftPlugin} from '../plugins_editor/PluginsEditor';
import {Link, findLinkEntities} from '../entities/link';
import {ContentBlock} from 'draft-js';
import {BlockType} from '../typings';

/**
 * Base plugin that provides styling and structure to the editor.
 */
export function inlineStylePlugin(): DraftPlugin {
    return {
        blockStyleFn(contentBlock: ContentBlock): string | null {
            const blockType = contentBlock.getType() as BlockType;

            switch (blockType) {
                case Block.BLOCKQUOTE:
                    return `md-block md-block--quote`;
                case Block.UNSTYLED:
                    return `md-block md-block--paragraph`;
                case Block.ATOMIC:
                    return `md-block md-block--atomic`;
                case Block.CAPTION:
                    return `md-block md-block-caption`;
                case Block.BLOCKQUOTE_CAPTION: {
                    return `md-block md-block--quote md-block-quote-caption`;
                }
                default:
                    return null;
            }
        },
        customStyleMap: {
            [INLINE_STYLE_HIGHLIGHT]: {
                backgroundColor: 'yellow',
            },
        },
        blockRenderMap: Map({
            [Block.CAPTION]: {
                element: 'cite',
            },
            [Block.BLOCKQUOTE_CAPTION]: {
                element: 'blockquote',
            },
            [Block.IMAGE]: {
                element: 'figure',
            },
            [Block.BREAK]: {
                element: 'div',
            },
            [Block.UNSTYLED]: {
                element: 'div',
                aliasedElements: ['p', 'div'],
            },
        }),
        decorators: [{
            strategy: findLinkEntities,
            component: Link,
        }],
    };
}
