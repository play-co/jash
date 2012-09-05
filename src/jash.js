/******************************************************************************
 *
 * jash.js allows you to more easily use node as a shell scripting facility
 * it looks up all executables in your path and adds them to exports.
 *
 * You can then call any commandline utility like this:
 *
 * 	var $ = require('jash')
 * 	$.ls('-l', '/tmp/foo', function(statusCode, stdout, stderr) {
 *		console.log('files are', stdout);
 * 	}
 *
 *****************************************************************************/

//TODO stop using sync everything
var permissions = require('./permissions.js');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var util = require('util');
var spawn = require('child_process').spawn;


/*
 * get all of the files at path and return the fully qualified paths
 * in an array.
 */
function readdir(path) {
	var files = fs.readdirSync(path);
	return _.map(files, function(f) { return path + '/' + f; });
}

/*
 * finds all binaries in the user's $PATH
 *
 * - get a list of all dirs in the path by splitting env.PATH on ':'
 * - filter out those that don't exist (fs.existsSync) 
 * - read all of these dirs by mapping readdir to the list
 * - this gives us an array of arrays, flatten it
 * - finally filter out all file in the path that aren't marked as executable
 */
function findBinaries(env) {
	return _.filter(_.flatten(_.map(_.filter(env.split(':'), fs.existsSync), readdir)), permissions.isExecutable);
}

var cwd = '.';
var env = process.env;
/*
 * spawn a process to run the command name
 * with commandline arguments args
 * call cb on completion
 */
function runCommand(name, args, options, cb, stdoutHandler, stderrHandler) {
	//if we dont actually have stdout and stderr, try to get the cb
	//if there was no callback passed, used a default

	options = options || { cwd : cwd, env: env };
	var child = spawn(name, args, options);
	if (cb) {
		var out = '';
		var err = '';
		//we need to wait for process.exit, stdout.end, and stderr.end before
		//we return
		var waiting = 3;
		var returnArgs = [null, null, null];

		var fire = function(index, arg) {
			returnArgs[index] = arg;
			if (--waiting === 0) {
				cb.apply(undefined, returnArgs);
			}
		};
		//buffer stdout and stderr to pass to the completion callback
		stdoutHandler = stdoutHandler || function(data) {
			out += data;
		};

		stderrHandler = stderrHandler || function(data) {
			err += data;
		};
		child.stdout.setEncoding('utf8');
		child.stdout.on('data', stdoutHandler); 
		child.stdout.on('end', function() {fire(1, out); });
				
		child.stderr.setEncoding('utf8');
		child.stderr.on('data', stderrHandler);
		child.stderr.on('end', function() {fire(2, err); });

		child.on('exit', function(code) {
			fire(0, code);
		});
	}

	return child;

}

//for all the binaries in the path, setup a proxy function with the binary's
//name that will execute it.
function addBinaries(binaries) {
	//iterate backwards to mimic normal resolution order
	for (var i = binaries.length-1; i >= 0; i--) {
		var parts = binaries[i].split('/');
		(function() {var name = parts[parts.length-1];
		exports[name] = function() {

			//grab the last argument, which might be a callback

			var cbs = Array.prototype.slice.call(arguments, 3);
			//assume none of the args we got were handlers
			var args = Array.prototype.slice.call(arguments);
			var argLength = args.length;
		
			var cb, stdoutHandler, stderrHandler, options;
			if (args[argLength-3] instanceof Function) {
				//we have all 3
				stderrHandler = args.pop();
				stdoutHandler = args.pop();
				cb = args.pop();
				argsToRemove = 3;
			} else if (arguments[argLength-2] instanceof Function) {
				//we have cb and stdout 
				stdoutHandler = args.pop();
				cb = args.pop();
				argsToRemove = 2;
			} else if (arguments[argLength-1] instanceof Function) {
				//we have cb only
				cb = args.pop();
				argsToRemove = 1;
			}

			//if the last arg is an object, it's the options object
			if (typeof args[args.length-1] == 'object') {
				options = args.pop();
			}
			//if the first argument was an array, the args were passed as
			//an array
			if (args[0] instanceof Array) {
				args = args[0];
			}
			
			return runCommand(name, args, options, cb, stdoutHandler, stderrHandler);

		};})();
	}
}

var binaries = findBinaries(process.env.PATH);

addBinaries(binaries);

//to add extra paths, pass a ':' separated list
exports.addPath = function(path) {
	var binaries = findBinaries(path);
	addBinaries(binaries);
};

//$.cd is special - commands will be run in this directory
//it can also be chained
exports.cd = function(path) {
	cwd = path;
	return this;
};

exports.setEnv = function(newEnv) {
	env = newEnv;
};
