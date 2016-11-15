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



test('keyedTree: keyName', (assert) => {

    const { get, act, reducer } = keyedTree({
        keyName: 'id',
        subTree: toggleTree({
            selectorName : 'isActive',
            onActorName  : 'activate',
            offActorName : 'deactivate'
        })
    });

    const test = (id) => (...actions) => get.isActive({id})( actions.reduce(reducer, {}) ); 
    const activate = (id) => act.activate({id});
    const deactivate = (id) => act.deactivate({id});

    assert.equal( test('bob')(), false);
    assert.equal( test('bob')( activate('bob') ), true);
    assert.equal( test('bob')( activate('bob'), deactivate('bob') ), false);
    assert.equal( test('bob')( activate('alice') ), false);
    assert.equal( test('bob')( activate('bob'), deactivate('alice') ), true);
    assert.equal( test('bob')( activate('bob'), deactivate('bob'), activate('alice') ), false);
    assert.end();
})

test('keyedTree: removeActorName', (assert) => {

    // override console.error
    const originalConsoleError = console.error;
    let lastError = null;
    console.error = (e) => lastError = e;

    const { reducer, get, act } = keyedTree({
        removeActorName: 'explodeSpaceship',
        subTree: durationTree('FiringLasers') 
    });

    const test = (key) => (...actions) => get.isFiringLasers({key})( actions.reduce(reducer, {}) )

    lastError = null;
    act.explodeSpaceship();
    assert.notEqual(lastError, null, `
        remove actor should complain if the key is not provided.
    `);

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

    // cleanup
    console.error = originalConsoleError;
    assert.end();
});

test('keyedTree.get.[keysSelectorName]', (assert) => {

    const { reducer, get, act } = keyedTree({
        keyName: 'dev',
        keysSelectorName: 'devsWhoAreUnitTesting',
        subTree: durationTree('UnitTesting')
    });

    const state = [
        act.startUnitTesting({ dev: 'kevin'  }),
        act.startUnitTesting({ dev: 'devon'  }),
        act.startUnitTesting({ dev: 'steven' })
    ].reduce( reducer, {});

    const keys = get.devsWhoAreUnitTesting()(state);

    assert.deepEqual( keys.sort(), ['devon', 'kevin', 'steven'], `
        should an array containing all the keys in the tree
    `);

    assert.deepEqual( get.devsWhoAreUnitTesting()(), [], `
        should return [] by default
    `);

    assert.end();
});

test('keyedTree: default state', (assert) => {
    const tree = keyedTree({
        subTree: {
            reducer: x => x,
            get: {},
            act: {}
        }
    });
    assert.deepEqual( tree.reducer(), {}, 'reducer should return an empty object by default')
    const state = {};
    assert.equal( tree.reducer(state), state, 'reducer should be the identity function if no action is provided')
    assert.end();
});


test('keyedTree type', ({equal, end}) => {
    equal(typeof keyedTree, 'function', 'should be a function');
    end();
});

test('keyedTree parameter validation', (assert) => {
    assert.throws( () => keyedTree(), /required/, 'throws if options are omitted');
    assert.throws( () => keyedTree({}), /subTree/, 'throws if subTree is not included in options');
    assert.doesNotThrow( () => keyedTree({ subTree: durationTree('Running') }), /./, `
        does not throw if subTree is included in options
    `);
    assert.end();
});
