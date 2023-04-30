# grunt-translator

> A Grunt plugin that can be leveraged to translate your static website. It translates all key-variables in your files to the translated values specified in one convenient json file, in all the languages you may need.

## Getting Started

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-static-website-translator --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks("grunt-static-website-translator");
```

## The "translator" task

### Overview

In your project's Gruntfile, add a section named `translator` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    translator: {
        options: {
            // Task-specific options go here.
        },
        your_target: {
            // Target-specific file lists and/or options go here.
        },
    },
});
```

### Options

#### options.expand

Type: `Boolean`
Default value: `false`

When a cwd folder is configured, `options.expand` specifies if src files need to be recursively looked for inside nested folders that are possibly contained in the cwd folder.

#### options.translations

Type: `String`
Default value: `"assets/translations.json"`

Path to the the json file that holds the translated strings. For more information about the required schema of this json file take a look at the examples in this repository.

#### options.languages

Type: `String[]`
Default value: `["en"]`

All languages wherefor you need translations. A separate destination folder will be created for every language.

#### options.defaultLanguage

Type: `String`
Default value: `"en"`

Determines the default language of the main index.html file.

### Usage Examples

#### Default Options

In this example, the default options are used to translate whatever key variables inside "test/fixtures/123.html" that can be matched to a translation in the translations.json file. The key variables will be overwritten in the text and the new version of "123.html" will be saved to the specified destination folder "dist/default_options/".

```js
grunt.initConfig({
    translator: {
        options: {},
        src: ["app/www/index.html"],
        dest: "dist/www/",
    },
});
```

#### Look for a pattern

You can set a value to cwd to specify a root folder where src files matching a certain patterns can be found. Setting src to `*.html` for example will enable you to retrieve all html files in the specifoed cwd folder.

```js
grunt.initConfig({
    translator: {
        options: {},
        cwd: "app/www/",
        src: "*.html",
        dest: "dist/www/",
    },
});
```

#### Multiple targets

In this example `grunt-translate` will translate 2 separate parts of your website using their own configuration.

```js
grunt.initConfig({
    translator: {
        admin: {
            options: {
                translations: "assets/admin-translations.json",
                languages: ["en"],
                defaultLanguage: "en",
            },
            cwd: "app/admin/",
            src: "*.html",
            dest: "dist/admin/",
        },
        www: {
            options: {
                languages: ["en", "nl"],
                defaultLanguage: "nl",
            },
            cwd: "app/www/",
            src: "*.html",
            dest: "dist/www/",
        },
    },
});
```

#### Multiple files per target

In this example we show how you can configure a translator task to translate files that match a certain pattern, like `*.html`, that are found in one or more specified folders. These folders can be specified in the cwd value.

```js
grunt.initConfig({
    translator: {
        options: {
            languages: ["en", "nl"],
            defaultLanguage: "nl",
        },
        files: [
            {
                cwd: ["app/www/modules/", "test/www/pages/"],
                src: "*.html",
                dest: "dist/www/",
            },
        ],
    },
});
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

-   2023-04-30   v0.1.0   Work in progress, not yet officially released.
