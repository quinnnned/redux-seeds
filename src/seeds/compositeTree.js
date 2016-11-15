export default (branches) => {

    const reducer = combineReducers(
                        Object.keys(branches)
                            .reduce( (reducers, branchName) => (
                                Object.assign({}, reducers, {
                                    [branchName]: branches[branchName].reducer
                                })
                            ), {})
                    );
    let get = {};
    let act = {};

    Object.keys(branches).map( (branchName) => {
        const branch = branches[branchName]; 

        //// .get
        Object.keys(branch.get).forEach( (selectorName) => {
            const selector = branch.get[selectorName];
            if (typeof selector === 'function') {
                // selector of form branch.get = (options) => (state) => (value)
                get = Object.assign({}, get, {
                    [selectorName]: (options) => (state) => selector(options)(state[branchName])
                });
            }
        });

        //// .act
        Object.keys(branch.act || {} ).forEach( (actorName) => {
            const actor = branch.act[actorName];
            if (typeof actor === 'function') {
                // selector of form branch.act = (options) => action || (options) => (dispatch) => void    
                act = Object.assign({}, act, {
                    [actorName]: actor
                });
            }
        });

        // temporary
        Object.keys(branch.reducer).forEach( (selectorName) => {
            const selector = branch.reducer[selectorName];
            reducer[selectorName] = (state,...rest) => selector(state[branchName], ...rest)
        });

    })

    get.composites = {};
    get.compose = function(name, composite) {
        this.composites[name] = composite;
        this[name] = composite(this, reducer);
    };


    act.composites = {};
    act.compose = function(name, composite) {
        this.composites[name] = composite;
        this[name] = (options) => {
            const action = composite(this, get)(options);
            
            // If actor returns an array of actions, 
            // convert to a thunk which dispatches
            // each action in order. (maybe middleware this?)
            if (typeof action.forEach === 'function') {
                return (dispatch) => action.forEach(dispatch);
            }

            // Otherwise return action
            return action;
        };
    };


    return { get, reducer, act };
};