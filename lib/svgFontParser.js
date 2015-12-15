var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var handlebars = require('handlebars');

var xml = require('xmldom');
var Parser = xml.DOMParser;

// 如果有可能，还是使用 sax，不吃内存
function getPathData(svgContent, options) {
  var doc = new Parser().parseFromString(svgContent, 'text/xml');
  var icons = options.icons;
  var glyphs = doc.getElementsByTagName('glyph');
  var i = 0, len = glyphs.length;

  for (; i < len; i++) {
    var glyph = glyphs[i];
    var name = glyph.getAttribute('glyph-name');
    var d = glyph.getAttribute('d');

    _.each(icons, function(icon) {
      if (icon.name === name) {
        icon.d = d;
        return false;
      }
    });
  }

  return icons;
}

function getSvgIcon(options) {
  var tmpPath = path.join(__dirname, 'svg.handlebars');
  return Q.nfcall(fs.readFile, tmpPath, 'utf-8')
    .then(function(source) {
      var template = handlebars.compile(source);
      return template(options);
    });
}

exports.getPathData = getPathData;
exports.getSvgIcon = getSvgIcon;