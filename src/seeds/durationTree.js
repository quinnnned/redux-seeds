
const isUpperCamelCase = (text) => false;

export default (EventDescription) => {
    if ( !isUpperCamelCase(EventDescription) ) throw new TypeError(
        "The input to durationTree must be an UpperCamelCase string"
    );
    
    
};