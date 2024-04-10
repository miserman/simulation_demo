!function(){var t,e,n,i,a,r,s={47599:function(t,e,n){"use strict";var i=n(99303),a=n.n(i);class r{rollValue(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:15,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:.25;this.valueParams.base=t,this.valueParams.alpha=e,this.valueParams.beta=n,this.value=t+a()(e,n)}rollConnections(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:4,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:.9,i=t-1,a=()=>Math.floor(Math.random()*i),r=Math.max(Math.min(i,e),1),s=Math.floor(r/2),o=this.index<s?i-s:this.index-s-1,l={};for(let e=r;e--;)if(++o===this.index&&o++,o===t&&(o=this.index?0:1),1===n||0!==n&&(o in l||Math.random()<n)){let t=a();for(;t===this.index||(t in l);)t=a();l[t]=t}else l[o]=o;this.connections=Object.values(l)}step(t){let e=0,n=[-1,-1/0],i=[-1,1/0];this.connections.length&&(this.connections.forEach((a,r)=>{let s=t[a];if(this.mobility&&s.connections.length){[...s.connections,Math.floor(Math.random()*t.length)].forEach(e=>{if(e!==this.index&&!this.connections.includes(e)){let n=Math.abs(t[e].value-this.value);n<i[1]&&(i[0]=e,i[1]=n)}});let e=Math.abs(s.value-this.value);e>n[1]&&(n[0]=r,n[1]=e)}e+=s.value}),e/=this.connections.length);let r=e-this.value;if(Math.abs(r)>this.tol&&(this.stability<1&&(this.value+=Math.max(-.1,Math.min(r,.1))*(1-this.stability)),this.mobility&&n[0]>0&&-1!==i[0]&&Math.random()<this.mobility&&(this.connections[n[0]]=i[0])),this.errorProp){let t=this.valueParams.base+a()(this.valueParams.alpha,this.valueParams.beta);this.value+=this.errorProp*(t-this.value)}}constructor(t,e=0,n=0,i=0,a=0){this.index=0,this.value=0,this.tol=0,this.stability=0,this.mobility=0,this.errorProp=0,this.connections=[],this.valueParams={base:15,alpha:3,beta:.25},this.index=t,this.tol=e,this.stability=Math.max(0,Math.min(n,1)),this.mobility=Math.max(0,Math.min(i,1)),this.errorProp=Math.max(0,Math.min(a,1))}}function s(){return Math.random()-.5}class o{step(){let t=!1;[...this.agents].sort(s).forEach(e=>{let n=e.value;e.step(this.agents),(1===e.stability||Math.abs(n-e.value)>1e-6)&&(t=!0)}),t||(this.converged=!0)}constructor(t=100,e,n,i){this.converged=!1,this.agents=[],this.agents=Array(t),e||(e={});let a=e.tolerance||0,s=e.stability||0,o=e.mobility||0,l=e.errorProp||0;n||(n={});let h=n.base||15,u=n.alpha||3,c="beta"in n?n.beta:.25;i||(i={});let f=i.k||4,v="beta"in i?i.beta:.9;for(let e=t;e--;){let n=new r(e,a,s,o,l);n.rollValue(h,u,c),n.rollConnections(t,f,v),this.agents[e]=n}}}addEventListener("message",t=>{let{name:e,runs:n,epochs:i,n:a,agentParams:r,valueParams:s,connectionParams:l}=t.data;postMessage({name:e,runs:Array.from({length:n},()=>{let t=new o(a,r,s,l),e=t.agents.map(t=>t.value),n=[];for(let e=i;e--;){t.step();let e=0;t.agents.map(t=>e+=t.value),n.push(e/a)}return{means:n,initialValues:e,finalValues:t.agents.map(t=>t.value)}})})})}},o={};function l(t){var e=o[t];if(void 0!==e)return e.exports;var n=o[t]={exports:{}},i=!0;try{s[t](n,n.exports,l),i=!1}finally{i&&delete o[t]}return n.exports}l.m=s,l.x=function(){var t=l.O(void 0,[303],function(){return l(47599)});return l.O(t)},t=[],l.O=function(e,n,i,a){if(n){a=a||0;for(var r=t.length;r>0&&t[r-1][2]>a;r--)t[r]=t[r-1];t[r]=[n,i,a];return}for(var s=1/0,r=0;r<t.length;r++){for(var n=t[r][0],i=t[r][1],a=t[r][2],o=!0,h=0;h<n.length;h++)s>=a&&Object.keys(l.O).every(function(t){return l.O[t](n[h])})?n.splice(h--,1):(o=!1,a<s&&(s=a));if(o){t.splice(r--,1);var u=i();void 0!==u&&(e=u)}}return e},l.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return l.d(e,{a:e}),e},l.d=function(t,e){for(var n in e)l.o(e,n)&&!l.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},l.f={},l.e=function(t){return Promise.all(Object.keys(l.f).reduce(function(e,n){return l.f[n](t,e),e},[]))},l.u=function(t){return"static/chunks/"+t+".17a7f5a090ea96f8.js"},l.miniCssF=function(t){},l.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},l.tt=function(){return void 0===e&&(e={createScriptURL:function(t){return t}},"undefined"!=typeof trustedTypes&&trustedTypes.createPolicy&&(e=trustedTypes.createPolicy("nextjs#bundler",e))),e},l.tu=function(t){return l.tt().createScriptURL(t)},l.p="/simulation_demo/_next/",n={599:1},l.f.i=function(t,e){n[t]||importScripts(l.tu(l.p+l.u(t)))},a=(i=self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push.bind(i),i.push=function(t){var e=t[0],i=t[1],r=t[2];for(var s in i)l.o(i,s)&&(l.m[s]=i[s]);for(r&&r(l);e.length;)n[e.pop()]=1;a(t)},r=l.x,l.x=function(){return l.e(303).then(r)},_N_E=l.x()}();