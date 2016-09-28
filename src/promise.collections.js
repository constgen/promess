'use strict'

var Promise = require('./promise.js')

 function PromiseCollection (specificFunc) {
	return function (iterable) {
		var PromArr = [],
		var len,
		var collection = {
			length: 0,
			done: 0,
			error: 0,
			results: [],
			errorResults: []
		};

		if (arguments.length > 1) {
			PromArr = arguments
		}
		else if (iterable instanceof Array || (typeof iterable === 'object' && 0 in iterable)) { //like Array
			PromArr = iterable
		}
		else if (arguments.length) {
			PromArr.push(iterable)
		}

		len = collection.length = PromArr.length


		return new Promise(function(resolve, reject, progress) {
			//create closure of current state for callbacks
			var itemCallbacks = specificFunc(collection, resolve, reject, progress)
			
			var nextStep = function(promise, i) {
				//check if iterable was augmented
				if (i === len - 1) {
					promise['finally'](function() {
						collection.length = PromArr.length;
						if (len !== collection.length) {
							len = collection.length;
							//continue iteration
							iterationLoop();
						}
					});
				}
				promise.then(
					itemCallbacks.itemResolved && itemCallbacks.itemResolved.bind(undefined, i),
					itemCallbacks.itemRejected && itemCallbacks.itemRejected.bind(undefined, i),
					itemCallbacks.itemProgressed && itemCallbacks.itemProgressed.bind(undefined, i)
				);
			};

			var iterationLoop = function() {
				var promise
				var i = 0
				while (i < len || ((len = collection.length = PromArr.length) && i < len)) {
					if (i in PromArr) {
						//ensure that item is a Promise
						promise = Promise(PromArr[i]);
						nextStep(promise, i);
					}
					//skip item
					else if ('itemSkipped' in itemCallbacks) {
						itemCallbacks.itemSkipped(i)
					}
					
					i += 1;
				}
			};

			//start loop
			iterationLoop();
		}, function() {
			//cancel all Promises in array
			setAsyncTask(function() {
				PromArr.forEach(function(p) {
					if (p && p.cancel) {
						p.cancel();
					}
				});
			});
		});
	}
}

//`all` method, gathers many promises and becomes resolved, when they all resolved
exports.all = Promise.every = PromiseCollection(function (collection, resolveCollection, rejectCollection, progressCollection) {
	//if no arguments, resolve collection
	if (!collection.length) {
		resolveCollection([])
	}

	return {
		itemSkipped: function(i) {
			collection.done += 1
			if (collection.done == collection.length) {
				resolveCollection(collection.results)
			}
		},
		itemResolved: function (i, result) {
			progressCollection(result)
			collection.done += 1
			collection.results[i] = result
			if (collection.done === collection.length) {
				resolveCollection(collection.results)
			}
		},
		itemRejected: function (i, err) {
			rejectCollection(err)
		},
		itemProgressed: undefined
	}
})

//`any` method, gathers many promises and becomes resolved, when they all fullfilled with any results.
exports.any = PromiseCollection(function (collection, resolveCollection, rejectCollection, progressCollection) {
	//if no arguments, resolve collection
	if (!collection.length) {
		resolveCollection([])
	}

	return {
		itemSkipped: function (i) {
			collection.done += 1
			if (collection.done == collection.length) {
				resolveCollection(collection.results)
			}
		},
		itemResolved: function (i, result) {
			progressCollection(result)
			collection.done += 1
			collection.results[i] = result
			if (collection.done === collection.length) {
				resolveCollection(collection.results)
			}
		},
		itemRejected: function (i, err) {
			progressCollection(err)
			collection.done += 1
			collection.results[i] = err
			if (collection.done === collection.length) {
				resolveCollection(collection.results)
			}
		},
		itemProgressed: undefined
	}
})

//`some` method, gathers many promises and becomes resolved, when they all fullfilled with any results. But if all promises are rejected `some` also becomes rejected.
exports.some = PromiseCollection(function (collection, resolveCollection, rejectCollection, progressCollection) {
	return {
		itemSkipped: function(i) {
			collection.done += 1
			collection.error += 1
			if (collection.error == collection.length) {
				//if all promise collection was rejected
				rejectCollection(collection.errorResults)
			} else if (collection.done == collection.length) {
				//return only successful results
				resolveCollection(collection.results.filter(function(itm, j) { return j in collection.results }))
			}
		},
		itemResolved: function (i, result) {
			progressCollection(result)
			collection.done += 1
			collection.results[i] = result
			if (collection.done === collection.length) {
				//return only successful results
				resolveCollection(collection.results.filter(function (itm, j) { return j in collection.results }))
			}
		},
		itemRejected: function (i, err) {
			progressCollection(err)
			collection.done += 1
			collection.error += 1
			collection.errorResults[i] = err
			if (collection.error === collection.length) {
				//if all promise collection was rejected
				rejectCollection(collection.errorResults)
			} else if (collection.done === collection.length) {
				//return only successful results
				resolveCollection(collection.results.filter(function (itm, j) { return j in collection.results }))
			}
		},
		itemProgressed: undefined
	}
})