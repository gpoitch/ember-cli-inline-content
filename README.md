# ember-cli-inline-content 
[![Build Status](https://travis-ci.org/gdub22/ember-cli-inline-content.svg?branch=master)](https://travis-ci.org/gdub22/ember-cli-inline-content)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-inline-content.svg)](https://emberobserver.com/addons/ember-cli-inline-content)

An ember-cli add-on to render inline scripts, styles, or any content directly into your index.html file.

## Install
```
npm install --save-dev ember-cli-inline-content
```

## Usage

In your app's **ember-cli-build.js**, define inlineContent options on your app instance

```js
var app = new EmberApp(defaults, {
  inlineContent: {
    'key1' : 'filepath1.js',
    'key2' : 'filepath2.css',
    'key3' : {
      file: 'filepath3.js',
      attrs: { 'data-foo' : 'bar' }
    },
    'key4' : {
      content: 'foo'
    }
  }
});
```

Then in your **index.html** file, use the `content-for` helper with a references to the keys in your options:

```hbs
{{content-for 'key1'}}
{{content-for 'key2'}}
{{content-for 'key3'}}
{{content-for 'key4'}}
```

During the build process, this will render the contents of those files directly inline with `<script>` or `<style>` tags, based on the filetype. You are not restricted to just js/css files.  It will inline the literal contents of any UTF-8 string file.  If you would like to minify the inlined-content, see [ember-cli-html-minifier](https://github.com/gdub22/ember-cli-html-minifier)

## Content options
- filepath (String) The path to the content file

or

- options (Object)
    - file (String) The path to the content file
    - content (String) Literal string content instead of loading a file
    - enabled (Boolean) explicitly enable/disable inlining this content
    - attrs (Object) Hash of html attributes to add to the generated tags
    - postProcess (Function) Hook to perform any transformations on the loaded file contents

## Examples

#### Enviroment specific content:
ember-cli-build.js:
```js
var app = new EmberApp(defaults, {
  ...
});

if (app.env === 'production') {
  app.options.inlineContent = {
    'some-script' : './some-script.js'
  };
}
```

#### Rendering a string of content instead of a file:
ember-cli-build.js:
```js
var app = new EmberApp(defaults, {
  inlineContent: {
    'env-heading' : {
      content: '<h1>Environment: ' + process.env.EMBER_ENV + '</h1>'
    }
  }
});
```

Output:
```html
<h1>Environment: development</h1>
```

#### Adding attributes:
ember-cli-build.js:
```js
var app = new EmberApp(defaults, {
  inlineContent: {
    'olark' : {
      file: './olark.js',
      attrs: { 'data-cfasync' : true }
    }
  }
});
```

Output:
```html
<script data-cfasync="true">
  ... ./olark.js content here ...
</script>
```

#### Post processing:
ember-cli-build.js:
```js
var env = process.env.EMBER_ENV;
var config = require('./config/environment')(env);

var app = new EmberApp(defaults, {
  inlineContent: {
    'google-analytics' : {
      file: './ga.js',
      postProcess: function(content) {
        return content.replace(/\{\{GOOGLE_ANALYTICS_ID\}\}/g, config.googleAnalyticsId);
      }
    }
  }
});
```

environment.js
```js
ENV.googleAnalyticsId = environment === 'production' ? 'UA-XXXXXXXX-1' : 'UA-XXXXXXXX-2';
```

ga.js:
```js
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', '{{GOOGLE_ANALYTICS_ID}}', 'auto');
```

index.html:
```hbs
{{content-for 'google-analytics'}}
```

Output:
```html
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-XXXXXXXX-1', 'auto');
</script>
```

#### Explicitly enable/disable:
ember-cli-build.js:
```js
var app = new EmberApp(defaults, {
  inlineContent: {
    'analytics' : {
      file: './analytics.js',
      enabled: process.env.EMBER_ENV === 'production'
    }
  }
});
```


## Why?
- You want some code to start executing before your whole app downloads
- You don't want that code to require a separate request
- `<script async>` is not widely supported, or incompatible with some 3rd party code
- Some 3rd party code recommends, or requires you to inline their code
- You need to place various inline content but want to keep your index.html clean
- You want minified inline content, but keep full source in separate files for dev and testing

