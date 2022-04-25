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
  contentState: any;
  html: any;
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

async function getDraft(slug: {
  slug: string;
}): Promise<{
  error?: string;
  data?: string;
}> {
  return await axios({
    url: `http://localhost:3000/api/graphql`,
    method: "post",
    data: {
      query: `query{
        post(slug:"${slug}"){
          uid 
          title
          slug 
          text
          price
        }
       }`,
    },
  });
}

export default class TextEditor extends React.Component<{}, State> {
  html = "";
  contentState = toState(this.html);
  state = {
    editorState: EditorState.createWithContent(this.contentState),
  };

  async componentDidMount() {
    this.html = await axios({
      url: `http://localhost:3000/api/graphql`,
      method: "post",
      data: {
        query: `query{
          post(slug:"${this.props.slug}"){
            uid 
            title
            slug 
            text
            price
          }
         }`,
      },
    });
    if (this.html) {
      this.html = this.html.data.data.post.text;
    }
    this.contentState = toState(this.html);
    this.state = {
      editorState: EditorState.createWithContent(this.contentState),
    };
    this.setState({
      editorState: this.state.editorState,
    });
  }

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
        url: `http://localhost:3000/api/graphql`,
        method: "post",
        data: {
          query: `mutation{
            updatePost(slug:"${this.props.slug}",text:"${html}"){
              uid 
              title
              slug 
              text
              price
            }
           }`,
        },
      });
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
  }, []);

  var text = nhm.translate(html);
}
