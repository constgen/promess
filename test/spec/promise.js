'use strict';

describe('Promise', function () {
	var Promise = require('../../src/promise.js')

	var promise1, promise2, promise3, promise4
	var handler1, handler2, handler3
	var value1, value2, value3
	var error1, error2, error3

	var A = [1,2, null, undefined, new Error(), 3]

	beforeEach(function () {
		promise1 = undefined
		promise2 = undefined
		promise3 = undefined
		promise4 = undefined
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


/*





can be called without new (inheritance)
can be canceled
can progress
catches exeptions in a progress handler

chain


 */


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

	describe('constructor', function(){
		xit('can be called without a creation function', {

		})
		xit('can be called without a `new` statement', {
			
		})
	})

	describe('on progress', function(){
		xit('resolved', function(done){
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



		
	})

	describe('then', function(){
		it('returns a new Promise instance', function(){
			promise1 = new Promise()
			promise2 = promise1.then(handler1)

			expect(promise2).not.toEqual(promise1)
			expect(promise2).toEqual(jasmine.any(Promise))
		})
	})

	describe('chain', function(){
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
	})
return;



	describe('Resolve promise with a promise', function () {
		it('', function(done){
			p2 = new Promise(5).wait(1500)
			p2.then(function (v) { console.info('p2 done', v) }, function (e) { console.error('p2 error: ' + e.message) })

			p1 = new Promise(function (resolve, reject) {
				setTimeout( function(){ resolve(p2) },  750)
			}, function () { console.warn('canceled') })

			p1.then(function (v) { console.info('p1 done', v) }, function (e) { console.error('p1 error: ' + e.message) })

			//p3 = p2.then(function () { return 0 })

		})
	})

	

	

	describe('Inheritance', function () {
		it('', function(done){
			window.ExtPromise = function(initFunc, cancelFunc) {
				if (this instanceof Promise) { //with `new` operator
					Promise.call(this, initFunc, cancelFunc)
				}
				else { //as a function
					return new ExtPromise(function(resolve) {
						resolve(initFunc)
					})
				}
			}
			ExtPromise.prototype = Object.create(Promise.prototype)
			ExtPromise.prototype.constructor = ExtPromise

			ExtPromise.prototype.then = function(src, options) {
				return new ExtPromise(function(d, e, p) {
					Promise.prototype.then.call(this, d, e, p)
				}.bind(this))
			}

			ExtPromise.prototype.extra = function(src, options) {
				return this.then(function() {
					return new ExtPromise()
				})
				
			}
			ExtPromise.prototype.load = function(src, options) {
				return this.then(function() {
					return Core.load(src, options)
				})
			}

			p1 = new ExtPromise(function(r) { console.log(1); setTimeout(r, 500) })
			p2 = p1.then(function(v) { console.info(v)})
			console.log(p1.extra())
			console.log(p2.extra)

		})
	})

	describe('jQuery compatibility', function () {
		it('', function(done){
			var def = $.Deferred()
			setTimeout(function () { def.resolve(1,2,3)}, 10)
			def//.then(function (a, b, c) { console.log(a, b, c) })
			
			window.p2 = Promise(def).then(function (a,b,c) {console.info(a,b,c) })

		})
	})

	describe('default', function () {
		it('', function(done){
			//Promise.some(A).then(function(R) {
			//	console.log(R)
			//	console.log(R.filter(function() { return true}))
			//})
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

		})
	})

	describe('"delay"', function () {
		it('', function(done){
			

		})
	})
})