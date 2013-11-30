'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true,

                options: {
                    files: [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'angular-component-factory.min.js',
                        'angular-component-factory.test.js'
                    ]
                }
            }
        },
        ngmin: {
            dist: {
                files: [{
                    cwd: './',
                    src: 'angular-component-factory.js',
                    dest: 'angular-component-factory.min.js'
                }]
            }
        },
        uglify: {
            dist: {
                files: {
                    'angular-component-factory.min.js': [
                        'angular-component-factory.min.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', [
        'build',
        'karma:unit'
    ]);

    grunt.registerTask('build', [
        'ngmin',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);
};
