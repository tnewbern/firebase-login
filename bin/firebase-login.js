#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var Firebase = require('firebase');

function main(argv, env) {
  var args = require('minimist')(argv.slice(2), {});
  var prompt = require('prompt');
  var config;

  try {
    config = JSON.parse(fs.readFileSync('./firebase.json', 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(error);
      process.exit(1);
    }
    config = {};
  }

  prompt.message = path.basename(argv[1]);
  prompt.override = {
    firebase: args.firebase || config.firebase,
    email: args.email,
    password: args.password
  };
  prompt.start({
    stdout: process.stderr
  });

  prompt.get({
    properties: {
      firebase: {
        description: 'Enter the firebase instance',
        required: true
      },
      email: {
        description: 'Enter your email address',
        format: 'email',
        required: true
      },
      password: {
        description: 'Enter your password',
        required: true,
        hidden: true
      }
    }
  }, function(error, results) {
    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    if (args.verbose) {
      console.warn(prompt.message + prompt.delimiter + 'Authenticating...');
    }

    var firebase = new Firebase('https://' + results.firebase + '.firebaseio.com');
    firebase.authWithPassword({
      email: results.email,
      password: results.password
    }, function(error, authData) {
      if (error) {
        console.error(error.message);
        process.exit(1);
      }
      console.log(authData.token);
      process.exit(0);
    });
  });
}


if (require.main === module) {
  main(process.argv, process.env);
}