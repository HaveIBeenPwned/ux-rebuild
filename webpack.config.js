// webpack.config.js for bundling TypeScript and SCSS
const path = require('node:path');

module.exports = {
  entry: './web/assets/ts/main.ts', // Adjust if your entry file is different
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'web/assets/js'),
    clean: true, // Clean the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  externals: {
    bootstrap: true,
    turnstile: true
  },
  mode: 'production', // or 'development'
  devtool: 'source-map',
};
