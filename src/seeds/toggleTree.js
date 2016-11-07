import camelToUpperSnake from '../lib/camelToUpperSnake';

export default ({
    defaultState = false,
    selectorName = null,
    onActorName = null,
    offActorName = null 
}={}) => {
    // Validate Inputs
    if ( selectorName === null) throw `"selectorName" is a required parameter for toggleTree seed.`
    if ( onActorName  === null) throw `"onActorName" is a required parameter for toggleTree seed.`
    if ( offActorName === null) throw `"offActorName" is a required parameter for toggleTree seed.`

    // Generate action type constants from actor names
    const ON_ACTION_TYPE  = camelToUpperSnake(onActorName);
    const OFF_ACTION_TYPE = camelToUpperSnake(offActorName);

    // Return State Tree
    return ({
        get: {
            compose: 'TODO',
            [selectorName]: () => (state = defaultState) => state
        }, 
        act: {
            compose: 'TODO',
            [onActorName]: () => ({ type: ON_ACTION_TYPE }),
            [offActorName]: () => ({ type: OFF_ACTION_TYPE })
        },
        reducer: (state = defaultState, {type} = {}) => {
            if (type === ON_ACTION_TYPE) return true;
            if (type === OFF_ACTION_TYPE) return false;
            return state;
        }
    });
};