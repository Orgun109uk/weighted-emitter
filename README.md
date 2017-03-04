[![Build Status](https://travis-ci.org/Orgun109uk/weighted-emitter.svg)](https://travis-ci.org/Orgun109uk/weighted-emitter)
[![Build Status](https://david-dm.org/orgun109uk/weighted-emitter.png)](https://david-dm.org/orgun109uk/weighted-emitter)
[![npm version](https://badge.fury.io/js/weighted-emitter.svg)](http://badge.fury.io/js/weighted-emitter)

[![NPM](https://nodei.co/npm/weighted-emitter.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/weighted-emitter/)

# Weighted Emitter

This utility is a basic event emitter, and allows sorting the listener callbacks by weight.

### Installation
```sh
$ npm install weighted-emitter
```

### Usage

```js
const WeightedEmitter = require('weighted-emitter');
const emitter = new WeightedEmitter();

emitter.on('event', function (next) {
    if (!this.result) {
        this.result = [];
    }

    this.result.push('world');
    next();
});

emitter.on('event', function (next) {
    if (!this.result) {
        this.result = [];
    }

    this.result.push(this.args.message1);
}, -10);

emitter.emit('event', {message1: 'hello'}, function (err, result) {
    console.info(result);
    /**
     * Result = ['hello', 'world'];
     */
});
```

Listeners can also be removed;

```js
emitter.un('event', callback);
// Or to remove all listeners of an event;
emitter.un('event');
```

## Testing
A mocha test suite has been provided and can be run by:
```sh
$ npm test
```
