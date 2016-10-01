'use strict';

describe('Promise helper', function () {
	var Promise = require('../../src/promise.js')

	var promise

	describe('"delay"', function () {
		it('', function(done){
			p1 = new Promise(function(r, e) {
				setTimeout(function() {
					r(1, 2, 3)
				}, 499)
				
			})
			
			p1.then(function(a, b, c) { console.log(a, b, c) }, null, function() { console.info(0)})
				.delay(500).then(function(a, b, c) { console.log(a, b, c) }).catch(function(e, e2) { console.error(e, e2) })
				.delay(500).then(function(a, b, c) { console.log(a, b, c) }).catch(function(e, e2) { console.error(e, e2) })

			p1.interval(100)

		})
	})

	describe('"interval"', function () {
		it('', function(done){
			p1 = new Promise(function(r, e) {
				setTimeout(function() {
					r(1, 2, 3)
				}, 499)
				
			})
			
			p1.then(function(a, b, c) { console.log(a, b, c) }, null, function() { console.info(0)})
				.delay(500).then(function(a, b, c) { console.log(a, b, c) }).catch(function(e, e2) { console.error(e, e2) })
				.delay(500).then(function(a, b, c) { console.log(a, b, c) }).catch(function(e, e2) { console.error(e, e2) })

			p1.interval(100)

		})
	})

	describe('"and"', function () {
		it('cancelation', function(done){
			p1 = new Promise(function () { }, function () { console.warn('p1 canceled') }).wait(100)
			p2 = new Promise(5).wait(500)
			p3 = p1.and(p2)
			p3.then(function (v) { console.log(v) }, function (e) { console.error(e) })
			p3.cancel()
		})
	})

	describe('"wait"', function () {
		it('', function(done){
			//var P1 = Promise.any(p1, p2)
			//P1.then(function (v) { console.log(v); window.v = v }, function (e) { console.error(e) }, function (i) { console.info(i); })
			//p1.wait(200)
			//P1.cancel()
		})
	})

	describe('"timeout"', function () {
		it('', function(done){
			
		})
	})


	describe('"isPromise"', function () {
		it('', function(done){
			
		})
	})
})
