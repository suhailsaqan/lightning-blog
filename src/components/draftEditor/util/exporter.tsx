import * as React from "react";
import {
  ContentStateConverterOptions,
  convertToHTML,
  RawBlock,
  RawEntity,
} from "draft-convert";

import {
  Block,
  ENTITY_TYPE_LINK,
  INLINE_STYLE_BOLD,
  INLINE_STYLE_CODE,
  INLINE_STYLE_HIGHLIGHT,
  INLINE_STYLE_ITALIC,
  INLINE_STYLE_STRIKETHROUGH,
  INLINE_STYLE_UNDERLINE,
} from "./constants";
import { ContentState } from "draft-js";

export const styleToHTML = (style: string) => {
  switch (style) {
    case INLINE_STYLE_ITALIC:
      return <em />;

    case INLINE_STYLE_BOLD:
      return <strong />;

    case INLINE_STYLE_STRIKETHROUGH:
      return <s />;

    case INLINE_STYLE_UNDERLINE:
      return <u />;

    case INLINE_STYLE_HIGHLIGHT:
      return <mark />;

    case INLINE_STYLE_CODE:
      return <code />;

    default:
      return null;
  }
};

export const blockToHTML = (block: RawBlock) => {
  const blockType = block.type;

  switch (blockType) {
    case Block.H1:
      return <h1 />;

    case Block.H2:
      return <h2 />;

    case Block.H3:
      return <h3 />;

    case Block.H4:
      return <h4 />;

    case Block.H5:
      return <h5 />;

    case Block.H6:
      return <h6 />;

    case Block.BLOCKQUOTE_CAPTION:
    case Block.CAPTION:
      return {
        start: "<p><caption>",
        end: "</caption></p>",
      };

    case Block.IMAGE: {
      const blockData = block.data;
      // @ts-ignore: blockData.data is Map from ImmutableJs
      const imgData = (blockData.data && blockData.data.toJS
        ? blockData.data.toJS()
        : {}) as { [key: string]: string | null | number };
      const sizes = blockData.sizes;
      const srcSet = blockData.srcSet;
      let dataStr = Object.keys(imgData)
        .map(
          (key) => `data-${key}="${decodeURIComponent(imgData[key] as string)}"`
        )
        .join(" ");

      if (sizes) {
        dataStr += ` sizes="${sizes}"`;
      }
      if (srcSet) {
        dataStr += ` srcset="${srcSet}"`;
      }

      return {
        start: `<figure><img src="${blockData.src}" alt="" ${dataStr}/><figcaption>`,
        end: "</figcaption></figure>",
      };
    }

    case Block.ATOMIC:
      return {
        start: "<figure>",
        end: "</figure>",
      };

    case Block.BREAK:
      return <hr />;

    case Block.BLOCKQUOTE:
      return <blockquote />;

    case Block.OL:
      return {
        element: <li />,
        nest: <ol />,
      };

    case Block.UL:
      return {
        element: <li />,
        nest: <ul />,
      };

    case Block.UNSTYLED:
      if (block.text.length < 1) {
        return (
          <p>
            <br />
          </p>
        );
      }

      return <p />;

    case Block.CODE:
      return {
        element: <pre />,
      };

    default:
      return null;
  }
};

export const entityToHTML = (entity: RawEntity, originalText: string) => {
  if (entity.type === ENTITY_TYPE_LINK) {
    return {
      start: `<a href="${entity.data.url}">`,
      end: "</a>",
    };
  }

  return originalText;
};

export const options: ContentStateConverterOptions = {
  styleToHTML,
  blockToHTML,
  entityToHTML,
};

export const setRenderOptions = (htmlOptions = options) =>
  convertToHTML(htmlOptions);

export const fromState = (contentState: ContentState, htmlOptions = options) =>
  convertToHTML(htmlOptions)(contentState);
