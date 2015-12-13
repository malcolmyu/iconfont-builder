var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Q = require('q');

var _ = require('underscore');
var builder = require('../../lib');

var basePath = 'test/builder';

describe('生成正确的字体文件', function() {
  it('传递完整的icon信息', function(done) {
    var dest = path.join(basePath, 'dest');
    var options = {
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

    var hasDirQ = Q.nfcall(fs.access, dest);
    var rmDirQ = Q.nfcall(fs.rmdir, dest);

    hasDirQ.then(rmDirQ).finally(function() {
      builder(options)
        .then(function() {
          var fonts = ['svg', 'ttf', 'eot', 'woff'];
          var fontsQ = _.map(fonts, function(type) {
            var file = path.join(dest, 'iconfont.' + type);
            return Q.nfcall(fs.access, file);
          });

          return Promise.all(fontsQ)
        })
        .then(function() {
          done()
        })
        .catch(function(err) {
          done(err);
        });
    });
  })
});