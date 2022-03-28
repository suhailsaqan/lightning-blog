const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const pkg = require("./package.json");

const banner = [
  `${pkg.name}`,
  `Version - ${pkg.version}`,
  `Authors - ${pkg.author}`,
  "",
].join("\n");

function getOutput(isProd = false) {
  const data = {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  };

  if (isProd) {
    data.libraryTarget = "umd";
    data.library = "MediumDraft";
    data.globalObject = "self";
  }

  return data;
}

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: {
      "medium-draft": isProd ? "./src/index.ts" : "./src/demo.tsx",
      base: "./src/index.module.css",
    },
    output: getOutput(isProd),
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
      alias: {
        // protect from two copies of immutable
        immutable: path.join(
          __dirname,
          "/node_modules/immutable/dist/immutable.min.js"
        ),
      },
    },
    devtool: isProd ? false : "source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    plugins: isProd
      ? [
          new webpack.BannerPlugin(banner),
          new MiniCssExtractPlugin({
            filename: "[name].css",
          }),
        ]
      : [
          new HtmlWebpackPlugin({
            template: path.join(__dirname, "./index.html"),
          }),
          new MiniCssExtractPlugin({
            filename: "[name].css",
          }),
        ],
    externals: isProd
      ? {
          react: {
            root: "React",
            commonjs: "react",
            commonjs2: "react",
            amd: "react",
          },
          "react-dom": {
            root: "ReactDOM",
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "react-dom",
          },
          "draft-js": {
            root: "Draft",
            commonjs: "draft-js",
            commonjs2: "draft-js",
            amd: "draft-js",
          },
          immutable: {
            root: "Immutable",
            commonjs: "immutable",
            commonjs2: "immutable",
            amd: "immutable",
          },
        }
      : {},
  };
};
