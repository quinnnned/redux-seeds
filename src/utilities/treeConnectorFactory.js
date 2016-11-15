import {connect} from 'react-redux';

const nop = () => ({})

export default ({ get, act, reducer }) => (mapGetToProps=nop, mapActToProps=nop, mergeProps, options) => {

    reflect(mapGetToProps, mapActToProps);

    const mapStateToProps = (state, ownProps) => {
        const getProps = mapGetToProps(get, ownProps, reducer);
        return Object.keys(getProps)
                .map( (propName) => ({ [propName] : getProps[propName](state) }) )
                .reduce( (props, fragment) => Object.assign(props, fragment), {});
    };

    const mapDispatchToProps = (dispatch, ownProps) => {
        const actProps = mapActToProps(act, ownProps);
        return Object.keys(actProps)
                .map( (propName) => ({
                     [propName] : (...params) => dispatch(actProps[propName](...params)) 
                })) 
                .reduce( (props, fragment) => Object.assign(props, fragment), {});
    }

    return connect(mapStateToProps, mapDispatchToProps, mergeProps, options);
};

//// For Testing
let reflect = nop;
if ('development' == process.env.NODE_ENV) {
    // supermock
    const _ = new Proxy(()=>{},{apply:()=>_,get:()=>_});
    
    const exposed = { 
        get     : new Set(), 
        act     : new Set(),
        reducer : new Set()
    };

    window.ExposedStateApiKeys = {
        get: () => Array.from(exposed.get),
        act: () => Array.from(exposed.act),
        reducer: () => Array.from(exposed.reducer)
    }
     
    const proxyFor = (set) => new Proxy({}, {
        get: (target, property) => {
            exposed[set].add(property);
            return _;
        }
    });

    const callAll = (o) => Object.keys(o).forEach( (key) => o[key](_) );  

    reflect = (mapGetToProps, mapActToProps) => [
        mapGetToProps( proxyFor('get'), _, proxyFor('reducer') ),
        mapActToProps( proxyFor('act'), _ )
    ].forEach(callAll);
};