const path = require("path");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: "production",
  entry: {
    example: path.join(__dirname, "src", "api", "example.ts"),
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
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