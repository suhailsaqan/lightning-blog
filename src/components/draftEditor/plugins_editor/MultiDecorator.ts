import { List } from "immutable";
import { ContentBlock, ContentState } from "draft-js";

interface CompositeDecoratorType {
  getDecorations(block: ContentBlock, contentState: ContentState): List<string>;

  getComponentForKey(key: string): () => void;

  getPropsForKey(key: string): {};
}

/**
 * Copyright (c) 2016 Nikolaus Graf
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following
 * conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

const KEY_SEPARATOR = "-";

export class MultiDecorator {
  public decorators: List<CompositeDecoratorType>;

  constructor(decorators: CompositeDecoratorType[]) {
    this.decorators = List(decorators);
  }

  /**
   * Return list of decoration IDs per character
   */
  public getDecorations(
    block: ContentBlock,
    contentState: ContentState
  ): List<string> {
    const decorations = new Array(block.getText().length).fill(null);

    this.decorators.forEach((decorator, i) => {
      const subDecorations = decorator.getDecorations(block, contentState);

      subDecorations.forEach((key, offset) => {
        if (!key) {
          return;
        }

        decorations[offset] = i + KEY_SEPARATOR + key;
      });
    });

    return List(decorations);
  }

  /**
   * Return component to render a decoration
   *
   * @param {String} key
   * @return {Function}
   */
  public getComponentForKey(key: string): () => void {
    const decorator = this.getDecoratorForKey(key);

    return decorator.getComponentForKey(MultiDecorator.getInnerKey(key));
  }

  /**
   * Return props to render a decoration
   *
   * @param {String} key
   * @return {Object}
   */
  public getPropsForKey(key: string): object {
    const decorator = this.getDecoratorForKey(key);

    return decorator.getPropsForKey(MultiDecorator.getInnerKey(key));
  }

  /**
   * Return a decorator for a specific key
   *
   * @param {String} key
   * @return {CompositeDecoratorType}
   */
  public getDecoratorForKey(key: string): CompositeDecoratorType {
    const parts = key.split(KEY_SEPARATOR);
    const index = Number(parts[0]);

    return this.decorators.get(index);
  }

  /**
   * Return inner key for a decorator
   *
   * @param {String} key
   * @return {String}
   */
  public static getInnerKey(key: string): string {
    const parts = key.split(KEY_SEPARATOR);

    return parts.slice(1).join(KEY_SEPARATOR);
  }
}
