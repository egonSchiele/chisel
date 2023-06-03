const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const pages = fs.readdirSync(path.resolve(__dirname, "pages"));

const templateParameters = {
  googleAnalytics: `<!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-DF96D426XE"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'G-DF96D426XE');
  </script>`,
};

const htmlPages = pages.map((page) => {
  const name = page.split(".")[0];
  return new HtmlWebpackPlugin({
    title: "Chisel Editor",
    filename: page,
    template: `./pages/${page}`,
    chunks: [`${name}`],
    excludeChunks: ["main"],
    templateParameters,
  });
});

module.exports = {
  experiments: { topLevelAwait: true },
  mode: "development",
  entry: {
    //server: "./server.js",
    admin: "./admin.tsx",
    library: "./library.tsx",
    book: "./library.tsx",
    chapter: "./library.tsx",
    "login-base": "./login.tsx",
    privacy: "./empty.tsx",
    register: "./login.tsx",
    mobile: "./mobile.tsx",
    404: "./empty.tsx",
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
  devtool: "cheap-module-source-map",
};
