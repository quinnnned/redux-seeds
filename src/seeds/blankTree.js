export default () => {
    const tree = {};
    tree.reducer = (state = null) => state;
    tree.get = composable(tree);
    tree.act = composable(tree);
    return tree;
}

const composable = (root) => {
    const composableObject = {}
    attachNonEnumerable(composableObject, 'composites', {});
    attachNonEnumerable(composableObject, 'compose', (name, composite) => {
        composableObject.composites[name] = composite;
        composableObject[name] = composite(root);
    });
    return composableObject;
}

const attachNonEnumerable = (object, propertyName, value) => (
    Object.defineProperty(object, propertyName, {
        enumerable: false,
        configurable: false,
        writable: false,
        value
    })
);
