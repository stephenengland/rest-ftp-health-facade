'use strict';
var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    express: {
      ftpRest: {
        options: {
          script: path.join(__dirname, 'index.js')
        }
      },
      ftpRestKeepAlive: {
        options: {
          script: path.join(__dirname, 'index.js'),
          background: false
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
    run: {
      localTests: {
        cmd: 'jasmine-node',
        args: [ 'tests/ftptests_spec.js' ]
      }
    },
    availabletasks: { 
      tasks: {
        options: {
          filter: 'exclude',
          tasks: ['availabletasks']
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('runAndTest', ['jshint', 'express:ftpRest', 'run:localTests']);
  grunt.registerTask('test', ['jshint', 'run:localTests']);
  grunt.registerTask('default', ['jshint', 'express:ftpRestKeepAlive']);
};