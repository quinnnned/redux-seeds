export default ({get, act}) => (connect) => (g2p, a2p, ...rest) => (
    connect(
        remap(g2p, get, (state, propValue) => propValue(state) ), 
        remap(a2p, act, (dispatch, propValue) => (
            (...args) => dispatch(propValue(...args))
        )),
        ...rest
    )
);

const remap = (mapper, treePart, convertor) => {
    if (typeof mapper != 'function') return undefined;
    return (target, ownProps) => {
        const mappedProps = mapper(treePart, ownProps);
        const propNames = Object.keys(mappedProps);
        const propCount = propNames.length;
        const props = {};
        for( let i = 0; i < propCount; i++) {
            const propName = propNames[i];
            const propValue = mappedProps[propName];
            props[propName] = convertor(target, propValue);
        }
        return props;
    };
};