const path = require("path");
// const nodeExternals = require("webpack-node-externals");
// import nodeExternals from "webpack-node-externals";
// import fs from "fs";
const fs = require("fs");

const {
	checkModules,
	buildIncludeRegexp,
	buildExcludeRegexp,
} = require("are-you-es5");

const result = checkModules({
	path: "", // Automatically find up package.json from cwd
	checkAllNodeModules: true,
	ignoreBabelAndWebpackPackages: true,
});

/** Returns the regexp including all es6 modules */
const es6IncludeRegExp = buildIncludeRegexp(result.es6Modules);

/** Returns the regexp excluding all es6 modules */
const es6ExcludeRegexp = buildExcludeRegexp(result.es6Modules);

var nodeModules = {};
fs.readdirSync("./node_modules")
	.filter(function (x) {
		return [".bin"].indexOf(x) === -1;
	})
	.forEach(function (mod) {
		nodeModules[mod] = "commonjs " + mod;
	});

// module.exports = {
// 	entry: "./build/js/cli.js",
// 	target: "node",
// 	output: {
// 		path: path.join(__dirname, "./build/js/"),
// 		filename: "main_webpackked.js",
// 	},
// 	module: {},
// 	externals: nodeModules,
// };

module.exports = {
	entry: {
		index: path.join(__dirname, "build/js/cli.js"),
	},
	target: "node",
	module: {
		rules: [
			{
				test: [
					/\.js$/,
					/\*nbind\.js/,
					es6IncludeRegExp,
					/\/node_modules\/?(yoga-layout-prebuilt)\//,
				],
				loader: "babel-loader",
				options: {
					presets: [
						"@babel/preset-react",
						[
							"@babel/preset-env",
							{
								targets: {
									node: true,
								},
								modules: "commonjs",
								debug: true,
							},
						],
					],
				},
			},
		],
	},
	resolve: {
		modules: [__dirname, "node_modules"],
	},
	externals: nodeModules, // just add this
	output: {
		path: path.join(__dirname, "./build/js/"),
		filename: "main_webpackked.js",
	},
};
