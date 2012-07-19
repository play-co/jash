#!/usr/bin/env node
var $ = require('./jash');
var repl = require('repl');
global.$ = $;

repl.start({ useGlobal: true, prompt: '> ' });

