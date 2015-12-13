var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Q = require('q');

var _ = require('underscore');
var builder = require('../../lib');

var basePath = 'test/builder';
var dest = path.join(basePath, 'dest');

function getOptions() {
  return {
    icons: [
      {
        name: 'www-font-o',
        codepoint: 0xF001,
        file: 'test.svg'
      }
    ],
    src: basePath,
    dest: dest,
    fontName: 'iconfont'
  };
}

function generateFonts(options) {
  var hasDirQ = Q.nfcall(fs.access, dest);
  var rmDirQ = Q.nfcall(fs.rmdir, dest);

  return hasDirQ
    .then(rmDirQ)
    .finally(function() {
      return builder(options);
    })
    .then(function() {
      var fonts = ['svg', 'ttf', 'eot', 'woff'];
      var fontsQ = _.map(fonts, function(type) {
        var file = path.join(dest, 'iconfont.' + type);
        return Q.nfcall(fs.access, file);
      });

      return Promise.all(fontsQ)
    });
}

describe('生成正确的字体文件', function() {
  it('传递完整的icon信息', function(done) {
    var options = getOptions();

    generateFonts(options)
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('缺失部分icon信息', function(done) {
    var options = getOptions();
    delete options.icons[0].name;

    generateFonts(options)
      .then(function() {
        done(new Error('It cannot be resolved'))
      })
      .catch(function() {
        done();
      });
  });

  it('不传递icon信息', function(done) {
    var options = getOptions();
    delete options.icons;

    generateFonts(options)
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});