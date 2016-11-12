import test from 'tape';
import { keyedTree, durationTree, toggleTree } from '../src/';

test('keyedTree: subTree', ({deepEqual, throws, doesNotThrow, equal, end}) => {
    
    // escalate console.error
    const oldConsoleError = console.error;
    console.error = (e) => { throw e }; 

    const tree = keyedTree({
        subTree: durationTree('DoingSomething')
    });

    equal(typeof tree.get.isDoingSomething, 'function', 'a keyedTree should inherit the selectors of its subtree');
    equal(typeof tree.act.startDoingSomething, 'function', 'a keyedTree should inherit the actors of its subtree');
    equal(typeof tree.act.stopDoingSomething, 'function', 'a keyedTree should inherit the actors of its subtree');


    throws( () => tree.act.startDoingSomething(), /forgot/, 'keyed actors complain if the key is not provided');
    doesNotThrow( () => tree.act.startDoingSomething({key:'foo'}), /forgot/, 'keyed actors complain if the key is not provided');
    throws( () => tree.act.stopDoingSomething(), /forgot/, 'keyed actors complain if the key is not provided');
    doesNotThrow( () => tree.act.stopDoingSomething({key:'foo'}), /forgot/, 'keyed actors complain if the key is not provided');

    
    throws( () => tree.get.isDoingSomething()(), /forgot/, 'keyed selectors complain if the key is not provided');
    doesNotThrow( () => tree.get.isDoingSomething({key:'foo'}), /forgot/, 'keyed selectors complain if the key is not provided');
    
    /// ignore errors for this part
    console.error = () => {};
    deepEqual(tree.act.startDoingSomething(), {}, 'keyed actors return an empty action if the key is not provided');
    deepEqual(tree.act.stopDoingSomething(), {}, 'keyed actors return an empty action if the key is not provided');
    deepEqual(tree.get.isDoingSomething()(), false, `
        keyed selectors return the default value for the subtrees if the key is not provided
    `);
    
    // cleanup
    console.error = oldConsoleError
    end();
});

test('keyedTree: key isolation', (assert) => {

    const { get, act, reducer } = keyedTree({
        subTree: toggleTree({
            selectorName : 'isActive',
            onActorName  : 'activate',
            offActorName : 'deactivate'
        })
    });

    const test = (key) => (...actions) => get.isActive({key})( actions.reduce(reducer, {}) ); 
    const activate = (key) => act.activate({key});
    const deactivate = (key) => act.deactivate({key});

    assert.equal( test('bob')(), false);
    assert.equal( test('bob')( activate('bob') ), true);
    assert.equal( test('bob')( activate('bob'), deactivate('bob') ), false);
    assert.equal( test('bob')( activate('alice') ), false);
    assert.equal( test('bob')( activate('bob'), deactivate('alice') ), true);
    assert.equal( test('bob')( activate('bob'), deactivate('bob'), activate('alice') ), false);
    assert.end();
})


// TODO
test('keyedTree: removeActorName', (assert) => {

    const { reducer, get, act } = keyedTree({
        removeActorName: 'explodeSpaceship',
        subTree: durationTree('FiringLasers') 
    });

    const test = (key) => (...actions) => get.isFiringLasers({key})( actions.reduce(reducer, {}) )

    assert.equal( test('zorp')(), false);
    assert.equal( test('zorp')( 
                act.startFiringLasers({ key: 'zorp' })
            ), true);
    assert.equal( test('zorp')( 
                act.startFiringLasers({ key: 'zorp' }),
                act.stopFiringLasers({ key: 'zorp' })
            ), false);
    assert.equal( test('zorp')( 
                act.startFiringLasers({ key: 'zorp' }),
                act.explodeSpaceship({ key: 'zorp' })
            ), false);
    assert.end();
});

test('keyedTree: default state', ({deepEqual, end}) => {
    const tree = keyedTree();
    deepEqual( tree.reducer(), {}, 'reducer should return an empty object by default')
    end();
});


test('keyedTree type', ({equal, end}) => {
    equal(typeof keyedTree, 'function', 'should be a function');
    end();
});

test('keyedTree output: state tree structure', ({deepEqual, equal, end}) => {

    const tree = keyedTree();

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
    const myTree = keyedTree();

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
    const myTree = keyedTree();

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