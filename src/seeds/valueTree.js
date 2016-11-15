import {camelToUpperSnake} from '../../../lib/state';

export default ({ 
    defaultState=null, 
    valueName="value", 
    selectorName = "", 
    setActorName = null, 
    clearActorName = null
}) => {

    // If not supplied, the actor names will be derived from the selectorName
    setActorName = setActorName || "set" + selectorName[0].toUpperCase() + selectorName.slice(1);
    clearActorName = clearActorName || "clear" + selectorName[0].toUpperCase() + selectorName.slice(1);

    // Build Action Types By converting actor names
    const SET_ACTION_TYPE = camelToUpperSnake(setActorName);
    const CLEAR_ACTION_TYPE = camelToUpperSnake(clearActorName);

    // Return State Tree
    return ({
        reducer: (state = defaultState, {type, payload}={}) => {
            if (type === SET_ACTION_TYPE) return payload[valueName];
            if (type === CLEAR_ACTION_TYPE) return defaultState;
            return state;
        },
        get: { 
            [selectorName]: () => (state=defaultState) => state 
        },
        act: {
            [setActorName]:  (options) => ({ 
                type: SET_ACTION_TYPE, 
                payload: { 
                    [valueName]: options[valueName]
                }
            }),
            [clearActorName]: () => ({ type: CLEAR_ACTION_TYPE })
        }
    })
};