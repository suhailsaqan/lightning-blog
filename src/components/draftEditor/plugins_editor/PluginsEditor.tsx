import * as React from "react";
import {
  CompositeDecorator,
  ContentBlock,
  ContentState,
  DefaultDraftBlockRenderMap,
  DraftBlockRenderConfig,
  DraftBlockRenderMap,
  DraftBlockType,
  DraftDragType,
  DraftHandleValue,
  DraftStyleMap,
  Editor,
  EditorProps,
  EditorState,
  SelectionState,
  getDefaultKeyBinding,
  DraftEditorCommand,
} from "draft-js";
import { Map } from "immutable";
import memoizeOne from "memoize-one";

import { MultiDecorator } from "./MultiDecorator";
import { HANDLED, NOT_HANDLED } from "../util/constants";
import { BlockProps, BlockPropsInner } from "../typings";

export interface PluginFunctions {
  /**
   * Get the list of plugins passed to the editor
   */
  getPlugins: () => DraftPlugin[];
  /**
   * Get all the props passed to the editor
   */
  getProps: () => PluginEditorProps;
  /**
   * Update the editorState
   */
  setEditorState: (editorState: EditorState) => void;
  /**
   * Get the latest editorState
   */
  getEditorState: () => EditorState;
  /**
   * Get if the editor is readOnly or not
   */
  getReadOnly: () => boolean;
  /**
   * Make the editor non-editable
   */
  setReadOnly: (readOnly: boolean) => void;

  getEditorRef?: () => Editor;
}

export interface PluginEditorProps extends EditorProps {
  plugins?: DraftPlugin[];
  getParentMethods?: () => {
    getInput: (title: string) => Promise<string>;
  };
}

