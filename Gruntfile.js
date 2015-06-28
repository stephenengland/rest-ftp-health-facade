'use strict';
var path = require('path');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-run');

  grunt.initConfig({
    express: {
      ftpRest: {
        options: {
          script: path.resolve(__dirname, './index.js')
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        node: true
      },
      files: {
        src: ['*.js', 'tests/**.js']
      }
    },
    jasmine_node: {
      options: {
        match: ".",
        matchall: true,
        extensions: "js",
        specNameMatcher: "spec"
      },
      all: ['./tests/spec.js']
    }
  });

  grunt.registerTask('server', ['jshint', 'express:ftpRest', 'jasmine_node']);
  grunt.registerTask('test', ['jshint', 'jasmine_node']);
  grunt.registerTask('default', [ 'server' ]);
};