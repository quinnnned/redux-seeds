import blankTree from './blankTree';

export default ({
    defaultState = null,
    actionHandlers = {},
} = {}) => {

    const tree = blankTree();

    //// .reducer
    tree.reducer = ( state = defaultState, action = {} ) => {
        const handler = actionHandlers[action.type];

        // If no matching handler was found, simply return the previous state
        if (typeof handler !== 'function') return state;

        // Get handler result; warn if it is undefined
        const result = handler(state, action)
        if (result === undefined) {
            warnAboutUndefinedResultFromActionHandler(action.type, defaultState);
            return defaultState;
        }

        return result;
    };

    //// return state tree
    return tree;
};

//// Warnings
const warnAboutUndefinedResultFromActionHandler = (type, defaultState) => console.error(`
    Just so you know, the actionHandler for actions of type "${type}" returned undefined, 
    so I'm going to return the default state instead (${defaultState}).  Have a nice day!
`);