export interface SimpleDecorator {
  strategy: (
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => void;
  component: (props: any) => JSX.Element;
  props?: any;
}

export type DraftDecoratorType = SimpleDecorator | CompositeDecorator;

export interface DraftPlugin {
  blockRendererFn?: (
    contentBlock: ContentBlock,
    draftPluginFns: PluginFunctions
  ) => {
    component:
      | React.ComponentType<BlockProps>
      | React.FunctionComponent<BlockProps>;
    editable?: boolean;
    props?: BlockPropsInner;
  } | null;
  blockRenderMap?: Map<
    string,
    {
      element: string;
      wrapper?: React.ReactElement;
      aliasedElements?: string[];
    }
  >;
  blockStyleFn?: (contentBlock: ContentBlock) => string | null;
  customStyleMap?: DraftStyleMap;
  decorators?: DraftDecoratorType[];
  handleBeforeInput?: (
    input: string,
    es: EditorState,
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  handleDrop?: (
    selection: EditorState,
    dataTransfer: DataTransfer,
    isInternal: DraftDragType,
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  handleDroppedFiles?: (
    selection: SelectionState,
    files: File[],
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  handleKeyCommand?: (
    command: string,
    editorState: EditorState,
    eventTimeStamp: number,
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  handlePastedFiles?: (files: File[]) => DraftHandleValue;
  handlePastedText?: (
    text: string,
    html: string,
    editorState: EditorState,
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  handleReturn?: (
    ev: React.KeyboardEvent<{}>,
    es: EditorState,
    draftPluginFns: PluginFunctions
  ) => DraftHandleValue;
  initialize?: (draftPluginFns: PluginFunctions) => void;
  keyBindingFn?: (
    ev: React.KeyboardEvent<{}>,
    draftPluginFns: PluginFunctions
  ) => DraftEditorCommand | void | false;
  onBlur?: (e: React.SyntheticEvent<{}>) => void;
  onChange?: (
    es: EditorState,
    draftPluginFns: PluginFunctions
  ) => EditorState | void;
  onFocus?: (e: React.SyntheticEvent<{}>) => void;
  willUnmount?: (draftPluginFns: PluginFunctions) => void;
}

type DraftPluginKeys = keyof DraftPlugin;
type DraftPluginArray = {
  [K in DraftPluginKeys]?: Array<DraftPlugin[DraftPluginKeys]>;
};
type DraftPluginsMergedProps = {
  [K in keyof EditorProps]?: EditorProps[K];
};

function getMainPropsFromPlugins(
  plugins: DraftPlugin[],
  getters?: () => PluginFunctions
): DraftPluginsMergedProps {
  const props: DraftPluginArray = {};

  plugins.forEach((plugin) => {
    (Object.keys(plugin) as DraftPluginKeys[]).forEach((key) => {
      props[key] = props[key] || [];
      props[key].push(plugin[key]);
    });
  });

  const mainProps: DraftPluginsMergedProps = {};

  (Object.keys(props) as DraftPluginKeys[]).forEach((key) => {
    if (key === "onChange" || key === "blockRenderMap") {
      return;
    }

    const handlers = props[key];

    if (key === "keyBindingFn") {
      mainProps.keyBindingFn = (e) => {
        for (let i = 0; i < handlers.length; i++) {
          const handler = handlers[i] as (
            ev: React.KeyboardEvent<{}>,
            draftPluginFns: PluginFunctions
          ) => DraftEditorCommand | void | false;
          const result = handler(e, getters());

          if (result) {
            return result;
          }

          // stop loop without default key binding
          if (result === false) {
            return null;
          }
        }

        return getDefaultKeyBinding(e);
      };

      return;
    }

    if (key.indexOf("handle") === 0) {
      // @ts-ignore: Unreachable code error
      mainProps[key] = (...args) => {
        const returnVal = handlers.some(
          (handler: any) => handler(...args, getters()) === HANDLED
        );

        return returnVal ? HANDLED : NOT_HANDLED;
      };
    } else if (key.indexOf("on") === 0) {
      // @ts-ignore: Unreachable code error
      mainProps[key] = (...args) => {
        handlers.some((handler: any) => {
          const retVal: boolean = handler(...args, getters());

          return !!retVal;
        });

        return null;
      };
    } else if (key.indexOf("Fn") === key.length - "Fn".length) {
      // @ts-ignore: Unreachable code error
      mainProps[key] = (...args) => {
        for (let i = 0; i < handlers.length; i++) {
          const handler = handlers[i] as any;
          const result = handler(...args, getters());

          if (result !== null && result !== undefined) {
            return result;
          }
        }

        return null;
      };
    } else if (key === "customStyleMap") {
      mainProps[key] = handlers.reduce((acc, handler) => {
        return Object.assign(acc, handler);
      }, {}) as any;
    }
  });

  return mainProps;
}

function getBlockRenderMap(plugins: DraftPlugin[]): DraftBlockRenderMap {
  const blockRenderMap: DraftBlockRenderMap = plugins
    .filter((plugin) => !!plugin.blockRenderMap)
    .reduce(
      (acc, plugin) => acc.merge(plugin.blockRenderMap),
      Map<DraftBlockType, DraftBlockRenderConfig>()
    );

  return blockRenderMap.merge(DefaultDraftBlockRenderMap);
}

function getDecorators(plugins: DraftPlugin[]): MultiDecorator {
  const finalDecorators = plugins
    .filter((pl) => !!pl.decorators)
    .reduce((acc, plugin) => {
      plugin.decorators.forEach((dec: DraftDecoratorType) => {
        if ((dec as CompositeDecorator).getComponentForKey) {
          acc.push(dec);
        } else {
          acc.push(new CompositeDecorator([dec as SimpleDecorator]));
        }
      });

      return acc;
    }, []);

  if (!finalDecorators.length) {
    return null;
  }

  return new MultiDecorator(finalDecorators);
}

export class PluginsEditor extends React.PureComponent<PluginEditorProps> {
  public static defaultProps = {
    plugins: [] as DraftPlugin[],
  };

  constructor(props: PluginEditorProps) {
    super(props);

    const { plugins } = props;
    this.parsePlugins = memoizeOne<
      (
        plugins: DraftPlugin[],
        getters?: () => PluginFunctions
      ) => DraftPluginsMergedProps
    >(getMainPropsFromPlugins);
    this.blockRenderMapPlugins = memoizeOne<
      (plugins: DraftPlugin[]) => DraftBlockRenderMap
    >(getBlockRenderMap);
    this.pluginDecorators = memoizeOne(getDecorators);

    const decorator = this.pluginDecorators(plugins);
    this.onChange(
      EditorState.set(props.editorState, {
        decorator,
      })
    );
    // Only for compatibility with other draft-js plugins
    plugins
      .filter((pl) => !!pl.initialize)
      .forEach((pl) => pl.initialize(this.getters()));
  }

  private readonly parsePlugins: (
    plugins: DraftPlugin[],
    getters?: () => PluginFunctions
  ) => DraftPluginsMergedProps;

  private readonly blockRenderMapPlugins: (
    plugins: DraftPlugin[]
  ) => DraftBlockRenderMap;

  private readonly pluginDecorators: (plugins: DraftPlugin[]) => MultiDecorator;

  private editor: Editor;

  public componentDidUpdate(prevProps: PluginEditorProps) {
    const { plugins, editorState } = this.props;

    if (prevProps.plugins !== plugins) {
      const decorator = this.pluginDecorators(plugins);

      if (decorator !== editorState.getDecorator()) {
        this.onChange(
          EditorState.set(editorState, {
            decorator,
          })
        );
      }
    }
  }

  public componentWillUnmount() {
    this.props.plugins
      .filter((pl) => !!pl.willUnmount)
      .forEach((pl) => pl.willUnmount(this.getters()));
  }

  public render() {
    const draftProps = this.parsePlugins(this.props.plugins, this.getters);
    const blockRenderMap = this.blockRenderMapPlugins(this.props.plugins);

    return (
      <Editor
        {...this.props}
        {...draftProps}
        ref={this.editorRefCb}
        blockRenderMap={blockRenderMap}
        onChange={this.onChange}
      />
    );
  }

  public focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  public blur() {
    if (this.editor) {
      this.editor.blur();
    }
  }

  private editorRefCb = (node: Editor) => {
    this.editor = node;
  };

  private onChange = (es: EditorState) => {
    let newEs = es;
    const { plugins, onChange } = this.props;

    plugins
      .filter((pl) => !!pl.onChange)
      .forEach((pl) => {
        const tmpEs = pl.onChange(newEs, this.getters());

        if (tmpEs) {
          newEs = tmpEs;
        }
      });

    onChange(newEs);
  };

  private getters = (): PluginFunctions => ({
    setEditorState: this.onChange,
    getEditorState: () => this.props.editorState,
    getPlugins: () => this.props.plugins,
    getProps: (): PluginEditorProps => this.props,
    getReadOnly: () => this.props.readOnly,
    setReadOnly: () => {
      // nothing
    },
    getEditorRef: () => this.editor,
  });
}
