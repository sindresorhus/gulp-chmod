'use strict';
var through = require('through2');
var deepAssign = require('deep-assign');
var Mode = require('stat-mode');

// 511 = 0777
var defaultMode = 511 & (~process.umask());

function normalize(mode) {
	var called = false;
	var newMode = {
		owner: {},
		group: {},
		others: {}
	};

	['read', 'write', 'execute'].forEach(function (key) {
		if (typeof mode[key] === 'boolean') {
			newMode.owner[key] = mode[key];
			newMode.group[key] = mode[key];
			newMode.others[key] = mode[key];
			called = true;
		}
	});

	return called ? newMode : mode;
}

module.exports = function (mode, dirMode) {
	// check mode
	if (mode !== undefined && typeof mode !== 'number' && typeof mode !== 'object') {
		throw new TypeError('Expected mode to be null/undefined, a number, or an object');
	}
	
	// if dirMode === true, use mode argument for directories as well
	if(dirMode === true){
		dirMode = mode;
	}
	
	// check dirMode
	if (dirMode !== undefined && typeof dirMode !== 'number' && typeof dirMode !== 'object'){
		throw new TypeError('Expected dirMode to be null/undefined, true, a number, or an object');
	}

	return through.obj(function (file, enc, cb) {
		// default to file mode
		var curMode = mode;
		
		// file is a directory?
		if (file.isNull() && file.stat && file.stat.isDirectory && file.stat.isDirectory()) {
			// use dirMode because this is a directory
			curMode = dirMode;
		}
		
		// is no mode defined?
		if (curMode === undefined || curMode === null){
			// pass it through
			cb(null, file);
			return;
		}

		file.stat = file.stat || {};
		file.stat.mode = file.stat.mode || defaultMode;

		if (typeof curMode === 'object') {
			var statMode = new Mode(file.stat);
			deepAssign(statMode, normalize(curMode));
			file.stat.mode = statMode.stat.mode;
		} else {
			file.stat.mode = parseInt(curMode, 8);
		}

		cb(null, file);
	});
};
