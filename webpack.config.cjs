const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: {
    main: "./index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    assetModuleFilename: "[name][ext]",
    //clean: true,
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
  plugins: [
    new HtmlWebpackPlugin({
      title: "Tiny CRA",
      filename: "index.html",
      template: "./index.html",
    }),
  ],
  devServer: {
    open: true,
    hot: true,
  },
};
