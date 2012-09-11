  jash.js allows you to more easily use node as a shell scripting facility.
  It will collate all output in an easy to consume way - avoiding pitfalls
  that can cause you to lose data.
 
  You can call any commandline utility like this: (Why '$'?  It's a shell prompt!)
 
  	var $ = require('jash');
  	$.ls('-l', '/tmp/foo', function(statusCode, stdout, stderr) {
 		console.log('files are', stdout);
  	}

	var getStreamConsumer = function() {
			return function(data) {
				console.log('I got some data!', data);
			};
	};
	
  or with your own callbacks for stdout and stderr.  This is nice for 
  long running processes and the like

	$.tail('-f', '/var/log/foo.log', getStreamConsumer(), getStreamConsumer());

  Since the child process is returned, you can also do whatever you want:

    var child = $.ls('-l', '/tmp/foo');
    child.stdout.on ...
    child.stderr.on ...
    child.on('exit') ...


  The full API:

    $.cmd(arg1, arg2, arg3, [options],[cb [, stdoutHandler, stdErrHandler]]);

  where *options* is the options argument passed to child_process.spawn:
  http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

  arguments can also be passed in an array as the first argument:

    $.cmd([arg1, arg2, arg3], ...

  When only one callback is passed, *cb* is a function that takes 3 arguments:

    function(statusCode, stdout, stderr) { ...

  You can also pass 3 callbacks:

    cb = function(statusCode) ...
    stdout = function(data) ...
	stderr = function(data) ...

jash is written by Tom Fairfield <www.github.com/fairfieldt>
