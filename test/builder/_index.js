var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var sax = require('sax');
var parser = require('sax').parser();

var _ = require('underscore');
var builder = require('../../src');

var dest = path.join(__dirname, 'dest');

function getOptions() {
  return {
    icons: [
      {
        name: 'www-font-o',
        codepoint: 0xF000,
        file: 'test.svg'
      }
    ],
    src: __dirname,
    dest: dest,
    fontName: 'myfont',
    descent: 128
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
        var file = path.join(dest, 'myfont.' + type);
        return Q.nfcall(fs.access, file);
      });

      return Promise.all(fontsQ)
    });
}

describe('生成正确的字体文件', function() {
  it('使用 buffer 生产字体', function(done) {
    var options = getOptions();
    var iconFile = path.join(options.src, options.icons[0].file);
    Q.nfcall(fs.readFile, iconFile)
      .then(function(buffer) {
        options.icons[0].buffer = buffer;
        delete options.icons[0].codepoint;
        delete options.icons[0].file;
        return generateFonts(options);
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

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
    options.icons[0].d = ' M896,960 L832,960 L832,128 L192,128 L192,960 L128,960 Q101,959 83,941 Q65,923 64,896 L64,64 Q65,37 83,19 Q101,1 128,0 L896,0 Q923,1 941,19 Q959,37 960,64 L960,896 Q959,923 941,941 Q923,959 896,960 M320,768 Q347,769 365,787 Q383,805 384,832 L384,960 Q383,987 365,1005 Q347,1023 320,1023 Q293,1023 275,1005 Q257,987 256,960 L256,832 Q257,805 275,787 Q293,769 320,768 M704,768 Q731,769 749,787 Q767,805 768,832 L768,960 Q767,987 749,1005 Q731,1023 704,1023 Q677,1023 659,1005 Q641,987 640,960 L640,832 Q641,805 659,787 Q677,769 704,768 M256,704 L768,704 L768,576 L256,576 M256,512 L768,512 L768,384 L256,384 M448,960 L576,960 L576,832 L448,832';
    options.readFiles = false;
    options.translate = -128;

    generateFonts(options)
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('检测自动填充 codepoint 生成是否正确', function(done) {
    var options = getOptions();
    delete options.icons[0].codepoint;
    options.icons.push({
      name: 'www-font-x',
      file: 'test.svg'
    });

    generateFonts(options)
      .then(function() {
        parser.onopentag = function(node) {
          if (node.name === 'GLYPH') {
            var attributes = node.attributes;
            var name = attributes['GLYPH-NAME'];
            var code = attributes['UNICODE'].codePointAt(0);
            switch (name) {
              case 'www-font-o':
                if (code !== 0xE000) {
                  done(new Error('第一个字体的编码错误，应为 0xe000，输出 ' + code.toString(16)));
                }
                break;
              case 'www-font-x':
                if (code !== 0xE001) {
                  done(new Error('第二个字体的编码错误，应为 0xe001，输出 ' + code.toString(16)));
                }
                break;
            }
          }
        };
        parser.onend = function() {
          done();
        };
        var svgPath = path.join(dest, 'myfont.svg');
        Q.nfcall(fs.readFile, svgPath).then(function(data) {
          parser.write(data).close();
        });
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('codepoint 去重', function(done) {
    var options = getOptions();
    delete options.icons[0].codepoint;
    options.icons.push({
      name: 'www-font-x',
      codepoint: 0xE000,
      file: 'test.svg'
    });

    generateFonts(options)
      .then(function() {
        parser.onopentag = function(node) {
          if (node.name === 'GLYPH') {
            var attributes = node.attributes;
            var name = attributes['GLYPH-NAME'];
            var code = attributes['UNICODE'].codePointAt(0);
            switch (name) {
              case 'www-font-o':
                if (code !== 0xE001) {
                  done(new Error('第一个字体的编码错误，应为 0xE001，输出 0x' + code.toString(16)));
                }
                break;
              case 'www-font-x':
                if (code !== 0xE000) {
                  done(new Error('第二个字体的编码错误，应为 0xE000，输出 0x' + code.toString(16)));
                }
                break;
            }
          }
        };
        parser.onend = function() {
          done();
        };
        var svgPath = path.join(dest, 'myfont.svg');
        Q.nfcall(fs.readFile, svgPath).then(function(data) {
          parser.write(data).close();
        });
      })
      .catch(function(err) {
        done(err);
      });
  });
});
