import {camelToUpperSnake} from '../../../lib/state';
import createStateTree from './createStateTree';

export default ({ 
    defaultState = null, 
    valueName    = "value", 
    selectorName = null, 
    actorName    = null
}) => {

    actorName = actorName || "set" + selectorName[0].toUpperCase() 
                                   + selectorName.slice(1);

    // Build Action Types By converting actor names
    const ACTION_TYPE = camelToUpperSnake(setActorName);

    const tree = createStateTree({
        defaultState,
        actionHandlers: {
            [ACTION_TYPE]: (state = defaultState, action = {}) => {

                // TODO: Add Checks and Warnings
                return action.payload[valueName]
            }        
        }
    })

    //// Attach Selector
    tree.get[selectorName] = (options = {}) => (state = defaultState) => state;

    //// Attach Actor
    tree.act[actorName] = (options = {}) => {

        // TODO: Add Checks and Warnings

        return {
            type: ACTION_TYPE,
            payload: {
                [valueName]: options[valueName]
            }
        }
    }

    return tree;
};