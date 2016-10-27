var InlineContentRenderer = require('../index.js');
var fs = require('fs');
var path = require('path');

var defaultProject = {
  root: './'
};

var defaultApp = {
  options: {
    minifyJS: {},
    minifyCSS: {}
  }
};

test('can create renderer', function() {
  var renderer = new InlineContentRenderer();
  ok( renderer );
  ok( renderer instanceof InlineContentRenderer );
});

test('can renderer js file', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyJs: './tests/dummy.js'
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyJs');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyJs), 'utf8');

  equal( content, '<script>\n'+file+'\n</script>' );
});

test('can renderer css file', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyCss: './tests/dummy.css'
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyCss');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyCss), 'utf8');

  equal( content, '<style>\n'+file+'\n</style>' );
});

test('can renderer other utf8 files', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyHtml: './tests/dummy.html'
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyHtml');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyHtml), 'utf8');

  equal( content, file );
});

test('can renderer content directly', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyContent: {
      content: 'foo'
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyContent');

  equal( content, 'foo' );
});

test('can renderer empty string', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyContent: {
      content: ''
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyContent');

  equal( content, '' );
});

test('content supersedes file', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyContent: {
      content: 'foo',
      file: './tests/dummy.js'
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyContent');

  equal( content, 'foo' );
});

test('can render attributes', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyJs: {
      file: './tests/dummy.js',
      attrs: { 'data-foo' : 'bar', 'data-baz' : false }
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyJs');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyJs.file), 'utf8');

  equal( content, '<script data-foo="bar" data-baz="false">\n'+file+'\n</script>' );
});

test('postProcess hook', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyJs: {
      file: './tests/dummy.js',
      postProcess: function(content) {
        return content + 'console.log(1);';
      }
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyJs');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyJs.file), 'utf8');

  equal( content, '<script>\n'+file+'console.log(1);'+'\n</script>' );
});

test('can explictly enable/disable via option', function() {
  var renderer = new InlineContentRenderer(defaultProject);
  var app = Object.create(defaultApp);
  app.options.inlineContent = {
    dummyJs: {
      enabled: false,
      file: './tests/dummy.js'
    }
  };

  renderer.included(app);
  var content = renderer.contentFor('dummyJs');
  equal( content, undefined );

  app.options.inlineContent.dummyJs.enabled = true;
  renderer.included(app);
  var content = renderer.contentFor('dummyJs');
  var file = fs.readFileSync(path.join(renderer.project.root, app.options.inlineContent.dummyJs.file), 'utf8');
  equal( content, '<script>\n'+file+'\n</script>' );
});
