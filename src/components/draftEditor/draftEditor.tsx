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
  state = {
    editorState: EditorState.createEmpty(),
    // editorState: EditorState.createWithContent(
    //   toState(`<h2><em>Castlevania: Lords of Shadow</em></h2>
    // <p><em>Lords of Shadow</em> is a third-person action-adventure game in which the player controls the main character, Gabriel Belmont. The combat involves a retractable chain whip called the Combat Cross. The player can perform up to forty unlockable <a href="https://en.wikipedia.org/wiki/Combo_(video_gaming)">combos</a> with it. The commands consist of  direct attacks for dealing damage to single enemies, and weak area attacks when surrounded by them. It is  also capable of interactions with secondary weapons, such as knives, holy water and other items which can be  upgraded. In addition, the Combat Cross&#x27;s melee skills can be combined with the Light and Shadow magic  system, which are spells aimed at defense and aggression, respectively. The whip is upgradeable and can also be  used to guard against an opponent&#x27;s attack.</p>
    // <p><br/></p>
    // <hr/>
    // <p>The developers attempted to reach out to new audiences by  distancing <em>Lords of Shadow</em> from previous <em>Castlevania</em> games, but kept some elements intact to  not alienate franchise fans. For example, <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event">vampires</a> (press Ctrl) and  werewolves are recurring enemies in the game,but other existing enemies include trolls, giant spiders  and goblin-like creatures. The enemies can be defeated for experience points, which can be used to purchase combos  or to augment the player&#x27;s abilities further. <em>Lords of Shadow</em> has large-scale bosses known as  titans. <mark>The Combat Cross</mark> can be used to grapple onto their bodies and navigate them, and break the runes  that animate the titan.</p><blockquote>The <strong>Baader–Meinhof effect</strong>, also known as <strong>frequency illusion</strong>, is the illusion in which a word, a name, or other thing that has  recently come to one&#x27;s attention suddenly seems to appear with  improbable frequency shortly afterwards (not to be confused with the <a href="https://en.wikipedia.org/wiki/Recency_illusion">recency illusion</a> or <a href="https://en.wikipedia.org/wiki/Selection_bias">selection bias</a>).</blockquote>
    // <img src="https://upload.wikimedia.org/wikipedia/commons/0/03/Flood-meadow_near_Hohenau.jpg" data-id="my-awesome-id" />
    // <p>Look at console when typing</p>`)
    // )
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
            font-family: serif;
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
