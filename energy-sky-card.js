"use strict";(()=>{var L="energy-sky-card",M=`${L}-editor`,dt="Energy Sky Card",Pt="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Nt="https://github.com/macanto44/energy-sky-card",It="0.3.4";function Se(t,e){let n=`${L}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),a=o.pathname.lastIndexOf("/");if(o.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var Y;function Dt(){return customElements.get(M)?Promise.resolve():(Y??(Y=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=Se(M,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(M)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw Y=void 0,t})),Y)}var ke=new Set(["unavailable","unknown","none",""]);function x(t){if(!t||ke.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ae={mw:1e6,kw:1e3,w:1},Le={mwh:1e3,kwh:1,wh:.001};function Ft(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function v(t){let e=x(t);return e===void 0?void 0:e*(Ae[Ft(t)]??1)}function ct(t){let e=x(t);return e===void 0?void 0:e*(Le[Ft(t)]??1)}var Me={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function lt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return Me[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Te(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return Vt(void 0);default:return Vt(t?.locale?.language||t?.language||"en")}}function Vt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function J(t){return{lang:lt(t),decimal:Te(t)}}function w(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function Q(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:w(Math.round(t),0,e),unit:"W"}:{value:w(t/1e3,1,e),unit:"kW"}}function ut({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function E(t,e){return ut(Q(t,e))}function pt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":w(t,1,e)}function Wt(t,e){let n=pt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Kt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,e)}\xA0V`}function Z(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function zt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,n)} ${e||"\xB0C"}`}var ft=20,$e=["warning","alarm"],T={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},ht="mdi:gauge",V=Object.keys(T),W=4;function Gt(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var gt=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",Bt=t=>typeof t=="object"&&t!==null&&!gt(t)&&typeof t.type=="string",Re=t=>typeof t=="string"?t:Bt(t)?t.type:void 0;function He(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function mt(t){if(!t.cells)return He(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,W).flatMap((n,r)=>{if(gt(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=Re(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...Bt(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function Ut(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function H(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function K(t,e){let n=H(t).map(r=>v(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var Xt=(t,e)=>t===void 0||!e?t:-t;function yt(t,e){return Xt(v(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function bt(t,e){return Xt(v(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function qt(t){let e=[...H(t),t.consumption_entity,...(t.cells??[]).filter(gt).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Oe(t,e){let n=(t.daily_production_entities??[]).map(r=>ct(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function Pe(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Ne(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Ie(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??$e).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function De(t,e,n,r){let o=x(e.states[t.battery?.soc_entity??""]),a=Pe(bt(t,e),r),i=o===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=Ne(t,e),d=e.states[t.battery?.temperature_entity??""],l=x(d),c=Z(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${zt(l,u,n)}`,extra:s?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${w(Math.round(l),0,n)}\xB0`,extra:s?"\u202F\u2713":""},bare:c}}}function Fe(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:E(yt(t,e),n),extra:"",extraShort:""}}function Ve(t,e,n){let r=t.grid?.voltage_entity?x(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:Ie(t,e)?y(n.lang,"outage"):Kt(r,n),extra:"",extraShort:""}}function We(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:Wt(ct(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Ke(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:E(v(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function ze(t,e,n){let r=t.custom,o=e.states[r.entity],a=String(o?.attributes.unit_of_measurement??""),i;if(!o||x(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(a))i=E(v(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=x(o);i=d===void 0?o.state:ut({value:w(d,Number.isInteger(d)?0:1,n),unit:a})}let s=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||ht;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:s}}function je(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Ge(t,e,n){let r=je(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:Q(v(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=x(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:w(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:Q(K(t,e),n)}}function Yt(t,e){let n=J(e),r=t.battery?.power_threshold??ft,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:pt(Oe(t,e),n)}):void 0,a=mt(t).map(c=>{switch(c.kind){case"battery":return De(t,e,n,r);case"grid":return Fe(t,e,n);case"voltage":return Ve(t,e,n);case"tomorrow":return We(t,e,n);case"consumption":return Ke(t,e,n);case"custom":return ze(c,e,n)}}),{hero:i,label:s,labelShort:d=s}=Ge(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(s),contextShort:l(d),metrics:a}}var Jt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},Qt="Bleu";var Kn=[255/255,214/255,140/255],Be=.55;var xt=6e3,tt=.45,et={x:0,y:-30,radius:100},Zt=[8,18,40],wt=.2,te=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],Ue=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,ee=t=>typeof t=="string"&&Ue.test(t);function Xe(t,e){let n={...Jt,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(a=>a.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[Qt]??Jt[Qt]}function ne(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=K(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:xt,a=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:Xe(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*Be*1e3)/1e3,producing:r>0}}var _t={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},qe={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},C=Object.keys(_t),oe=20,P=t=>Math.max(t??0,0);function Ye(t,e,n,r){let o=P(t),a=P(e===void 0?void 0:-e),i=P(e),s=P(n),d=P(n===void 0?void 0:-n),l=Math.min(a,o);o-=l;let c=Math.min(a-l,d),u=Math.min(s,o);o-=u;let h=Math.min(s-u,i),p={sh:o,sg:l,sb:u,gh:i-h,bh:d-c,gb:h,bg:c};for(let g of C)p[g]<oe&&(p[g]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function Je(t){return t<oe?0:t<500?1:t<1500?2:t<3e3?3:4}function vt(t,e){switch(e){case"solar":return H(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}function re(t,e){let n=J(e),r=K(t,e),o=yt(t,e),a=bt(t,e),i=t.battery?.power_threshold??ft,s=a!==void 0&&Math.abs(a)<=i?0:a,d=v(e.states[t.consumption_entity??""]),l=Ye(r,o,s,d),c=t.production_max&&t.production_max>0?t.production_max:xt,u=x(e.states[t.battery?.soc_entity??""]),h={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},p=h.sun+h.grid+h.batt,f=m=>m==="solar"||m==="home"||!!vt(t,m),g=Object.fromEntries(C.map(m=>[m,Je(l.wires[m])]));return{nodes:{solar:{present:f("solar"),label:y(n.lang,"solar"),value:E(r,n),ring:[[Math.min(P(r)/c,1),"sun"]]},grid:{present:f("grid"),label:y(n.lang,"grid"),value:E(o,n),ring:[]},battery:{present:f("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?E(a,n):Z(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:f("home"),label:y(n.lang,"home"),value:E(l.home,n),ring:p>0?["sun","batt","grid"].filter(m=>h[m]>0).map(m=>[h[m]/p,m]):[]}},levels:g,off:C.filter(m=>!qe[m].every(f))}}var S=220,N=46,Qe=12;function Ze([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,a]=e,i=1-r,s=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*a[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(a[l]-o[l])+3*r*r*(n[l]-a[l]);return{at:[s(0),s(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var z=t=>Math.round(t*10)/10,O=([t,e])=>`${z(t)},${z(e)}`,nt=27;function ie(t){let e=Math.max(t,160),n=Math.round(Math.min(Math.max((e-48)/2,96),128)),r=Math.round(Math.min(n+20,e-n-32)),o=r/2,a=N/2,i=S/2,s=3+a,d=S-3-a,l=e/2,c=n-nt,u=e-n+nt,h=l-o+nt,p=l+o-nt,f=(b,A)=>{let F=(A[1]-b[1])/2;return[b,[[b[0],b[1]+F],[A[0],A[1]-F]],A]},g={sh:[[n,i],null,[e-n,i]],sg:f([c,i-a],[h,s+a]),gh:f([p,s+a],[u,i-a]),sb:f([c,i+a],[h,d-a]),bh:f([p,d-a],[u,i+a]),gb:[[l,s+a],null,[l,d-a]],bg:[[l,d-a],null,[l,s+a]]},m={},U="";for(let b of C){let A=g[b],[F,X,Ht]=A;m[b]=X?`M${O(F)} C${O(X[0])} ${O(X[1])} ${O(Ht)}`:`M${O(F)} L${O(Ht)}`;let q=X?Qe:1,st=[];for(let R=0;R<=q;R++){let{at:Ot,deg:Ee}=Ze(A,R/q),Ce=R===0||R===q?" opacity: 0;":"";st.push(`${z(R/q*100)}% { transform: translate(${z(Ot[0])}px, ${z(Ot[1])}px) rotate(${Math.round(Ee)}deg);${Ce} }`)}st.push("10%, 90% { opacity: 1; }"),U+=`@keyframes esc-flow-${b} { ${st.join(" ")} }
`}return{nodeWidth:n,centreWidth:r,paths:m,keyframes:U}}var Et=t=>`rgba(${Zt.join(", ")}, ${t})`,ae=t=>`${Math.round(t*1e3)/10}%`,tn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${ae(1-tt/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${ae((.6-tt)/(1-tt))}, var(--esc-c2, #1d4f87) 100%)`,se=`${et.x}px ${et.y}px`,de={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8"},en=.14,nn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],on=(S-N)/2,j=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,ce=`
:host {
    display: block;
    height: 100%;
    /* Apple's system font on iPhone and Mac, Home Assistant's body font elsewhere */
    --esc-font: system-ui, -apple-system, "SF Pro Text", var(--ha-font-family-body, Roboto), sans-serif;
    --esc-font-display: system-ui, -apple-system, "SF Pro Display", var(--ha-font-family-body, Roboto), sans-serif;
    --esc-hero-size: 56px;
}
ha-card {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    color: #fff;
    background: #0b1026;
    border: none;
    -webkit-tap-highlight-color: transparent;
}
/* The sky: two layers, day and night, one shown at a time */
.sky { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.layer { position: absolute; inset: 0; opacity: 0; }
:host([data-mode="day"]) .layer.day,
:host([data-mode="night"]) .layer.night { opacity: 1; }
.layer.day { background: linear-gradient(180deg, var(--esc-c0, #4b90d5) 0%, var(--esc-c1, #2169b0) 60%, var(--esc-c2, #1d4f87) 100%); }
.layer.night { background: linear-gradient(180deg, #1d2b4d 0%, #0b1026 100%); }
.halo {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 88% 12%, rgb(255, 214, 140), rgba(255, 214, 140, 0) 45%);
    opacity: var(--esc-halo-alpha, 0);
    transform-origin: 88% 12%;
}
.star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
    opacity: var(--esc-o, 1);
}
.star.twinkle { opacity: calc(var(--esc-o, 1) * 0.6); }
/* Particles the card hid because they would touch text */
.sky [hidden] { display: none; }
/* Shooting stars, each on its own path and rhythm (set inline); hidden unless animated */
.shooting {
    position: absolute;
    width: 64px;
    height: 1.5px;
    border-radius: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff);
    opacity: 0;
    transform-origin: 100% 50%;
}
/*
 * By day, cloud shadows: soft dark bands, each in a card-wide .drift that
 * crosses from -110 % to 110 % (the cloud fully off both edges). They only
 * darken the sky; without motion they rest where they are.
 */
.drift { position: absolute; inset: 0; }
.cloud {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(closest-side, ${Et(wt)}, ${Et(wt/2)} 50%, ${Et(0)} 100%);
}
/*
 * Motion. data-motion on the host: "on" runs, "paused" holds (tab hidden,
 * card off-screen: the phase is kept), "off" never animates (animate: false,
 * prefers-reduced-motion). Every animation below is declared under on or
 * paused only; test/motion.test.ts holds the stylesheet to that.
 */
@keyframes esc-breathe {
    from { opacity: calc(var(--esc-halo-alpha, 0) * 0.55); transform: scale(1); }
    to { opacity: calc(var(--esc-halo-alpha, 0) * 1); transform: scale(1.12); }
}
@keyframes esc-twinkle {
    from { opacity: calc(var(--esc-o, 1) * 0.15); transform: translate(-50%, -50%) scale(0.6); }
    to { opacity: var(--esc-o, 1); transform: translate(-50%, -50%) scale(1.4); }
}
/* One pass in the first 8 % of each period (0.9 s of 11 s), quiet the rest of the time */
@keyframes esc-shoot {
    0% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(0) scaleX(0.3); }
    2% { opacity: 1; }
    8% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(var(--esc-shoot-run, 110px)) scaleX(1); }
    100% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(var(--esc-shoot-run, 110px)) scaleX(1); }
}
/* A cloud's band crossing the card, left to right */
@keyframes esc-drift {
    from { transform: translateX(-110%); }
    to { transform: translateX(110%); }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
${j('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${j('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${j('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${j('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${j("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .drift, .layer, .comet { animation: none !important; transition: none !important; }
}
/* Compact: the tight spacing, for a card shorter than four rows (fit() sets it last) */
:host([data-compact]) .content { padding: 14px 20px 12px; }
:host([data-compact]) .context { margin: 0 0 6px; }
:host([data-compact]) .grid { padding-top: 7px; row-gap: 4px; }
:host([data-compact]) .value { margin-top: 0; }
ha-card:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
/* A cell with a tap of its own (its entity, or its tap_action) */
.metric[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }
.content {
    position: relative;
    z-index: 1;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* The prototype's air: ~27 px above the hero, 22 px under the last value */
    padding: 22px 20px 16px;
    font-family: var(--esc-font);
}
.content > * { flex-shrink: 0; }
.line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hero {
    font-family: var(--esc-font-display);
    font-size: var(--esc-hero-size);
    font-weight: 200;
    line-height: 0.9;
    letter-spacing: -0.045em;
    font-variant-numeric: tabular-nums;
    /* Room for the comma's tail below the baseline */
    padding: 2px 0 3px;
}
:host([data-layout="side"]) { --esc-hero-size: 44px; }
:host([data-hero="48"]) { --esc-hero-size: 48px; }
:host([data-hero="40"]) { --esc-hero-size: 40px; }
:host([data-hero="36"]) { --esc-hero-size: 36px; }
.hero-unit {
    font-size: 0.4em;
    font-weight: 400;
    letter-spacing: 0;
    opacity: 0.85;
    /* A word space, as in the prototype's \xAB 1,3 kW \xBB */
    margin-left: 0.45em;
}
.context {
    margin-top: 12px;
    margin-bottom: 16px;
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: -0.012em;
}
.grid {
    /* Anchored to the bottom; at least the prototype's gap above the hairline */
    margin-top: auto;
    padding-top: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 12px;
}
.grid:empty { display: none; }
.metric { min-width: 0; }
.label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 13px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.75;
}
.label-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.label ha-icon { --mdc-icon-size: 13px; width: 13px; height: 13px; display: inline-flex; flex: none; }
.value {
    font-size: 16px;
    font-weight: 500;
    line-height: 21px;
    font-variant-numeric: tabular-nums;
    margin-top: 5px;
}
.extra { font-size: 13px; font-weight: 400; opacity: 0.8; }
/*
 * Side layout (layout: side, 2 rows): the hero and context on the left, the
 * cells listed on the right, one line each, the icon standing for the label
 * (still read by screen readers, and shown on hover).
 */
:host([data-layout="side"]) .layer.day { background: ${tn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${et.radius}px at ${se}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${se};
}
:host([data-layout="side"]) .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    grid-template-rows: auto auto;
    align-content: center;
    column-gap: 16px;
    padding: 14px 18px 12px 20px;
}
:host([data-layout="side"]) .hero { grid-column: 1; grid-row: 1; align-self: end; }
:host([data-layout="side"]) .hero:has(+ .context[hidden]) { grid-row: 1 / 3; align-self: center; }
:host([data-layout="side"]) .context {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    margin: 8px 0 0;
    font-size: 15px;
    line-height: 20px;
    /* Too long for one line beside the cells (fit() tries that first): two lines, never cut */
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
:host([data-layout="side"]) .context[hidden] { display: none; }
:host([data-layout="side"]) .grid {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
    margin: 0;
    padding: 0 0 0 16px;
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.22);
    grid-template-columns: max-content;
    row-gap: 3px;
}
:host([data-layout="side"]) .metric { display: flex; align-items: center; gap: 8px; }
:host([data-layout="side"]) .label { position: relative; flex: none; }
:host([data-layout="side"]) .label ha-icon { --mdc-icon-size: 15px; width: 15px; height: 15px; }
:host([data-layout="side"]) .label-text { position: absolute; top: 0; left: 0; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
:host([data-layout="side"]) .value { margin-top: 0; font-size: 15px; line-height: 20px; }
:host([data-layout="side"]) .extra { font-size: 12.5px; }
:host([data-layout="side"][data-compact]) .content { padding: 8px 16px 6px 18px; }
:host([data-layout="side"][data-compact]) .context { margin-top: 4px; }
:host([data-layout="side"][data-compact]) .grid { row-gap: 0; }
/*
 * Expandable (expandable: true): the card sets its own height (the grid's
 * rows: auto), the sky stays on the top part at its usual height, and the
 * flow unfolds below on the gradient's last colour (the darkest).
 */
:host([data-expandable]) { height: auto; --esc-top-h: 248px; }
:host([data-expandable][data-layout="side"]) { --esc-top-h: 120px; }
:host([data-expandable]) ha-card { height: auto; }
:host([data-expandable]) .content { height: var(--esc-top-h); }
:host([data-expandable]) .sky { bottom: auto; height: var(--esc-top-h); }
:host([data-expandable][data-mode="day"]) ha-card { background: var(--esc-c2, #1d4f87); }
:host([data-ready][data-expandable]:not([data-motion="off"])) ha-card { transition: background-color 3s ease-in-out; }
:host([data-expandable]) .hero, :host([data-expandable]) .context { cursor: pointer; }
:host([data-expandable]) .hero:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }
.grabber { position: absolute; left: 50%; bottom: 5px; width: 28px; height: 3px; margin-left: -14px; border-radius: 2px; background: rgba(255, 255, 255, 0.35); }
.panel { position: relative; z-index: 1; margin: 0 20px; padding: 10px 0 14px; border-top: 1px solid rgba(255, 255, 255, 0.22); font-family: var(--esc-font); }
:host([data-layout="side"]) .panel { margin: 0 18px 0 20px; }
.flow { position: relative; height: ${S}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wire path { fill: none; stroke: currentColor; stroke-linecap: round; }
.wire .line { stroke-opacity: 0.55; stroke-width: var(--esc-w); }
.wire .glow { stroke-opacity: 0.16; stroke-width: calc(var(--esc-w) + 6px); }
.wire[data-level="0"] .line { stroke: #fff; stroke-opacity: 0.16; stroke-width: 1.2px; stroke-dasharray: 2 5; }
.wire[data-level="0"] .glow, .wire[data-off] { display: none; }
/* Grid \u2194 battery: one link, dotted while idle; battery \u2192 grid is drawn only while a battery sells (it lies on the same line) */
.wire[data-wire="bg"][data-level="0"] { display: none; }
/* The bridge: where grid \u2194 battery passes under sun \u2192 home, a gap of the panel's colour */
.panel { --esc-panel: var(--esc-c2, #1d4f87); }
:host([data-mode="night"]) .panel { --esc-panel: #0b1026; }
.wire .gap { stroke: var(--esc-panel); stroke-opacity: 1; stroke-width: 10px; stroke-linecap: butt; }
${nn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.entries(de).map(([t,e])=>`.wire.${t} { color: ${e}; }`).join(" ")}
${C.map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
/* Comets: none without motion; one at level 1, two at 2, three above, evenly spaced */
.comet { display: none; }
.comet circle { fill: currentColor; }
/* Spare comets of a quieter wire: hidden, still in step for when the wire gets busier */
.wire[data-level="1"] .c2, .wire[data-level="1"] .c3, .wire[data-level="2"] .c3 { visibility: hidden; }
.wire[data-level="2"] .c2 { --esc-delay: calc(var(--esc-dur) * -0.5); }
.wire[data-level="3"] .c2, .wire[data-level="4"] .c2 { --esc-delay: calc(var(--esc-dur) * -0.333); }
.wire[data-level="3"] .c3, .wire[data-level="4"] .c3 { --esc-delay: calc(var(--esc-dur) * -0.667); }
.node {
    position: absolute;
    top: ${on}px;
    width: var(--esc-node-w);
    height: ${N}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${N/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${en}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: ${S-3-N}px; }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.entries(de).map(([t,e])=>`.seg[data-source="${t}"] { stroke: ${e}; }`).join(" ")}
.disc ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; display: inline-flex; }
.centre { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.node[data-centre] .disc ha-icon, .node:not([data-centre]) .centre { display: none; }
.ntext { min-width: 0; display: flex; flex-direction: column; }
.nlab { font-size: 9.5px; font-weight: 600; line-height: 12px; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.78; }
.nval { font-size: 15px; font-weight: 500; line-height: 19px; font-variant-numeric: tabular-nums; }
.flow[data-narrow] .nval { font-size: 13.5px; }
.flow[data-narrow] .nlab { font-size: 8.5px; }
.flow[data-narrow] .node { gap: 6px; padding: 0 8px 0 5px; }
.flow[data-narrow] .disc { width: 32px; height: 32px; }
.flow[data-narrow] .ring { width: 38px; height: 38px; }
`;var Ct={cols:10,rows:6},rn=[1,.9,.8,.7,.6,.5],an=.4,sn=3,dn=1.4;function cn(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var I=(t,e=1)=>Math.round(t*10**e)/10**e;function ln(t,e,n,r){return{x:I((e+.1+t()*.8)/r.cols*100),y:I((n+.1+t()*.8)/r.rows*100)}}function un(t=24301){let e=cn(t),n=[];for(let r=0;r<Ct.rows;r++)for(let o=0;o<Ct.cols;o++){let a=e()<rn[r],{x:i,y:s}=ln(e,o,r,Ct),d=1.4+e()*.8,l=e()<an,c=I(e()*5,2);if(!a)continue;let u=s/100;n.push({x:i,y:s,size:I(d*(1-.3*u),2),opacity:I(1-.45*u,2),twinkle:l,delay:c})}return n}var pn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],fn=t=>I(t.size/2*(t.twinkle?dn:1)+sn,2);function le(t=un()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${fn(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+pn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var ue=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var hn="(prefers-reduced-motion: reduce)";function gn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var ot=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(hn),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return gn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var mn=["bleu","blanc","rouge"],kt=/tomorrow|demain/i,yn=/today|daily|jour|_day(_|$)/i,bn=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function xn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function wn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!kt.test(e.entity_id)&&mn.includes(String(e.state).toLowerCase()))?.entity_id}function G(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var rt=t=>(e,n)=>n===t,it=t=>t[0];function St(t,e,n){return(e&&t.states[e]?e:void 0)??it(G(t,n,rt("power")))}function _n(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),a=[...new Set(o.map(c=>St(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];a.length&&(r.production_entity=a.length===1?a[0]:a);let i=[...new Set(o.flatMap(c=>G(e,c.stat_energy_from,(u,h)=>h==="energy"&&yn.test(u)&&!bn.test(u)&&!kt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&kt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let s=n.find(c=>c.type==="battery");if(s){let c=s.stat_energy_from??s.stat_energy_to,u=(s.stat_soc&&e.states[s.stat_soc]?s.stat_soc:void 0)??it(G(e,c,rt("battery"))),h=s.power_config?.stat_rate??s.stat_rate,p=St(e,h,c),f=it(G(e,c,rt("temperature"))),g={};u&&(g.soc_entity=u),p&&(g.power_entity=p),p&&h&&p===h&&(g.invert=!0),f&&(g.temperature_entity=f),Object.keys(g).length&&(r.battery=g)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,h=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let g=St(e,h,c);g&&(p.power_entity=g)}let f=it(G(e,c,rt("voltage")));f&&(p.voltage_entity=f),Object.keys(p).length&&(r.grid=p)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function pe(t,e){let n=t?_n(e,t):{},r=wn(t);return{production_entity:xn(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function fe(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var at=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",D=t=>t!==void 0&&t.action!=="none";function me(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])at(n[o])&&(r[o]=n[o]);return r}function ye(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:D(t.tap_action)}function he(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function B(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&he(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...a}=e;D(r)&&he(t,"hass-action",{config:a,action:n})}var At=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{D(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,D(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,B(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!D(e.double_tap_action)){B(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,B(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,B(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());ye(o)&&(e.preventDefault(),B(this.host,o,"tap"))}},ge=new WeakSet;function be(t,e,n){ge.has(t)||(ge.add(t),new At(t,e,n))}function xe(t,e){let n=ye(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=D(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var vn=[56,48,40],En=[44,40,36],we=[0,1,2],Lt=[0,1,2,3],$t=[["solar",T.tomorrow],["grid",T.grid],["battery",T.battery],["home",T.consumption]],Mt=2*Math.PI*17;function _(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Cn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),Tt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),_e=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,Sn=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]]],kn=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],An=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],Cn,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Ln(t){if(!t||typeof t!="object")throw _("Configuration invalide","Invalid configuration");let e=t;for(let[o,a]of kn)if(Tt(e,o)!==void 0)throw _(`${o} n'existe plus : ${a.fr}`,`${o} is gone: ${a.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw _("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,a]of Sn){let i=Tt(e,o);if(i!==void 0&&!a.includes(i))throw _(`${o} : ${_e(a,"ou")}`,`${o}: ${_e(a,"or")}`)}for(let[o,a,i,s]of An)for(let d of o)if(!a(Tt(e,d)))throw _(`${d} ${i}`,`${d} ${s}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>W)throw _(`cells : une liste de ${W} cases au plus`,`cells: a list of at most ${W} cells`);for(let o of e.cells){let a=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?V.includes(o):typeof a.entity=="string"&&!!a.entity||V.includes(a.type))){let s=String(typeof o=="object"?JSON.stringify(o):o);throw _(`cells : \xAB ${s} \xBB n'est ni ${V.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${s}" is neither ${V.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(a.tap_action!==void 0&&!at(a.tap_action))throw _("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw _("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(ee))throw _(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e}var Rt=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new ot(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Ln(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=n&&this.config?.expandable===!0;if(r===this.open&&this.hasAttribute("data-expanded")===r)return;this.open=r,this.toggleAttribute("data-expanded",r);let o=this.refs?.flow;o&&(o.panel.hidden=!r),this.config?.expandable&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(r)),this.fit()}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=mt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),this.toggleAttribute("data-expandable",n.expandable===!0),this.flowWidth=0,this.fitted="",this.root.innerHTML=`
            <style>${ce}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Mn()}</div>
                    <div class="layer night">${le()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    ${n.expandable?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${r.map(i=>`
                        <div class="metric" data-metric="${i.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.expandable?Tn():""}
            </ha-card>`;let o=(i,s=this.root)=>ve(s,i);this.refs={card:o("ha-card"),flow:n.expandable?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let s=o(`[data-metric="${i.key}"]`),d=o("ha-icon",s);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||ht:T[i.kind]),[i.key,{el:s,icon:d,label:o(".label-text",s),value:o(".value-main",s),extra:o(".extra",s)}]}))},this.actions=me(n,H(n)[0]);let a=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let s=Ut(n,i),d=at(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:s,tap:d}]]:a&&s?[[i.key,{entity:s}]]:[]})),n.expandable){let i=this.refs.heroValue.parentElement;for(let s of[i,this.refs.context,this.refs.flow.panel])s.dataset.cellTarget="",s.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false");for(let[s]of $t){let d=vt(n,s);if(!d)continue;this.cellTargets.set(`node:${s}`,{entity:d});let l=this.refs.flow.nodes.get(s).el;l.dataset.cellTarget="",l.setAttribute("role","button"),l.tabIndex=0}}for(let[i,s]of this.cellTargets){if(i.startsWith("node:"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",s.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}be(this.refs.card,this,i=>this.actionsFor(i)),xe(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.metric??"",a=r?this.cellTargets.get(o):void 0;if(!a)return this.actions;let{tap_action:i,...s}=this.actions;return{...s,entity:a.entity??this.actions.entity,...a.tap?{tap_action:a.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=ie(r);n.svg.setAttribute("viewBox",`0 0 ${r} ${S}`),n.box.style.setProperty("--esc-node-w",`${o.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${o.centreWidth}px`),n.box.toggleAttribute("data-narrow",o.nodeWidth<112);for(let[a,i]of n.wires)for(let s of i.paths)s.setAttribute("d",o.paths[a]);n.keyframes.textContent=o.keyframes}flowRefs(){let n=(r,o=this.root)=>ve(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(C.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map($t.map(([r])=>{let o=n(`[data-node="${r}"]`);return[r,{el:o,label:n(".nlab",o),value:n(".nval",o),centre:n(".centre",o),segs:[...o.querySelectorAll(".seg")]}]}))}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=re(this.config,this._hass);for(let[o,a]of n.nodes){let i=r.nodes[o];a.el.hidden===i.present&&(a.el.hidden=!i.present),k(a.label,i.label),k(a.value,i.value),k(a.centre,i.centre??""),a.el.toggleAttribute("data-centre",i.centre!==void 0);let s=0;a.segs.forEach((d,l)=>{let c=i.ring[l],u=c?Math.max(Mt*c[0]-(i.ring.length>1?3:0),0):0;$(d,"stroke-dasharray",`${u.toFixed(1)} ${Mt.toFixed(1)}`),$(d,"stroke-dashoffset",(-s).toFixed(1)),$(d,"data-source",c&&u>=1.5?c[1]:""),c&&(s+=Mt*c[0])})}for(let[o,a]of n.wires)$(a.g,"data-level",String(r.levels[o])),$(a.g,"data-off",r.off.includes(o)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(a=>a.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let a of n.querySelectorAll(".star")){let i=r.left+parseFloat(a.style.left)/100*r.width,s=r.top+parseFloat(a.style.top)/100*r.height,d=ue(i,s,Number(a.dataset.reach),o);a.hidden!==d&&(a.hidden=d)}}writeForms(n){this.form=n,$(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:a,extra:i}=Gt(r,n);k(o.value,a),k(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&k(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),a=n.heroValue.parentElement,i=n.context,s=[...n.metrics.values()].map(f=>f.value.parentElement),d=f=>f.scrollWidth>f.clientWidth+1,l=()=>parseFloat(getComputedStyle(i).lineHeight)||20,c=()=>!i.hidden&&(d(i)||i.scrollHeight>l()+1),u=f=>!d(a)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!f||(r?!c():!s.some(d))),h=r?En:vn,p=(f,g)=>{for(let m of[!1,!0]){this.toggleAttribute("data-compact",m);for(let U of g){this.writeForms(U);for(let b of h)if($(this,"data-hero",b===h[0]?null:String(b)),u(f))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,we)||p(!1,we.slice(-1)),this.writeContext(!i.hidden&&d(i));return}p(!0,Lt)||(this.writeContext(!0),!p(!0,Lt)&&(this.writeContext(!1),p(!1,Lt),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=qt(this.config);return[lt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=Yt(this.config,this._hass),o=this.refs;this.paintSky(),k(o.heroValue,r.hero.value),k(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let s=o.metrics.get(i.key);s&&(k(s.label,i.label),this.side&&s.el.title!==i.label&&(s.el.title=i.label),i.icon&&s.icon.getAttribute("icon")!==i.icon&&s.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow();let a=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);a!==this.fitted&&(this.fitted=a,this.fit())}paintSky(){let n=ne(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,a)=>r.style.setProperty(`--esc-c${a}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.expandable?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return pe(n,await fe(n))}static async getConfigElement(){return customElements.get(M)||await Dt(),document.createElement(M)}};function Mn(){return te.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Tn(){let t=[1,2,3].map(o=>`<g class="comet c${o}"><circle cx="-8" r="1.3" opacity="0.25"></circle><circle cx="-4" r="1.8" opacity="0.5"></circle><circle r="2.5"></circle></g>`).join(""),n=["gb","bg",...C.filter(o=>o!=="gb"&&o!=="bg")].map(o=>`<g class="wire ${_t[o]}" data-wire="${o}" data-level="0">${o==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${t}</g>`).join(""),r=$t.map(([o,a])=>`
        <div class="node" data-node="${o}">
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon icon="${a}"></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${S}">${n}</svg>${r}</div></div>`}function ve(t,e){return t.querySelector(e)}function $(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function k(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(L)||(customElements.define(L,Rt),window.customCards=window.customCards||[],window.customCards.push({type:L,name:dt,description:Pt,preview:!0,documentationURL:Nt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${dt} %c ${It} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
