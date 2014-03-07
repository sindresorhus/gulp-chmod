'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var deepExtend = require('deep-extend');
var Mode = require('stat-mode');

module.exports = function (mode) {
	if (typeof mode !== 'number' && typeof mode !== 'object') {
		throw new TypeError('Expected a number or object');
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-chmod', 'Streaming not supported'));
			return cb();
		}

		if (typeof mode === 'object') {
			var statMode = new Mode(file.stat);
			deepExtend(statMode, mode);
			file.stat.mode = statMode.stat.mode;
		} else {
			file.stat.mode = parseInt(mode, 8);
		}

		this.push(file);
		cb();
	});
};
