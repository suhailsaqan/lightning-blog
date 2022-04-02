import * as React from "react";

import { BlockButtonsBar } from "./BlockButtonsBar";
import { InlineToolbar } from "./InlineButtonsBar";
import {
  getSelectedEntityKey,
  getSelection,
  getSelectionRect,
  isSelectionInsideLink,
} from "../../util/selection";
import { getCurrentBlock } from "../../util/helpers";
import {
  ENTITY_TYPE_LINK,
  HYPERLINK,
  KEY_ENTER,
  KEY_ESCAPE,
} from "../../util/constants";
import { EditorState, SelectionState } from "draft-js";
import { ToolbarButton } from "./ToolbarButton";

import "./Toolbar.module.css";

interface ToolbarProps {
  editorState: EditorState;
  toggleBlockType: (style: string) => void;
  toggleInlineStyle: (style: string) => void;
  inlineButtons: ToolbarButtonInterface[];
  blockButtons: ToolbarButtonInterface[];
  setLink: (url: string) => void;
  focus: () => void;
}

interface ToolbarState {
  isURLInputVisible: boolean;
  urlInputValue: string;
  selectedAddress: string;
  isVisible: boolean;
}

export interface ToolbarButtonInterface {
  label?: string | JSX.Element;
  style: string;
  description?: string;
}

