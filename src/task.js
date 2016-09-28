'use strict'

setAsyncTask,
clearAsyncTask,
var document = window.document

var window = window;
/*shortcuts*/
noop = function () { },

//internal task scheduling
	//https://github.com/kriskowal/asap/blob/2a2a1b4e73bf13a7d5fb5bc0937e40125ff7921e/browser-raw.js
	//https://github.com/kriskowal/asap/issues/21
	//https://github.com/tildeio/rsvp.js/commit/3f75248d34c11fb05d3d214c183f507dd97f738a
	//https://github.com/cujojs/when/blob/a22dd023a691617b30505460a21a5f99e1a1f187/lib/async.js
	(function () {
		var Stack = [],
			IDs = {},
			idCounter = 1,
			implementation,
			createTask,
			cancelTask = noop,
			setImmediate = global.setImmediate || (global.msClearImmediate && global.msSetImmediate) /*IE10*/,
			clearImmediate = global.clearImmediate || global.msClearImmediate /*IE10*/,
			MutationObserver = window.MutationObserver || window.WebkitMutationObserver,

			//feature detection
			hasNextTick = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]'),
			hasPostMessage = (function () {
				if (!global.postMessage || global.importScripts) return false;
				//reject Opera 9 and lower
				if (Object.prototype.toString.call(global.opera) == '[object Opera]' && parseFloat(global.opera.version()) < 10) return false;
				
				var isAsync = true,
					originHandler = global.onmessage;

				global.onmessage = function () { isAsync = false }
				global.postMessage('{}', '*')
				global.onmessage = originHandler

				return isAsync;
			}()),
			hasReadyStateChange = !hasPostMessage && document && ('onreadystatechange' in document.createElement('script'));


		if (hasNextTick) { //microtask approach.
			createTask = function (callback) {
				process.nextTick(callback)
			}
		}
		else if (!!MutationObserver) { //microtask approach.
			createTask = function (callback) {
				implementation = new MutationObserver(callback)
				implementation.target = document.createTextNode('')
				implementation.observe(implementation.target, { characterData: true })
				implementation.target.data = 1
			}
			cancelTask = function () {
				implementation.disconnect()
				implementation = implementation.target = undefined
			}
		}
		else if (!!setImmediate) { //native setImmediate implementation
			createTask = function (callback) {
				implementation = setImmediate(callback)
			}
			cancelTask = function () {
				clearImmediate(implementation)
			}
		}
		else if (hasPostMessage) { //postMessage approach. Most of browsers.
			(function () {
				var message = 'coreasynctask' + Math.round(Math.random() * Math.pow(10, 15)),
					origin = location.origin || location.host ? (location.protocol + '//' + location.host) : '*',
					handler,
					onmessage = function(e) {
						var callback;
						if (
							e.source === global
							&& typeof e.data === 'string'
							&& e.data == message
							&& (((e.origin && (location.host ? e.origin : '*')) == origin) || true)
						) {
							callback = handler;
							handler = undefined
							callback()
						}
					};

				createTask = function (callback) {
					handler = callback
					global.addEventListener('message', onmessage, false)
					global.postMessage(message, origin)
				}
				cancelTask = function () {
					handler = undefined
					global.removeEventListener('message', onmessage)
				}
			}())
		} else if (!!global.MessageChannel) { //MessageChanel approach. Some WebWorkers.
			createTask = function (callback) {
				implementation = new global.MessageChannel()
				implementation.port1.onmessage = function () {
					callback()
				}
				implementation.port2.postMessage({})
			}
			cancelTask = function () {
				implementation.port1.onmessage = null
				implementation = undefined
			}
		} else if (hasReadyStateChange) { //Async event approach. IE 8-
			createTask = function (callback) {
				implementation = document.createElement('script')
				implementation.onreadystatechange = function () {
					this.onreadystatechange = null
					this.parentNode.removeChild(this)
					implementation = undefined
					callback()
				}
				document.head.appendChild(implementation)
			}
			cancelTask = function () {
				implementation.onreadystatechange = null
				implementation.parentNode.removeChild(implementation)
				implementation = undefined
			}
		} else {// The elder browsers
			createTask = function (callback) {
				implementation = setTimeout(callback, 10)
			}
			cancelTask = function () {
				clearTimeout(implementation)
			}
		}

		//clean
		hasNextTick =
		hasPostMessage =
		hasReadyStateChange = undefined

		//define
		setAsyncTask = function (taskFunc) {
			if (typeof taskFunc !== 'function') return;
			var id = idCounter++;
			IDs[id] = taskFunc //save reference to callback
			//If already has tasks, than just add new one. Execution is already scheduled.
			if (Stack.length) {
				Stack.push(taskFunc)
			}
			//Else add first task and schedule async execution.
			else {
				Stack.push(taskFunc)
				createTask(function () {
					var task;
					while (task = Stack.shift()) {
						task()
					}
				})
			}
			return id;
		}

		clearAsyncTask = function (id) {
			if (typeof id !== 'number' || !(id in IDs) || !Stack.length) return;
			var task, i = 0;
			while (task = Stack[i++]) {
				if (task === IDs[id]) {
					Stack.splice(i - 1, 1)
					delete IDs[id]
				}
			}
			if (!Stack.length) { //cancel async operation if no functions to execute
				cancelTask()
			}
		}
	}());
