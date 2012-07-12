/******************************************************************************
 * helper module for dealing with file permissions 
 *
 *****************************************************************************/

var fs = require('fs');

exports.getPermissions = function(fileName) {
	if (fs.existsSync(fileName)) { 
		var stats = fs.statSync(fileName);
		var mode = stats.mode;

		var octalString = mode.toString(8);
		
		//the last 3 octal digits are the permissions
		return octalString.substring(octalString.length-3, octalString.length);
	}
	//if the file didn't exist we should return an error
	return '000';
}

var executable = {'1':true, '3':true, '5':true, '7':true};
exports.isExecutable = function(fileName) {
	var p = exports.getPermissions(fileName);
	//1, 3, 5, or 7 in any of the 3 spots means it's executable
	return !!(executable[p[2]] || executable[p[1]] || executable[p[0]]);
}
