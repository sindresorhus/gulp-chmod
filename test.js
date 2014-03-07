'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var chmod = require('./index');

it('should chmod files using a number', function (cb) {
	var stream = chmod(755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188
		},
		contents: new Buffer('')
	}));
});

it('should chmod files using an object', function (cb) {
	var stream = chmod({
		owner: {
			read: true,
			write: true,
			execute: true
		},
		group: {
			execute: true
		},
		others: {
			execute: true
		}
	});

	stream.on('data', function (file) {
		assert.strictEqual((file.stat.mode & parseInt('07777', 8)).toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188
		},
		contents: new Buffer('')
	}));
});
