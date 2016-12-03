# redux-seeds
Seeds: Factories for Generating Common Redux State Trees

[![Build Status](https://travis-ci.org/quinnnned/redux-seeds.svg?branch=master)](https://travis-ci.org/quinnnned/redux-seeds)
[![npm version](https://img.shields.io/npm/v/redux-seeds.svg?style=flat-square)](https://www.npmjs.com/package/redux-seeds)
[![Coverage Status](https://coveralls.io/repos/github/quinnnned/redux-seeds/badge.svg?branch=master)](https://coveralls.io/github/quinnnned/redux-seeds?branch=master)

*NOTE: This library uses the word "Actor" as a shorthand for "Action Creator"*

+ [State Tree Proposal](#state-tree-proposal)
+ [Redux Seeds](#redux-seeds-1)
+ [Simplified Unit Testing](#simplified-unit-testing-composite-actors--selectors)
+ [Seed Documentation](#seed-documentation)
  + [`valueTree`: represent a basic value](#value-tree)
  + [`durationTree`: represent if an event is happening](#duration-tree)
  + [`toggleTree`: represent a togglable boolean value](#toggle-tree)
  + [`customTree`: explicitly handle specific action types](#custom-tree)
  + [`keyedTree`: extend a scalar state tree to a keyed collection](#keyed-tree)
  + [`branchedTree`: combine multiple state trees](#branched-tree)
  + [`blankTree`: make your own seeds!](#blank-tree)
+ [Utilities](#utilities)
  + [`createTreeConnector()`: connect React components to your state tree](#createtreeconnector)

# State Tree Proposal

Large Redux stores can be tricky to organize, difficult to change, and can
require significant boilerplate for common data structures.

The State Tree Pattern solves all of these issues.

A *State Tree* is a JavaScript object with the following structure:

``` js
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
```

# Redux Seeds
A seed is a factory function that returns a specific type of state tree.

For example, need a part of your state tree that represents whether or not some
async event is occuring? That's one line of code with the durationTree seed:
```js
const { reducer, act, get } = durationTree('FetchingData');
```
This one line gives you the following for free:
* A reducer for START_FETCHING_DATA and STOP_FETCHING_DATA actions
* A selector for the current state: get.isFetchingData()(state)
* An actor to signal the beginning: act.startFetchingData()
* An actor to signal the end: act.stopFetchingData()

What if you need to keep track of the state of multiple async requests?
That's only a few more lines of code:

```js
const { reducer, act, get } = keyedTree({
    keyName: 'requestId',
    subTree: durationTree('FetchingData')
});
```
This will have the same actors and selectors as above, except now
now their options will be required to include the property 'requestId', to
specify a unique branch of the tree: 
 *  get.isFetchingData({ requestId: 42 })(state);
 *  act.startFetchingData({ requestId: 42 });
 *  act.stopFetchingData({ requestId: 42});

Mix and match to build complex state trees with very little code:
```js
const ( reducer, act, get ) = branchedTree({
    isFetching: keyedTree({
        keyName : 'requestId',
        subTree : durationTree('FetchingData')
    }),
    user: branchedTree({
        isAuthenticated: toggleTree({
            selectorName : 'get.isUserAuthenticated',
            offActorName : 'act.deAuthenticateUser',
            onActorName  : 'act.authenticateUser'
        }),
        name: valueTree({
            actorName    : 'act.setUserName'
            selectorName : 'get.userName',
        })
    }),
    grid3d: keyedTree({
        keyName : 'x',
        subTree : keyedTree({
            keyName : 'y',
            subTree : keyedTree({
                keyName : 'z',
                subTree : valueTree({
                    actorName    : 'act.setGridValue',
                    selectorName : 'get.gridValue'
                })
            })
        })
    })
});
```
# Simplified Unit Testing: Composite Actors & Selectors

All trees produced by redux-seeds have get.compose() and act.compose() methods,
which can be used to create higher-order selectors and actors, respectively.

For example, this ...
```js
/* 
 * get.compose() takes a string selector name and a composite selector of the
 * form: (tree) => selector, that is, (tree) => (options) => (state) => value
 */
get.compose('numbersAboveThreshold', (tree) => (options) => (state) => (
    tree.get.numbers()(state)
        .filter( (n) => n > tree.get.threshold()(state) )
));
```

... can be tested like this:

```js
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
```
The `(tree) => selector` format of composites allow mock versions of primary 
selectors (get.numbers, get.threshold) to be injected, which removes the need 
to set up a dummy state for the selector.  The internal behavior of the primary
selectors or the shape of the state tree can change without needing to change
this test.

Composite selectors get attached to `get.composites`, while composite actors 
( of the form `(tree) => actor` ) get attached to `act.composites`.

# Seed Documentation
+ All seeds have the form `tree = seed(options)`, so the documentation below
will focus on the options available for each seed.

+ All names for actors/selectors can be passed with an '`act.`' or '`get.`'
prefix, respectively.  This is only there to make your code more
self-documenting; these prefixes are ignored by the seeds.


## Value Tree
Seed for a tree that represents a single value of any type.

### Options:
+ `defaultState`: (optional, `any`, default: `null`) If provided, specifies the
state that will be filled-in if state is not provided to reducer or one of the 
selectors.

+ `selectorName`: (optional, `string`, default: `null`) If provided, a selector
with this name will be attached to `tree.get`.

+ `actorName`: (optional, `string`, default: `null`) If provided, an actor with 
this name will be attached to `tree.act`.  This actor produces actions that
can change the value represented by the resulting `valueTree`. 

+ `valueName`: (optional, `string`, default: `'value'`) Specifies the name of
of the option that will be passed to the `valueTree`'s actor and its action
payload to specify the value to be changed.

### Example:

```js
import { valueTree } from 'redux-seeds';

const { reducer, get, act } = valueTree({
    defaultState : 'Tuesday',
    selectorName : 'get.dayOfTheWeek',
    actorName    : 'act.setDayOfTheWeek',
    valueName    : 'day'
});

get.dayOfTheWeek()();
// 'Tuesday'

const setDayToMondayAction = act.setDayOfTheWeek({ day: 'Monday' });
// { type: 'SET_DAY_OF_THE_WEEK' payload: { day: 'Monday' } }

const state = reducer(undefined, setDayToMondayAction);
get.dayOfTheWeek()(state);
// 'Monday'

```

## Duration Tree
Creates a tree that represents whether or not (`boolean`) an event of the 
given description is taking place.  This type of tree is especially helpful for
async events such as api calls or animations.

### Options:  (required, `string`, UpperCamelCase). 
Unlike the other seeds, `durationTree` expects a single string value instead
of an options object.  This string should be the UpperCamelCase description of
an event, such as `'RequestingData'` or `'FiringLasers'`.

### Example:
```js
import { durationTree } from 'redux-seeds';

const { reducer, get, act } = durationTree('SubmittingForm');

get.isSubmittingForm()();
// false

const startAction = act.startSubmittingForm();
// { type: 'START_SUBMITTING_FORM' }

const stopAction = act.stopSubmittingForm();
// { type: 'STOP_SUBMITTING_FORM' }

let state = reducer(undefined, startAction);
get.isSubmittingForm()(state);
// true

state = reducer(state, stopAction);
get.isSubmittingForm()(state);
// false
```    

## Toggle Tree
Creates a tree to represent a scalar boolean value.

### Options:
+ `defaultState`: (optional, `boolean`, default: `false`) If provided, specifies the
state that will be filled-in if state is not provided to reducer or one of the 
selectors.  The value is false by default.

+ `selectorName`: (optional, `string`, default: `null`) If provided, a selector
with this name will be attached to `tree.get`.  This selector returns the current state
of the `toggleTree` (`true` / `false`)

+ `onActorName`: (optional, `string`, default: `null`) If provided, an actor with 
this name will be attached to `tree.act`.  This actor produces an action that will "turn on"
the `toggleTree` (set it to `true`). 

+ `offActorName`: (optional, `string`, default: `null`) If provided, an actor with 
this name will be attached to `tree.act`.  This actor produces an action that will "turn off"
the `toggleTree` (set it to `false`).

### Example:
```js
import {toggleTree} from 'redux-seeds';

const { reducer, get, act } = toggleTree({
    defaultState : true,
    selectorName : 'get.isPlayerAlive',
    offActorName : 'act.killPlayer',
    onActorName  : 'act.revivePlayer'
});

get.isPlayerAlive()();
// true

const deadState = reducer(undefined, act.killPLayer());
get.isPlayerAlive()(deadState);
// false

const revivedState = reducer(deadState, act.revivePlayer());
get.isPlayerAlive()(revivedState);
// true
```

## Custom Tree
Creates a tree with custom reducers for each action type.  This is a great choice for creating a tree that has complex behavior not covered by any of the other seeds.  If you use this tree, you'll have to attach your own actors and selectors to `act.` and `get.`, but you'll also get `get.compose` and `act.compose` for free!   

### Options:
+ `defaultState`: (optional, `any`, default: `null`) If provided, specifies the
state that will be filled-in if state is not provided to reducer or one of the 
selectors.  The value is false by default.

+ `actionHandlers`: (optional, `object`, default: `{}`) An object that maps a given action type to a custom reducer for that action type. Actions with types not explicitly handled by these reducers have no effect on the state of this tree.

### Example:

```js
import {customTree} from 'redux-seeds';

const mod = (q,d) => (q%d+d)%d // because js does modulo wrong

cosnt defaultState = 0;
const { reducer, act, get } = customTree({
    defaultState,
    actionHandlers: {
        ROTATE: (state, action) => mod(state + action.payload.degrees, 360)
    }
});
get.angle  = () => (state = defaultState) => state;
act.rotate = ({degrees}) => ({ type: "ROTATE", payload: {degrees} });

reducer();
// 0

reducer(0,  act.rotate({degrees: 45}) );
// 45

reducer(0,  act.rotate({degrees: 450}) );
// 270

reducer(0,  act.rotate({degrees: -45}) );
// 315
```

## Keyed Tree
Creates a tree for representing a dynamic, keyed collection of state branches.

## Branched Tree
This is the redux-seeds version of redux's `combineReducers`.

## Blank Tree
Seed for a basic tree. No selectors or actors. reducer is identity function and
returns null by default.  
```js
import { blankTree } from 'redux-seeds';

const { reducer, get, act } = blankTree();
```

# Utilities

## `createTreeConnector()`

Extends the capabilities of react-redux's connect() function.  Instead of `mapStateToProps` and `mapDispatchToProps`, you can directly access selectors (`mapGetToProps`) and actors (`mapActToProps`) without having to import them into your React component files.  In fact, the `treeConnect` function produced by `createTreeConnector` can be a complete abstraction layer between your ui and state.

This encourages a stronger separation between ui and state, since the user can only directly use the available actors and selectors and no internal state details (tree structure, action types) will appear in your React components.

As shown below, it is still possible to access `state` in mapGetToProps and it is still possible to access `dispatch` in mapActToProps (with redux-thunk), but the user must go out of her way to do so.

To create a "tree connector":
```js
import {connect} from 'react-redux'
import {createTreeConnector} from 'redux-seeds';
import tree from '../state';

// only has to be defined once
export const treeConnect = createTreeConnector(tree)(connect);
```

To use:
```js
// Must return an object that maps prop names to functions of the form: (state) => value 
const mapGetToProps = (get, ownProps) => ({
    // Note that you use get.selector(options) and not get.selector(options)(state)
    username: get.userName({userId: ownProps.id}),
    
    // Since each property is expected to be a function of state, you can still
    // directly access state if necessary.  However, this is not the intended use.
    favoriteColor: (state) => state.favoriteColorByUserId[ownProps.id]
});

// Must return an object that maps a given prop name to an actor (Action Creator)
const mapActToProps = (act, ownProps) => ({
    // Like this
    onClickAdd: act.addUserToFriends({userId: ownProps.id}),
    
    // Or this:
    onClickBack: act.navigateToMenu,
    
    // Or even this (with redux-thunk)
    onClickMoreInfo: () => (dispatch) => { /* some async actions */ }
});

const SmartComponent = treeConnect(mapGetToProps, mapActToProps)(DumbComponent);
```


