const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        svg: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'SVG Sandbox'
        }),
        new BundleAnalyzerPlugin()
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // loads text files
            {
                test: /\.(txt|csv)$/,
                use: 'raw-loader'
            },
            // loads JSON data
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            // loads images
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                exclude: /node_modules/,                
                use: [
                    'file-loader'
                ]
            },
            // transpiles JSX syntax for react
            {
                test: /\.(js|jsx)$/,
                include: /src/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['react', 'es2015']
                        }
                    }
                ]
            },
            // loads fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                exclude: /node_modules/,                
                use: [
                    'file-loader'
                ]
            },
            // loads stylesheets
            {
                test: /\.s*css$/,
                exclude: /node_modules/,                
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
}