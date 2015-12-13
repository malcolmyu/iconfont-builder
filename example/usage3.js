var iconfontBuilder = require('./../lib/index');
var path = require('path');

var src = {
	svgDir: path.join(__dirname, 'srcFile')
};

var dest = path.join(__dirname, 'destFile');

var opts = {
	fontName: 'iconfont',
	normalize: true,
};

iconfontBuilder(src, dest, opts, function(err, results){
	console.log("err = ", err);
	console.log("results = ", results);
});
