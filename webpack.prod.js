const path = require("path");
const config = require("./webpack.config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = merge(config, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    assetModuleFilename: "img/[hash][ext]",
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "main.[contenthash].css",
    }),
    new InjectManifest({
      swSrc: path.resolve(__dirname, "src/sw.js"),
      swDest: "sw.bundle.js",
      exclude: [/sw\.js$/],
    }),
  ],

  //* ------- CSS Minimize Optimization ------- */
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
});
