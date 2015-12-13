# `iconfont-builder`

## Introduction

Iconfont-builder is a node.js package for providing a middleware that create some font files.

## Installation (via [npm](https://npmjs.org/package/iconfont-builder))

```bash
$ npm install iconfont-builder
```
## Usage

### Simple Usage

```javascript
var iconfontBuilder = require('iconfont-builder');
var path = require('path');

/*单个svgicon配置信息
    {
        id: [Number],  // 用于生成字体时读取srcFile内对应id的svg文件
        name: [String], // 用于生成字体时图标类名
        codepoint: [Number] // 用于生成字体时图标编码
    }
*/
var src = {
	svgIcons: [{
		id: 1,
		name: "www-star-o",
		codepoint: 61440
	},{
		id: 2,
		name: "www-fish-o",
		codepoint: 61441
	},{
		id: 3,
		name: "www-star-f",
		codepoint: 61442
	},{
		id: 4,
		name: "www-fish-f",
		codepoint: 61443
	}],
	svgDir: path.join(__dirname, 'srcFile')
};

var dest = path.join(__dirname, 'destFile');

var opts = {
	fontName: 'iconfont',
	normalize: true,
};

iconfontBuilder(src, dest, opts, function(err, results){
	console.log("err = ", err);
	console.log("results = ", results);
});

```

## Author

[missmiss](http://www.weibo.com/ssherrylliu)

**[Follow me (@missmiss) on Github!](http://missmiss.github.io/)**
