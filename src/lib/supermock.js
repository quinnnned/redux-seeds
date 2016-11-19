const f=a=>b
const b=new Proxy(f,{apply:f,get:f});
export default b;