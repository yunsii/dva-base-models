const moduleName = "index";

var webpackConfig = {
  mode: "production",
  devtool: "source-map",
  entry: "./src/index.ts",
  output: {
    filename: `${moduleName}.js`,
    library: moduleName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    },
    dva: {
      root: 'dva',
      commonjs2: 'dva',
      commonjs: 'dva',
      amd: 'dva'
    },
    antd: {
      root: 'antd',
      commonjs2: 'antd',
      commonjs: 'antd',
      amd: 'antd'
    }
  },
};

module.exports = webpackConfig;
