import createStateTree from './createStateTree';
import camelToUpperSnake from '../lib/camelToUpperSnake';

export default ({
    subTree = null,
    keyName = 'key',
    removeActorName = null
} = {}) => {
    const defaultState = {};

    const tree = createStateTree({ defaultState });

    const REMOVE_ACTION_TYPE = camelToUpperSnake(removeActorName);
    
    if (removeActorName) {
        tree.act[removeActorName] = (options = {}) => {

            const key = options[keyName];

            if (key === undefined) {
                return warnAboutMissingKeyInActor(keyName, removeActorName);
            }

            return {
                type: REMOVE_ACTION_TYPE,
                payload: {
                    [keyName]: key
                }
            }

        } 
    }

    if (subTree == null) return tree;

    tree.reducer = (state = defaultState, action = {}) => {
        const {type = null, payload = {}, ...rest} = action;
        const key = payload[keyName];
        if (key === undefined) return state;

        if ( REMOVE_ACTION_TYPE === type) {
            const stateCopy = Object.assign({}, state);
            delete stateCopy[key];
            return stateCopy;
        }

        const subState = state[key];
        const subAction = { type, ...rest, payload: Object.assign({}, payload)};
        delete subAction.payload[keyName];

        return Object.assign({}, state, {
            [key]: subTree.reducer(subState, subAction)
        })
    };

    Object.keys(subTree.get)
        .filter( (key) => key !== 'compose' )
        .filter( (key) => key !== 'composites' )
        .forEach( (selectorName) => {
            tree.get[selectorName] = (options={}) => (state=defaultState) => {
            
                const key = options[keyName]
                const subState = state[key];

                // strip key from options passed to subSelector
                const subOptions = Object.assign({}, options);
                delete subOptions[keyName];

                const result = subTree.get[selectorName](subOptions)(subState); 

                if (key === undefined) {
                    warnAboutMissingKeyInSelector(keyName, selectorName, result);
                }

                return result;
            } 
        });

    Object.keys(subTree.act)
        .filter( (key) => key !== 'compose' )
        .filter( (key) => key !== 'composites' )
        .forEach( (actorName) => {
            tree.act[actorName] = (options={}) => {

                const key = options[keyName];

                if (key === undefined) {
                    return warnAboutMissingKeyInActor(keyName, actorName);
                }

                // strip key from options passed to subSelector
                const subOptions = Object.assign({}, options);
                delete subOptions[keyName];

                const subAction = subTree.act[actorName](subOptions);

                return Object.assign({}, subAction, {
                    payload: Object.assign({}, subAction.payload, {
                        [keyName]: key
                    })
                });
            } 
        });

    
    return tree;
};


//// Warnings
const warnAboutMissingKeyInSelector = (keyName, selectorName, defaultValue) => {
    console.error(`
        Just so you know, you forgot to include "${keyName}" 
        in the options when you called get.${selectorName},
        so it returned its default value (${defaultValue}).
    `);

    return null;
}

const warnAboutMissingKeyInActor = (keyName, actorName) => {
    console.error(`
        Just so you know, you forgot to include "${keyName}" 
        in the options when you called act.${actorName},
        so I cancelled the action.
    `);

    return {};
}