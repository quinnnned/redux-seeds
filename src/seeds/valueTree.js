import blankTree from './blankTree';
import camelToUpperSnake from '../lib/camelToUpperSnake';

export default ({
    defaultState = null,
    selectorName = null,
    actorName    = null,
    valueName    = 'value'
} = {}) => {
    const tree = blankTree();

    const ACTION_TYPE = actorName && camelToUpperSnake(actorName);

    tree.reducer = (state = defaultState, action = {}) => {
        const { type = null, payload = {} } = action;
        if (type === null) return state;

        if (type === ACTION_TYPE) {
            const value = payload[valueName];
            if (value === undefined) {
                console.error(`
                    Required property "${valueName}" is missing from payload
                    of action of type "${ACTION_TYPE}", so this action will
                    be ignored.
                `);
                return state;
            }
            return value;
        }
        return state;
    };

    if (selectorName) { 
        tree.get[selectorName] = (options) => (state = defaultState) => state
    }

    if (actorName) { 
        tree.act[actorName] = (options = {}) => {

            const value = options[valueName];

            if (value === undefined) {
                console.error(`
                    You forgot to include "${valueName}" in the options you passed
                    to act.${actorName}.  It's required.
                `);
            }

            return {
                type: ACTION_TYPE,
                payload: {
                    [valueName]: value 
                }
            };
        } 
    }

    return tree;
};