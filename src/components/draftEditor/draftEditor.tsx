import * as React from "react";
import { useState, useEffect } from "react";

import { EditorState } from "draft-js";

import "./index.module.css";
import "./draftEditor.module.css";

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
import { /*gql,*/ useMutation, useQuery } from "@apollo/client";
import axios from "axios";
import { print } from "graphql";
import gql from "graphql-tag";

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
  html =
    "<h1>Bitcoin, a Peaceful Protest for the Palestinians</h1><p><strong>With Palestinians excluded from financial services and unable to achieve independence in the fiat system, the country needs Bitcoin.</strong></p><p>Palestine’s economy is struggling from severe internal and external constraints under the Israeli occupation. Israel-imposed economic and social restrictions are constantly hindering inclusive and sustainable economic growth. These restrictions put various limitations on people and resources, causing economic stagnation in that area.</p><p>However, other internal factors also contribute to poor economic growth. Some of these include high poverty and unemployment rates and poor financial systems. For example, the unemployment rate in Gaza reached 49% last year, with a poverty rate as high as 56% in 2017.</p><p><br/></p>";
  contentState = toState(this.html);
  state = {
    // editorState: EditorState.createEmpty(),
    editorState: EditorState.createWithContent(this.contentState),
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
      <div>
        <MediumDraftEditor
          autoFocus
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={this.plugins}
          inlineButtons={INLINE_BUTTONS}
          blockButtons={BLOCK_BUTTONS}
          sideButtons={this.sideButtons}
          toolbarEnabled={true}
          // spellCheck={true}
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

          .md-root {
            font-family: "Inconsolata", "Menlo", "Consolas", monospace;
            max-width: 600px;
            margin: 25px auto;
            padding: 25px;
            background: #fff;
          }

          .md-content-editor .public-DraftStyleDefault-pre {
            font-family: "Inconsolata", "Menlo", "Consolas", monospace;
          }

          .md-block-atomic-wrapper.md-block-atomic-wrapper-separator {
            border-color: transparent;
          }

          .md-block--quote {
            border-left: 5px solid #4ca8de;
            font-size: 1.2em;
            margin: 0;
            padding: 15px 0 15px 20px;
            background-color: #e2f2ff;
          }
        `}</style>
      </div>
    );
  }

  private onChange = async (editorState: EditorState) => {
    if (
      editorState.getCurrentContent() !==
      this.state.editorState.getCurrentContent()
    ) {
      var html = setRenderOptions(editorState.getCurrentContent());
      // onExport(editorState.getCurrentContent());
      const t = await axios({
        url: `${process.env.SELF_URL}/api/graphql`,
        method: "post",
        data: {
          query: `mutation{
            updatePost(slug:"hey",text:"${html}"){
              uid 
              title
              slug 
              text
              price
            }
           }`,
        },
      });
      console.log(t);
    }

    this.setState({
      editorState,
    });
  };
}

export function onExport(exporttext) {
  var html = setRenderOptions(exporttext);

  console.log(html);

  html = String(html);

  const query = gql`
    mutation updatePost {
      updatePost(slug: "license", text: html) {
        uid
        title
        slug
        text
        price
      }
    }
  `;

  useEffect(() => {
    const { data } = useQuery(query);
    console.log(data);
  }, []);

  var text = nhm.translate(html);

  console.log(text);
}
