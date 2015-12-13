var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var mkdirp = require('mkdirp');

var generator = require('./fontGenerator');

var DEFAULT_OPTIONS = {
  writeFiles: true,
  fontName: 'iconfont',
  startCodePoint: 0xF000,
  src: '.',
  dest: '.',
  ascent: 0,
  descent: 0
};

function builder(options) {
  var def = Promise.defer();

  if (!options.icons || !options.icons.length) {
    def.reject(new Error('options.files is empty'));
    return def.promise;
  }

  options = _.extend({}, DEFAULT_OPTIONS, options);
  // 填充 icons 数据
  return fillIcons(options)
    .then(function(icons) {
      options.icons = icons;
      return generator(options);
    })
    .then(function(fonts) {
      // TODO: 直接通过 d 数据生成
      if (options.writeFiles) {
        return writeFonts(fonts, options);
      } else {
        // 将 svg 文件的内容返回
        // TODO: 直接返回 d 数据
        return fonts[0];
      }
    });
}

function writeFonts(fonts, options) {
  var type = ['svg', 'ttf', 'eot', 'woff'];

  var fontsQ = _.map(fonts, function(font, i) {
    var filePath = path.join(options.dest, options.fontName + '.' + type[i]);

    var mkdirQ = Q.nfcall(mkdirp, path.dirname(filePath));
    var writeFileQ = Q.nfcall(fs.writeFile, filePath, font);

    return mkdirQ.then(writeFileQ);
  });

  return Promise.all(fontsQ);
}

function fillIcons(options) {
  // 如果有 icons 数据，确保数据不为空
  if (options.icons) {
    var def = Promise.defer();

    _.each(options.icons, function(icon) {
      if (!icon.codepoint || !icon.name) {
        def.reject(new Error('icon ' + icon.file + ' has no name or code'));
        return false;
      }
    });

    def.resolve(options.icons);
    return def.promise;
  } else {
    // 如果没有 icons 数据，从 src 里自动生成
    var base = options.startCodePoint;

    return Q.nfcall(fs.readdir, options.src)
      .then(function(files) {
        var svgFiles = _.filter(files, /\.svg$/i.test);

        return _.map(svgFiles, function(file) {
          return {
            name: 'glyph' + base,
            codepoint: base++,
            file: file
          };
        });
      });
  }
}

module.exports = builder;