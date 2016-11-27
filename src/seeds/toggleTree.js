import camelToUpperSnake from '../lib/camelToUpperSnake';
import nameNormalizer from '../lib/nameNormalizer';
import customTree from './customTree';

export default ({
    defaultState = false,
    selectorName = null,
    onActorName = null,
    offActorName = null 
}={}) => {
    //// Validate Inputs
    if ( selectorName === null) throw `"selectorName" is a required parameter for toggleTree seed.`
    if ( onActorName  === null) throw  `"onActorName" is a required parameter for toggleTree seed.`
    if ( offActorName === null) throw `"offActorName" is a required parameter for toggleTree seed.`

    //// Normalize Actor and Selector names
    selectorName = nameNormalizer(selectorName);
    offActorName = nameNormalizer(offActorName);
    onActorName  = nameNormalizer(onActorName);

    //// Generate action type constants from actor names
    const ON_ACTION_TYPE  = camelToUpperSnake(onActorName);
    const OFF_ACTION_TYPE = camelToUpperSnake(offActorName);

    //// Create State Tree
    const tree = customTree({
        defaultState,
        actionHandlers: {
            [ON_ACTION_TYPE]: () => true,
            [OFF_ACTION_TYPE]: () => false
        }
    })

    //// Attach selectors
    tree.get[selectorName] = () => (state = defaultState) => state;

    //// Attach Actors
    tree.act[onActorName]  = () => ({ type: ON_ACTION_TYPE });
    tree.act[offActorName] = () => ({ type: OFF_ACTION_TYPE }); 

    //// Return Mutated State Tree
    return tree;
};