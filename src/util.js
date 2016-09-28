'use strict'

exports.isError = function (value) {
	return (value instanceof Error) || (value && value.name && /Error$/.test(value.name))
}

exports.isPromise = function (value) {
	return value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

exports.isFunc = function (func) {
	return (typeof func === 'function')
}