export default (name) => {
    if (name !== `${name}`) return null;
    const prefix = name.slice(0,4);
    if (prefix === 'get.' || prefix === 'act.') return name.slice(4);
    return name;
};