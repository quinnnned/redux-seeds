import test from 'tape';
import {barebonesTree} from '../src/';

test('barebonesTree type', ({equal, end}) => {
    equal(typeof barebonesTree, 'function', 'should be a function');
    end();
});

test('barebonesTree output: state tree structure', ({deepEqual, equal, end}) => {

    const tree = barebonesTree();

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

test('get.compose', ({equal, end}) => {

    const spies = { 
        options: 'selector-options',
        state: 'selector-state',
        value: 'selector-value' 
    };
    const myTree = barebonesTree();

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
    const myTree = barebonesTree();

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