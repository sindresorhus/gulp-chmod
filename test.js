/* eslint-env mocha */
'use strict';
const assert = require('assert');
const Vinyl = require('vinyl');
const chmod = require('.');

it('should throw if invalid argument type', () => {
	assert.throws(
		() => {
			chmod('bad argument');
		},
		/Expected `fileMode` to be/
	);
});

it('should chmod files using a number', cb => {
	const stream = chmod(0o755);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode.toString(8), '755');
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644
		},
		contents: Buffer.from('')
	}));
});

it('should chmod files using an object', cb => {
	const stream = chmod({
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

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode & 0o07777, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644
		},
		contents: Buffer.from('')
	}));
});

it('should chmod files using a simple object', cb => {
	const stream = chmod({
		read: false
	});

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode & 0o07777, 0o200);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644
		},
		contents: Buffer.from('')
	}));
});

it('should not change folder permissions without a directoryMode value', cb => {
	const stream = chmod(0o755);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode, 0o100644);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644,
			isDirectory: () => true
		}
	}));
});

it('should use mode for directories when directoryMode set to true', cb => {
	const stream = chmod(0o755, true);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644,
			isDirectory: () => true
		}
	}));
});

it('should throw if invalid argument type', () => {
	assert.throws(
		() => {
			chmod(undefined, 'bad argument');
		},
		/Expected `directoryMode` to be/
	);
});

it('should chmod directories using a number', cb => {
	const stream = chmod(undefined, 0o755);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644,
			isDirectory: () => true
		}
	}));
});

it('should chmod directories using an object', cb => {
	const stream = chmod(undefined, {
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

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode & 0o07777, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o100644,
			isDirectory: () => true
		}
	}));
});

it('should handle no stat object', cb => {
	const stream = chmod(0o755);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		contents: Buffer.from('')
	}));
});

it('should use defaultMode if no mode on state object', cb => {
	const stream = chmod(0o755);

	stream.on('data', file => {
		assert.strictEqual(file.stat.mode, 0o755);
		cb();
	});

	stream.end(new Vinyl({
		stat: {},
		contents: Buffer.from('')
	}));
});

it('should handle different values for mode and directoryMode', cb => {
	const stream = chmod(0o755, 0o777);
	let checkedDirectory = false;
	let checkedFile = false;

	stream.on('data', file => {
		if (file.stat && file.stat.isDirectory && file.stat.isDirectory()) {
			assert.strictEqual(file.stat.mode, 0o777);
			checkedDirectory = true;
		} else {
			assert.strictEqual(file.stat.mode, 0o755);
			checkedFile = true;
		}

		// Checked both file and directory values
		if (checkedDirectory && checkedFile) {
			cb();
		}
	});

	stream.write(new Vinyl({
		contents: Buffer.from('')
	}));

	stream.write(new Vinyl({
		stat: {
			isDirectory: () => true
		}
	}));

	stream.end();
});
