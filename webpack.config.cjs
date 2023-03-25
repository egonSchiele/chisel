const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const pages = fs.readdirSync(path.resolve(__dirname, "pages"));

const htmlPages = pages.map((page) => {
  const name = page.split(".")[0];
  return new HtmlWebpackPlugin({
    title: "Frisson Editor",
    filename: page,
    template: `./pages/${page}`,
    chunks: [`${name}`],
    excludeChunks: ["main"],
  });
});

module.exports = {
  mode: "development",
  entry: {
    //server: "./server.js",
    index: "./index.tsx",
    login: "./empty.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    assetModuleFilename: "[name][ext]",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        //include: ["index.css", path.resolve(__dirname, "src")],
        //include: path.resolve(__dirname, "src"),

        use: ["style-loader", "css-loader", "postcss-loader"],
      },

      {
        test: /\.(svg|png|jpg|jpeg|ico|gif)$/i,
        type: "asset/resource",
      },
      { test: /\.json$/, type: "json" },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [/node_modules/, /public/],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [...htmlPages],
  devServer: {
    open: true,
    hot: true,
  },
};
