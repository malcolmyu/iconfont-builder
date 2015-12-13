var iconfontBuilder = require('./../lib/index');
var path = require('path');

var src = {
	svgIcons: [{
		id: 1,
		name: "www-star-o"
	},{
		id: 2,
		name: "www-fish-o"
	},{
		id: 3,
		name: "www-star-f"
	},{
		id: 4,
		name: "www-fish-f"
	}],
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
