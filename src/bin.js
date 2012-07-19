#!/usr/bin/env node
var $ = require('./jash');
var repl = require('repl');
global.$ = $;

console.log('jash.js shell.  $.command...');
repl.start({ useGlobal: true, prompt: '> ' });

