export default () => {

    const tree = {};

    //// .reducer
    tree.reducer = (state=null) => state;

    //// .get
    tree.get = { 
        composites: {},
        compose: (name, composite) => {
            tree.get.composites[name] = composite;
            tree.get[name] = composite(tree);
        }
    };

    //// .act
    tree.act = {
        composites: {},
        compose: (name, composite) => {
            tree.act.composites[name] = composite;
            tree.act[name] = composite(tree);
        }
    };

    return tree;
}