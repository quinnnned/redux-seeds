import test from 'tape';
import {branchedTree, valueTree} from '../src';

test('branchedTree type', (assert) => {
    assert.equal( typeof branchedTree, 'function', `
        should be a function
    `);
    assert.end();
})

test('branchedTree reducer composition', (assert) => {
    const tree = branchedTree({
        counter: {
            reducer: (state = 0, action = {}) => (
                action.type === 'increment' ? state + 1 : state
            )
        },
        stack: {
            reducer: (state = [], action = {}) => (
                action.type === 'push' ? [ ...state, action.value ] : state
            )
        }
    });

    const state = tree.reducer();
    assert.equal(tree.reducer(state), state, `
        should be identity function if nothing changed
    `);
    const s1 = tree.reducer(state, { type: 'increment' });
    assert.deepEqual(s1, { counter: 1, stack: [] });
    const s2 = tree.reducer(s1, { type: 'push', value: 'a' });
    assert.deepEqual(s2, { counter: 1, stack: [ 'a' ] });
    assert.end();
});

test('branchedTree selector composition', (assert) => {
    const tree = branchedTree({
        counter: {
            reducer: (state = 0, action = {}) => (
                action.type === 'increment' ? state + 1 : state
            ),
            get: {
                count: (options) => (state = 0) => state,
                isEven: (options) => (state = 0) => (state % 2 === 0),
                toThe: ({power = 1}) => (state = 0) => Math.pow(state, power)
            }
        },
        stack: {
            reducer: (state = [], action = {}) => (
                action.type === 'push' ? [ ...state, action.value ] : state
            ),
            get : {
                stack: (options) => (state = []) => state,
                stackLength: (options) => (state = []) => state.length
            }
        }
    });

    const state = [
        { type: 'increment' },
        { type: 'increment' },
        { type: 'push', value: 'a' },
        { type: 'push', value: 'b' }
    ].reduce(tree.reducer, undefined);

    assert.equal( tree.get.count()(), 0 );
    assert.equal( tree.get.isEven()(), true );
    assert.deepEqual( tree.get.stack()(), []);
    assert.equal( tree.get.stackLength()(), 0);
    assert.equal( tree.get.count()(state), 2 );
    assert.equal( tree.get.toThe({power: 10})(state), 1024 );
    assert.equal( tree.get.isEven()(state), true );
    assert.deepEqual( tree.get.stack()(state), ['a', 'b']);
    assert.equal( tree.get.stackLength()(state), 2);
    assert.end();
});

test('branchedTree actor composition', (assert) => {
    const tree = branchedTree({
        counter: {
            reducer: (state = 0, action = {}) => (
                action.type === 'increment' ? state + 1 : state
            ),
            get: {
                count: (options) => (state = 0) => state,
                isEven: (options) => (state = 0) => (state % 2 === 0),
                toThe: ({power = 1}) => (state = 0) => Math.pow(state, power)
            },
            act: {
                up: () => ({ type: 'increment' })
            }
        },
        stack: {
            reducer: (state = [], action = {}) => (
                action.type === 'push' ? [ ...state, action.value ] : state
            ),
            get : {
                stack: (options) => (state = []) => state,
                stackLength: (options) => (state = []) => state.length
            },
            act: {
                push: ({value}) => ({ type: 'push', value })
            }
        }
    });

    const state = [
        tree.act.up(),
        tree.act.up(),
        tree.act.push({ value: 'a' }),
        tree.act.push({ value: 'b' })
    ].reduce(tree.reducer, undefined);

    assert.equal( tree.get.count()(), 0 );
    assert.equal( tree.get.isEven()(), true );
    assert.deepEqual( tree.get.stack()(), []);
    assert.equal( tree.get.stackLength()(), 0);
    assert.equal( tree.get.count()(state), 2 );
    assert.equal( tree.get.toThe({power: 10})(state), 1024 );
    assert.equal( tree.get.isEven()(state), true );
    assert.deepEqual( tree.get.stack()(state), ['a', 'b']);
    assert.equal( tree.get.stackLength()(state), 2);
    assert.end();
});

test('branchedTree .composites', (assert) => {
    const a = valueTree({ defaultState: 2, selectorName: 'a' })
    a.get.compose('a2', ({get}) => (
        (options) => (state) => get.a()(state) * get.a()(state)
    ));

    const b = valueTree({ defaultState: 3, selectorName: 'b' })
    b.get.compose('b2', ({get}) => (
        (options) => (state) => get.b()(state) * get.b()(state)
    ));

    const c = branchedTree({a,b});
    c.get.compose('sumOfSquares', ({get}) => (
        (options) => (state) => get.a2()(state) + get.b2()(state)
    ));

    assert.equal(c.get.sumOfSquares()(), 13);
    assert.equal(typeof c.get.composites.a2, 'function');
    assert.equal(typeof c.get.composites.b2, 'function');
    assert.equal(typeof c.get.composites.sumOfSquares, 'function');
    assert.end();
});