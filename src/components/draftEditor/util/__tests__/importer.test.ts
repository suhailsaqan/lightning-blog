import { toState } from "../importer";
import { fromState } from "../exporter";
import { convertToRaw } from "draft-js";

test("paragraph with text", () => {
  const html = "<p>bla-bla</p>";
  const contentState = toState(html);
  const blocks = convertToRaw(contentState).blocks;

  expect(blocks).toHaveLength(1);
  expect(blocks[0].text).toEqual("bla-bla");
  expect(blocks[0].type).toEqual("unstyled");
  expect(blocks[0].data).toEqual({});
});

test("paragraph without text", () => {
  const html = "<p><br/></p>";
  const contentState = toState(html);

  // ts-ignore-nex
  const blocks = convertToRaw(contentState).blocks;

  expect(blocks).toHaveLength(1);
  expect(blocks[0].text).toEqual("");
  expect(blocks[0].type).toEqual("unstyled");
  expect(blocks[0].data).toEqual({});
});

test("export and import", () => {
  const html = "<p><br/></p>";
  const contentState = toState(html);
  const htmlResult = fromState(contentState);

  expect(htmlResult).toEqual(html);
});

test("paragraph without new line tag", () => {
  const html = "<p></p>";
  const contentState = toState(html);
  const blocks = convertToRaw(contentState).blocks;

  expect(blocks).toHaveLength(1);
  expect(blocks[0].text).toEqual("");
  expect(blocks[0].type).toEqual("unstyled");
  expect(blocks[0].data).toEqual({});
});

test("figure image", () => {
  const html =
    '<figure><img src="./image.jpeg" ' +
    'srcset="image-320w.jpg 320w,image-800w.jpg 800w" ' +
    'sizes="(max-width: 320px) 280px,800px" alt="" ' +
    'data-id="775" /><figcaption>bla-bla</figcaption></figure>';
  const contentState = toState(html);
  const blocks = convertToRaw(contentState).blocks;

  expect(blocks).toHaveLength(1);
  expect(blocks[0].data).toEqual({
    src: "./image.jpeg",
    srcSet: "image-320w.jpg 320w,image-800w.jpg 800w",
    sizes: "(max-width: 320px) 280px,800px",
    data: {
      id: "775",
    },
  });
  expect(blocks[0].text).toEqual("bla-bla");
});

test("image", () => {
  const html =
    '<img src="./image.jpeg" ' +
    'srcset="image-320w.jpg 320w,image-800w.jpg 800w" ' +
    'sizes="(max-width: 320px) 280px,800px" alt="" ' +
    'data-id="775" />';
  const contentState = toState(html);
  const blocks = convertToRaw(contentState).blocks;

  expect(blocks).toHaveLength(1);
  expect(blocks[0].data).toEqual({
    src: "./image.jpeg",
    srcSet: "image-320w.jpg 320w,image-800w.jpg 800w",
    sizes: "(max-width: 320px) 280px,800px",
    data: {
      id: "775",
    },
  });
  expect(blocks[0].text).toEqual("");
});
