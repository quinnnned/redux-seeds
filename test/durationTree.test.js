import test from 'tape';
import {durationTree} from '../src/';

test('durationTree type', ({equal, end}) => {
    equal(typeof durationTree, 'function', 'should be a function');
    end();
});

// test('durationTree parameter validation', ({throws, doesNotThrow, end}) => {
//     throws( () => durationTree('lowerCamelCase'), undefined, 'throws if input is not a UpperCamelCase string');
//     doesNotThrow( () => durationTree('lowerCamelCase'), undefined, 'throws if input is not a UpperCamelCase string');
//     end();
// });

// test('toggleTree output: state tree structure', ({deepEqual, equal, end}) => {

//     const example = toggleTree({
//         selectorName : 'exampleSelectorName',
//         onActorName  : 'exampleOnActorName',
//         offActorName : 'exampleOffActorName'
//     });


//     equal(example == null, false, 'should not return null or undefined');

//     // get
//     equal(example.get == null, false, 'should have a "get" property');
//     deepEqual( Object.keys(example.get), ['compose', 'exampleSelectorName'], 'get should have (2) properties called compose" and the user-provided selectorName' )
//     equal(typeof example.get.exampleSelectorName, 'function', 'selector should be a function');
//     equal(typeof example.get.exampleSelectorName(), 'function', 'selector should be a function factory');

//     // act
//     equal(example.act == null, false, 'should have an "act" property');
//     deepEqual( Object.keys(example.act), ['compose', 'exampleOnActorName', 'exampleOffActorName'], 'act should have (3) properties called "compose" and the user-provided onActorName and offActorName');
//     equal(typeof example.act.exampleOnActorName, 'function', 'on actor should be a function');
//     equal(typeof example.act.exampleOffActorName, 'function', 'off actor should be a function');

//     equal(typeof example.reducer, 'function', 'should have a function "reducer" property');
//     end();
// });

// test('toggleTree default state', ({equal, end}) => {

//     const example = toggleTree({
//         selectorName : 'exampleSelectorName',
//         onActorName  : 'exampleOnActorName',
//         offActorName : 'exampleOffActorName'
//     });

//     equal( example.reducer(), false, 'reducer should return false by default' );
//     equal( example.get.exampleSelectorName()(), false, 'selector should return false by default');

//     const exampleDefaultTrue = toggleTree({
//         defaultState : true,
//         selectorName : 'exampleSelectorName',
//         onActorName  : 'exampleOnActorName',
//         offActorName : 'exampleOffActorName'
//     });

//     equal( exampleDefaultTrue.reducer(), true, 'if defaultState is true, reducer should return true by default' );
//     equal( exampleDefaultTrue.get.exampleSelectorName()(), true, 'if defaultState is true, selector should return true by default');
//     end();
// });

// test('toggleTree actions', ({deepEqual, end}) => {

//     const example = toggleTree({
//         selectorName : 'exampleSelectorName',
//         onActorName  : 'turnTheThingOn',
//         offActorName : 'turnTheThingOff'
//     });

//     deepEqual(example.act.turnTheThingOn(), { type: 'TURN_THE_THING_ON' }, "tree.act.[onActorName] should return an action with type equal to the UPPER_SNAKE_CASE equivalent of onActorName.");
//     deepEqual(example.act.turnTheThingOff(), { type: 'TURN_THE_THING_OFF' }, "tree.act.[offActorName] should return an action with type equal to the UPPER_SNAKE_CASE equivalent of offActorName.");
//     end();
// });

// test('toggleTree reducer', ({equal, deepEqual, end}) => {

//     const example = toggleTree({
//         selectorName : 'isTheThingOn',
//         onActorName  : 'turnTheThingOn',
//         offActorName : 'turnTheThingOff'
//     });

//     const test = (...actions) => example.get.isTheThingOn()( actions.reduce(example.reducer, {} ) );
//     const on = example.act.turnTheThingOn();
//     const off = example.act.turnTheThingOff();
//     const etc = { type: "SOME_UNRELATED_ACTION_TYPE" }

//     equal( test(on), true, 'selector should return true for state produced by an [onActorName] action');
//     equal( test(on, off), false, 'selector should return false for state produced by an [offActorName] action');
//     deepEqual( test(on), test(on, etc), 'state should not be affected by unrelated actions');
//     end();
// });