var $ = require('../src/jash');

var getConsumer = function() {
	var i = 0;
	return function(data) {
		console.log('got some more data', data);
		console.log('called', ++i, 'times');
	};
};
$.ls('-l', getConsumer(), getConsumer());
