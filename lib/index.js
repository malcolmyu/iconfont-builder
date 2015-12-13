var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    svgicons2svgfont = require('svgicons2svgfont'),
    svg2ttf = require('svg2ttf'),
    svg2png = require('svg2png'),
    ttf2eot = require('ttf2eot'),
    ttf2woff = require('ttf2woff');
/*图标元数据不带codepoint, 则由工具提供, 初始值为F000(16进制), 有效范围f000 - f8ff*/
var baseIndex = 61441;

module.exports = function (source, destDir, options, cb){
	async.auto({
		toSvgFont: function (callback) {
			/*用于命令行方式source.svgIcons不存在, 则读取source.svgDir文件夹内svg*/
			if(source.svgIcons === undefined) {
				console.log("未定义svgicons配置属性则直接通过svgicons文件生成字体，图标参数由系统默认定义！");
				source.svgIcons = fs.readdirSync(source.svgDir).filter(function (item, index, array) {
					return ( item.match(/([^\/]+)(\.svg)/i) );
				});
			}
			if(!source.codepoint) {
				console.log("未定义codepoint则图标编码由系统默认定义!");
			}
			var icons = source.svgIcons.map(function (icon, index){
				/*当source.svgIcons分配codepoint则直接读取, 否则用baseIndex生成code*/
				var codepoint = icon.codepoint || baseIndex++;
				if(!!icon.id) {
					var stream = fs.createReadStream( path.join(source.svgDir, icon.id + '.svg') );
				}else {
					var stream = fs.createReadStream( path.join(source.svgDir, icon) );
				}
				return {
					name: icon.name || ('glyph-' + codepoint),
					codepoint: codepoint,
					stream: stream,
					content: codepoint.toString(16)
				};
			});

			try {
				svgicons2svgfont(icons, options)
					.pipe(fs.createWriteStream( path.join(destDir, options.fontName + '.svg') ))
					.on('finish', function(){
						console.log('Font written !');

						var svgFont = path.join(destDir, options.fontName + '.svg');
						callback(null, svgFont);//执行下一个函数, 值传递
					})
			}catch (e) {
				console.log(e);
				callback(e);
			}
		},
		toTtf: ['toSvgFont', function (callback, results){
			var ttf = svg2ttf( fs.readFileSync(results.toSvgFont, {encoding:'utf-8'}), {} );
			fs.writeFileSync( path.join(destDir, options.fontName + '.ttf'), new Buffer(ttf.buffer) );
			var ttfFont = path.join(destDir, options.fontName + '.ttf');
			callback(null, ttfFont);//执行下一个函数, 值传递
		}],
		toPng: ['toSvgFont', function (callback, results){
			/*存在问题
			svg2png('destFile/1.svg', path.join(destDir, options.fontName + '.png'), 12, function (err) {
				console.log(err);
			})*/
			callback(null, null);//cb是为了告诉async一个结束点

		}],
		toEot: ['toTtf', function (callback, results){
			var eot = ttf2eot(fs.readFileSync(results.toTtf), {});
			fs.writeFileSync( path.join(destDir, options.fontName + '.eot'), new Buffer(eot.buffer) );
			var eotFont = path.join(destDir, options.fontName + '.eot');
			callback(null, eotFont);
		}],
		toWoff: ['toTtf', function (callback, results){
			var woff = ttf2woff(fs.readFileSync(results.toTtf), {});
			fs.writeFileSync( path.join(destDir, options.fontName + '.woff'), new Buffer(woff.buffer) );
			var woffFont = path.join(destDir, options.fontName + '.woff');
			callback(null, woffFont);
		}]
	}, function  (err, results) {
		baseIndex = 61441;
		cb({
			err: err,
			results: results
		});/*回调通知*/
	});
}
