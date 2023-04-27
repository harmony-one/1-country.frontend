// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()
const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const CopyPlugin = require('copy-webpack-plugin')

let commitHash = ''
try {
  commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim()
} catch (e) {}

console.log(!process.env.HTTP)

const isProduction = process.argv.indexOf('--mode=production') > -1

console.log('### isProduction', isProduction)

module.exports = {
  devServer: {
    port: 3100,
    https: !process.env.HTTP,
    http2: !process.env.HTTP,
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: false,
    client: {
      overlay: false,
      progress: true,
    },
  },
  cache: {
    type: 'filesystem',
  },
  module: {
    noParse: /\.wasm$/,
    parser: {
      javascript: {
        importExportsPresence: false,
      },
    },
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: false,
                  // corejs: 3,
                  modules: 'auto',
                },
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              [
                'babel-plugin-styled-components',
                { displayName: !isProduction },
              ],
              ['@babel/plugin-proposal-class-properties'],
            ],
            assumptions: {
              setPublicClassFields: false,
            },
          },
        },
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: { not: [/el/] }, // exclude react component if *.svg?el
      },
      {
        test: /\.svg$/i,
        resourceQuery: /el/, // *.svg?el
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  entry: {
    main: ['./src/index.tsx'],
  },
  devtool: isProduction ? false : 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },

  externals: {
    path: 'path',
    fs: 'fs',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    extensions: ['.jsx', '.js', '.ts', '.tsx'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
    },
  },

  optimization: {
    // concatenateModules: true,
    minimize: isProduction,
    splitChunks: {
      chunks: 'async',
    },
  },
  plugins: [
    // disable chunks for dev env
    !isProduction
      ? new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 5,
        })
      : false,
    new Dotenv({
      allowEmptyValues: true,
      systemvars: true,
    }),
    new webpack.EnvironmentPlugin({
      GIT_COMMIT_HASH: commitHash,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: 'index.html',
      template: 'assets/index.html',
      environment: process.env.NODE_ENV,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    process.env.SIZE_ANALYSIS ? new BundleAnalyzerPlugin({}) : null,
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'assets/favicon.ico',
          to: 'favicon.ico',
        },
        {
          from: 'assets/images',
          to: 'images',
        },
        {
          from: 'assets/tokens',
          to: 'tokens',
        },
      ],
    }),
  ].filter((i) => i),
}
