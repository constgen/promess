'use strict'

var isFunc = require('./util.js').isFunc
var isPromise = require('./util.js').isPromise
var Deferred = require('./deferred.js')

module.exports = Promise

function getDeferFromPromise (promise) {
	return promise.__defer__
}

function setDeferToPromise (promise, deferred) {
	deferred.promise = promise
	return promise.__defer__ = deferred 
}

// Polymorphic Promise constructor.
// Promise constructor has to be used with `new` operator, 
// else returns istantly resolved promise object.
function Promise (initFunc, cancelFunc, optionalValue) {
	var deferred, //Deferred, that will serve this Promise
		promise,
		args = arguments;

	//if was called as a constructor or by `Promise.call()`
	if (
		(this instanceof Promise)
		|| (//this !== global
			//&& this !== undefined
			this !== (function(){return this}()) //check for default context
		) //to be possible to inherit
	) {
		promise = this
		//link promise with deferred 
		deferred = setDeferToPromise(promise, new Deferred(cancelFunc))

		if (isFunc(initFunc)) {
			// create promise
			initFunc(deferred.resolve.bind(deferred), deferred.reject.bind(deferred), deferred.progress.bind(deferred))
		}
		else {
			// if `initFunc` is not a function, create passive promise with preseted result
			deferred.value = args
		}
	}
	//if called as a function
	else {
		if (initFunc instanceof Promise) {
			//return passed promise as it is
			return initFunc;
		}
		else if (isPromise(initFunc)) {
			//redefine promise if another promise was passed as first argument
			promise = new Promise(
				function(d, e, p) { initFunc.then(d, e, p) },
				initFunc.cancel ? function() { initFunc.cancel() } : undefined
			)
		}
		else if (isFunc(initFunc)) {
			//make promise resolved with function returned value
			promise = new Promise(function (d) { d(initFunc()) })
		}
		else if (isError(initFunc)) {
			//make promise rejected with passed error
			promise = new Promise(function (d, e) { e(initFunc) })
		}
		else {
			//make promise resolved with passed value
			promise = new Promise(function(d) {
				//some speed optimization
				if (args.length > 3) {
					d.apply(undefined, args)
				} else {
					d.call(undefined, initFunc, cancelFunc, optionalValue)
				}
			})
		}
	}

	return promise;
}

Promise.prototype.then = function (doneCallback, errorCallback, progressCallback) {
	var deferred = getDeferFromPromise(this),
		newPromise = new Promise(),
		handler = {
			done: isFunc(doneCallback) ? doneCallback : undefined,
			canceled: isFunc(errorCallback) ? errorCallback : undefined,
			progress: isFunc(progressCallback) ? progressCallback : undefined,
			childDeferred: getDeferFromPromise(newPromise)
		};

	//if Deferred is resolved or rejected, execute doneCallback immediately
	if (deferred.resolved || deferred.rejected) {
		deferred.handle(handler);
	}
	else {
		deferred.callbacks.push(handler)
	}
	return newPromise;
}

Promise.prototype.cancel = function () {
	var deferred = getDeferFromPromise(this)
	if (isFunc(deferred.canceler)) {
		deferred.canceler.call()
	}
	deferred.reject(new Error('Canceled'))
	return this;
}

Promise.prototype['catch'] = function (onFailed) {
	return this.then(undefined, onFailed);
}

Promise.prototype.progress = function(onProgress) {
	return this.then(undefined, undefined, onProgress);
}

Promise.prototype['finally'] = function(onFinished) {
	return this.then(onFinished, onFinished);
}

/*Helpers*/

//wait before resolve promise
Promise.prototype.wait = function (ms) {
	var deferred = getDeferFromPromise(this)
	var timer = (ms) ? setTimeout : setAsyncTask
	var id = timer(function() {
		deferred.resolve.apply(deferred, deferred.value)
	}, ms)
	this.then(
		function () { ms ? clearTimeout(id) : clearAsyncTask(id) },
		function () { ms ? clearTimeout(id) : clearAsyncTask(id) }
	)
	return this;
}

//wait before reject and cancel promise
Promise.prototype.timeout = function (ms) {
	var promise = this
	var deferred  = getDeferFromPromise(this)
	var timer = ms ? setTimeout : setAsyncTask
	var id = timer(function () {
		deferred.reject(new Error('Timedout'))
		//and do cancelatin
		promise.cancel()
	}, ms)

	this.then(
		function () { ms ? clearTimeout(id) : clearAsyncTask(id) },
		function () { ms ? clearTimeout(id) : clearAsyncTask(id) }
	)
	return this;
}
//Current promise can't be resolved until passed promise will resolve. If passed promise will fail, current promise also will fail with that error
Promise.prototype.and = function (anotherPromise) {
	//promisify value
	anotherPromise = Promise(anotherPromise)
	var currentPromise = this;
	return new Promise(function (done, fail, notify) {
		currentPromise.then(function (val) {//done
			anotherPromise.then(
				function () { done(val) }, //success
				fail //switch to error state with this error
			)
		}, fail, notify)
	}, function () {
		currentPromise.cancel()
	});
}

//create delay between callbacks and errorbacks, has no effect to progressback
Promise.prototype.delay = function(ms) {
	var timer = (ms) ? setTimeout : setAsyncTask;
	return this.then(
		function() {//done
			var values = arguments;
			return new Promise(function(done) {
				timer(function() { 
					done.apply(undefined, values) 
				}, ms)
			})
		},
		function() {//canceled
			var values = arguments;
			return new Promise(function(done, fail) {
				timer(function() { 
					fail.apply(undefined, values) 
				}, ms)
			})
		}
	);
}

//call progress with interval before promise is resolved or rejected
Promise.prototype.interval = function(ms) {
	var deferred  = getDeferFromPromise(this)
	var id = setInterval(deferred.progress.bind(deferred), ms)
	this.then(
		clearInterval.bind(undefined, id),//done
		clearInterval.bind(undefined, id)//canceled
	)
	return this;
}




//Determines if `value` is a Promise-like object
Promise.isPromise = isPromise