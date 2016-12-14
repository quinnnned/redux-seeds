import test from 'tape';
import {blankTree} from '../src/';

test('blankTree type', ({equal, end}) => {
    equal(typeof blankTree, 'function', 'should be a function');
    end();
});

test('blankTree output: state tree structure', ({deepEqual, equal, end}) => {

    const tree = blankTree();

    equal(tree == null, false, 'should not return null or undefined');

    // .get
    equal(tree.get == null, false, 'should have a "get" property');
    deepEqual( Object.keys(tree.get).length, 0, `
        get.compose and get.composites should not be enumerable
    `);
    deepEqual(tree.get.composites, {}, 'tree.get.composites should be an empty object');
    equal(typeof tree.get.compose, 'function', 'get.compose should be a function');
    
    // .act
    equal(tree.act == null, false, 'should have an "act" property');
    deepEqual( Object.keys(tree.act).length, 0, `
        act.compose and act.composites should not be enumerable
    `);
    deepEqual(tree.act.composites, {}, 'tree.act.composites should be an empty object');
    equal(typeof tree.act.compose, 'function', 'act.compose should be a function');
    
    // .reducer
    equal(typeof tree.reducer, 'function', 'should have a function "reducer" property');
    end();
});

test('blankTree.reducer', (assert) => {

    const tree = blankTree();

    assert.equal(tree.reducer(), null, `
        should return null by default
    `);

    const state = {};
    assert.equal(tree.reducer(state), state, `
        should be an identity function
    `);    

    assert.end();
});


test('get.compose', ({equal, end}) => {

    const spies = { 
        options: 'selector-options',
        state: 'selector-state',
        value: 'selector-value' 
    };
    const myTree = blankTree();

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
    const myTree = blankTree();

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

test('get.compose order indifference', (assert) => {

    const tree = blankTree();

    tree.get.compose('fourth', ({get}) => (options) => (state) => (
        get.third()(state) + '4'
    ));

    tree.get.compose('third', ({get}) => (options) => (state) => (
        get.second()(state) + '3'
    ));

    tree.get.compose('second', ({get}) => (options) => (state) => (
        get.first()(state) + '2'
    ));

    tree.get.first = () => () => '1';
    
    assert.equal( tree.get.fourth()(), '1234', `
        the order that selectors are get.compose()'d does not matter;
        composite selectors can reference other selectors that have not yet been defined.
    `)

    assert.end();
});

test('get.compose prefixes', (assert) => {

    const {get} = blankTree();

    get.compose('get.withPrefix', (tree) => (options) => (state) => state)

    assert.equal(typeof get["get.withPrefix"], 'undefined', `
        should ignore get. prefix
    `)

    assert.equal(typeof get.withPrefix, 'function', `
        should set selector based on text after get. prefix   
    `)

    assert.end();
});

test('act.compose prefixes', (assert) => {

    const {act} = blankTree();

    act.compose('act.withPrefix', (tree) => (options) => ({}) )

    assert.equal(typeof act["act.withPrefix"], 'undefined', `
        should ignore act. prefix
    `)

    assert.equal(typeof act.withPrefix, 'function', `
        should set selector based on text after act. prefix   
    `)

    assert.end();
});

test('act.compose: multicomposition', (assert) => {

    const {act} = blankTree();

    act.compose({
        foo: (tree) => (options) => 'foo',
        bar: (tree) => (options) => 'bar',
        baz: (tree) => (options) => 'baz'
    });

    assert.equal(typeof act.foo, 'function');
    assert.equal(act.foo(), 'foo');
    assert.equal(typeof act.bar, 'function');
    assert.equal(act.bar(), 'bar');
    assert.equal(typeof act.baz, 'function');
    assert.equal(act.baz(), 'baz');
    assert.end();
});

test('get.compose: multicomposition', (assert) => {
    const {get} = blankTree();

    get.compose({
        foo: (tree) => (options) => (state) => 'foo',
        bar: (tree) => (options) => (state) => 'bar',
        baz: (tree) => (options) => (state) => 'baz'
    });

    assert.equal(typeof get.foo, 'function');
    assert.equal(get.foo()(), 'foo');
    assert.equal(typeof get.bar, 'function');
    assert.equal(get.bar()(), 'bar');
    assert.equal(typeof get.baz, 'function');
    assert.equal(get.baz()(), 'baz');
    assert.end();
});