function getSelectedAddress(selState: SelectionState): string {
  return `${selState.getAnchorKey()}_${selState.getAnchorOffset()}-${selState.getFocusKey()}_${selState.getFocusOffset()}`;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
  public state = {
    isURLInputVisible: false,
    isVisible: false,
    selectedAddress: "",
    urlInputValue: "",
  };

  private toolbarRef = React.createRef<HTMLDivElement>();

  private urlInputRef = React.createRef<HTMLInputElement>();

  public static getDerivedStateFromProps(
    newProps: ToolbarProps,
    prevState: ToolbarState
  ) {
    const { editorState } = newProps;
    const selectionState = editorState.getSelection();

    if (selectionState.isCollapsed()) {
      return {
        isURLInputVisible: false,
        isVisible: false,
        selectedAddress: "",
        urlInputValue: "",
      };
    } else {
      const selectedAddress = getSelectedAddress(selectionState);
      let isURLInputVisible = prevState.isURLInputVisible;
      let urlInputValue = prevState.urlInputValue;
      if (
        selectedAddress !== prevState.selectedAddress &&
        prevState.isURLInputVisible
      ) {
        isURLInputVisible = false;
        urlInputValue = "";
      }

      return {
        isURLInputVisible,
        isVisible: true,
        selectedAddress,
        urlInputValue,
      };
    }
  }

  public componentDidUpdate() {
    if (!this.state.isVisible || this.state.isURLInputVisible) {
      return;
    }

    const toolbarNode = this.toolbarRef.current;
    if (!toolbarNode) {
      return;
    }

    const parent = toolbarNode.parentElement;
    if (!parent) {
      return;
    }

    const selectionState = this.props.editorState.getSelection();
    if (selectionState.isCollapsed()) {
      return;
    }

    const nativeSelection = getSelection(window);
    if (!nativeSelection || !nativeSelection.rangeCount) {
      return;
    }

    const selectionBoundary = getSelectionRect(nativeSelection);
    const toolbarBoundary = toolbarNode.getBoundingClientRect();
    const parentBoundary = parent.getBoundingClientRect();
    /*
     * Main logic for setting the toolbar position.
     */
    const top =
      selectionBoundary.top - parentBoundary.top - toolbarBoundary.height;
    const width = toolbarBoundary.width;

    // The left side of the tooltip should be:
    // center of selection relative to parent - half width of toolbar
    const selectionCenter =
      selectionBoundary.left +
      selectionBoundary.width / 2 -
      parentBoundary.left;
    let left = selectionCenter - width / 2;

    if (left < 0) {
      left = 0;
    } else if (left + toolbarBoundary.width > parentBoundary.width) {
      left = parentBoundary.width - toolbarBoundary.width;
    }

    toolbarNode.style.left = `${left}px`;
    toolbarNode.style.width = `${width}px`;
    toolbarNode.style.top = `${top}px`;
  }

  public render() {
    const { editorState, inlineButtons, blockButtons } = this.props;
    const { isURLInputVisible, urlInputValue, isVisible } = this.state;

    if (!isVisible) {
      return null;
    }

    if (isURLInputVisible) {
      return (
        <div
          ref={this.toolbarRef}
          className="md-editor-toolbar md-editor-toolbar--link-input"
        >
          <div className="md-toolbar-controls md-toolbar-controls--show-input">
            <button
              className="md-url-input-close md-toolbar-button"
              onClick={this.onSaveLink}
            >
              link
            </button>
            <input
              ref={this.urlInputRef}
              type="text"
              className="md-url-input"
              onKeyDown={this.onKeyDown}
              onChange={this.onChange}
              placeholder="Enter or paste url"
              value={urlInputValue}
            />
          </div>
          <style jsx global>{`
            .md-editor-toolbar {
              background: #111;
              color: #fff;
              border-radius: 8px;
              z-index: 2;
              position: absolute;
              box-shadow: 0 1px 3px #717171;
              margin-top: -5px;
              display: flex;
              overflow: hidden;
              white-space: nowrap;
            }

            .md-editor-toolbar .md-url-input {
              box-sizing: border-box;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: calc(100% - 35px);
              height: 35px;
              padding: 5px 11px 5px 11px;
              border: none;
              background: #111;
              color: #fff;
              font-size: 0.9em;
              font-weight: 100;
              border-right: 1px solid #555;
              outline: none;
            }

            .md-editor-toolbar .md-url-input-close {
              position: absolute;
              right: 0;
              top: 0;
              cursor: pointer;
              background: #111;
            }

            .md-toolbar-controls {
              font-size: 14px;
              border-right: 1px solid #555;
              display: inline-flex;
              vertical-align: center;
            }

            .md-toolbar-controls:last-child {
              border-right: none;
            }

            .md-toolbar-controls.md-toolbar-controls--show-input {
              display: flex;
              flex: 1;
            }

            .md-toolbar-button {
              color: inherit;
              cursor: pointer;
              padding: 6px;
              height: 35px;
              width: 35px;
              line-height: 24px;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              background: none;
              border: 0;
              box-sizing: border-box;
            }

            .md-toolbar-button:hover {
              background: #0a3223;
            }

            .md-toolbar-button:active {
              background: #0a3223;
            }

            .md-toolbar-button.md-toolbar-button--active {
              background: #0a3223;
            }

            .md-toolbar-button.md-toolbar-button--active:hover {
              background: #0a3223;
            }

            .md-toolbar-button.md-toolbar-button--active:active {
              background: #0a3223;
            }

            .md-toolbar-button:last-child {
              margin-right: 0;
            }

            .md-toolbar-button.md-toolbar-button--bold {
              font-weight: bold;
            }

            .md-toolbar-button.md-toolbar-button--italic {
              font-style: italic;
            }

            .md-toolbar-button.md-toolbar-button--underline {
              text-decoration: underline;
            }

            .md-toolbar-button.md-toolbar-button--strikethrough {
              text-decoration: line-through;
            }

            .md-toolbar-button > svg {
              pointer-events: none;
            }
          `}</style>
        </div>
      );
    }

    // try find hyperlink to move it in separate section
    let currentInlineButtons = [...inlineButtons];
    let hyperLink: null | ToolbarButtonInterface = null;
    let isHyperLinkActive = false;
    for (let cnt = currentInlineButtons.length - 1; cnt > 0; cnt--) {
      if (currentInlineButtons[cnt].style === HYPERLINK) {
        hyperLink = currentInlineButtons.splice(cnt, 1)[0];
        isHyperLinkActive = isSelectionInsideLink(editorState);
        break;
      }
    }

    return (
      <div ref={this.toolbarRef} className="md-editor-toolbar">
        {currentInlineButtons.length > 0 ? (
          <InlineToolbar
            editorState={editorState}
            onToggle={this.props.toggleInlineStyle}
            buttons={currentInlineButtons}
          />
        ) : null}

        {hyperLink && (
          <div className="md-toolbar-controls">
            <ToolbarButton
              label={hyperLink.label}
              style={hyperLink.style}
              active={isHyperLinkActive}
              onToggle={this.handleLinkInput}
              description={hyperLink.description}
            />
          </div>
        )}

        {blockButtons.length > 0 ? (
          <BlockButtonsBar
            editorState={editorState}
            onToggle={this.props.toggleBlockType}
            buttons={blockButtons}
          />
        ) : null}
        <style jsx global>{`
          .md-editor-toolbar {
            background: #111;
            color: #fff;
            border-radius: 8px;
            z-index: 2;
            position: absolute;
            box-shadow: 0 1px 3px #717171;
            margin-top: -5px;
            display: flex;
            overflow: hidden;
            white-space: nowrap;
          }

          .md-editor-toolbar .md-url-input {
            box-sizing: border-box;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: calc(100% - 35px);
            height: 35px;
            padding: 5px 11px 5px 11px;
            border: none;
            background: #111;
            color: #fff;
            font-size: 0.9em;
            font-weight: 100;
            border-right: 1px solid #555;
            outline: none;
          }

          .md-editor-toolbar .md-url-input-close {
            position: absolute;
            right: 0;
            top: 0;
            cursor: pointer;
            background: #111;
          }

          .md-toolbar-controls {
            font-size: 14px;
            border-right: 1px solid #555;
            display: inline-flex;
            vertical-align: center;
          }

          .md-toolbar-controls:last-child {
            border-right: none;
          }

          .md-toolbar-controls.md-toolbar-controls--show-input {
            display: flex;
            flex: 1;
          }

          .md-toolbar-button {
            color: inherit;
            cursor: pointer;
            padding: 6px;
            height: 35px;
            width: 35px;
            line-height: 24px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: 0;
            box-sizing: border-box;
          }

          .md-toolbar-button:hover {
            background: #0a3223;
          }

          .md-toolbar-button:active {
            background: #0a3223;
          }

          .md-toolbar-button.md-toolbar-button--active {
            background: #0a3223;
          }

          .md-toolbar-button.md-toolbar-button--active:hover {
            background: #0a3223;
          }

          .md-toolbar-button.md-toolbar-button--active:active {
            background: #0a3223;
          }

          .md-toolbar-button:last-child {
            margin-right: 0;
          }

          .md-toolbar-button.md-toolbar-button--bold {
            font-weight: bold;
          }

          .md-toolbar-button.md-toolbar-button--italic {
            font-style: italic;
          }

          .md-toolbar-button.md-toolbar-button--underline {
            text-decoration: underline;
          }

          .md-toolbar-button.md-toolbar-button--strikethrough {
            text-decoration: line-through;
          }

          .md-toolbar-button > svg {
            pointer-events: none;
          }
        `}</style>
      </div>
    );
  }

  private onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.which === KEY_ENTER) {
      e.preventDefault();
      e.stopPropagation();

      this.onSaveLink();
    } else if (e.which === KEY_ESCAPE) {
      this.hideLinkInput();
    }
  };

  private onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.setState({
      urlInputValue: e.target.value,
    });
  };

  private handleLinkInput = () => {
    const { editorState } = this.props;
    const selection = editorState.getSelection();

    // On empty selection
    if (selection.isCollapsed()) {
      this.props.focus();

      return;
    }

    const selectedAddress = getSelectedAddress(editorState.getSelection());
    const entityKey = getSelectedEntityKey(
      selection,
      getCurrentBlock(editorState)
    );
    let linkFound = false;

    if (entityKey) {
      const entity = editorState.getCurrentContent().getEntity(entityKey);
      if (entity.getType() === ENTITY_TYPE_LINK) {
        const { url } = entity.getData();

        this.setState(
          {
            selectedAddress,
            isURLInputVisible: true,
            urlInputValue: url,
          },
          () => {
            setTimeout(() => {
              this.urlInputRef.current.focus();
              this.urlInputRef.current.select();
            });
          }
        );

        linkFound = true;
      }
    }

    if (!linkFound) {
      this.setState(
        {
          selectedAddress,
          isURLInputVisible: true,
        },
        () => {
          setTimeout(() => {
            this.urlInputRef.current.focus();
          });
        }
      );
    }
  };

  private onSaveLink = () => {
    this.props.setLink(this.state.urlInputValue);
    this.hideLinkInput();
  };

  private hideLinkInput = () => {
    this.setState(
      {
        selectedAddress: "",
        isURLInputVisible: false,
        urlInputValue: "",
      },
      this.props.focus
    );
  };
}
