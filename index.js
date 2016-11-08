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
	if (mode !== undefined && typeof mode !== 'number' && typeof mode !== 'object') {
		throw new TypeError('Expected mode to be null/undefined, a number, or an object');
	}
	
	if(dirMode === true){
		dirMode = mode;
	}
	
	if (dirMode !== undefined && typeof dirMode !== 'number' && typeof dirMode !== 'object'){
		throw new TypeError('Expected dirMode to be null/undefined, true, a number, or an object');
	}

	return through.obj(function (file, enc, cb) {
		var curMode = mode;
		
		if (file.isNull() && file.stat.isDirectory()) {
			curMode = dirMode;
		}
		
		if (curMode === undefined || curMode === null){
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
