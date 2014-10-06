# ember-cli-inline-content

An add-on for ember-cli that allows you to render inline scripts and styles directly into your index.html file.

## Example

In your app's Brocfile.js, define a manifest of files you want to inline (name : filepath)

```js
var app = new EmberApp({
  ...
  inlineContent: {
    'google-analytics' : 'ext/google-analytics.js',
    'fast-style' : 'ext/red.css'
  }
});
```

In your index.html file, use the 'content-for' helper with a reference to the name in the manifest

```html
{{content-for 'fast-style'}}
<p>some other stuff</p>
{{content-for 'google-analytics'}}
```

During the build preocess, this will render the contents of those files directly inline with `<script>` or `<style>` tags, based on the filetype.

In production, the contents of the inline blocks will be minified

## Why?
- You want some code to execute before your whole app downloads
- You want some code not to be bundled with your app and excute without a separate request
- `<script async>` is not widely supported, or incompatible with some code
- Some 3rd party scripts recommend, or require to inline their code

## TODO
ES6 module support
