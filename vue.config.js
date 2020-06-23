module.exports = {
  devServer: {
    proxy: {
      '^/newbase/api': {
        target: 'http://pesway.ru/newbase/',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/newbase': '' },
        logLevel: 'debug',
      },
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? 'http://pesway.ru/newbase/generator/' : '/',
};
