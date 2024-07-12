var z=Object.defineProperty;var B=(t,e,s)=>e in t?z(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var a=(t,e,s)=>B(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))l(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();let f=Object.getPrototypeOf,b,w,d,u,A={isConnected:1},J=1e3,S,Y={},Q=f(A),M=f(f),p,I=(t,e,s,l)=>(t??(setTimeout(s,l),new Set)).add(e),T=(t,e,s)=>{let l=d;d=e;try{return t(s)}catch(r){return console.error(r),s}finally{d=l}},O=t=>t.filter(e=>{var s;return(s=e._dom)==null?void 0:s.isConnected}),$=t=>S=I(S,t,()=>{for(let e of S)e._bindings=O(e._bindings),e._listeners=O(e._listeners);S=p},J),v={get val(){var t;return(t=d==null?void 0:d._getters)==null||t.add(this),this.rawVal},get oldVal(){var t;return(t=d==null?void 0:d._getters)==null||t.add(this),this._oldVal},set val(t){var e;(e=d==null?void 0:d._setters)==null||e.add(this),t!==this.rawVal&&(this.rawVal=t,this._bindings.length+this._listeners.length?(w==null||w.add(this),b=I(b,this,U)):this._oldVal=t)}},F=t=>({__proto__:v,rawVal:t,_oldVal:t,_bindings:[],_listeners:[]}),_=(t,e)=>{let s={_getters:new Set,_setters:new Set},l={f:t},r=u;u=[];let o=T(t,s,e);o=(o??document).nodeType?o:new Text(o);for(let i of s._getters)s._setters.has(i)||($(i),i._bindings.push(l));for(let i of u)i._dom=o;return u=r,l._dom=o},H=(t,e=F(),s)=>{let l={_getters:new Set,_setters:new Set},r={f:t,s:e};r._dom=s??(u==null?void 0:u.push(r))??A,e.val=T(t,l,e.rawVal);for(let o of l._getters)l._setters.has(o)||($(o),o._listeners.push(r));return e},N=(t,...e)=>{for(let s of e.flat(1/0)){let l=f(s??0),r=l===v?_(()=>s.val):l===M?_(s):s;r!=p&&t.append(r)}return t},D=(t,e,...s)=>{var i;let[l,...r]=f(s[0]??0)===Q?s:[{},...s],o=t?document.createElementNS(t,e):document.createElement(e);for(let[h,n]of Object.entries(l)){let g=m=>m?Object.getOwnPropertyDescriptor(m,h)??g(f(m)):p,P=e+","+h,V=Y[P]??(Y[P]=((i=g(f(o)))==null?void 0:i.set)??0),x=h.startsWith("on")?(m,q)=>{let W=h.slice(2);o.removeEventListener(W,q),o.addEventListener(W,m)}:V?V.bind(o):o.setAttribute.bind(o,h),k=f(n??0);h.startsWith("on")||k===M&&(n=H(n),k=v),k===v?_(()=>(x(n.val,n._oldVal),o)):x(n)}return N(o,...r)},X=t=>({get:(e,s)=>D.bind(p,t,s)}),R=new Proxy(t=>new Proxy(D,X(t)),X()),G=(t,e)=>e?e!==t&&t.replaceWith(e):t.remove(),U=()=>{let t=0,e=[...b].filter(l=>l.rawVal!==l._oldVal);do{w=new Set;for(let l of new Set(e.flatMap(r=>r._listeners=O(r._listeners))))H(l.f,l.s,l._dom),l._dom=p}while(++t<100&&(e=[...w]).length);let s=[...b].filter(l=>l.rawVal!==l._oldVal);b=p;for(let l of new Set(s.flatMap(r=>r._bindings=O(r._bindings))))G(l._dom,_(l.f,l._dom)),l._dom=p;for(let l of s)l._oldVal=l.rawVal},Z=(t,e)=>G(t,_(e,t));const y={add:N,tags:R,state:F,derive:H,hydrate:Z},K=t=>{for(let e=t.length-1;e>0;e--){const s=Math.floor(Math.random()*(e+1)),l=t[e];t[e]=t[s],t[s]=l}return t},L=K(["success","primary","danger","info","warning","secondary","dark"]);class tt{constructor(e){a(this,"target");a(this,"handlers",[]);a(this,"scrollHandler");a(this,"bottomLock",!1);a(this,"topLock",!1);a(this,"leftLock",!1);a(this,"rightLock",!1);a(this,"lastScrollX",0);a(this,"lastScrollY",0);a(this,"bottomOffset",20);a(this,"topOffset",20);a(this,"leftOffset",0);a(this,"rightOffset",0);this.target=e}on(e,s){this.handlers.push([e,s]),this.updateScrollHandler()}updateScrollHandler(){this.scrollHandler&&this.target.removeEventListener("scroll",this.scrollHandler),this.scrollHandler=e=>{const s=this.getScrollInfo();this.handlers.forEach(([l,r])=>{switch(l){case"bottom":if(this.bottomLock||s.scrollY==this.lastScrollY)return;s.height-(s.scrollY+s.clientHeight)<=this.bottomOffset&&r(e);break;case"top":if(this.topLock||s.scrollY==this.lastScrollY)return;s.scrollY<=this.topOffset&&r(e);break;case"left":if(this.leftLock||s.clientWidth==s.width||s.scrollX==this.lastScrollX)return;s.scrollX<=this.leftOffset&&r(e);break;case"right":if(this.rightLock||s.clientWidth==s.width||s.scrollX==this.lastScrollX)return;s.width-(s.scrollX+s.clientWidth)<=this.rightOffset&&r(e);break}}),this.lastScrollX=s.scrollX,this.lastScrollY=s.scrollY},this.target.addEventListener("scroll",this.scrollHandler)}getScrollInfo(){return this.target instanceof Window?{scrollX:this.target.scrollX,scrollY:this.target.scrollY,width:document.body.offsetWidth,height:document.body.offsetHeight,clientWidth:window.innerWidth,clientHeight:window.innerHeight}:{scrollX:this.target.scrollLeft,scrollY:this.target.scrollTop,width:this.target.scrollWidth,height:this.target.scrollHeight,clientWidth:this.target.clientWidth,clientHeight:this.target.clientHeight}}off(e){this.handlers=this.handlers.filter(s=>s[1]!=e),this.updateScrollHandler()}}const{a:et,button:E,div:c,i:st,img:lt}=y.tags;y.tags("http://www.w3.org/2000/svg");const rt=()=>{const t=c({class:"tags hide-scrollbar d-flex gap-2 py-3 py-sm-4 sticky-top overflow-auto"}),e=c({class:"images row gy-4"});return ot(t,e),c({class:"container py-4 py-md-5"},c({class:"hstack"},c({class:"fs-3 fw-bold me-auto title"},c({class:"d-inline text-danger"},"不要害羞"),c({class:"d-inline text-success"}," 图片网")),et({href:"https://github.com/iuroc/haixiu",class:"link-secondary focus-ring focus-ring-success",target:"_blank"},"Github")),t,e)},ot=async(t,e)=>{const s=await fetch("./datas/init.json").then(n=>n.json());y.add(t,s.allTags.map((n,g)=>c({class:"btn-group"},E({class:`btn btn-${L[g%L.length]} text-nowrap`},n),E({class:`btn btn-${L[g%L.length]}`},st({class:"bi-alarm"})))));const l=Array.from({length:s.totalPage},(n,g)=>g),r=K(l),o=await C(r[0]);j(e,o.list,!1);const i=new tt(window);i.bottomOffset=100;let h=0;i.on("bottom",async()=>{if(i.bottomLock=!0,h==s.totalPage-1)return;const n=await C(r[++h]);j(e,n.list,!0),i.bottomLock=!1}),t.addEventListener("wheel",n=>{n.preventDefault(),t.scrollLeft+=n.deltaY})},C=async t=>await fetch(`./datas/data_${t}.json`).then(e=>e.json()),it=t=>c({class:"card",role:"button",onclick(){open(`./images/${t.bigImageFilename}`)}},c({class:"ratio ratio-1x1"},lt({class:"card-img-top",style:"pointer-events: none;",alt:t.title,src:`./images/${t.imageFilename}`})),c({class:"card-body"},c({class:"card-title text-truncate fw-bold"},t.title),c({class:"date card-text text-nowrap text-muted"},t.date))),j=(t,e,s=!0)=>{s||(t.innerHTML=""),y.add(t,e.map(l=>c({class:"col-xl-3 col-lg-4 col-6"},it(l))))};y.add(document.body,rt());
