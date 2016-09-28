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
		//loader plugins
		'json': '../node_modules/systemjs-plugin-json/json.js'
	}
});
