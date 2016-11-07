export default (camelCaseName) => (
    `${camelCaseName}`
        .split('')
        .map( (c) => /[A-Z]/.test(c) ? ('_'+c) : c.toUpperCase() )
        .join('')
);