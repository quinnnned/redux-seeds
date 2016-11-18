# redux-seeds
Grow Your State Tree The Easy Way


[![Build Status](https://travis-ci.org/quinnnned/redux-seeds.svg?branch=master)](https://travis-ci.org/quinnnned/redux-seeds)
[![npm version](https://img.shields.io/npm/v/redux-seeds.svg?style=flat-square)](https://www.npmjs.com/package/redux-seeds)
[![Coverage Status](https://coveralls.io/repos/github/quinnnned/redux-seeds/badge.svg?branch=master)](https://coveralls.io/github/quinnnned/redux-seeds?branch=master)

# State Tree Proposal

Large Redux stores can be tricky to organize, difficult to change, and can
require significant boilerplate for common data structures.

The State Tree Pattern solves all of these issues.

A *State Tree* is a JavaScript object with the following structure:

```` js
const tree = {
    reducer: /* The usual redux reducer */,
    act: { 
        /* 
        * An object of action creators, each of the form:
        *     (options = {}) => action
        */ 
    },
    get: {
        /* 
        * An object of state selectors, each of the form:
        *     (options = {}) => (state = defaultState) => value  
        */ 
    } 
}
````

# Redux Seeds
A seed is a factory function that returns a specific type of state tree.

For example, need a part of your state tree that represents whether or not some
async event is occuring? That's one line of code with the durationTree seed:
````js
/* 
 * What you get for free:
 *
 *  + Reducer:
 *       responds to START_FETCHING_DATA and STOP_FETCHING_DATA action types
 *
 *  + Selector: 
 *     get.isFetchingData()(state)
 *
 *  + Two Action Creators: 
 *      act.startFetchingData(): returns a START_FETCHING_DATA action
 *      act.stopFetchingData(): returns a STOP_FETCHING_DATA action 
 */
const { reducer, act, get } = durationTree('FetchingData');
````

How about if you need to keep track of the state of multiple async requests?
That's only a few more lines of code by wrapping your existing reducer with the
keyedTree seed:

````js
/* This will have the same action creators and selectors as above, except now
 * now their options will be required to include the property 'requestId', to
 * specify a unique branch of the tree: 
 *
 *  get.isFetchingData({ requestId: 42 })(state);
 *  act.startFetchingData({ requestId: 42 });
 *  act.stopFetchingData({ requestId: 42});
 */
const { reducer, act, get } = keyedTree({
    keyName: 'requestId',
    subTree: durationTree('FetchingData');
});
````