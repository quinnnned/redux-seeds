import test from 'tape';
import {customTree} from '../src/';

test('customTree type', ({equal, end}) => {
    equal(typeof customTree, 'function', 'should be a function');
    end();
});

test('customTree output: state tree structure', ({deepEqual, equal, end}) => {

    const tree = customTree();

    equal(tree == null, false, 'should not return null or undefined');

    // .get
    equal(tree.get == null, false, 'should have a "get" property');
    deepEqual( Object.keys(tree.get).length, 2, 'get should have exactly two keys');
    deepEqual(tree.get.composites, {}, 'tree.get.composites should be an empty object');
    equal(typeof tree.get.compose, 'function', 'get.compose should be a function');
    
    // .act
    equal(tree.act == null, false, 'should have an "act" property');
    deepEqual( Object.keys(tree.act).length, 2, 'act should have exactly two keys');
    deepEqual(tree.act.composites, {}, 'tree.act.composites should be an empty object');
    equal(typeof tree.act.compose, 'function', 'act.compose should be a function');
    
    // .reducer
    equal(typeof tree.reducer, 'function', 'should have a function "reducer" property');
    end();
});

test('customTree: defaultState', ({equal, end}) => {

    const nullTree = customTree();
    equal( nullTree.reducer(), null, 'reducer should return null by default' );

    const defaultState = {};
    const treeWithDefaultState = customTree({defaultState});
    equal(treeWithDefaultState.reducer(), defaultState, 'if defaultState is specified, reducer should return that value by default');

    end();
});

test('customTree: actionHandlers --> reducer', ({equal, end}) => {

    const oldConsoleError = console.error;
    let consoleErrorWasCalled = false;
    console.error = () => consoleErrorWasCalled = true;

    const spies = { state: 'this-is-the-old-state', newState: 'this-is-the-new-state', defaultState: 'default-state' };

    const test = (state, action) => customTree({
        defaultState: spies.defaultState,
        actionHandlers: {
            'THIS_ACTION_TYPE': (handlerState, handlerAction) => {
                equal(handlerState, state, 'should pass state to triggered action handler');
                equal(handlerAction, action, 'should pass action to triggered action handler');
                return spies.newState;
            },
            'RETURNS_UNDEFINED': () => { return; }
        }
    }).reducer(state, action);

    const thisAction = { type: 'THIS_ACTION_TYPE' };
    const unrelatedAction = { type: 'SOME_OTHER_ACTION' };

    equal(test(spies.state), spies.state, 'tree.reducer should be the identity function if no action is provided');
    equal(test(spies.state, unrelatedAction), spies.state, 'tree.reducer should be the identity function for unrelated actions');
    equal(test(spies.state, thisAction), spies.newState, 'if action.type matches one of the actionHandlers properties, tree.reducer should delegate to that handler');
    equal(consoleErrorWasCalled, false, 'normally should not trigger a console.error');
    equal(test({}, { type: 'RETURNS_UNDEFINED' }), spies.defaultState, 'if an action handler would return undefined, it will return defaultState instead');
    equal(consoleErrorWasCalled, true, 'triggers a console.error if an action handler returns undefined');
    end();

    console.error = oldConsoleError;
});

test('get.compose', ({equal, end}) => {

    const spies = { 
        options: 'selector-options',
        state: 'selector-state',
        value: 'selector-value' 
    };
    const myTree = customTree();

    const getBefore = myTree.get;

    const compositeSelector = (tree) => (options) => (state) => {
        equal(tree, myTree, 'should expect a triply-curried function, with the first parameter being the state tree itself');
        equal(options, spies.options, 'the second curried parameter should be the options passed to the composed selector');
        equal(state, spies.state, 'the final curried parameter should be the state passed to the composed selector');
        return spies.value;
    };

    myTree.get.compose('newSelector', compositeSelector)

    equal( typeof myTree.get.newSelector, 'function', 'should attach a composed selector to tree.get');
    equal( myTree.get, getBefore, 'should mutate tree.get');
    equal( myTree.get.composites.newSelector, compositeSelector, 'should attach the composite selector to tree.get.composites, to aid testing');
    equal( myTree.get.newSelector(spies.options)(spies.state), spies.value, 'composed selector should have the standard selector signature: (options) => (state) => value')
    end();
});

test('act.compose', ({equal, end}) => {

    const spies = { 
        options: 'actor-options',
        value: 'actor-value' 
    };
    const myTree = customTree();

    const actBefore = myTree.act;

    const compositeActor = (tree) => (options) => {
        equal(tree, myTree, 'should expect an (at least) doubly-curried function, with the first parameter being the state tree itself');
        equal(options, spies.options, 'the second curried parameter should be the options passed to the composed selector');
        return spies.value;
    };

    myTree.act.compose('newActor', compositeActor);

    equal( typeof myTree.act.newActor, 'function', 'should attach a composed selector to tree.act');
    equal( myTree.act, actBefore, 'should mutate tree.act');
    equal( myTree.act.composites.newActor, compositeActor, 'should attach the composite actor to tree.act.composites, to aid testing');
    equal( myTree.act.newActor(spies.options), spies.value, 'composed actor should have the standard actor signature: (options) => value')
    end();
});