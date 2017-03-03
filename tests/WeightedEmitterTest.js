/**
 * Provides the tests for the WeightedEmitter class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

const unitjs = require('unit.js');

const WeightedEmitter = require('../lib/WeightedEmitter');

/** @test {WeightedEmitter} */
describe('WeightedEmitter', () => {
    it('listeners should be an empty object', () => {
        const me = new WeightedEmitter();
        unitjs.object(me.listeners).is({});
    });

    /** @test {WeightedEmitter#on} */
    describe('WeightedEmitter.on()', () => {
        it('should add a new event and callback', () => {
            const me = new WeightedEmitter();
            const callback = function() {
                // Does nothing.
            };

            unitjs.object(me.listeners).is({});
            me.on('test', callback);
            unitjs.object(me.listeners).is({
                test: [{
                    callback: callback,
                    weight: 0
                }]
            });
        });

        it('should add multiple events and callbacks', () => {
            const me = new WeightedEmitter();
            const callback1 = function() {
                // Does nothing.
            };

            const callback2 = function() {
                // Does nothing.
            };

            const callback3 = function() {
                // Does nothing.
            };

            me.on('test', callback1);
            me.on('test', callback2);
            me.on('test1', callback3);
            unitjs.object(me.listeners).is({
                test: [{
                    callback: callback1,
                    weight: 0
                }, {
                    callback: callback2,
                    weight: 0
                }],
                test1: [{
                    callback: callback3,
                    weight: 0
                }]
            });
        });

        it('should sort the callbacks by weight', () => {
            const me = new WeightedEmitter();
            const callback1 = function() {
                // Does nothing.
            };

            const callback2 = function() {
                // Does nothing.
            };

            const callback3 = function() {
                // Does nothing.
            };

            me.on('test', callback1, 15);
            me.on('test', callback2);
            me.on('test', callback3, -10);
            unitjs.object(me.listeners).is({
                test: [{
                    callback: callback3,
                    weight: -10
                }, {
                    callback: callback2,
                    weight: 0
                }, {
                    callback: callback1,
                    weight: 15
                }]
            });
        });
    });

    /** @test {WeightedEmitter#un} */
    describe('WeightedEmitter.un()', () => {
        it('shouldnt moan if the event doesnt exist', () => {
            const me = new WeightedEmitter();
            me.un('test');
        });

        it('should unlisten a whole event', () => {
            const me = new WeightedEmitter();
            const callback1 = function() {
                // Does nothing.
            };

            const callback2 = function() {
                // Does nothing.
            };

            const callback3 = function() {
                // Does nothing.
            };

            me.on('test', callback1);
            me.on('test', callback2);
            me.on('test1', callback3);

            me.un('test');

            unitjs.object(me.listeners).is({
                test1: [{
                    callback: callback3,
                    weight: 0
                }]
            });
        });

        it('should unlisten a specified event callback', () => {
            const me = new WeightedEmitter();
            const callback1 = function() {
                // Does nothing.
            };

            const callback2 = function() {
                // Does nothing.
            };

            const callback3 = function() {
                // Does nothing.
            };

            me.on('test', callback1);
            me.on('test', callback2);
            me.on('test1', callback3);

            me.un('test', callback2);

            unitjs.object(me.listeners).is({
                test: [{
                    callback: callback1,
                    weight: 0
                }],
                test1: [{
                    callback: callback3,
                    weight: 0
                }]
            });

            me.un('test1', callback3);

            unitjs.object(me.listeners).is({
                test: [{
                    callback: callback1,
                    weight: 0
                }]
            });
        });
    });

    /** @test {WeightedEmitter#emit} */
    describe('WeightedEmitter.emit()', () => {
        it('shouldnt moan if the event doesnt exist', (done) => {
            const me = new WeightedEmitter();
            me.emit('test', (err, result) => {
                unitjs.value(err).is(null);
                unitjs.value(result).is(null);

                done();
            });
        });

        it('should execute the callbacks', (done) => {
            const me = new WeightedEmitter();

            me.on('test', function(next) {
                unitjs.object(this).is({
                    args: { 'hello': 'world' },
                    result: null
                });

                this.result = ['hello'];
                next();
            });

            me.on('test', function(next) {
                unitjs.object(this).is({
                    args: { 'hello': 'world' },
                    result: ['hello']
                });

                this.result.push(this.args.hello);
                next();
            });

            me.emit('test', { 'hello': 'world' }, (err, result) => {
                unitjs.value(err).is(null);
                unitjs.array(result).is(['hello', 'world']);

                done();
            });
        });

        it('should execute the callbacks in weight order', (done) => {
            const me = new WeightedEmitter();

            me.on('test', function(next) {
                this.result.push('world');
                next();
            }, 10);

            me.on('test', function(next) {
                this.result = [];
                next();
            }, -10);

            me.on('test', function(next) {
                this.result.push('hello');
                next();
            });

            me.emit('test', (err, result) => {
                unitjs.value(err).is(null);
                unitjs.array(result).is(['hello', 'world']);

                done();
            });
        });

        it('should catch errors in the callback', (done) => {
            const me = new WeightedEmitter();

            me.on('test', function(next) {
                throw new Error('Hello');
            });

            me.on('test', function(next) {
                unitjs.object(this).is({
                    args: { 'hello': 'world' },
                    result: ['hello']
                });

                this.result.push(this.args.hello);
                next();
            });

            me.emit('test', { 'hello': 'world' }, (err, result) => {
                unitjs.object(err).isInstanceOf(Error).hasKey('message', 'Hello');
                unitjs.value(result).is(null);

                done();
            });
        });
    });
});