// Dependencies.
var fs = require('fs'),
		path = require('path'),
		walk = require('walk'),
		prettyjson = require('prettyjson'),
		hyperProxy = require(path.join(path.dirname(module.filename), 'hyperProxy.js'));

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

 var conf = {
 	src: {
 		folder: './dynamique/'
	}
 };

// Walker options
var walker  = walk.walk(conf.src.folder, { followLinks: false });
var files = [];

var excludeFile = [
	'hyperProxy-root.crt',
	'hyperProxy-root.key',
	'.DS_Store'
];

walker.on('file', function(root, stat, next) {
    if(!excludeFile.contains(stat.name)) {
    	files.push(stat.name);
    }
    next();
});

var overrides = {};

walker.on('end', function() {
	console.log('************************ FILE ************************')
	console.log(prettyjson.render(files))
	console.log('******************************************************\n\n')

	var done = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		var file = files[i],
				name,
				regexpString,
				regexp;

		// module name
		name = file.replace(/ /g, '-');
		name = name.replace(/\./g, '-');
		name = name.toLowerCase();

		// regex
		regexpString = file.replace(/\./g, '\\.')
		regexp = new RegExp(regexpString, "i")

		overrides[name] = {
			'match': regexp,
			'callback': hyperProxy.overrideWithSpecifiedFile,
			'path': path.join(__dirname, 'dynamique', file),
			'omitCNTLM': true
		};
	}

	console.log('********************* OVERRIDES **********************')
	console.log(prettyjson.render(overrides))
	console.log('******************************************************\n\n')

	var proxy = hyperProxy.start(overrides, settings);
});

/*
	Our proxy settings.
*/
var settings = {
	'httpPort': 8000,
	'proxy': false,
	'documentRoot': process.cwd(),
	'followSymbolicLinks': false
};

/*---------------------------------------------------------------------------------------------------
	HELPER CALLBACKS USED FOR OVERRIDES
---------------------------------------------------------------------------------------------------*/

// Dependencies.
var fs = require('fs');
var path = require('path');