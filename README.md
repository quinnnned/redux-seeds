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
const { reducer, act, get } = durationTree('FetchingData');
````
This one line gives you the following for free:
* A reducer for START_FETCHING_DATA and STOP_FETCHING_DATA actions
* A selector for the current state: get.isFetchingData()(state)
* An action creator to signal the beginning: act.startFetchingData()
* An action creator to signal the end: act.stopFetchingData()

What if you need to keep track of the state of multiple async requests?
That's only a few more lines of code:

````js
const { reducer, act, get } = keyedTree({
    keyName: 'requestId',
    subTree: durationTree('FetchingData');
});
````
This will have the same action creators and selectors as above, except now
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

# valueTree Seed
````js
const { reducer, get, act } = valueTree({
    defaultState, // optional, default: null
    selectorName  // optional, default: null
    actorName,    // optional, default: null
    valueName,    // optional, default: 'value'
});
````

