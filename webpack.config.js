const path = require("path");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    "macu": path.join(__dirname, "src", "macu.ts"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      src: path.resolve(__dirname, "src"),
      ".test": path.resolve(__dirname, ".test"),
      ".mocks": path.resolve(__dirname, ".mocks"),
      ".data": path.resolve(__dirname, ".data"),
    }
  },
  target: "node",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: 'umd',
    chunkFormat: false
  },
  plugins: [ new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })]
};