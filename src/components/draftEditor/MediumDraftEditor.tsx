import * as React from "react";
import { DraftPlugin, PluginsEditor } from "./plugins_editor/PluginsEditor";
import { Block, ENTITY_TYPE_LINK } from "./util/constants";
import { EditorProps, EditorState, RichUtils } from "draft-js";
import { AddButton } from "./components/AddButton/AddButton";
import { Toolbar, ToolbarButtonInterface } from "./components/Toolbar/Toolbar";
import { getSelectionForEntity, isSelectionInsideLink } from "./util/selection";
import { LinkTooltip } from "./components/LinkTooltip/LinkTooltip";

import "./index.module.css";

export interface SideButtonComponentProps {
  getEditorState: () => EditorState;
  setEditorState: (state: EditorState) => void;
  close: () => void;
}

export interface SideButton {
  component:
    | (new (props: SideButtonComponentProps) => React.Component)
    | React.FunctionComponent<SideButtonComponentProps>;
  props?: {};
}

export interface MediumDraftEditorProps extends EditorProps {
  autoFocus?: boolean;
  blockButtons: ToolbarButtonInterface[];
  editorState: EditorState;
  inlineButtons: ToolbarButtonInterface[];
  onChange: (editorState: EditorState) => void;
  placeholder?: string;
  plugins?: DraftPlugin[];
  processURL?: (url: string) => string;
  readOnly?: boolean;
  sideButtons: SideButton[];
  toolbarEnabled?: boolean;
}

interface MediumDraftEditorState {
  isLinkTooltipOpen: boolean;
}

/**
 * The main editor component with all the bells and whistles
 */
export class MediumDraftEditor extends React.PureComponent<
  MediumDraftEditorProps,
  MediumDraftEditorState
> {
  public readonly state = {
    isLinkTooltipOpen: false,
  };

  private contentEditorRef = React.createRef<HTMLDivElement>();

  private editorRef = React.createRef<PluginsEditor>();

  public componentDidMount(): void {
    if (this.props.autoFocus) {
      setTimeout(this.focus);
    }
  }

  public render() {
    const {
      readOnly,
      toolbarEnabled,
      autoFocus,
      sideButtons,
      blockButtons,
      inlineButtons,
      ...restProps
    } = this.props;

    let editorClass = "md-content-editor";
    if (readOnly) {
      editorClass += " md-content-editor--readonly";
    }
    if (this.state.isLinkTooltipOpen) {
      editorClass += " md-content-editor--pointer";
    }

    return (
      <div className="md-root">
        <div className={editorClass} ref={this.contentEditorRef}>
          <PluginsEditor
            {...restProps}
            // readOnly={readOnly}
            ref={this.editorRef}
          />
        </div>
        {sideButtons.length > 0 && !readOnly && (
          <AddButton
            editorState={this.props.editorState}
            getEditorState={this.getEditorState}
            setEditorState={this.props.onChange}
            focus={this.focus}
            sideButtons={this.props.sideButtons}
          />
        )}
        {toolbarEnabled && !readOnly && (
          <Toolbar
            editorState={this.props.editorState}
            toggleBlockType={this.toggleBlockType}
            toggleInlineStyle={this.toggleInlineStyle}
            setLink={this.setLink}
            focus={this.focus}
            blockButtons={blockButtons}
            inlineButtons={inlineButtons}
          />
        )}
        <LinkTooltip
          editorRef={this.contentEditorRef}
          onTooltipShow={this.onLinkTooltipShow}
          onTooltipHide={this.onLinkTooltipHide}
        />
        <style jsx global>{`
          .md-root {
            position: relative;
          }

          .md-block {
            margin: 15px 0;
          }

          .md-block:first-child {
            margin-top: 0;
          }

          .md-block:last-child {
            margin-bottom: 0;
          }

          .md-RichEditor-hidePlaceholder .public-DraftEditorPlaceholder-root {
            display: none;
          }

          .md-content-editor .public-DraftStyleDefault-pre {
            margin-top: 10px;
          }

          .public-DraftStyleDefault-unorderedListItem,
          .public-DraftStyleDefault-orderedListItem {
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    );
  }

  private focus = () => {
    if (this.editorRef.current) {
      this.editorRef.current.focus();
    }
  };

  private getEditorState = () => this.props.editorState;

  private setLink = (url: string) => {
    let { editorState } = this.props;
    const content = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    let entityKey = null;
    let newUrl = url;

    if (this.props.processURL) {
      newUrl = this.props.processURL(url);
    } else if (
      url &&
      url.indexOf("http") !== 0 &&
      url.indexOf("mailto:") !== 0 &&
      url.indexOf("@") >= 0
    ) {
      newUrl = `mailto:${newUrl}`;
    }

    if (newUrl) {
      const contentWithEntity = content.createEntity(
        ENTITY_TYPE_LINK,
        "MUTABLE",
        { url: newUrl }
      );
      editorState = EditorState.push(
        editorState,
        contentWithEntity,
        "apply-entity"
      );
      entityKey = contentWithEntity.getLastCreatedEntityKey();
    }

    if (isSelectionInsideLink(editorState)) {
      selection = getSelectionForEntity(editorState);
    }

    this.props.onChange(
      RichUtils.toggleLink(editorState, selection, entityKey)
    );
  };

  /*
   * The function documented in `draft-js` to be used to toggle block types (mainly
   * for some key combinations handled by default inside draft-js).
   */
  private toggleBlockType = (blockType: string) => {
    const type = RichUtils.getCurrentBlockType(this.props.editorState);
    if (type.indexOf(`${Block.ATOMIC}:`) === 0) {
      return;
    }

    this.props.onChange(
      RichUtils.toggleBlockType(this.props.editorState, blockType)
    );
  };

  /*
   * The function documented in `draft-js` to be used to toggle inline styles of selection (mainly
   * for some key combinations handled by default inside draft-js).
   */
  private toggleInlineStyle = (inlineStyle: string) => {
    this.props.onChange(
      RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    );
  };

  private onLinkTooltipShow = () => {
    this.setState({
      isLinkTooltipOpen: true,
    });
  };

  private onLinkTooltipHide = () => {
    this.setState({
      isLinkTooltipOpen: false,
    });
  };
}
