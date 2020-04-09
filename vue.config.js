module.exports = {
	publicPath: './',
	lintOnSave: false,
	
	devServer: {
		disableHostCheck: true,
		proxy: {
			'/api': {
				target: 'http://localhost:80/trading-platform',
				changeOrigin: false,
				pathRewrite: { '^/api': '' }
			}
		}
	}
}