import * as React from "react";
import {
  Block,
  HYPERLINK,
  INLINE_STYLE_BOLD,
  INLINE_STYLE_HIGHLIGHT,
  INLINE_STYLE_ITALIC,
  INLINE_STYLE_STRIKETHROUGH,
  INLINE_STYLE_UNDERLINE,
} from "../../util/constants";
import { ToolbarButtonInterface } from "./Toolbar";

export const BLOCK_BUTTON_H1 = {
  label: "H1",
  style: Block.H1,
  description: "Heading 1",
};

export const BLOCK_BUTTON_H2 = {
  label: "H2",
  style: Block.H2,
  description: "Heading 2",
};

export const BLOCK_BUTTON_H3 = {
  label: "H3",
  style: Block.H3,
  description: "Heading 3",
};

export const BLOCK_BUTTON_BLOCKQUOTE = {
  label: (
    <svg width="10.8" height="10" viewBox="0 0 13 12">
      <path
        d="M12.5 0l.5.6c-2 1.5-3 3-3 4.8 0 1.5.8 2.7 2.4 3.8L9.5 12C8 10.8 7.1 9.3 7.1 7.7c0-2.4 1.8-5 5.4-7.7zM5.4 0l.5.6c-2 1.5-3 3-3 4.8 0 1.5.7 2.7 2.3 3.8L2.4 12C.8 10.8 0 9.3 0 7.7c0-2.4 1.8-5 5.4-7.7z"
        fill="currentColor"
      />
    </svg>
  ),
  style: Block.BLOCKQUOTE,
  description: "Blockquote",
};

export const BLOCK_BUTTON_UL = {
  label: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path fill="currentColor" d="M8 5h14v1H8zM8 12h14v1H8zM8 19h14v1H8z" />
      <circle fill="currentColor" cx="4.5" cy="5.5" r="1.5" />
      <circle fill="currentColor" cx="4.5" cy="12.5" r="1.5" />
      <circle fill="currentColor" cx="4.5" cy="19.5" r="1.5" />
    </svg>
  ),
  style: Block.UL,
  description: "Unordered List",
};

export const BLOCK_BUTTON_OL = {
  label: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path
        fill="currentColor"
        d="M8 5h14v1H8zM8 12h14v1H8zM8 19h14v1H8zM4.4 8h-1V3.9h-.9v-.7L4.4 3v5zM5.6 15h-3v-.6L4 12.7l.4-.7.1-.5-.1-.5-.4-.2-.4.2-.1.6h-1c0-.4.1-.8.4-1.1.2-.3.6-.5 1-.5.5 0 .8.1 1.1.4s.4.6.4 1.1l-.2.8-.7 1-.7 1h1.8v.7zM3.9 19.1l.4-.2.1-.5-.2-.5-.2-.2-.4.2-.1.4h-1c0-.4.1-.7.4-.9.3-.3.6-.4 1.1-.4.5 0 .8.1 1.1.4.3.2.4.6.4 1l-.2.6-.5.4.5.4.2.7c0 .4-.1.8-.4 1-.3.4-.7.5-1.1.5-.4 0-.8-.1-1.1-.4-.3-.2-.4-.6-.4-1h.9l.2.5.4.2.5-.2c.2-.1.2-.3.2-.5l-.2-.6a.8.8 0 0 0-.5-.2h-.5v-.7h.4z"
      />
    </svg>
  ),
  style: Block.OL,
  description: "Ordered List",
};

export const BLOCK_BUTTONS: ToolbarButtonInterface[] = [
  BLOCK_BUTTON_H1,
  BLOCK_BUTTON_H2,
  BLOCK_BUTTON_H3,
  BLOCK_BUTTON_BLOCKQUOTE,
  BLOCK_BUTTON_UL,
  BLOCK_BUTTON_OL,
];

export const INLINE_BUTTON_BOLD = {
  label: "B",
  style: INLINE_STYLE_BOLD,
  description: "Bold",
};

export const INLINE_BUTTON_ITALIC = {
  label: "I",
  style: INLINE_STYLE_ITALIC,
  description: "Italic",
};

export const INLINE_BUTTON_UNDERLINE = {
  label: "U",
  style: INLINE_STYLE_UNDERLINE,
  description: "Underline",
};

export const INLINE_BUTTON_HIGHLIGHT = {
  label: "Hi",
  style: INLINE_STYLE_HIGHLIGHT,
  description: "Highlight selection",
};

export const INLINE_BUTTON_STRIKETHROUGH = {
  label: "St",
  style: INLINE_STYLE_STRIKETHROUGH,
  description: "Strikethrough selection",
};

export const INLINE_BUTTON_HYPERLINK = {
  label: (
    <svg width="24" height="24">
      <path
        d="M12 9.2l2.7-2.8.7-.4c.6-.2 1.1-.1 1.6.4l1.4 1.5c.6.6.7 1.1.5 1.5l-.4.8-3 3c-.5.5-1.1.6-1.6.4l-.6-.3L12 9.2zm1.1 6.6l-3 2.7-.8.4c-.5.2-1.1 0-1.5-.4L6.3 17c-.5-.5-.6-1.1-.4-1.6 0-.3.2-.5.4-.7l3-3c.5-.5 1.1-.8 1.5-.6.3.1.5.4.6.5l1.7 4.2z"
        stroke="#FFF"
        fill="none"
      />
    </svg>
  ),
  style: HYPERLINK,
  description: "Add a link",
};

export const INLINE_BUTTONS: ToolbarButtonInterface[] = [
  INLINE_BUTTON_BOLD,
  INLINE_BUTTON_ITALIC,
  INLINE_BUTTON_UNDERLINE,
  INLINE_BUTTON_HIGHLIGHT,
  INLINE_BUTTON_STRIKETHROUGH,
  INLINE_BUTTON_HYPERLINK,
];
