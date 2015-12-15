var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var mkdirp = require('mkdirp');

var generator = require('./fontGenerator');
var parser = require('./svgFontParser');

var DEFAULT_OPTIONS = {
  noFiles: false,
  writeFiles: true,
  fontName: 'iconfont',
  startCodePoint: 0xF000,
  src: '.',
  dest: '.',
  descent: 0
};

/**
 * 入口函数，根据参数生成字体或 icon 对象
 *
 * @param {Object} options 传递参数，详见 readme
 * @returns {Promise}
 */
function builder(options) {
  options = _.extend({}, DEFAULT_OPTIONS, options);
  options.ascent = 1024 - options.descent;

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
        // 直接返回包含 d 的 icon 数据
        return parser.getPathData(fonts[0], options);
      }
    });
}

/**
 * 字体写入方法，生成四种字体
 *
 * @param {Array<String>} fonts 字体内容数组
 * @param {Object} options 参数对象
 * @returns {Promise}
 */
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

/**
 * 判断是否传入 icons 对象，选择排查或补充
 *
 * @param {Object} options 参数对象
 * @returns {Promise}
 */
function fillIcons(options) {
  // 如果有 icons 数据，确保数据不为空
  if (options.icons) {
    var def = Promise.defer();

    _.each(options.icons, function(icon) {
      // name 和 codepoint 是必备的
      if (!icon.codepoint || !icon.name) {
        def.reject(new Error('icon ' + icon.file + ' has no name or code'));
        return false;
      }

      // 有 d 的前提下可以不写 file
      if (options.noFiles && !icon.d) {
        def.reject(new Error('icon ' + icon.name + ' has no path data(d)'));
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
        var svgFiles = _.filter(files, function(file) {
          return /\.svg$/i.test(file);
        });

        return _.map(svgFiles, function(file) {
          return {
            name: 'glyph-' + base,
            codepoint: base++,
            file: file
          };
        });
      });
  }
}

module.exports = builder;