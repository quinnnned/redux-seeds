import test from 'tape';
import {createTreeConnector} from '../src';

test('createTreeConnector basics', (assert) => {
    assert.equal( typeof createTreeConnector, 'function', `
        should be a function
    `);

    const mapGetToProps = undefined;
    const mapActToProps = undefined;
    const spies = { mergeProps: {}, options: {}, Component: {} };
    const connect = (
        mapStateToProps, 
        mapDispatchToProps, 
        mergeProps, 
        options 
    ) => (Component) => {
        assert.equal(mapStateToProps, undefined, `
            if mapGetToProps is undefined, then undefined should also be passed
            to the base connect() for mapStateToProps
        `);
        assert.equal(mapDispatchToProps, undefined, `
            if mapActToProps is undefined, then undefined should also be passed
            to the base connect() for mapDispatchToProps
        `);
        assert.equal(mergeProps, spies.mergeProps, `
            treeConnector does nothing special connect's mergeProps parameter,
            just passes it through.
        `);
        assert.equal(options, spies.options, `
            treeConnector does nothing special connect's options parameter,
            just passes it through.
        `);
        assert.equal(Component, spies.Component, `
            should pass Component on down to the base connect()
        `);
        assert.end();
    }
    const treeConnector = createTreeConnector({}, false)(connect);

    treeConnector(
        undefined, 
        undefined, 
        spies.mergeProps, 
        spies.options
    )(spies.Component);
});

test('createTreeConnector: mapGetToProps', (assert) => {
    assert.plan(7)

    const spies = {
        state: {}, 
        foo: 'foo-value', 
        bar: 'bar-value', 
        ownProps: 'own-props'
    };

    const tree = {
        get: {
            foo: ({fooOption}) => (state) => {
                assert.equal(fooOption, 'foo-option');
                assert.equal(state, spies.state);
                return spies.foo;
            },
            bar: ({barOption}) => (state) => {
                assert.equal(barOption, 'bar-option');
                assert.equal(state, spies.state);
                return spies.bar;
            }
        }
    };

    const mapGetToProps = (get, ownProps) => {
        assert.equal(ownProps, spies.ownProps);
        return {
            fooProp: get.foo({fooOption: 'foo-option'}),
            barProp: get.bar({barOption: 'bar-option'})
        };
    };

    const connect = (mapStateToProps) => () => {
        const props = mapStateToProps(spies.state, spies.ownProps);
        assert.equal(props.fooProp,  spies.foo);
        assert.equal(props.barProp, spies.bar);
    };

    const treeConnector = createTreeConnector(tree, false)(connect);

    treeConnector(mapGetToProps)({});
});

test('createTreeConnector: mapActToProps', (assert) => {
    assert.plan(6)

    const spies = { 
        state: {}, 
        foo: 'foo-action', 
        bar: 'bar-action',
        ownProps: 'own-props'
    };

    const tree = {
        act: {
            foo: ({fooOption}) =>  {
                assert.equal(fooOption, 'foo-option');
                return spies.foo;
            },
            bar: ({barOption}) => {
                assert.equal(barOption, 'bar-option');
                return spies.bar;
            }
        }
    };

    const mapActToProps = (act, ownProps) => {
        assert.equal(ownProps, spies.ownProps);
        return ({
            fooProp: () => act.foo({fooOption: 'foo-option'}),
            barProp: () => act.bar({barOption: 'bar-option'})
        });
    };

    const connect = (_, mapDispatchToProps) => () => {

        const dispatchedActions = [];
        const dispatch = (action) => dispatchedActions.push(action);
        const props = mapDispatchToProps(dispatch, spies.ownProps);

        assert.deepEqual(dispatchedActions, []);
        props.fooProp();
        assert.deepEqual(dispatchedActions, [ spies.foo ]);
        props.barProp();
        assert.deepEqual(dispatchedActions, [ spies.foo, spies.bar ]);
    };

    const treeConnector = createTreeConnector(tree, false)(connect);

    treeConnector(undefined, mapActToProps)({});
});

test('createTreeConnector _USAGE_', (assert) => {

    const tree = {
        get: {
            fooSelector: () => () => null,
            barSelector: () => () => null
        },
        act: {
            fooActor: () => null,
            barActor: () => null
        }
    }
    const connect = () => () => {};

    const treeConnector = createTreeConnector(tree)(connect);

    treeConnector( (get) => ({ 
        a: get.fooSelector()
    }))({ displayName: 'ComponentA' });

    treeConnector(undefined, (act) => ({
        b: act.fooActor()
    }))({ displayName: 'ComponentB' });

    treeConnector(
        (get) => ({ 
            c: get.barSelector()
        }), 
        (act) => ({
            d: act.barActor()
        })
    )({ displayName: 'ComponentC' });


    assert.deepEqual(treeConnector._USAGE_.act, [
        ['ComponentB', 'fooActor'],
        ['ComponentC', 'barActor']
    ]);

    assert.deepEqual(treeConnector._USAGE_.get, [
        ['ComponentA', 'fooSelector'],
        ['ComponentC', 'barSelector']
    ]);

    assert.end();
});