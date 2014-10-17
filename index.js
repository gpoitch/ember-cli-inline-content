var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');

function InlineContentRenderer(project) {
  this.name = 'ember-cli-inline-content';
  this.project = project;
}

InlineContentRenderer.prototype.included = function(app) {
  this.options = app.options || {};
};

InlineContentRenderer.prototype.contentFor = function(type, config) {
  var inlineContent = this.options.inlineContent;
  var inlineContentForType = inlineContent && inlineContent[type];
  var contentOptions, relativeFilePath, filePath, fileContent, ext;

  if(inlineContentForType) {
    contentOptions = ('object' === typeof inlineContentForType) && inlineContentForType;
    relativeFilePath = contentOptions ? contentOptions.file : inlineContentForType;
    if (!relativeFilePath) {
      return console.log(this.name + ' error: file path not defined');
    }

    filePath = path.join(this.project.root, relativeFilePath);
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch(e){
      return console.log(this.name + ' error: file not found: ' + filePath);
    }

    ext = path.extname(filePath);
    switch (ext) {
      case '.js':
        return this.renderScript(fileContent, contentOptions);
      case '.css':
        return this.renderStyle(fileContent, contentOptions);
      default:
        return fileContent;
    }
  }
};

InlineContentRenderer.prototype.renderContentWithTag = function(content, tag, options) {
  var attrs = options && options.attrs;
  var openTag = '<' + tag;
  var closeTag = '</' + tag + '>';

  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      openTag += ' ' + attr + '="' + attrs[attr] + '"';
    }
  }
  openTag += '>';
  return [openTag, content, closeTag].join('\n');
};

InlineContentRenderer.prototype.renderScript = function(content, options) {
  if (this.options.minifyJS.enabled) {
    var uglifyOptions = this.options.minifyJS.options;
    uglifyOptions.fromString = true;
    content = UglifyJS.minify(content, this.options.minifyJS.options).code;
  }
  return this.renderContentWithTag(content, 'script', options);
};

InlineContentRenderer.prototype.renderStyle = function(content, options) {
  if (this.options.minifyCSS.enabled) {
    content = new CleanCSS(this.options.minifyCSS.options).minify(content);
  }
  return this.renderContentWithTag(content, 'style', options);
};

module.exports = InlineContentRenderer;
