const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  devtool: false,
  module: {
    rules: [
      //* ------- Babel Loader ------- */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            targets: "defaults",
            presets: ["@babel/preset-env"],
          },
        },
      },

      //* ------- File Loader ------- */
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },

      // * ------- Image Loader ------- */
      {
        test: /\.html$/i,
        loader: "html-loader",
      },

      //* ------- Image Asset Loader ------- */
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },

  //* ------- Plugins ------- */
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/"),
          to: path.resolve(__dirname, "dist/public/"),
        },
        {
          from: path.resolve(__dirname, "app.webmanifest"),
          to: path.resolve(__dirname, "dist/"),
        },
      ],
    }),
  ],
};
