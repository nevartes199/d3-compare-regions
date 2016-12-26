const path = require('path')
const webpack = require('webpack')

const DashboardPlugin = require('webpack-dashboard/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin

const ENV = process.env.npm_lifecycle_event
const isProd = ENV === 'build'

const HREF = isProd ? '/d3-compare-regions/' : '/'

const PROD_PLUGINS = isProd ? [
		new webpack.optimize.UglifyJsPlugin({
			output: {
				comments: false
			}
		})
	] : []

module.exports = {
	devtool: isProd ? undefined : 'source-map',
	entry: {
		app: src('app'),
		demo: src('demo')
	},
	output: {
		path: root('dist'),
		publicPath: HREF,
		filename: '[name]-[hash].js',
		chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json', '.scss'],
		alias: {
			data: root('data'),
			components: src('components'),
			styles: src('styles')
		},
		plugins: [
			new TsConfigPathsPlugin()
		]
	},

	module: {
		loaders: [
			{test: /\.ts$/, loader: 'awesome-typescript-loader'},
			{test: /\.json$/, loader: 'json-loader'},
			{test: /\.scss$/, loader: 'style-loader!raw-loader!postcss-loader!sass-loader'}
		]
	},

	plugins: [
		new DashboardPlugin(),

		new webpack.optimize.CommonsChunkPlugin({
			name: ['common']
		}),

		new HtmlWebpackPlugin({
			inject: 'body',
			chunks: ['common', 'app', 'demo'],
			template: src('demo.ejs'),
			filename: 'index.html',
			favicon: root('public/favicon.png')
		}),


		...PROD_PLUGINS
	],

	devServer: {
		contentBase: './public',
	}
}

function root(args) {
	args = Array.prototype.slice.call(arguments, 0)
	return path.join.apply(path, [__dirname].concat(args))
}

function src(path) {
	return root('src/' + path)
}
