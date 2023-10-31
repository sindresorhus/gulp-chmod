import process from 'node:process';
import merge from 'lodash.merge';
import Mode from 'stat-mode';
import {gulpPlugin} from 'gulp-plugin-extras';

const defaultMode = 0o777 & (~process.umask()); // eslint-disable-line no-bitwise

function normalize(mode) {
	const newMode = {
		owner: {},
		group: {},
		others: {},
	};

	let isCalled = false;

	for (const key of ['read', 'write', 'execute']) {
		if (typeof mode[key] === 'boolean') {
			newMode.owner[key] = mode[key];
			newMode.group[key] = mode[key];
			newMode.others[key] = mode[key];
			isCalled = true;
		}
	}

	return isCalled ? newMode : mode;
}

export default function gulpChmod(fileMode, directoryMode) {
	if (!(fileMode === undefined || typeof fileMode === 'number' || typeof fileMode === 'object')) {
		throw new TypeError('Expected `fileMode` to be undefined/number/object');
	}

	if (directoryMode === true) {
		directoryMode = fileMode;
	}

	if (!(directoryMode === undefined || typeof directoryMode === 'number' || typeof directoryMode === 'object')) {
		throw new TypeError('Expected `directoryMode` to be undefined/true/number/object');
	}

	return gulpPlugin('gulp-chmod', file => {
		const currentMode = file.isDirectory() ? directoryMode : fileMode;

		if (currentMode === undefined) {
			return file;
		}

		file.stat = file.stat ?? {};
		file.stat.mode = file.stat.mode ?? defaultMode;

		if (typeof currentMode === 'object') {
			const statMode = new Mode(file.stat);
			merge(statMode, normalize(currentMode));
			file.stat.mode = statMode.stat.mode;
		} else {
			file.stat.mode = currentMode;
		}

		return file;
	}, {supportsDirectories: true});
}
