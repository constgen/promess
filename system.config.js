System.config({
	defaultJSExtensions: false,
	transpiler: 'traceur',
	meta: {
		'*.json': {loader: 'json'},
	},
	map: {
		'../../src/': 'source:',
		'../../': 'project:'
	},
	paths: {
		'project:*': '../*',
		'source:*': '../src/*',
		'traceur': '../node_modules/bower-traceur/traceur.js',
		'json': '../node_modules/systemjs-plugin-json/json.js',
		'jquery': '../node_modules/jquery/dist/jquery.js'
	}
});
