/*
 * grunt-translator
 * https://github.com/kvdjonck/Grunt_plugins
 *
 * Copyright (c) 2023 Kristof Van Der Jonckheyd
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ["Gruntfile.js", "tasks/*.js", "<%= nodeunit.tests %>"],
            options: {
                jshintrc: ".jshintrc",
            },
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ["dist"],
        },

        // Configuration to be run (and then tested).
        translator: {
            default_options: {
                options: {
                    expand: false,
                    translations: "assets/translations.json",
                    languages: ["en"],
                    defaultLanguage: "en",
                },
                src: ["www/pages/123.html"],
                dest: "dist/default_options/",
            },
            custom_options: {
                options: {
                    expand: true,
                    languages: ["en", "nl"],
                    defaultLanguage: "nl",
                },
                cwd: "www/",
                src: "*.html",
                dest: "dist/custom_options/",
            },
        },
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks("tasks");

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");

    // Run all translator targets
    grunt.registerTask("default", ["clean", "translator"]);
};
