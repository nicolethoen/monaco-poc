const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const pfDir = path.dirname(require.resolve('@patternfly/patternfly/package.json'));

// Don't include PatternFly styles twice
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/app.js',
    output: {
      path: path.resolve('public'),
      filename: '[name].[contenthash:8].bundle.js'
    },
    devServer: {
      historyApiFallback: true,
      port: 8003
    },
    optimization: {
      minimize: isProd ? true : false,
      runtimeChunk: 'single',
    },
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
    },
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          include: [
            path.resolve(process.cwd(), 'src')
          ],
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: '.cache',
              cacheCompression: false,
              presets: [['@babel/preset-env', {
                loose: true,
                corejs: 3,
                useBuiltIns: 'entry',
                exclude: ['transform-regenerator', 'transform-async-to-generator'],
              }]],
              plugins: [
                '@babel/plugin-transform-react-jsx',
                '@babel/plugin-proposal-class-properties',
                // ...(isProd ? [] : [require.resolve('react-refresh/babel')])
              ],
            }
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isProd
              },
            },
            {
              loader: 'css-loader'
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                fallback: 'file-loader',
                name: '[name]-[contenthash:5].[ext]',
                outputPath: 'images/'
              },
            }
          ]
        },
        {
          test: /.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[contenthash].css',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': isProd ? "'production'" : "'development'"
      }),
      new CopyPlugin({
        patterns: [
          { from: path.join(pfDir, 'assets/images/'), to: 'assets/images/' },
          { from: path.join(pfDir, 'assets/fonts/'), to: 'assets/fonts/' }
        ]
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      ...(isProd
        ? [
          new webpack.HashedModuleIdsPlugin(), // Hashes based on module content
          new CleanWebpackPlugin(),
          ...(env === 'analyze' ? [new BundleAnalyzerPlugin()] : []) // webpack --env analyze
        ]
        : [
          // new ReactRefreshWebpackPlugin()
        ]
      ),
    ],
    stats: isProd ? 'normal' : 'minimal'
  };
}