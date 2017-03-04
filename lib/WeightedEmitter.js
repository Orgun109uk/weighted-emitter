/**
 * Provide the WeightedEmitter class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

const async = require('async');
const sortByKey = require('sort-by-key');

/**
 * Function used to emit a given callback.
 *
 * @param {Object} response The emitter response object.
 * @param {Object} listener The listener object.
 * @return {Function} Returns an async function call.
 */
function emitCallback(response, listener) {
    return function(next) {
        try {
            listener.callback.call(response, next);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = class WeightedEmitter {
    /**
     * Construct the WeightedEmitter object.
     */
    constructor() {
        const _listeners = {};

        Object.defineProperties(this, {
            /**
             * Get the internal listeners object.
             *
             * @type {Object}
             */
            listeners: {
                get: function() {
                    return _listeners;
                }
            }
        });
    }

    /**
     * Register an event listener callback.
     *
     * @param {String} event The event to listen to.
     * @param {Function} callback The callback.
     * @param {Int} weight The weight to give this callback.
     * @return {WeightedEmitter} Returns self.
     */
    on(event, callback, weight) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push({
            callback: callback,
            weight: weight || 0
        });

        sortByKey(this.listeners[event], 'weight');

        return this;
    }

    /**
     * Unregister an event or an event listener callback.
     *
     * @param {String} event The event to unlisten on.
     * @param {Function} callback The callback to unlisten, if not provided the whole even will be cleared.
     * @return {WeightedEmitter} Returns self.
     */
    un(event, callback) {
        if (!this.listeners[event]) {
            return this;
        }

        if (!callback) {
            delete this.listeners[event];
        } else {
            var tmp = [];
            for (var i = 0; i < this.listeners[event].length; i++) {
                if (this.listeners[event][i].callback === callback) {
                    continue;
                }

                tmp.push(this.listeners[event][i]);
            }

            if (tmp.length) {
                this.listeners[event] = tmp;
            } else {
                delete this.listeners[event];
            }
        }

        return this;
    }

    /**
     * Emit the given event and pass the given arguments.
     *
     * @param {String} event The event to emit.
     * @param {Object} args An array of arguments to send to each callback.
     * @param {Function} done The done callback.
     * @return {WeightedEmitter} Returns self.
     */
    emit(event, args, done) {
        if (typeof args === 'function') {
            done = args;
            args = {};
        }

        const response = {};
        response.args = args;
        response.result = null;

        if (!this.listeners[event]) {
            return done(null, response.result);
        }

        const queue = [];
        this.listeners[event].forEach(function(listener) {
            queue.push(emitCallback(response, listener));
        });

        async.series(queue, function(err) {
            done(err, err ? null : response.result);
        });

        return this;
    }
};