import test from 'tape';
import {valueTree} from '../src/';

test('valueTree type', (assert) => {
    assert.equal(typeof valueTree, 'function', 'should be a function');
    assert.end();
});

test('valueTree: defaultState', (assert) => {

    const treeA = valueTree();

    assert.equal(treeA.reducer(), null, `
        should default to null
    `);

    const defaultState = {}
    const treeB = valueTree({defaultState});
    assert.equal(treeB.reducer(), defaultState, `
        can be set explicitly
    `);

    assert.end();
});

test('valueTree.get.[selectorName]', (assert) => {

    const treeA = valueTree();
    const testNoteA = `
        valueTree.get should initially just contain .compose and .composites
    `;
    assert.equal( Object.keys(treeA.get).length, 2, testNoteA);
    assert.equal( typeof treeA.get.compose, 'function', testNoteA);
    assert.equal( typeof treeA.get.composites, 'object', testNoteA);

    const treeB = valueTree({
        selectorName: 'thing'
    });
    const testNoteB = `
        valueTree.get.[selectorName] should be a function if selectorName
        is provided in the options
    `;
    assert.equal( Object.keys(treeB.get).length, 3, testNoteB);
    assert.equal( typeof treeB.get.thing, 'function', testNoteB);
    assert.equal( treeB.get.thing()(), null, testNoteB);
    assert.end();
});

test('valueTree.act.[actorName]', (assert) => {
    const treeA = valueTree();
    const testNoteA = `
        valueTree.act should initially just contain .compose and .composites
    `;
    assert.equal( Object.keys(treeA.act).length, 2, testNoteA);
    assert.equal( typeof treeA.act.compose, 'function', testNoteA);
    assert.equal( typeof treeA.act.composites, 'object', testNoteA);

    const treeB = valueTree({
        actorName: 'setUserName'
    });
    const testNoteB = `
        valueTree.act.[actorName] should be a function if actorName
        is provided in the options
    `;
    assert.equal( Object.keys(treeB.act).length, 3, testNoteB);
    assert.equal( typeof treeB.act.setUserName, 'function', testNoteB);
    assert.deepEqual( treeB.act.setUserName({ value: 'dave' }), {
        type: 'SET_USER_NAME',
        payload: {
            value: 'dave'
        }
     }, testNoteB);
    assert.end();
});

test('valueTree actor options validation', (assert) => {
    let lastError = null;
    const originalConsoleError = console.error;
    console.error = (e) => lastError = e;

    const tree = valueTree({
        actorName: 'setUserAge'
    });

    lastError = null;
    assert.deepEqual(tree.act.setUserAge(), {}, `
        actor should return an empty action if the value is not provided
    `);
    assert.notEqual(lastError, null, `
        actor should log an error message if value is not provided
    `);

    lastError = null;
    assert.notDeepEqual(tree.act.setUserAge({value: 42}), {}, `
        actor should not return an empty action if the value is provided
    `);
    assert.equal(lastError, null, `
        actor should not log an error message if value is provided
    `);

    console.error = originalConsoleError;
    assert.end();
})

test('valueTree.act.[actorName] with valueName', (assert) => {
    
    const tree = valueTree({
        actorName: 'setUserName',
        valueName: 'name'
    });
    assert.deepEqual( tree.act.setUserName({ name: 'dave' }), {
        type: 'SET_USER_NAME',
        payload: {
            name: 'dave'
        }
     }, `
        the payload returned by valueTree.act.[actorName] should use
        valueName instead of 'value' if provided
    `);
    assert.end();
});


test('valueTree actor options validation with valueName', (assert) => {
    // Escalate console.error()
    const originalConsoleError = console.error;
    console.error = (e) => { throw e; };

    const tree = valueTree({
        valueName: 'age',
        actorName: 'setUserAge'
    });

    assert.throws( () => tree.act.setUserAge(), /age/, `
        actor should log an error message if value is not provided
    `);

    assert.doesNotThrow( () => tree.act.setUserAge({age: 42}), /./, `
        actor should not log an error message if value is provided
    `);

    // De-Escalate console.error()
    console.error = originalConsoleError;
    assert.end();
});

test('valueTree state updates', (assert) => {

    const {reducer, get, act} = valueTree({
        valueName: 'game',
        actorName: 'setFavoriteGame',
        selectorName: 'favoriteGame',
        defaultState: 'NO GAME SELECTED'
    });

    const test = (...actions) => (
        get.favoriteGame()(actions.reduce(reducer, undefined))
    );

    assert.equal(test(), 'NO GAME SELECTED');
    assert.equal(test(
        act.setFavoriteGame({game: 'Chess' }) 
    ), 'Chess');
    assert.equal(test(
        act.setFavoriteGame({game: 'Chess' }),
        act.setFavoriteGame({game: 'Checkers' }), 
    ), 'Checkers');


    assert.end();
});

test('valueTree reducer action validation', (assert) => {
    let lastError = null;
    const originalConsoleError = console.error;
    console.error = (e) => lastError = e;

    const tree = valueTree({
        actorName: 'doSomething'
    });

    const state = {};
    lastError = null;
    assert.equal( tree.reducer(state, { type: 'DO_SOMETHING' }), state, `
        reducer should ignore the action if the value is missing
    `);
    assert.notEqual(lastError, null, `
        reducer should log an error message if the action's value is missing.
    `);
    assert.equal( tree.reducer(state, { type: 'SOME_OTHER_ACTION'}), state, `
        reducer should ignore all other actions
    `);

    console.error = originalConsoleError;
    assert.end();
});

test('valueTree selector/actor prefixes', (assert) => {
    const {get, act} = valueTree({
        actorName    : 'act.setName',
        selectorName : 'get.name'
    });
    assert.equal(typeof act.setName, 'function');
    assert.equal(typeof get.name, 'function');
    assert.end();
});
