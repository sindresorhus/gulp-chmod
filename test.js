import {Buffer} from 'node:buffer';
import test from 'ava';
import Vinyl from 'vinyl';
import {pEvent} from 'p-event';
import chmod from './index.js';

test('should throw if invalid argument type', t => {
	t.throws(() => {
		chmod('bad argument');
	}, {
		message: /Expected `fileMode` to be/,
	});
});

test('should chmod files using a number', async t => {
	const stream = chmod(0o755);

	stream.end(new Vinyl({
		stat: {mode: 0o10_0644},
		contents: Buffer.from(''),
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode.toString(8), '755');
});

test('should chmod files using an object', async t => {
	const stream = chmod({
		owner: {read: true, write: true, execute: true},
		group: {execute: true},
		others: {execute: true},
	});

	stream.end(new Vinyl({
		stat: {mode: 0o10_0644},
		contents: Buffer.from(''),
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode & 0o0_7777, 0o755); // eslint-disable-line no-bitwise
});

test('should chmod files using a simple object', async t => {
	const stream = chmod({read: false});

	stream.end(new Vinyl({
		stat: {mode: 0o10_0644},
		contents: Buffer.from(''),
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode & 0o0_7777, 0o200); // eslint-disable-line no-bitwise
});

test('should not change folder permissions without directoryMode value', async t => {
	const stream = chmod(0o755);

	stream.end(new Vinyl({
		stat: {
			mode: 0o10_0644,
			isDirectory: () => true,
		},
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode, 0o10_0644);
});

test('should use mode for directories when directoryMode set to true', async t => {
	const stream = chmod(0o755, true);

	stream.end(new Vinyl({
		stat: {
			mode: 0o10_0644,
			isDirectory: () => true,
		},
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode, 0o755);
});

test('should throw if invalid directoryMode argument type', t => {
	t.throws(() => {
		chmod(undefined, 'bad argument');
	}, {
		message: /Expected `directoryMode` to be/,
	});
});

test('should chmod directories using a number', async t => {
	const stream = chmod(undefined, 0o755);

	stream.end(new Vinyl({
		stat: {
			mode: 0o10_0644,
			isDirectory: () => true,
		},
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode, 0o755);
});

test('should chmod directories using an object', async t => {
	const stream = chmod(undefined, {
		owner: {read: true, write: true, execute: true},
		group: {execute: true},
		others: {execute: true},
	});

	stream.end(new Vinyl({
		stat: {
			mode: 0o10_0644,
			isDirectory: () => true,
		},
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode & 0o0_7777, 0o755); // eslint-disable-line no-bitwise
});

test('should handle no stat object', async t => {
	const stream = chmod(0o755);
	stream.end(new Vinyl({contents: Buffer.from('')}));
	const file = await pEvent(stream, 'data');
	t.is(file.stat.mode, 0o755);
});

test('should use defaultMode if no mode on state object', async t => {
	const stream = chmod(0o755);

	stream.end(new Vinyl({
		stat: {},
		contents: Buffer.from(''),
	}));

	const file = await pEvent(stream, 'data');

	t.is(file.stat.mode, 0o755);
});

test('should handle different values for mode and directoryMode', async t => {
	t.plan(2);

	const stream = chmod(0o755, 0o777);
	let checkedDirectory = false;
	let checkedFile = false;

	stream.write(new Vinyl({
		contents: Buffer.from(''),
	}));

	stream.write(new Vinyl({
		stat: {isDirectory: () => true},
	}));

	stream.on('data', file => {
		if (file.isDirectory()) {
			t.is(file.stat.mode, 0o777);
			checkedDirectory = true;
		} else {
			t.is(file.stat.mode, 0o755);
			checkedFile = true;
		}

		if (checkedDirectory && checkedFile) {
			stream.end();
		}
	});

	await pEvent(stream, 'end');
});
