import {convertFromHTML, ConvertFromHTMLOptions, EntityKey} from 'draft-convert';
import {Map} from 'immutable';
import {
    Block,
    ENTITY_TYPE_LINK,
    INLINE_STYLE_BOLD,
    INLINE_STYLE_CODE,
    INLINE_STYLE_HIGHLIGHT,
    INLINE_STYLE_ITALIC,
    INLINE_STYLE_STRIKETHROUGH,
    INLINE_STYLE_UNDERLINE
} from './constants';
import {ContentState, DraftInlineStyle} from 'draft-js';

export const htmlToStyle = (nodeName: string, node: HTMLElement, currentStyle: DraftInlineStyle) => {
    switch (nodeName) {
        case 'em':
            return currentStyle.add(INLINE_STYLE_ITALIC);

        case 'strong':
            return currentStyle.add(INLINE_STYLE_BOLD);

        case 'strike':
            return currentStyle.add(INLINE_STYLE_STRIKETHROUGH);

        case 'u':
            return currentStyle.add(INLINE_STYLE_UNDERLINE);

        case 'mark':
            return currentStyle.add(INLINE_STYLE_HIGHLIGHT);

        case 'code':
            return currentStyle.add(INLINE_STYLE_CODE);

        default:
            break;
    }

    return currentStyle;
};

export const htmlToEntity = (nodeName: string, node: HTMLElement, createEntity: (type: string, mutability: string, data: object) => EntityKey) => {
    if (nodeName === 'a') {
        const hrefNode = node as HTMLAnchorElement;

        return createEntity(ENTITY_TYPE_LINK, 'MUTABLE', {url: hrefNode.href});
    }

    return undefined;
};

export const htmlToBlock = (nodeName: string, node: HTMLElement) => {
    if (nodeName === 'h1') {
        return {
            type: Block.H1,
            data: {},
        };
    } else if (nodeName === 'h2') {
        return {
            type: Block.H2,
            data: {},
        };
    } else if (nodeName === 'h3') {
        return {
            type: Block.H3,
            data: {},
        };
    } else if (nodeName === 'h4') {
        return {
            type: Block.H4,
            data: {},
        };
    } else if (nodeName === 'h5') {
        return {
            type: Block.H5,
            data: {},
        };
    } else if (nodeName === 'h6') {
        return {
            type: Block.H6,
            data: {},
        };
    } else if (nodeName === 'p' && (
        node.className === 'md-block-caption' ||
        node.className === 'md-block-block-quote-caption')) {
        return {
            type: Block.BLOCKQUOTE_CAPTION,
            data: {},
        };
    } else if (nodeName === 'figure') {
        const imageNode = node.querySelector('img') as HTMLImageElement;

        if (imageNode) {
            return {
                type: Block.IMAGE,
                data: {
                    src: imageNode.src,
                    srcSet: imageNode.srcset,
                    sizes: imageNode.sizes,
                    data: Map(imageNode.dataset)
                },
            };
        }

        return undefined;
    } else if (nodeName === 'img') {
        return {
            type: Block.IMAGE,
            data: {
                src: (node as HTMLImageElement).src,
                srcSet: (node as HTMLImageElement).srcset,
                sizes: (node as HTMLImageElement).sizes,
                data: Map(node.dataset)
            },
        };

    } else if (nodeName === 'hr') {
        return {
            type: Block.BREAK,
            data: {},
        };
    } else if (nodeName === 'blockquote') {
        return {
            type: Block.BLOCKQUOTE,
            data: {},
        };
    } else if (nodeName === 'p') {
        return {
            type: Block.UNSTYLED,
            data: {},
        };
    } else if (['div', 'pre'].includes(nodeName) && node.className === 'md-block-code-container') {
        return {
            type: Block.CODE,
            data: {},
        };
    }

    return undefined;
};

function replaceBrInEmptyParagraph(html: string): string {
    return html.replace(/<p[^>]*><br\s*\/><\/p>/g, '<p><\/p>');
}

export const options: ConvertFromHTMLOptions = {
    htmlToStyle,
    htmlToEntity,
    htmlToBlock,
};

export function setImportOptions(htmlOptions: ConvertFromHTMLOptions = options) {
    const converter = convertFromHTML(htmlOptions);

    return (rawHTML: string) => {
        return converter(replaceBrInEmptyParagraph(rawHTML));
    };
}

export function toState(rawHTML: string, htmlOptions: ConvertFromHTMLOptions = options): ContentState {
    return convertFromHTML(htmlOptions)(replaceBrInEmptyParagraph(rawHTML));
}
