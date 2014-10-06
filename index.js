var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');

function InlineContentRenderer(project) {
  this.name = 'ember-cli-inline-content';
  this.project = project;
}

InlineContentRenderer.prototype.included = function(app) {
  var options = app.options || {};
  this.contentDict = options.inlineContent;
  this.minifyCSS = options.minifyCSS || {};
  this.minifyJS = options.minifyJS || {};
  this.minifyJS.options = this.minifyJS.options || {};
  this.minifyJS.options.fromString = true;
};

InlineContentRenderer.prototype.contentFor = function(type, config) {
  var pathForInlineContent = this.contentDict && this.contentDict[type];
  var filePath, fileContent, ext;

  if(pathForInlineContent) {
    filePath = path.join(this.project.root, pathForInlineContent);
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch(e){
      return console.log(this.name + ' error: file not found: ' + filePath);
    }

    ext = path.extname(filePath);
    switch (ext) {
      case '.js':
        return this.renderScript(fileContent);
      case '.css':
        return this.renderStyle(fileContent);
      default:
        return console.log(this.name + ' error: file type not supported: ' + ext);
    }
  }
};

InlineContentRenderer.prototype.renderContentWithTag = function(content, tag) {
  return ['<' + tag + '>', content, '</' + tag + '>'].join('\n');
};

InlineContentRenderer.prototype.renderScript = function(content) {
  if (this.minifyJS.enabled) {
    content = UglifyJS.minify(content, this.minifyJS.options).code;
  }
  return this.renderContentWithTag(content, 'script');
};

InlineContentRenderer.prototype.renderStyle = function(content) {
  if (this.minifyCSS.enabled) {
    content = new CleanCSS(this.minifyCSS.options).minify(content);
  }
  return this.renderContentWithTag(content, 'style');
};

module.exports = InlineContentRenderer;
