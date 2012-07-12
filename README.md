 
  jash.js allows you to more easily use node as a shell scripting facility
  it looks up all executables in your path and adds them to exports.
 
  You can then call any commandline utility like this:
 
  	var $ = require('jash');
  	$.ls('-l', '/tmp/foo', function(statusCode, stdout, stderr) {
 		console.log('files are', stdout);
  	}

	var getStreamConsumer = function() {
			return unction(data) {
				console.log('I got some data!', data);
			};
	};
	
  or with your own callbacks for stdout and stderr.  This is nice for 
  long running processes and the like

	$.tail('-f', '/var/log/foo.log', getStreamConsumer(), getStreamConsumer());
