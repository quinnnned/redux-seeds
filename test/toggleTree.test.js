import test from 'tape';
import {toggleTree} from '../src/';

test('toggleTree type', ({equal, end}) => {
    equal(typeof toggleTree, 'function', 'should be a function');
    end();
});

test('toggleTree parameter validation', ({throws, end}) => {

    throws( () => toggleTree(), /selectorName/, 'throws if "selectorName" is not provided' );

    throws( () => toggleTree({
        selectorName: 'someSelectorName'
    }), /onActorName/, 'throws if "onActorName" is not provided' );

    throws( () => toggleTree({
        selectorName: 'selectorName',
        onActorName: 'onActorName'
    }), /offActorName/, 'throws if "offActorName" is not provided' );

    end();
});

test('toggleTree output: state tree structure', ({deepEqual, equal, end}) => {

    const example = toggleTree({
        selectorName : 'exampleSelectorName',
        onActorName  : 'exampleOnActorName',
        offActorName : 'exampleOffActorName'
    });


    equal(example == null, false, 'should not return null or undefined');

    // .get
    equal(example.get == null, false, 'should have a "get" property');
    deepEqual( Object.keys(example.get).length, 3, 'get should have exactly 3 properties' )
    equal(typeof example.get.exampleSelectorName, 'function', 'selector should be a function');
    equal(typeof example.get.exampleSelectorName(), 'function', 'selector should be a function factory');

    // .act
    equal(example.act == null, false, 'should have an "act" property');
    deepEqual( Object.keys(example.act).length, 4, 'act should have exactly 4 properties');
    equal(typeof example.act.exampleOnActorName, 'function', 'on actor should be a function');
    equal(typeof example.act.exampleOffActorName, 'function', 'off actor should be a function');

    // .reducer
    equal(typeof example.reducer, 'function', 'should have a function "reducer" property');
    end();
});

test('toggleTree default state', ({equal, end}) => {

    const example = toggleTree({
        selectorName : 'exampleSelectorName',
        onActorName  : 'exampleOnActorName',
        offActorName : 'exampleOffActorName'
    });

    equal( example.reducer(), false, 'reducer should return false by default' );
    equal( example.get.exampleSelectorName()(), false, 'selector should return false by default');

    const exampleDefaultTrue = toggleTree({
        defaultState : true,
        selectorName : 'exampleSelectorName',
        onActorName  : 'exampleOnActorName',
        offActorName : 'exampleOffActorName'
    });

    equal( exampleDefaultTrue.reducer(), true, 'if defaultState is true, reducer should return true by default' );
    equal( exampleDefaultTrue.get.exampleSelectorName()(), true, 'if defaultState is true, selector should return true by default');
    end();
});

test('toggleTree actions', ({deepEqual, end}) => {

    const example = toggleTree({
        selectorName : 'exampleSelectorName',
        onActorName  : 'turnTheThingOn',
        offActorName : 'turnTheThingOff'
    });

    deepEqual(example.act.turnTheThingOn(), { type: 'TURN_THE_THING_ON' }, "tree.act.[onActorName] should return an action with type equal to the UPPER_SNAKE_CASE equivalent of onActorName.");
    deepEqual(example.act.turnTheThingOff(), { type: 'TURN_THE_THING_OFF' }, "tree.act.[offActorName] should return an action with type equal to the UPPER_SNAKE_CASE equivalent of offActorName.");
    end();
});

test('toggleTree reducer', ({equal, deepEqual, end}) => {

    const example = toggleTree({
        selectorName : 'isTheThingOn',
        onActorName  : 'turnTheThingOn',
        offActorName : 'turnTheThingOff'
    });

    const test = (...actions) => example.get.isTheThingOn()( actions.reduce(example.reducer, {} ) );
    const on = example.act.turnTheThingOn();
    const off = example.act.turnTheThingOff();
    const etc = { type: "SOME_UNRELATED_ACTION_TYPE" }

    equal( test(on), true, 'selector should return true for state produced by an [onActorName] action');
    equal( test(on, off), false, 'selector should return false for state produced by an [offActorName] action');
    deepEqual( test(on), test(on, etc), 'state should not be affected by unrelated actions');
    end();
});


test('get.compose', ({equal, end}) => {

    const spies = { 
        options: 'selector-options',
        state: 'selector-state',
        value: 'selector-value' 
    };
    const myTree = toggleTree({
        selectorName : 'isTestingSelectorComposer',
        onActorName  : 'beginTestingSelectorComposer',
        offActorName : 'endTestingSelectorComposer'
    });

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

    const myTree = toggleTree({
        selectorName : 'isTestingActorComposer',
        onActorName  : 'beginTestingActorComposer',
        offActorName : 'endTestingActorComposer'
    });

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

test('toggleTree selector/actor prefixes', (assert) => {
    const {get, act} = toggleTree({
        onActorName  : 'act.markAsRead',
        offActorName : 'act.markAsUnread',
        selectorName : 'get.isRead',
    });

    assert.equal(typeof act.markAsRead, 'function');
    assert.equal(typeof act.markAsUnread, 'function');
    assert.equal(typeof get.isRead, 'function');
    assert.end();
});
