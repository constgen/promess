'use strict'

var isError = require('./util.js').isError
var isPromise = require('./util.js').isPromise

module.exports = Deferred
	


 function Deferred (canceler) {
	this.canceler = canceler
	this.resolved = false
	this.rejected = false
	this.handled = false
	this.value = [] //arguments array
	this.callbacks = []
	//Deferred may serve Promise or not
	this.promise = undefined
}

Deferred.prototype.handle = function (handler) {
	var func = this.resolved ? handler.done : handler.canceled,
		stateAction = this.resolved ? 'resolve' : 'reject',
		deferred = handler.childDeferred,
		result;

	if (func) {
		this.handled = true
		//setAsyncTask(function(){
			try {
				result = func.apply(undefined, this.value)
				//if callback returns the same Promise object, then create error
				if (result === this.promise) {
					deferred.reject(new TypeError())
				}
					//if callback returns Promise-like object, then create chain
				else if (isPromise(result)) {
					deferred.canceler = function () {
						result.cancel && result.cancel()
					}
					result.then(deferred.resolve.bind(deferred), deferred.reject.bind(deferred), deferred.progress.bind(deferred))
				}
					//if callback returns error object, then reject child promise
				else if (isError(result)) {
					deferred.reject(result)
				}
				else if (result) {
					deferred[stateAction](result)
				} else {
					deferred[stateAction].apply(deferred, this.value)
				}
			}
			catch (err) {
				//console.error(err)
				result = err
				deferred.reject(result)
			}
		//}.bind(this))
	} else {
		deferred[stateAction].apply(deferred, this.value)
	}

	return result;
}

//used for both `resolve` and reject, because they are similar
var deferredTransition = function (state) {
	return function (val/*, args*/) {
		//if resolved with the same Promise object
		if (val === this.promise) {
			return this.reject(new TypeError());
		}
		//if resolved with any other Promise object
		else if (isPromise(val)) {
			val.then(this.resolve.bind(this), this.reject.bind(this), this.progress.bind(this))
			return this;
		}
		//prevent second resolve
		if (this.resolved || this.rejected) {
			return this;
		}
		var handler;
		this.value = arguments //save value

		//state dependent behavior
		if (state === 'resolve') { this.resolved = true }
		else if (state === 'reject') { this.rejected = true }

		while (handler = this.callbacks.shift()) {
			this.handle(handler)
		}
		return this;
	}
}

Deferred.prototype.resolve = deferredTransition('resolve')

Deferred.prototype.reject = deferredTransition('reject')

Deferred.prototype.progress = function (/*args*/) {
	if (this.resolved || this.rejected) {
		return this;
	}
	var handler,
		i = 0,
		result,
		deferred;
	this.value = arguments //save value
	while (handler = this.callbacks[i++]) {
		try {
			deferred = handler.childDeferred
			handler.progress && (result = handler.progress.apply(undefined, this.value))
			//progress handler can't return promise
			if (result !== undefined && !isPromise(result)) {
				deferred.progress(result)
			}
			else {
				deferred.progress.apply(deferred, this.value)
			}
		} catch (err) {
			//console.error(err)
			deferred.reject(err)
		}
	}
	return this;
}