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
  var filePath, fileContent, ext;

  if(inlineContentForType) {
    filePath = path.join(this.project.root, inlineContentForType);
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
  if (this.options.minifyJS.enabled) {
    var uglifyOptions = this.options.minifyJS.options;
    uglifyOptions.fromString = true;
    content = UglifyJS.minify(content, this.options.minifyJS.options).code;
  }
  return this.renderContentWithTag(content, 'script');
};

InlineContentRenderer.prototype.renderStyle = function(content) {
  if (this.options.minifyCSS.enabled) {
    content = new CleanCSS(this.options.minifyCSS.options).minify(content);
  }
  return this.renderContentWithTag(content, 'style');
};

module.exports = InlineContentRenderer;
