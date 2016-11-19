import supermock from '../lib/supermock';


export default (tree, doReflect = true) => (connect) => {

    const treeConnect = (mapGetToProps, mapActToProps, mergeProps, options) => (
        (Component) => {

            if (doReflect) {
                reflect(treeConnect, mapGetToProps, mapActToProps, Component );
            }
            
            let mapStateToProps = undefined;
            if (typeof mapGetToProps === 'function') {
                mapStateToProps = (state, ownProps) => {
                    const getProps = mapGetToProps(tree.get, ownProps);
                    const propNames = Object.keys(getProps);
                    const propCount = propNames.length;
                    const props = {};
                    for( let i = 0; i < propCount; i++) {
                        const propName = propNames[i]; 
                        props[propName] = getProps[propName](state);
                    }
                    return props;
                };
            }

            let mapDispatchToProps = undefined;
            if (typeof mapActToProps === 'function') {
                mapDispatchToProps = (dispatch, ownProps) => {
                    const actProps = mapActToProps(tree.act, ownProps);
                    const propNames = Object.keys(actProps);
                    const propCount = propNames.length;
                    const props = {};
                    for ( let i = 0; i < propCount; i++) {
                        const propName = propNames[i];
                        props[propName] = (...options) => (
                            dispatch(actProps[propName](...options))
                        );
                    }
                    return props;
                };
            }

            return connect(
                mapStateToProps, 
                mapDispatchToProps, 
                mergeProps, 
                options
            )(Component);
        }
    );

    return treeConnect;
};

const reflect = (treeConnect, mapGetToProps, mapActToProps, Component) => {
    const componentName = Component.displayName;
    treeConnect._USAGE_ = treeConnect._USAGE_ || { get: [], act: [] };

    const examine = (mapper, type) => {
        if (typeof mapper === 'function') {
            callAll(
                mapper(
                    new Proxy({}, {
                        get: (target, property) => {
                            treeConnect._USAGE_[type]
                            .push([ componentName, property ]);
                            return supermock;
                        }
                    }), 
                    supermock
                )
            )    
        }
    } 
    
    examine( mapGetToProps, 'get');
    examine( mapActToProps, 'act');
};

const callAll = (o) => Object.keys(o).forEach( (key) => o[key](supermock) );