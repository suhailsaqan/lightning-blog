import * as React from "react";
import * as ReactDOM from "react-dom";
import { EditorState } from "draft-js";

// import "./index.module.css";
// import "./draftEditor.module.css";

import { codeBlockPlugin } from "./plugins/codeblockplugin";
import { imageBlockPlugin } from "./plugins/imageblockPlugin";
import { inlineStylePlugin } from "./plugins/style";
import { blockMovePlugin } from "./plugins/blockMovePlugin";
import { keyboardPlugin } from "./plugins/keyboardPlugin";
import { DraftPlugin } from "./plugins_editor/PluginsEditor";
import { SeparatorButton } from "./side_buttons/SeparatorButton";
import { getImageButton } from "./side_buttons/ImageButton";
import { BLOCK_BUTTONS, INLINE_BUTTONS } from "./components/Toolbar/Buttons";
import { blockRendererPlugin } from "./plugins/blockRendererFn";
import { setRenderOptions } from "./util/exporter";
import { toState } from "./util/importer";
import { UploadImageData } from "./util/uploadImage";
import { SideButton, MediumDraftEditor } from "./MediumDraftEditor";
import { nhm } from "./util/markdown";

import { useState } from "react";

interface State {
  editorState: EditorState;
}

function uploadImage(file: File): Promise<UploadImageData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      /*
          resolve({
              error: 'Network error',
          });
          */

      resolve({
        src: URL.createObjectURL(file),
      });
    }, 1000);
  });
}

export default class TextEditor extends React.Component<{}, State> {
  public state = {
    editorState: EditorState.createEmpty(),
  };

  private readonly plugins: DraftPlugin[] = [
    codeBlockPlugin(),
    imageBlockPlugin({
      uploadImage,
    }),
    inlineStylePlugin(),
    blockMovePlugin(),
    keyboardPlugin(),
    blockRendererPlugin(),
  ];

  private readonly sideButtons: SideButton[] = [
    {
      component: SeparatorButton,
    },
    {
      component: getImageButton({
        uploadImage,
      }),
    },
  ];

  private exporter = setRenderOptions();

  public render() {
    return (
      <div className={"container-body"}>
        <MediumDraftEditor
          autoFocus
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={this.plugins}
          inlineButtons={INLINE_BUTTONS}
          blockButtons={BLOCK_BUTTONS}
          sideButtons={this.sideButtons}
          toolbarEnabled={true}
          spellCheck={true}
        />
        <style jsx global>
          {`
            div {
              display: block;
            }

            .container {
              overflow-y: scroll;
            }

            .container-body {
              font-size: 16px;
              line-height: 1.4;
              padding: 25px;
              // background: #f5f5f5;
              max-width: 600px;
              position: relative;
              margin: auto;
            }

            a a:visited {
              color: #08c;
              text-decoration: none;
            }

            .md-root {
              background: #fff;
            }

            .md-content-editor .public-DraftStyleDefault-pre {
            }

            .md-block-atomic-wrapper.md-block-atomic-wrapper-separator {
              border-color: transparent;
            }
          `}
        </style>
      </div>
    );
  }

  private onExport(editorState: EditorState) {
    const html = this.exporter(editorState.getCurrentContent());

    console.log(html);

    var text = nhm.translate(html);

    console.log(text);

    // if (html !== demoText) {
    //   demoText = html;
    //   console.log(demoText);
    // }
  }

  private onChange = (editorState: EditorState) => {
    if (
      editorState.getCurrentContent() !==
      this.state.editorState.getCurrentContent()
    ) {
      this.onExport(editorState);
    }

    this.setState({
      editorState,
    });
  };
}
