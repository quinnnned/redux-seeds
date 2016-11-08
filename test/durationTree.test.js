import test from 'tape';
import {durationTree} from '../src/';

test('durationTree type', ({equal, end}) => {
    equal(typeof durationTree, 'function', 'should be a function');
    end();
});

test('durationTree parameter validation', ({throws, doesNotThrow, end}) => {
    throws( () => durationTree(), /UpperCamelCase/, 'throws if input is omitted');
    throws( () => durationTree(7),  /UpperCamelCase/, 'throws if input is not a string');
    throws( () => durationTree('lowerCamelCase'),  /UpperCamelCase/, 'throws if input is not an UpperCamelCase string');
    doesNotThrow( () => durationTree('UpperCamelCase'), 'does not throws if input is an UpperCamelCase string');
    end();
});

test('durationTree output: state tree structure', ({equal, end}) => {

    const example = durationTree('DoingSomething');

    equal(example == null, false, 'should not return null or undefined');

    // .get
    equal(typeof example.get.isDoingSomething, 'function', 'should have a selector named "is"+[EventDescription]')
    equal(typeof example.get.isDoingSomething(), 'function', 'selector should be a function factory');

    // .act
    equal(typeof example.act.startDoingSomething, 'function', 'should have an actor named "start"+[EventDescription]');
    equal(typeof example.act.stopDoingSomething, 'function', 'should have an actor named "stop"+[EventDescription]');

    // .reducer
    equal(typeof example.reducer, 'function', 'should have a function "reducer" property');
    end();
});

test('durationTree default state', ({equal, end}) => {
    const example = durationTree('MakingFriends');
    equal( example.reducer(), false, 'reducer should return false by default' );
    equal( example.get.isMakingFriends()(), false, 'selector should return false by default');
    end();
});

test('durationTree actions', ({deepEqual, end}) => {
    const example = durationTree('WritingCode');
    deepEqual(example.act.startWritingCode(), { type: 'START_WRITING_CODE' }, "tree.act.start[EventDescription] should return an action with type equal to START_[EVENT_DESCRIPTION]");
    deepEqual(example.act.stopWritingCode(), { type: 'STOP_WRITING_CODE' }, "tree.act.stop[EventDescription] should return an action with type equal to STOP_[EVENT_DESCRIPTION]");
    end();
});

test('durationTree reducer', ({equal, deepEqual, end}) => {
    const example = durationTree('SlayingDragons')
    const test = (...actions) => example.get.isSlayingDragons()( actions.reduce(example.reducer, {} ) );
    const start = example.act.startSlayingDragons();
    const stop = example.act.stopSlayingDragons();
    const etc = { type: "SOME_UNRELATED_ACTION_TYPE" }
    equal( test(start), true, 'selector should return true for state produced by a start[EventDescription] action');
    equal( test(start, stop), false, 'selector should return false for state produced by a stop[EventDescription] action');
    equal( test(start), test(start, etc), 'state should not be affected by unrelated actions');
    end();
});


test('get.compose', ({equal, end}) => {

    const spies = { 
        options: 'selector-options',
        state: 'selector-state',
        value: 'selector-value' 
    };
    const myTree = durationTree('TestingSelectorComposer');

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
    const myTree = durationTree('TestingActionComposer');

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