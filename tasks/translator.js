/*
 * grunt-translator
 * https://github.com/kvdjonck/Grunt_plugins
 *
 * Copyright (c) 2023 Kristof Van Der Jonckheyd
 * Licensed under the MIT license.
 */

"use strict";

const REGEX_KEY_VAR = /{{\s*([\w\d]+)\s*}}/g;
const REGEX_PATH_WITHOUT_FILE = /^.*[\\\/]/;

module.exports = function (grunt) {
    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask(
        "translator",
        "Grunt plugin that can be leveraged to translate your static website. It translates all key-variables in your files to the translated values specified in one convenient json file, in all the languages you may need.",
        function () {
            // Merge task-specific and/or target-specific options with these defaults.
            var options = this.options({
                // Specifies if we need to recursively look for src files inside the specified cwd folder(s), if any
                expand: false,
                // Path to json file that contains all translations
                translations: "assets/translations.json",
                // All languages to which translations need to be generated
                languages: ["en"],
                // Specifies the default language of the main index.html file
                defaultLanguage: "en",
            });

            // Determine destination root folder
            var destRoot = "./dist/";
            if (this.files[0].orig.dest) {
                if (!isValidFolderPath(this.files[0].orig.dest)) {
                    grunt.log.error(
                        `Destination folder ${this.files[0].orig.dest} is invalid.`
                    );
                    return;
                }
                destRoot = this.files[0].orig.dest;
            }

            // Retrieve translations
            if (!grunt.file.exists(options.translations)) {
                grunt.log.error(
                    `Translations file ${options.translations} not found.`
                );
                return;
            }
            const translations = validateJSON(options.translations);
            if (!translations) {
                grunt.log.error(
                    `Translations file ${options.translations} does not contain valid json.`
                );
                return;
            }

            // Filter out existing src files
            var files = [];
            for (let i = 0; i < this.files.length; i++) {
                var cwd = this.files[i].orig.cwd;
                var src = this.files[i].orig.src;

                if (!src) {
                    grunt.log.error(`Src is not set.`);
                    return;
                }

                // If src root folder(s) info is specified in the cwd we look for all src files that match the src (via file name or globbing patterns)
                if (cwd) {
                    for (const folder of cwd) {
                        if (!isValidFolderPath(folder)) {
                            grunt.log.error(`Cwd folder ${folder} is invalid.`);
                            return;
                        }

                        if (options.expand) {
                            // Recursivly look for src files inside the cwd folder and contained folders
                            grunt.file.recurse(
                                folder,
                                (abspath, rootdir, subdir, filename) => {
                                    for (const file of src) {
                                        if (grunt.file.isMatch(file, filename))
                                            if (
                                                !files.some((x) => x == abspath)
                                            )
                                                files.push(abspath);
                                    }
                                }
                            );
                        } else {
                            // Only look for src files inside the cwd folder
                            for (const file of src) {
                                const matches = grunt.file.expand(
                                    `${cwd}${file}`
                                );
                                for (const match in matches)
                                    if (!files.some((x) => x == match))
                                        files.push(match);
                            }
                        }
                    }
                } else {
                    for (const file of src) {
                        if (!grunt.file.exists(file)) {
                            grunt.log.warn(
                                `File ${file} does not exist. Skipping ${file}`
                            );
                            continue;
                        }

                        if (!files.some((x) => x == file)) files.push(file);
                    }
                }
            }

            // Iterate over all specified files.
            files.forEach(function (file) {
                var txt = grunt.file.read(file);

                // If the file is empty
                if (!txt || txt.trim() === "") {
                    grunt.log.warn(`File ${file} is empty. Skipping ${file}.`);
                    return;
                }

                // First extract all the key variables from the file content
                const keys = [
                    ...new Set(
                        txt
                            .match(REGEX_KEY_VAR)
                            ?.map((match) => match.slice(2, -2)) ?? []
                    ),
                ];

                // If there are no translations necessary in the file
                if (keys.length === 0) {
                    grunt.log.debug(
                        `File ${file} does not contain keys that require translation. Skipping ${file}.`
                    );
                    return;
                }

                // Iterate over all the specified languages
                options.languages.forEach(function (lang) {
                    const values = {};

                    // Iterate over all the found keys
                    keys.forEach(function (key) {
                        key = `${key}_${lang.toUpperCase()}`;

                        // Split the key variable up so that we have an array of the json keys leading to the variable
                        var jsonKeys = key.split("_");

                        // Retrieve the value from the translations json file
                        let value = translations;
                        for (const jsonKey of jsonKeys) {
                            value = value[jsonKey];

                            if (!value) {
                                grunt.log.warn(
                                    `Translation value ${jsonKey} not found in ${
                                        options.translations
                                    }. Not able to translate ${key.slice(
                                        0,
                                        -3
                                    )} in ${file} for ${lang} language. Skipping this one.`
                                );
                                continue;
                            }
                        }
                        values[`${key.slice(0, -3)}`] = value;
                    });

                    // Finally, replace the file content key variables with their corresponding matched values
                    const translatedTxt = txt.replace(
                        REGEX_KEY_VAR,
                        (match, key) => {
                            if (!values[key]) {
                                grunt.log.warn(
                                    `${key} could not be matched to translation value in ${file} for language ${lang}. Skipping this one.`
                                );
                                return;
                            }
                            return values[key];
                        }
                    );

                    // Write the destination file.
                    var dest =
                        file.endsWith("index.html") &&
                        options.defaultLanguage.toLowerCase() ==
                            lang.toLowerCase()
                            ? `${destRoot}${file.replace(
                                  REGEX_PATH_WITHOUT_FILE,
                                  ""
                              )}`
                            : `${destRoot}${lang.toLowerCase()}/${file.replace(
                                  REGEX_PATH_WITHOUT_FILE,
                                  ""
                              )}`;

                    grunt.file.write(dest, translatedTxt);

                    // Print a success message.
                    grunt.log.writeln(
                        `File ${file} successfully translated to language ${lang} and written to destination file ${dest}.`
                    );
                });
            });
        }
    );

    function validateJSON(file) {
        try {
            var data = grunt.file.readJSON(file);
            return data;
        } catch (e) {
            return null;
        }
    }

    function isValidFolderPath(path) {
        // check if path starts with a forward slash (absolute path),
        // a dot (relative path), a folder name, or a drive letter or network path
        if (!/^([\/\.]?|[A-Za-z]:\/|\\\\[\w-]+(\\\w+)*\\)/.test(path))
            return false;

        // check if path ends with a forward slash
        if (!/\/$/.test(path)) return false;

        // check if path does not contain a file
        if (/\.[a-z]+$/.test(path)) return false;

        return true;
    }
};
