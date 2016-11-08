import toggleTree from './toggleTree';

/**
 * Creates a state tree which represents whether or not some event is occuring.
 * Automatically generages selector, action types, and actors based on a single
 * input string.
 * @param {string} EventDescription (UpperCamelCase)
 * @throws TypeError if EventDescription is not an UpperCamelCase string
 */
export default (EventDescription) => {
    if ( !isUpperCamelCase(EventDescription) ) {
        failBecauseInputWasNotAnUpperCamelCaseString();
    }

    return toggleTree({
        defaultState : false,
        selectorName : `is${EventDescription}`,
        onActorName  : `start${EventDescription}`,
        offActorName : `stop${EventDescription}`,
    })
};

//// Utility Functions
const isUpperCamelCase = (text) => {
    if (text != `${text}`) return false;
    return /^([A-Z][a-z]+)+$/.test(text);
};

//// Exceptions
const failBecauseInputWasNotAnUpperCamelCaseString = () => {
    throw new TypeError(
        "The input to durationTree must be an UpperCamelCase string"
    );
}; 