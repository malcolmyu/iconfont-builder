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

  it('使用d数据来生成字体', function(done) {
    var options = getOptions();
    delete options.icons[0].file;
    options.icons[0].d = 'M828.8 387.2C744.2 302.6 631.6 256 512 256C392.4 256 279.8 302.6 195.2 387.2S64 584.4 64 704V768C64 785.6 78.4 800 96 800H928C945.6 800 960 785.6 960 768V704C960 584.4 913.4 471.8 828.8 387.2zM896 736H128V704C128 492.2 300.2 320 512 320S896 492.2 896 704V736zM928 832H96C78.4 832 64 846.4 64 864S78.4 896 96 896H928C945.6 896 960 881.6 960 864S945.6 832 928 832zM512 224C538.4 224 560 202.4 560 176S538.4 128 512 128C485.6 128 464 149.6 464 176S485.6 224 512 224zM512 160C520.8 160 528 167.2 528 176S520.8 192 512 192S496 184.8 496 176S503.2 160 512 160zM352 400C352 408.837 359.163 416 368 416C376.837 416 384 408.837 384 400C384 391.163 376.837 384 368 384C359.163 384 352 391.163 352 400zM302.4 421.2C217 484.6 165.4 581.4 160.4 687.2C160 696 166.8 703.6 175.6 704C175.8 704 176.2 704 176.4 704C184.8 704 192 697.4 192.4 688.8C197 592.6 244 504.4 321.6 447C328.6 441.8 330.2 431.8 325 424.6C319.6 417.4 309.6 415.8 302.4 421.2z';
    options.noFiles = true;

    generateFonts(options)
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});