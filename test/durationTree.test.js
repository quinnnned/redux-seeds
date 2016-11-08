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