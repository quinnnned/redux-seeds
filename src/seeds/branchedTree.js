import blankTree from './blankTree';

export default (branches) => {

    const defaultState = {};

    const tree = blankTree();

    const branchNames = Object.keys(branches);
    branchNames.forEach( (branchName) => {

        //// Attach Branch Selectors
        const branchGet = branches[branchName].get || {};
        Object.keys(branchGet)
            .filter( (selectorName) => selectorName != 'compose')
            .filter( (selectorName) => selectorName != 'composites')
            .forEach( (selectorName) => {
                const branchSelector = branchGet[selectorName];
                tree.get[selectorName] = (options = {}) => (
                    (state = defaultState) => (
                        branchSelector(options)(state[branchName])
                    )  
                );
            });

        //// Attach Branch Actors
        const branchAct = branches[branchName].act || {};
        Object.keys(branchAct)
            .filter( (actorName) => actorName != 'compose')
            .filter( (actorName) => actorName != 'composites')
            .forEach( (actorName) => {
                const branchActor = branchAct[actorName];
                tree.act[actorName] = (options = {}) => branchActor(options);
            });
    });

    //// Define Composite Reducer
    tree.reducer = (state = {}, action) => {
        let stateChanged = false;
        const nextState = {};

        branchNames.forEach( (branchName) => {
            const branchState = state[branchName];
            const branchReducer = branches[branchName].reducer;
            nextState[branchName] = branchReducer(branchState, action);
            if (nextState[branchName] !== branchState) {
                stateChanged = true;
            }
        })

        if (!stateChanged) return state;
        return nextState;
    };

    //// Return Mutated State Tree
    return tree;
};