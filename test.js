'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var chmod = require('./');

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

it('should chmod files using a simple object', function (cb) {
	var stream = chmod({
		read: false
	});

	stream.on('data', function (file) {
		assert.strictEqual((file.stat.mode & parseInt('07777', 8)).toString(8), '200');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188
		},
		contents: new Buffer('')
	}));
});

it('should ignore folders without dirMode set to true', function(cb){
	var stream = chmod(755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode, 33188);
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188,
			isDirectory: function(){ return true; }
		}
	}));
});

it('should set folders using mode when dirMode set to true', function(cb){
	var stream = chmod(755, true);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188,
			isDirectory: function(){ return true; }
		}
	}));
});