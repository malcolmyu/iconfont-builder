var _ = require('underscore');

var builder = require('../../lib');

var basePath = 'test/parser';

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
    fontName: 'iconfont'
  };
}

describe('能正确解析字体文件', function() {
  it('不生成字体，获取path信息', function(done) {
    var options = getOptions();
    options.writeFiles = false;

    builder(options)
      .then(function(icons) {
        if (!icons) done(new Error('no icons'));
        _.each(icons, function(icon) {
          if (!icon.d) {
            done(new Error('icon ' + icon.name + 'has no path'));
          }
          console.log(icon.d);
        });
        done();
      })
  });
});