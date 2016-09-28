'use strict';

var mainModule = require('../../src/modules/main.js'),
	packageManifest = require('../../package.json');

describe(packageManifest.name, function () {
	describe('module', function () {
		it('test 1 to be 1', function () {
			expect(1).toEqual(1)
		})
	})
})
