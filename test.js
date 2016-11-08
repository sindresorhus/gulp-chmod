'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var chmod = require('./');

it('should throw if invalid argument type', function () {
	assert.throws(
		function () {
			var stream = chmod('bad argument');
		},
		/Expected mode to be/
	);
});

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

it('should not change folder permissions without a dirMode value', function (cb) {
	var stream = chmod(755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode, 33188);
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188,
			isDirectory: function () { return true; }
		}
	}));
});

it('should use mode for directories when dirMode set to true', function (cb) {
	var stream = chmod(755, true);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188,
			isDirectory: function () { return true; }
		}
	}));
});

it('should throw if invalid argument type', function(){
	assert.throws(
		function(){
			var stream = chmod(null, 'bad argument');
		},
		/Expected dirMode to be/
	);
});

it('should chmod directories using a number', function (cb) {
	var stream = chmod(null, 755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {
			mode: 33188,
			isDirectory: function () { return true; }
		}
	}));
});

it('should chmod directories using an object', function (cb) {
	var stream = chmod(null, {
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
			mode: 33188,
			isDirectory: function () { return true; }
		}
	}));
});

it('should handle no stat object', function (cb) {
	var stream = chmod(755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('')
	}));
});

it('should use defaultMode if no mode on state object', function (cb) {
	var stream = chmod(755);

	stream.on('data', function (file) {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.write(new gutil.File({
		stat: {},
		contents: new Buffer('')
	}));
});

it('should handle different values for mode and dirMode', function (cb) {
	var stream = chmod(755, 777);
	var checkedDir = false;
	var checkedFile = false;

	stream.on('data', function (file) {
		if (file.stat && file.stat.isDirectory && file.stat.isDirectory()){
			assert.strictEqual(file.stat.mode.toString(8), '777');
			checkedDir = true;
		} else {
			assert.strictEqual(file.stat.mode.toString(8), '755');
			checkedFile = true;
		}

		// checked both file and directory values?
		if (checkedDir && checkedFile){
			cb();
		}
	});

	stream.write(new gutil.File({
		contents: new Buffer('')
	}));

	stream.write(new gutil.File({
		stat: {
			isDirectory: function () { return true }
		}
	}));
});
