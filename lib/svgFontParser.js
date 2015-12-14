var xml = require('xmldom');
var _ = require('underscore');
var Parser = xml.DOMParser;

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

exports.getPathData = getPathData;