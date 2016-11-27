import blankTree from './blankTree';
import camelToUpperSnake from '../lib/camelToUpperSnake';
import nameNormalizer from '../lib/nameNormalizer';

/**
 * Creates a state tree for representing and updating a single value
 */
export default ({
    defaultState = null,
    selectorName = null,
    actorName    = null,
    valueName    = 'value'
} = {}) => {

    //// Start with a blank tree
    const tree = blankTree();

    //// Normalize Actor and Selector Names
    actorName    = nameNormalizer(actorName);
    selectorName = nameNormalizer(selectorName);

    //// Generate Action Type from actorName (if provided)
    const ACTION_TYPE = actorName && camelToUpperSnake(actorName);

    //// Define Reducer
    tree.reducer = (state = defaultState, action = {}) => {
        const { type = null, payload = {} } = action;
        if (type === null) return state;

        if (type === ACTION_TYPE) {
            const value = payload[valueName];
            if (value !== undefined) return value;
            warnAboutMissingValueInReducer(valueName, ACTION_TYPE);
        }

        return state;
    };

    //// Attach Selector (if selectorName provided)
    if (selectorName) { 
        tree.get[selectorName] = (options) => (state = defaultState) => state
    }

    //// Attach Actor (if actorName provided)
    if (actorName) { 
        tree.act[actorName] = (options = {}) => {

            // Check for required value
            const value = options[valueName];
            if (value === undefined) {
                warnAboutMissingValueInActor(valueName, actorName);
                return {};
            }

            // Return Action 
            return {
                type: ACTION_TYPE,
                payload: {
                    [valueName]: value 
                }
            };
        } 
    }

    //// Return Mutated Tree
    return tree;
};

//// Warnings
const warnAboutMissingValueInActor = (valueName, actorName) => console.error(`
    You forgot to include "${valueName}" in the options you passed
    to act.${actorName}.  It's required.
`);

const warnAboutMissingValueInReducer = (valueName, ACTION_TYPE) => console.error(`
    Required property "${valueName}" is missing from payload
    of action of type "${ACTION_TYPE}", so this action will
    be ignored.
`);