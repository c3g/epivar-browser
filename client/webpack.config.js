const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";


const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[chunkhash:8].js",
    sourceMapFilename: "[name].[chunkhash:8].map",
    chunkFilename: "[name].[chunkhash:8].js",
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "EpiVar Browser | Epigenetic & Expression QTLs",
      template: "src/index.html",
      publicPath: "/",
    }),
    new CopyPlugin({
      patterns: [
        { from: "public", to: "" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
