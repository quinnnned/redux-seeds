import toggleTree from './toggleTree';

const isUpperCamelCase = (text) => {
    if (text != `${text}`) return false;
    return /^([A-Z][a-z]+)+$/.test(text);
};

export default (EventDescription) => {
    if ( !isUpperCamelCase(EventDescription) ) throw new TypeError(
        "The input to durationTree must be an UpperCamelCase string"
    );
    return toggleTree({
        defaultState : false,
        selectorName : `is${EventDescription}`,
        onActorName  : `start${EventDescription}`,
        offActorName : `stop${EventDescription}`,
    })
};