'use strict';

describe('Promise', function () {
	var Promise = require('../../src/promise.js')
	var $ = require('jquery')

	var promise1, promise2, promise3, promise4
	var handler1, handler2, handler3
	var value1, value2, value3
	var error1, error2, error3

	beforeEach(function () {
		value1 = 1
		value2 = 2
		value3 = 3
		error1 = new Error('Error1')
		error2 = new Error('Error2')
		error3 = new Error('Error3')
		handler1 = jasmine.createSpy('handler1')
		handler2 = jasmine.createSpy('handler2')
		handler3 = jasmine.createSpy('handler3')
	})

	afterEach(function(){
		promise1 = undefined
		promise2 = undefined
		promise3 = undefined
		promise4 = undefined
	})


/*









chain


 */
	describe('constructor', function(){
		it('can be initiated without a creation function', function(){
			handler1.and.callFake(function(){
				return new Promise()
			})
			promise1 = handler1()
			
			expect(handler1).not.toThrowError()
			expect(promise1).toEqual(jasmine.any(Promise))
		})
		it('can be initiated with any value instead of function', function(){
			handler1.and.callFake(function(){
				return new Promise(value1)
			})
			promise1 = handler1()
			promise1.then(handler2)
			
			expect(handler1).not.toThrowError()
			expect(promise1).toEqual(jasmine.any(Promise))
			expect(handler2).not.toHaveBeenCalled()
		})
		it('can be called without a `new` statement', function(){
			handler1.and.callFake(function(){
				return Promise()
			})
			promise1 = handler1()

			expect(handler1).not.toThrowError()
			expect(promise1).toEqual(jasmine.any(Promise))
		})

		describe('has a coercion', function(){
			it('without value', function(){
				promise1 = Promise()
				promise1.then(handler1)
				
				expect(handler1).toHaveBeenCalledWith()
			})

			it('for a value', function(){
				promise1 = Promise(value1)
				promise1.then(handler1)
				
				expect(handler1).toHaveBeenCalledWith(value1)
			})

			it('for multiple values', function(){
				promise1 = Promise(value1, value2)
				promise2 = Promise(value1, value2, value3)
				promise3 = Promise(value1, value2, value3, value2, value1)
				promise1.then(handler1)
				promise2.then(handler2)
				promise3.then(handler3)
				
				expect(handler1).toHaveBeenCalledWith(value1, value2)
				expect(handler2).toHaveBeenCalledWith(value1, value2, value3)
				expect(handler3).toHaveBeenCalledWith(value1, value2, value3, value2, value1)
			})

			it('for an error', function(){
				promise1 = Promise(error1)
				promise1.catch(handler1)
				
				expect(handler1).toHaveBeenCalledWith(error1)
			})

			it('only for one error and ignores multiple errors', function(){
				promise1 = Promise(error1, error2)
				promise2 = Promise(error1, error2, error3)
				promise3 = Promise(error1, error2, error3, error1, error2)
				promise1.catch(handler1)
				promise2.catch(handler2)
				promise3.catch(handler3)
				
				expect(handler1).toHaveBeenCalledWith(error1)
				expect(handler2).toHaveBeenCalledWith(error1)
				expect(handler3).toHaveBeenCalledWith(error1)
			})

			it('calls a function in case of coercion and gets returned value', function(){
				var value = function(){ return value1 }
				promise1 = Promise(value)
				promise1.then(handler1)
				
				expect(handler1).toHaveBeenCalledWith(value1)
			})

			it('for an own Promise object and should be equal to the same object', function(){
				promise1 = new Promise()
				promise2 = Promise(promise1)
				
				expect(promise2).toBe(promise1)
			})

			it('for a Promise-like object', function(){
				var promiselike1 = {then: function(callback){
					callback(value1)
				}}
				var promiselike2 = {then: function(callback, errorback){
					errorback(value2)
				}}
				promise1 = Promise(promiselike1)
				promise2 = Promise(promiselike2)
				promise1.then(handler1)
				promise1.catch(handler3)
				promise2.then(handler3)
				promise2.catch(handler2)
				
				expect(promise1).toEqual(jasmine.any(Promise))
				expect(handler1).not.toBe(promiselike1)
				expect(handler1).toHaveBeenCalledWith(value1)
				expect(handler2).toHaveBeenCalledWith(value2)
				expect(handler3).not.toHaveBeenCalled()
			})
		})

		describe('has an inheritance', function () {
			var PromiseLike;
			beforeEach(function(){
				PromiseLike = function(initFunc) {
					Promise.call(this, initFunc)
					this.extraProp = value1
				}
				PromiseLike.prototype = Object.create(Promise.prototype)
				PromiseLike.prototype.constructor = PromiseLike

				PromiseLike.prototype.then = function(callback, errorback, progressback) {
					return new PromiseLike(function(d, e, p) {
						Promise.prototype.then.call(this, d, e, p)
					}.bind(this))
				}

				PromiseLike.prototype.extraMethod = function() {
					return this.then(function() {
						return new PromiseLike()
					})
				}
			})

			it('that correctly preseves instance composition', function(){
				promise1 = new PromiseLike()

				expect(promise1).toEqual(jasmine.any(PromiseLike))
				expect(promise1).toEqual(jasmine.any(Promise))
			})

			xit('with custom properties', function(){
				promise1 = new PromiseLike()

				expect(promise1.extraProp)
				expect(promise1.extraMethod)
				expect(promise1.then)

				p1 = new PromiseLike(function(r) { console.log(1); setTimeout(r, 500) })
				p2 = p1.then(function(v) { console.info(v)})
				console.log(p1.extra())
				console.log(p2.extra)
			})

			xit('with cutom method', function(){
				promise1 = new PromiseLike()
				promise2 = promise1.extraMethod()

				expect(promise2).toEqual(jasmine.any(PromiseLike))
			})

			it('then returns the inherited instance', function(){
				promise1 = new PromiseLike()
				promise2 = promise1.then()

				expect(promise2).toEqual(jasmine.any(PromiseLike))
			})
		})
	})

	describe('on success', function (){
		it('can be resolved', function(done){
			promise1 = new Promise(function(resolve, reject){
				setTimeout(resolve, 1)
			})

			promise1.then(handler1)
			setTimeout(function(){
				expect(handler1).toHaveBeenCalled()
				done()
			}, 15)
		})

		it('can resolve synchronously', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve()
			})			
			promise1.then(handler1)	
			expect(handler1).toHaveBeenCalled()
		})

		it('is resolved without a value by default', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve()
			})			
			promise1.then(handler1)	
			expect(handler1).toHaveBeenCalledWith()
		})

		it('can resolve with a value', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1)
			})			
			promise1.then(handler1)	
			promise1.then(handler2)
			expect(handler1).toHaveBeenCalledWith(value1)			
			expect(handler2).toHaveBeenCalledWith(value1)
		})

		it('can resolve with multiple values', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value2, value3)
			})
			promise2 = new Promise(function(resolve, reject){
				resolve(value1, value2, value3)
			})				
			promise1.then(handler1)
			promise2.then(handler2)	
			expect(handler1).toHaveBeenCalledWith(value2, value3)
			expect(handler2).toHaveBeenCalledWith(value1, value2, value3)
		})

		it('can resolve with a Promise', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1)
			})
			promise2 = new Promise(function(resolve, reject){
				resolve(promise1)
			})
			promise2.then(handler2)
			expect(handler2).toHaveBeenCalledWith(value1)
		})

		it('can resolve with a Promise with multiple values', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1, value2)
			})
			promise2 = new Promise(function(resolve, reject){
				resolve(promise1)
			})
			promise2.then(handler2)
			expect(handler2).toHaveBeenCalledWith(value1, value2)
		})

		it('handlers called only once', function(done){
			promise1 = new Promise(function(resolve, reject){
				resolve()
				setTimeout(resolve, 5)
			})
			promise1.then(handler1)
			setTimeout(function(){
				expect(handler1.calls.count()).toEqual(1)
				done()
			}, 15)
		})

		it('handlers called in a correct order', function(){
			var order = []
			promise1 = new Promise(function(resolve, reject){
				resolve(value1)
			})
			handler1.and.callFake(function(){
				order.push('handler1')
			})
			handler2.and.callFake(function(){
				order.push('handler2')
			})
			handler3.and.callFake(function(){
				order.push('handler3')
			})
			promise1.then(handler1)
			promise1.then(handler2)
			promise1.then(handler3)
			expect(order).toEqual(['handler1', 'handler2', 'handler3'])
		})		
	})
	
	describe('on fail', function(){
		it('can be rejected', function(done){
			promise1 = new Promise(function(resolve, reject){
				setTimeout(reject, 1)
			})

			promise1.catch(handler1)
			setTimeout(function(){
				expect(handler1).toHaveBeenCalled()
				done()
			}, 15)
		})

		it('can reject synchronously', function(){
			promise1 = new Promise(function(resolve, reject){
				reject()
			})			
			promise1.catch(handler1)	
			expect(handler1).toHaveBeenCalled()
		})

		it('is rejected without a value by default', function(){
			promise1 = new Promise(function(resolve, reject){
				reject()
			})			
			promise1.catch(handler1)	
			expect(handler1).toHaveBeenCalledWith()
		})

		it('can reject with a value', function(){
			promise1 = new Promise(function(resolve, reject){
				reject(error1)
			})			
			promise1.catch(handler1)	
			promise1.catch(handler2)
			expect(handler1).toHaveBeenCalledWith(error1)			
			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('can reject with multiple values', function(){
			promise1 = new Promise(function(resolve, reject){
				reject(error2, error3)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(error1, error2, error3)
			})				
			promise1.catch(handler1)
			promise2.catch(handler2)	
			expect(handler1).toHaveBeenCalledWith(error2, error3)
			expect(handler2).toHaveBeenCalledWith(error1, error2, error3)
		})

		it('can reject with a Promise', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(promise1)
			})
			promise3 = new Promise(function(resolve, reject){
				reject(error1)
			})
			promise4 = new Promise(function(resolve, reject){
				reject(promise3)
			})

			promise2.then(handler1)
			promise4.catch(handler2)
			expect(handler1).toHaveBeenCalledWith(value1)
			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('can reject with a Promise with multiple values', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1, value2)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(promise1)
			})
			promise2.then(handler1)
			expect(handler1).toHaveBeenCalledWith(value1, value2)
		})

		it('error handlers called only once', function(done){
			promise1 = new Promise(function(resolve, reject){
				reject()
				setTimeout(reject, 5)
			})
			promise1.catch(handler1)
			setTimeout(function(){
				expect(handler1.calls.count()).toEqual(1)
				done()
			}, 15)
		})
		
		it('success handlers are not called', function(){
			promise1 = new Promise(function(resolve, reject){
				reject(error1)
			})
			promise1.then(handler1)
			expect(handler1).not.toHaveBeenCalledWith(error1)
		})

		it('error handlers called in a correct order', function(){
			var order = []
			promise1 = new Promise(function(resolve, reject){
				reject(value1)
			})
			handler1.and.callFake(function(){
				order.push('handler1')
			})
			handler2.and.callFake(function(){
				order.push('handler2')
			})
			handler3.and.callFake(function(){
				order.push('handler3')
			})
			promise1.catch(handler1)
			promise1.catch(handler2)
			promise1.catch(handler3)
			expect(order).toEqual(['handler1', 'handler2', 'handler3'])
		})

		it('catches exeptions in a success callback', function(){
			promise1 = new Promise(function(resolve){
				resolve()
			})
			handler1.and.throwError(error1)
			promise2 = promise1.then(handler1)
			promise2.catch(handler2)

			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('catches exeptions in an error callback', function(){
			promise1 = new Promise(function(resolve, reject){
				reject()
			})
			handler1.and.throwError(error1)
			promise2 = promise1.catch(handler1)
			promise2.catch(handler2)

			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('`then()` can handle an error in a second callbnack argument', function(){
			promise1 = new Promise(function(resolve, reject){
				reject(error1)
			})			
			promise1.then(null, handler1)	
			promise1.then(undefined, handler2)
			expect(handler1).toHaveBeenCalledWith(error1)			
			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('`then()` can\'t catch an exeptions of a current success callback', function(){
			promise1 = new Promise(function(resolve){
				resolve()
			})
			handler1.and.throwError(error1)
			promise1.then(handler1, handler2)

			expect(handler2).not.toHaveBeenCalledWith(error1)
		})
	})

	describe('on final', function(){
		it('handles success', function(){
			promise1 = new Promise(function(resolve){
				resolve()
			})			
			promise1.finally(handler1)

			expect(handler1).toHaveBeenCalled()
		})

		it('handles fail', function(){
			promise1 = new Promise(function(resolve, reject){
				reject()
			})			
			promise1.finally(handler1)

			expect(handler1).toHaveBeenCalled()
		})

		it('is fulfilled with a value', function(){
			promise1 = new Promise(function(resolve){
				resolve(value1)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(error1)
			})		
			promise1.finally(handler1)
			promise2.finally(handler2)

			expect(handler1).toHaveBeenCalledWith(value1)
			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('can fulfill with multiple values', function(){
			promise1 = new Promise(function(resolve){
				resolve(value1, value2)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(error1, error2, error3)
			})				
			promise1.finally(handler1)
			promise2.finally(handler2)

			expect(handler1).toHaveBeenCalledWith(value1, value2)
			expect(handler2).toHaveBeenCalledWith(error1, error2, error3)
		})

		it('can fulfill with a Promise', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(promise1)
			})
			promise3 = new Promise(function(resolve, reject){
				reject(error1)
			})
			promise4 = new Promise(function(resolve, reject){
				reject(promise3)
			})
			promise2.finally(handler1)
			promise4.finally(handler2)

			expect(handler1).toHaveBeenCalledWith(value1)
			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('can fulfill with a Promise with multiple values', function(){
			promise1 = new Promise(function(resolve, reject){
				resolve(value1, value2)
			})
			promise2 = new Promise(function(resolve, reject){
				reject(promise1)
			})
			promise2.finally(handler1)
			expect(handler1).toHaveBeenCalledWith(value1, value2)
		})

		it('handlers called only once', function(done){
			promise1 = new Promise(function(resolve, reject){
				reject()
				setTimeout(reject, 5)
			})
			promise1.finally(handler1)

			setTimeout(function(){
				expect(handler1.calls.count()).toEqual(1)
				done()
			}, 15)
		})

		it('handlers called in a correct order', function(){
			var order = []
			promise1 = new Promise(function(resolve, reject){
				reject(value1)
			})
			handler1.and.callFake(function(){
				order.push('handler1')
			})
			handler2.and.callFake(function(){
				order.push('handler2')
			})
			handler3.and.callFake(function(){
				order.push('handler3')
			})
			promise1.finally(handler1)
			promise1.finally(handler2)
			promise1.finally(handler3)

			expect(order).toEqual(['handler1', 'handler2', 'handler3'])
		})

		it('catches exeptions in a success callback', function(){
			promise1 = new Promise(function(resolve){
				resolve()
			})
			handler1.and.throwError(error1)
			promise2 = promise1.then(handler1)
			promise2.finally(handler2)

			expect(handler2).toHaveBeenCalledWith(error1)
		})

		it('catches exeptions in an error callback', function(){
			promise1 = new Promise(function(resolve, reject){
				reject()
			})
			handler1.and.throwError(error1)
			promise2 = promise1.catch(handler1)
			promise2.finally(handler2)

			expect(handler2).toHaveBeenCalledWith(error1)
		})
	})

	describe('on progress', function(){
		it('can be notified', function(done){
			promise1 = new Promise(function(resolve, reject, notify){
				var intervalId = setInterval(notify, 10)
				setTimeout(function(){
					clearInterval(intervalId)
				}, 55)
			})
			promise1.then(null, null, handler1)

			setTimeout(function(){
				expect(handler1.calls.count()).toEqual(5)
				done()
			}, 60)
		})

		it('is notified synchronosly', function(){
			var progress;
			promise1 = new Promise(function(resolve, reject, notify){
				progress = notify
			})
			promise1.then(null, null, handler1)
			progress()
			progress()
			progress()

			expect(handler1.calls.count()).toEqual(3)
		})

		xit('is notified with a value', function(){
			var progress;
			promise1 = new Promise(function(resolve, reject, notify){
				progress = notify
			})
			promise1.then(null, null, handler1)
			progress()
			progress()
			progress()

			expect(handler1.calls.count()).toEqual(3)
		})

		xit('is notified with multiple values', function(){
			var progress;
			promise1 = new Promise(function(resolve, reject, notify){
				progress = notify
			})
			promise1.then(null, null, handler1)
			progress()
			progress()
			progress()

			expect(handler1.calls.count()).toEqual(3)
		})

		xit('handles `progress()`', function(){
			var progress;
			promise1 = new Promise(function(resolve, reject, notify){
				progress = notify
			})
			promise1.then(null, null, handler1)
			progress()
			progress()
			progress()

			expect(handler1.calls.count()).toEqual(3)
		})

		it('don\'t notify if resolved', function(done){
			promise1 = new Promise(function(resolve, reject, notify){
				var intervalId = setInterval(notify, 10)
				setTimeout(function(){
					clearInterval(intervalId)
				}, 25)
				resolve()
			})
			promise1.then(null, null, handler1)
			setTimeout(function(){
				expect(handler1).not.toHaveBeenCalled()
				done()
			}, 30)
		})

		it('don\'t notify if rejected', function(done){
			promise1 = new Promise(function(resolve, reject, notify){
				var intervalId = setInterval(notify, 10)
				setTimeout(function(){
					clearInterval(intervalId)
				}, 25)
				reject()
			})
			promise1.then(null, null, handler1)
			setTimeout(function(){
				expect(handler1).not.toHaveBeenCalled()
				done()
			}, 30)
		})

		xit('catches exeptions in a notify handler', function(){


		})
	})

	describe('canceletion', function () {
		it('can be performed', function(){
			promise1 = new Promise()
			promise1.catch(handler1)
			promise1.cancel()

			expect(handler1).toHaveBeenCalled()
		})

		it('calls canceler', function(){
			promise1 = new Promise(function(){}, handler1)
			promise1.cancel()

			expect(handler1).toHaveBeenCalled()
		})

		xit('`cancel()` returns context', function(){
			promise1 = new Promise(function(){}, handler1)
			promise1.cancel()

			expect(handler1).toHaveBeenCalled()
		})	
	})

	describe('then', function(){
		it('returns a new Promise instance', function(){
			promise1 = new Promise()
			promise2 = promise1.then(handler1)

			expect(promise2).not.toEqual(promise1)
			expect(promise2).toEqual(jasmine.any(Promise))
		})
	})

	describe('then', function(){
		it('returns a new Promise instance', function(){
			promise1 = new Promise()
			promise2 = promise1.then(handler1)

			expect(promise2).not.toEqual(promise1)
			expect(promise2).toEqual(jasmine.any(Promise))
		})
	})

	describe('chaining', function(){
		/*
			window.p = new Promise(function (resolve, reject) { setTimeout(resolve) })
			.then(
				function () {
					return new Error('error-test')
					return new Promise(function (resolve) { setTimeout(resolve) }).then(
						function () { throw new Error('345') },
						function (e) { console.error('error 1.5', e) }
					).then(
						function (v) { console.log(v) }
						//function (e) { console.error('error 1.75', e) }
					)
				},
				function (e) { console.error('error 1', e) }
			).then(
				function (v) { console.log(v) },
				function (e) {
					return  Promise(5)
					console.error('error 2', e)
				}
			).then(
				function (v) { console.log(v) },
				function (e) { console.error('error 3', e) }
			)
			*/

		xit('is canceled if not resolved', function(done){
			p1 = new Promise(function () { 

			}, function () {
				 console.warn('canceled') 
			})
			p1.then(function () { console.info('p1 done') }, function (e) { console.error('p1 error: ' + e.message) })
			p2 =  new Promise().wait(1000)
			p2.then(function () { console.info('p2 done') }, function (e) { console.error('p2 error: ' + e.message) })
			p3 = p2.then(function () { return 0})
			
			p3.cancel()

		})

		xit('notification chain', function(done){
			p1 = new Promise(function (resolve, reject) {
				var intervalId = setInterval(function () {
					//pro('p1 pending')
				}, 100)

				setTimeout(function () {
					done('p1 done')
					//fail(new Error('p1 fail'))
					clearInterval(intervalId)
				}, 3000)
			})
			p2 = new Promise(function (done, fail, pro) {
				var intervalId = setInterval(function () {
					//pro('p2 pending')
				}, 100)

				setTimeout(function () {
					done('p2 done')
					//fail(new Error('p2 fail'))
					clearInterval(intervalId)
				}, 500)
			})

			p3 = p2.and(p1).then(function (v) { console.log(v); }, function (e) { console.error(e) }, function (i) { console.info(i); })
			//p2.then(function (v) { console.log(v); }, function (e) { console.error(e) }, function (i) { console.info(i); })
			//p4 = p3.then(function (v) { console.log(v); }, function (e) { console.error(e) }, function (i) { console.info(i) })
			//p3.cancel()
			setTimeout(function () {
				
				//p4.then(function (v) { console.log('p4 value: ' + v); }, function (e) { console.error('p4 error: ' + e.message) })
				//p3.then(function (v) { console.log('p3 value: ' + v); }, function (e) { console.error('p3 error: ' + e.message) }, function (i) { console.info('p3 progress: ' + i); return 111})
				//.then(function (v) { console.log('p33 value: ' + v); }, function (e) { console.error('p33 error: ' + e.message) }, function (i) { console.info('p33 progress: ' + i); })

				p1.then(function (v) { console.log('p1 test: ' + v) }, function (e) { console.error('p1 error: ' + e.message) }, function (i) { console.info('p1 progress: ' + i); })


				//console.log('sync')
			}, 200)

			setTimeout(function () {

				//p3.then(function (v) { console.log('p3 value: ' + v); }, function (e) { console.error('p3 error: ' + e.message) })
				//p4.then(function (v) { console.log('p4 value: ' + v); }, function (e) { console.error('p4 error: ' + e.message) })
				//p1.then(function (v) { console.log('p1 test: ' + v) }, function (e) { console.error('p1 error: ' + e.message) })

				//console.log('sync')
			}, 300)
			


			//p1 = new Promise(function(done, error) { setTimeout(function() { done('p1 done') }, 500) })
			//p2 = new Promise(function(done, error) { setTimeout(function() { done('p2 done') }, 1500) })
			//p3 = p1.then(function(v) { console.log(v); return p2 })
			//p3.then(function(v) { console.log('p3 value ' + v); })
			//p1.then(function(v) { console.log('p1 value ' + v); })

		})
	})

	describe('compatible with', function () {
		describe('jQuery', function(){
			var $deferred
			var $promise
			var TIMEOUT = 10
			beforeEach(function(){
				$deferred = $.Deferred()
				$promise = $deferred.promise()
			})

			it('deferred', function(done){
				promise1 = Promise($deferred).then(handler1)

				expect(handler1).not.toHaveBeenCalled()

				$deferred.resolve()			

				setTimeout(function(){
					expect(promise1).toEqual(jasmine.any(Promise))
					expect(handler1).toHaveBeenCalled()
					done()
				}, TIMEOUT)
			})

			it('promise', function(done){
				promise1 = Promise($promise).then(handler1)

				expect(handler1).not.toHaveBeenCalled()

				$deferred.resolve()		

				setTimeout(function(){
					expect(promise1).toEqual(jasmine.any(Promise))
					expect(handler1).toHaveBeenCalled()
					done()
				}, TIMEOUT)
			})

			it('deffered in a chain', function(done){
				promise1 = Promise().then(function(){
					return $deferred
				})
				promise1.then(handler1)

				expect(handler1).not.toHaveBeenCalled()

				$deferred.resolve()		

				setTimeout(function(){
					expect(handler1).toHaveBeenCalled()
					done()
				}, TIMEOUT)
			})

			it('promise in a chain', function(done){
				promise1 = Promise().then(function(){
					return $promise
				})
				promise1.then(handler1)

				expect(handler1).not.toHaveBeenCalled()

				$deferred.resolve()		

				setTimeout(function(){
					expect(handler1).toHaveBeenCalled()
					done()
				}, TIMEOUT)
			})

			it('success with multiple values', function(done){
				promise1 = Promise($promise)
				promise1.then(handler1)
				$deferred.resolve(value1, value2, value3)			

				setTimeout(function(){
					expect(handler1).toHaveBeenCalledWith(value1, value2, value3)
					done()
				}, TIMEOUT)
			})

			it('fail', function(done){
				promise1 = Promise($promise)
				promise1.catch(handler1)
				$deferred.reject(error1)			

				setTimeout(function(){
					expect(handler1).toHaveBeenCalledWith(error1)
					done()
				}, TIMEOUT)
			})

			it('progress', function(done){
				promise1 = Promise($promise)
				promise1.then(null, null, handler1)
				$deferred.notify(value1)			

				setTimeout(function(){
					expect(handler1).toHaveBeenCalledWith(value1)
					done()
				}, TIMEOUT)
			})
		})
	})
})