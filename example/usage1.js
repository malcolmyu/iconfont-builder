var iconfontBuilder = require('./../lib/index');
var path = require('path');

var src = {
	svgIcons: [{
		id: 1,
		name: "www-star-o",
		codepoint: 61440
	},{
		id: 2,
		name: "www-fish-o",
		codepoint: 61441
	},{
		id: 3,
		name: "www-star-f",
		codepoint: 61442
	},{
		id: 4,
		name: "www-fish-f",
		codepoint: 61443
	}],
	svgDir: path.join(__dirname, 'srcFile')
};

var dest = path.join(__dirname, 'destFile');

var opts = {
	fontName: 'iconfont',
	normalize: true,
};

iconfontBuilder(src, dest, opts, function(ret){
	console.log("err = ", ret.err);
	console.log("results = ", ret.results);
});
