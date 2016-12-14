import nameNormalizer from '../lib/nameNormalizer'; 

export default () => {
    const tree = {};
    tree.reducer = (state = null) => state;
    tree.get = composable(tree);
    tree.act = composable(tree);
    return tree;
}

const composable = (root) => {
    const composableObject = {}

    const singleCompose = (name, composite) => {
        const normalizedName = nameNormalizer(name);
        composableObject.composites[normalizedName] = composite;
        composableObject[normalizedName] = composite(root);
    };

    const multiCompose = (composites) => {
        Object.keys(composites).forEach(  (name) => {
            const composite = composites[name];
            singleCompose(name, composite);
        });        
    };

    const compose = (...params) => (
        (params.length > 1 ? singleCompose : multiCompose )(...params) 
    );

    attachNonEnumerable(composableObject, 'composites', {});
    attachNonEnumerable(composableObject, 'compose', compose);
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
