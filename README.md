# redux-seeds
Grow Your State Tree The Easy Way

[![Build Status](https://travis-ci.org/quinnnned/redux-seeds.svg?branch=master)](https://travis-ci.org/quinnnned/redux-seeds)
[![npm version](https://img.shields.io/npm/v/redux-seeds.svg?style=flat-square)](https://www.npmjs.com/package/redux-seeds)
[![Coverage Status](https://coveralls.io/repos/github/quinnnned/redux-seeds/badge.svg?branch=master)](https://coveralls.io/github/quinnnned/redux-seeds?branch=master)

*NOTE: This library uses the word "Actor" as a shorthand for "Action Creator"*

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
        * An object of actors, each of the form:
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
const { reducer, act, get } = durationTree('FetchingData');
````
This one line gives you the following for free:
* A reducer for START_FETCHING_DATA and STOP_FETCHING_DATA actions
* A selector for the current state: get.isFetchingData()(state)
* An actor to signal the beginning: act.startFetchingData()
* An actor to signal the end: act.stopFetchingData()

What if you need to keep track of the state of multiple async requests?
That's only a few more lines of code:

````js
const { reducer, act, get } = keyedTree({
    keyName: 'requestId',
    subTree: durationTree('FetchingData');
});
````
This will have the same actors and selectors as above, except now
now their options will be required to include the property 'requestId', to
specify a unique branch of the tree: 
 *  get.isFetchingData({ requestId: 42 })(state);
 *  act.startFetchingData({ requestId: 42 });
 *  act.stopFetchingData({ requestId: 42});

Mix and match to build complex state trees with very little code:
````js
const ( reducer, act, get ) = branchedTree({
    isFetching: keyedTree({
        keyName : 'requestId',
        subTree : durationTree('FetchingData');
    }),
    user: branchedTree({
        isAuthenticated: toggleTree({
            selectorName : 'isUserAuthenticated',
            onActorName  : 'authenticateUser',
            offActorName : 'deAuthenticateUser'  
        }),
        name: valueTree({
            selectorName : 'userName',
            actorName    : 'setUserName'
        })
    }),
    grid3d: keyedTree({
        keyName : 'x',
        subTree : keyedTree({
            keyName : 'y',
            subTree : keyedTree({
                keyName : 'z',
                subTree : valueTree({
                    selectorName : 'gridValue',
                    actorName    : 'setGridValue'
                })
            })
        })
    })
});
````
# Simplified Unit Testing: Composite Actors & Selectors

All trees produced by redux-seeds have get.compose() and act.compose() methods,
which can be used to create higher-order selectors and actors, respectively.

For example, this ...
````js
/* 
 * get.compose() takes a string selector name and a composite selector of the
 * form: (tree) => selector, that is, (tree) => (options) => (state) => value
 */
get.compose('numbersAboveThreshold', (tree) => (options) => (state) => (
    tree.get.numbers()(state)
        .filter( (n) => n > tree.get.threshold()(state) )
));
````

... can be tested like this:

````js
import test from 'tape';
import {get} from 'path/to/state';

test('get.numbersAboveThreshold selector', (assert) => {
    // Arrange (inject mock tree with mock selectors)
    const mockedSelector = get.composites.numbersAboveThreshold({ 
        get: {
            numbers   : (options) => (state) => [ 1, 2, 3, 4, 5 ],
            threshold : (options) => (state) => 3
        }
    });
    
    // Act
    const actual = mockedSelector()();
    const expected = [ 4, 5 ];

    // Assert
    assert.equal(typeof get.numbersAboveThreshold, 'function', `
        should be a primary selector
    `);
    assert.deepEqual(actual, expected `
        should return all numbers above the threshold value
    `);
    assert.end();
});
````
The `(tree) => selector` format of composites allow mock versions of primary 
selectors (get.numbers, get.threshold) to be injected, which removes the need 
to set up a dummy state for the selector.  The internal behavior of the primary
selectors or the shape of the state tree can change without needing to change
this test.

Composite selectors get attached to `get.composites`, while composite actors 
( of the form `(tree) => actor` ) get attached to `act.composites`.

# Seed Documentation

## Value Tree
Seed for a tree that represents a single value of any type.
````js
import { valueTree } from 'redux-seeds';

const { reducer, get, act } = valueTree({
    defaultState, // optional, default: null
    selectorName  // optional, default: null
    actorName,    // optional, default: null
    valueName,    // optional, default: 'value'
});
````

## Blank Tree
Seed for a basic tree. No selectors or actors. reducer is identity function and
returns null by default.  
````js
import { blankTree } from 'redux-seeds';

const { reducer, get, act } = blankTree();
````