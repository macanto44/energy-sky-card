"use strict";(()=>{var A="energy-sky-card",k=`${A}-editor`,nt="Energy Sky Card",St="Solar production, battery and grid on a sky that follows the tariff colour and the sun",At="https://github.com/macanto44/energy-sky-card",kt="0.3.2";function ge(t,e){let n=`${A}.js`;for(let{src:o}of e){let r=new URL(o,"http://local/"),s=r.pathname.lastIndexOf("/");if(r.pathname.slice(s+1)===n)return o.replace(n,`${t}.js`)}return`${t}.js`}var B;function Tt(){return customElements.get(k)?Promise.resolve():(B??(B=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=ge(k,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(k)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw B=void 0,t})),B)}var me=new Set(["unavailable","unknown","none",""]);function w(t){if(!t||me.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var ye={mw:1e6,kw:1e3,w:1},be={mwh:1e3,kwh:1,wh:.001};function Lt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function _(t){let e=w(t);return e===void 0?void 0:e*(ye[Lt(t)]??1)}function ot(t){let e=w(t);return e===void 0?void 0:e*(be[Lt(t)]??1)}var xe={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function rt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function g(t,e,n={}){return xe[t][e].replace(/\{(\w+)\}/g,(o,r)=>n[r]??"")}function we(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return Mt(void 0);default:return Mt(t?.locale?.language||t?.language||"en")}}function Mt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function G(t){return{lang:rt(t),decimal:we(t)}}function v(t,e,n){let o=t.toFixed(e);return(/^-0(\.0+)?$/.test(o)?o.slice(1):o).replace(".",n.decimal)}function U(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:v(Math.round(t),0,e),unit:"W"}:{value:v(t/1e3,1,e),unit:"kW"}}function it({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function E(t,e){return it(U(t,e))}function at(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":v(t,1,e)}function $t(t,e){let n=at(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Ht(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${v(Math.round(t),0,e)}\xA0V`}function X(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${v(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function Rt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${v(Math.round(t),0,n)} ${e||"\xB0C"}`}var ve=20,_e=["warning","alarm"];function Pt(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:o,...r}=t,{lock_entities:s,...i}=t.battery??{};return n&&(i.soc_reached_entities??(i.soc_reached_entities=s)),e&&(i.power_threshold??(i.power_threshold=o)),{...r,battery:i}}var T={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},st="mdi:gauge",W=Object.keys(T),D=4,dt=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",Nt=t=>typeof t=="object"&&t!==null&&!dt(t)&&typeof t.type=="string",Ee=t=>typeof t=="string"?t:Nt(t)?t.type:void 0;function Ce(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function lt(t){if(!t.cells)return Ce(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,D).flatMap((n,o)=>{if(dt(n))return[{key:`custom-${o}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let r=Ee(n);return!r||e.has(r)?[]:(e.add(r),[{key:r,kind:r,...Nt(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function It(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function Wt(t){return t.cell_tap==="card"?!1:t.cell_tap==="more-info"||t.tap_action===void 0}function M(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function F(t,e){let n=M(t).map(o=>_(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}var Dt=(t,e)=>t===void 0||!e?t:-t;function ct(t,e){return Dt(_(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function ut(t,e){return Dt(_(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function Ft(t){let e=[...M(t),t.consumption_entity,...(t.cells??[]).filter(dt).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Se(t,e){let n=(t.daily_production_entities??[]).map(o=>ot(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}function Ae(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function ke(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(o=>e.states[o]?.state==="on")}function Te(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??_e).map(r=>String(r).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Le(t,e,n,o){let r=w(e.states[t.battery?.soc_entity??""]),s=Ae(ut(t,e),o),i=r===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=ke(t,e),d=e.states[t.battery?.temperature_entity??""],u=w(d),l=X(r,n)+i,c=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:g(n.lang,"battery"),value:u===void 0?l:`${l} \xB7 ${Rt(u,c,n)}`,extra:a?` \xB7 ${g(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${g(n.lang,"soc_reached_short")}`:"",...u===void 0?{}:{tight:{value:`${l}\u202F\xB7\u202F${v(Math.round(u),0,n)}\xB0`,extra:a?"\u202F\u2713":""},bare:l}}}function Me(t,e,n){return{key:"grid",label:g(n.lang,"grid"),value:E(ct(t,e),n),extra:"",extraShort:""}}function $e(t,e,n){let o=t.grid?.voltage_entity?w(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:g(n.lang,"voltage"),value:Te(t,e)?g(n.lang,"outage"):Ht(o,n),extra:"",extraShort:""}}function He(t,e,n){return{key:"tomorrow",label:g(n.lang,"tomorrow"),value:$t(ot(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Re(t,e,n){return{key:"consumption",label:g(n.lang,"consumption"),value:E(_(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Oe(t,e,n){let o=t.custom,r=e.states[o.entity],s=String(r?.attributes.unit_of_measurement??""),i;if(!r||w(r)===void 0&&["unavailable","unknown",""].includes(r.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=E(_(r),n);else if(e.formatEntityState)i=e.formatEntityState(r);else{let d=w(r);i=d===void 0?r.state:it({value:v(d,Number.isInteger(d)?0:1,n),unit:s})}let a=o.icon||(typeof r?.attributes.icon=="string"?r.attributes.icon:"")||st;return{key:t.key,label:o.name||String(r?.attributes.friendly_name??o.entity),value:i,extra:"",extraShort:"",icon:a}}function Pe(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Ne(t,e,n){let o=Pe(t,e)?t.night_hero??"production":"production";if(o==="consumption"&&t.consumption_entity)return{hero:U(_(e.states[t.consumption_entity]),n),label:g(n.lang,"consumption"),labelShort:g(n.lang,"consumption_short")};if(o==="battery"&&t.battery?.soc_entity){let r=w(e.states[t.battery.soc_entity]);return{hero:r===void 0?{value:"\u2014",unit:""}:{value:v(Math.round(r),0,n),unit:"%"},label:g(n.lang,"battery")}}return{hero:U(F(t,e),n)}}function Vt(t,e){let n=G(e),o=t.battery?.power_threshold??ve,r=t.daily_production_entities?.length?g(n.lang,"produced",{value:at(Se(t,e),n)}):void 0,s=lt(t).map(l=>{switch(l.kind){case"battery":return Le(t,e,n,o);case"grid":return Me(t,e,n);case"voltage":return $e(t,e,n);case"tomorrow":return He(t,e,n);case"consumption":return Re(t,e,n);case"custom":return Oe(l,e,n)}}),{hero:i,label:a,labelShort:d=a}=Ne(t,e,n),u=l=>l?[l,r].filter(Boolean).join(" \xB7 "):r;return{hero:i,context:u(a),contextShort:u(d),metrics:s}}var Kt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},zt="Bleu";var $n=[255/255,214/255,140/255],Ie=.55;var pt=6e3,q=.45,Y={x:0,y:-30,radius:100},jt=[8,18,40],ft=.2,Bt=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],We=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Gt=t=>typeof t=="string"&&We.test(t);function De(t,e){let n={...Kt,...t.tariff_palettes??{}},o=String(e??"").toLowerCase(),r=Object.keys(n).find(s=>s.toLowerCase()===o);return r?n[r]:t.tariff_palettes?.[zt]??Kt[zt]}function Ut(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,o=F(t,e)??0,r=t.production_max&&t.production_max>0?t.production_max:pt,s=Math.min(Math.max(o,0)/r,1);return{mode:n==="below_horizon"?"night":"day",palette:De(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(s*Ie*1e3)/1e3,producing:o>0}}var ht={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},S=Object.keys(ht),Xt=20,$=t=>Math.max(t??0,0);function Fe(t,e,n,o){let r=$(t),s=$(e===void 0?void 0:-e),i=$(e),a=$(n),d=$(n===void 0?void 0:-n),u=Math.min(s,r);r-=u;let l=Math.min(s-u,d),c=Math.min(a,r);r-=c;let f=Math.min(a-c,i),p={sh:r,sg:u,sb:c,gh:i-f,bh:d-l,gb:f,bg:l};for(let h of S)p[h]<Xt&&(p[h]=0);return{wires:p,home:o??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function Ve(t){return t<Xt?0:t<500?1:t<1500?2:t<3e3?3:4}function qt(t,e){switch(e){case"solar":return M(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}function Yt(t,e){let n=G(e),o=F(t,e),r=ct(t,e),s=ut(t,e),i=_(e.states[t.consumption_entity??""]),a=Fe(o,r,s,i),d=t.production_max&&t.production_max>0?t.production_max:pt,u=w(e.states[t.battery?.soc_entity??""]),l={sun:a.wires.sh,grid:a.wires.gh,batt:a.wires.bh},c=l.sun+l.grid+l.batt,f=Object.fromEntries(S.map(p=>[p,Ve(a.wires[p])]));return{nodes:{solar:{present:!0,label:g(n.lang,"solar"),value:E(o,n),ring:[[Math.min($(o)/d,1),"sun"]]},grid:{present:!!t.grid?.power_entity,label:g(n.lang,"grid"),value:E(r,n),ring:[]},battery:{present:!!(t.battery?.power_entity||t.battery?.soc_entity),label:g(n.lang,"battery"),value:t.battery?.power_entity?E(s,n):X(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:!0,label:g(n.lang,"home"),value:E(a.home,n),ring:c>0?["sun","batt","grid"].filter(p=>l[p]>0).map(p=>[l[p]/c,p]):[]}},levels:f}}var C=200,H=46,Ke=12;function ze(t,e,n,o){if(!e)return{at:[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let r=1-o,s=[r*r*t[0]+2*r*o*e[0]+o*o*n[0],r*r*t[1]+2*r*o*e[1]+o*o*n[1]],i=2*r*(e[0]-t[0])+2*o*(n[0]-e[0]),a=2*r*(e[1]-t[1])+2*o*(n[1]-e[1]);return{at:s,deg:Math.atan2(a,i)*180/Math.PI}}var b=t=>Math.round(t*10)/10;function Qt(t){let e=Math.max(t,160),n=Math.round(Math.min(Math.max((e-48)/2,96),128)),o=Math.round(Math.min(n+20,e-n-32)),r=n/2,s=o/2,i=H/2,a=C/2,d=3+i,u=C-3-i,l=r,c=e-r,f=e/2,p={sh:[[n,a],null,[e-n,a]],sg:[[l,a-i],[l,d],[f-s,d]],gh:[[f+s,d],[c,d],[c,a-i]],sb:[[l,a+i],[l,u],[f-s,u]],bh:[[f+s,u],[c,u],[c,a+i]],gb:[[f,d+i],null,[f,u-i]],bg:[[f,u-i],null,[f,d+i]]},x={},h="";for(let tt of S){let[P,N,I]=p[tt];x[tt]=N?`M${b(P[0])},${b(P[1])} Q${b(N[0])},${b(N[1])} ${b(I[0])},${b(I[1])}`:`M${b(P[0])},${b(P[1])} L${b(I[0])},${b(I[1])}`;let j=N?Ke:1,et=[];for(let L=0;L<=j;L++){let{at:Ct,deg:fe}=ze(P,N,I,L/j),he=L===0||L===j?" opacity: 0;":"";et.push(`${b(L/j*100)}% { transform: translate(${b(Ct[0])}px, ${b(Ct[1])}px) rotate(${Math.round(fe)}deg);${he} }`)}et.push("10%, 90% { opacity: 1; }"),h+=`@keyframes esc-flow-${tt} { ${et.join(" ")} }
`}return{nodeWidth:n,centreWidth:o,paths:x,keyframes:h}}var gt=t=>`rgba(${jt.join(", ")}, ${t})`,Jt=t=>`${Math.round(t*1e3)/10}%`,je=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${Jt(1-q/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${Jt((.6-q)/(1-q))}, var(--esc-c2, #1d4f87) 100%)`,Zt=`${Y.x}px ${Y.y}px`,te={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8"},Be=.14,Ge=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],Ue=(C-H)/2,ee=`
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
    background: radial-gradient(closest-side, ${gt(ft)}, ${gt(ft/2)} 50%, ${gt(0)} 100%);
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
:host([data-motion="on"][data-mode="day"][data-producing]) .halo,
:host([data-motion="paused"][data-mode="day"][data-producing]) .halo { animation: esc-breathe 3s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .star.twinkle,
:host([data-motion="paused"][data-mode="night"]) .star.twinkle { animation: esc-twinkle 2s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .shooting,
:host([data-motion="paused"][data-mode="night"]) .shooting { animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="day"]) .drift,
:host([data-motion="paused"][data-mode="day"]) .drift { animation: esc-drift 60s linear infinite; animation-play-state: var(--esc-play); }
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
:host([data-motion="on"][data-expanded]) .wire:not([data-level="0"]) .comet,
:host([data-motion="paused"][data-expanded]) .wire:not([data-level="0"]) .comet { display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow); animation-play-state: var(--esc-play); }
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
.extra-short, :host([data-short-extra]) .extra-full { display: none; }
.context-short, :host([data-short-context]) .context-full { display: none; }
:host([data-short-context]) .context-short { display: inline; }
:host([data-short-extra]) .extra-short { display: inline; }
/* The last resort, for a cell that has it (the battery with its temperature): \xAB 100 % \u2193 \xB7 -13\xB0 \u2713 \xBB */
.value-tight, .extra-tight,
:host([data-tight-extra]) [data-tight] .value-main, :host([data-tight-extra]) [data-tight] .extra { display: none; }
:host([data-tight-extra]) [data-tight] .value-tight, :host([data-tight-extra]) [data-tight] .extra-tight { display: inline; }
/* The side layout's last resort: the complements left out (\xAB 78 % \u2191 \xBB, no temperature) */
.value-bare,
:host([data-no-extra]) .extra, :host([data-no-extra]) .value-tight, :host([data-no-extra]) [data-bare] .value-main { display: none; }
:host([data-no-extra]) [data-bare] .value-bare { display: inline; }
/*
 * Side layout (layout: side, 2 rows): the hero and context on the left, the
 * cells listed on the right, one line each, the icon standing for the label
 * (still read by screen readers, and shown on hover).
 */
:host([data-layout="side"]) .layer.day { background: ${je}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${Y.radius}px at ${Zt}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${Zt};
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
.flow { position: relative; height: ${C}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wire path { fill: none; stroke: currentColor; stroke-linecap: round; }
.wire .line { stroke-opacity: 0.55; stroke-width: var(--esc-w); }
.wire .glow { stroke-opacity: 0.16; stroke-width: calc(var(--esc-w) + 6px); }
.wire[data-level="0"] .line { stroke: #fff; stroke-opacity: 0.16; stroke-width: 1.2px; stroke-dasharray: 2 5; }
.wire[data-level="0"] .glow, .wire[data-off], .wire[data-wire="gb"][data-level="0"], .wire[data-wire="bg"][data-level="0"] { display: none; }
${Ge.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.entries(te).map(([t,e])=>`.wire.${t} { color: ${e}; }`).join(" ")}
${S.map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: ${Ue}px;
    width: var(--esc-node-w);
    height: ${H}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${H/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${Be}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: ${C-3-H}px; }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.entries(te).map(([t,e])=>`.seg[data-source="${t}"] { stroke: ${e}; }`).join(" ")}
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
`;var mt={cols:10,rows:6},Xe=[1,.9,.8,.7,.6,.5],qe=.4,Ye=3,Qe=1.4;function Je(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var R=(t,e=1)=>Math.round(t*10**e)/10**e;function Ze(t,e,n,o){return{x:R((e+.1+t()*.8)/o.cols*100),y:R((n+.1+t()*.8)/o.rows*100)}}function tn(t=24301){let e=Je(t),n=[];for(let o=0;o<mt.rows;o++)for(let r=0;r<mt.cols;r++){let s=e()<Xe[o],{x:i,y:a}=Ze(e,r,o,mt),d=1.4+e()*.8,u=e()<qe,l=R(e()*5,2);if(!s)continue;let c=a/100;n.push({x:i,y:a,size:R(d*(1-.3*c),2),opacity:R(1-.45*c,2),twinkle:u,delay:l})}return n}var en=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],nn=t=>R(t.size/2*(t.twinkle?Qe:1)+Ye,2);function ne(t=tn()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${nn(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+en.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var oe=(t,e,n,o)=>o.some(r=>t>r.left-n&&t<r.right+n&&e>r.top-n&&e<r.bottom+n);var on="(prefers-reduced-motion: reduce)";function rn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var Q=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(on),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let o=n.at(-1);o&&(this.outOfView=!o.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return rn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var an=["bleu","blanc","rouge"],bt=/tomorrow|demain/i,sn=/today|daily|jour|_day(_|$)/i,dn=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function ln(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function cn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!bt.test(e.entity_id)&&an.includes(String(e.state).toLowerCase()))?.entity_id}function V(t,e,n){let o=e?t.entities?.[e]?.device_id:void 0;return o?Object.values(t.entities??{}).filter(r=>r.device_id===o&&r.entity_id.startsWith("sensor.")&&t.states[r.entity_id]).map(r=>r.entity_id).filter(r=>n(r,t.states[r].attributes.device_class)):[]}var J=t=>(e,n)=>n===t,Z=t=>t[0];function yt(t,e,n){return(e&&t.states[e]?e:void 0)??Z(V(t,n,J("power")))}function un(t,e){let n=t?.energy_sources??[],o={},r=n.filter(l=>l.type==="solar"),s=[...new Set(r.map(l=>yt(e,l.stat_rate,l.stat_energy_from)).filter(l=>!!l))];s.length&&(o.production_entity=s.length===1?s[0]:s);let i=[...new Set(r.flatMap(l=>V(e,l.stat_energy_from,(c,f)=>f==="energy"&&sn.test(c)&&!dn.test(c)&&!bt.test(c))))];if(i.length&&(o.daily_production_entities=i),r.some(l=>l.config_entry_solar_forecast?.length)){let l=Object.values(e.entities??{}).find(c=>c.entity_id.startsWith("sensor.")&&bt.test(c.entity_id)&&/forecast|solcast|production/i.test(`${c.platform} ${c.entity_id}`)&&e.states[c.entity_id]?.attributes.device_class==="energy")?.entity_id;l&&(o.forecast_tomorrow_entity=l)}let a=n.find(l=>l.type==="battery");if(a){let l=a.stat_energy_from??a.stat_energy_to,c=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??Z(V(e,l,J("battery"))),f=a.power_config?.stat_rate??a.stat_rate,p=yt(e,f,l),x=Z(V(e,l,J("temperature"))),h={};c&&(h.soc_entity=c),p&&(h.power_entity=p),p&&f&&p===f&&(h.invert=!0),x&&(h.temperature_entity=x),Object.keys(h).length&&(o.battery=h)}let d=n.find(l=>l.type==="grid");if(d){let l=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,c=d.power_config?.stat_rate_inverted,f=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(c&&e.states[c])Object.assign(p,{power_entity:c,invert:!0});else{let h=yt(e,f,l);h&&(p.power_entity=h)}let x=Z(V(e,l,J("voltage")));x&&(p.voltage_entity=x),Object.keys(p).length&&(o.grid=p)}let u=n.find(l=>l.type==="home");return u?.stat_rate&&e.states[u.stat_rate]&&(o.consumption_entity=u.stat_rate),o}function re(t,e){let n=t?un(e,t):{},o=cn(t);return{production_entity:ln(t)??"sensor.production_pv",...n,...o?{tariff_color_entity:o}:{},sun_entity:"sun.sun"}}async function ie(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var wt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",O=t=>t!==void 0&&t.action!=="none";function de(t,e){let n=t??{},o={entity:e};for(let r of["tap_action","hold_action","double_tap_action"])wt(n[r])&&(o[r]=n[r]);return o}function le(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:O(t.tap_action)}function ae(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function K(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let o=e[`${n}_action`];if(o===void 0){n==="tap"&&e.entity&&ae(t,"hass-more-info",{entityId:e.entity});return}let{toggle:r,...s}=e;O(o)&&ae(t,"hass-action",{config:s,action:n})}var xt=class{constructor(e,n,o){this.el=e;this.host=n;this.resolve=o;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",r=>this.down(r)),e.addEventListener("pointermove",r=>this.move(r)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",r=>this.key(r)),e.addEventListener("contextmenu",r=>{O(this.resolve(r.composedPath()).hold_action)&&r.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,O(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,K(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,o=e.clientY-this.origin.y;n*n+o*o>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!O(e.double_tap_action)){K(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,K(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,K(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let r=this.resolve(e.composedPath());le(r)&&(e.preventDefault(),K(this.host,r,"tap"))}},se=new WeakSet;function ce(t,e,n){se.has(t)||(se.add(t),new xt(t,e,n))}function ue(t,e){let n=le(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let o=O(e.hold_action)?"none":"";t.style.userSelect=o,t.style.setProperty("-webkit-user-select",o),t.style.setProperty("-webkit-touch-callout",o)}var pn=[56,48,40],fn=[44,40,36],hn=[[],["data-short-extra"],["data-short-extra","data-tight-extra"],["data-no-extra"]],pe=["data-short-extra","data-tight-extra","data-no-extra"],_t=[["solar",T.tomorrow],["grid",T.grid],["battery",T.battery],["home",T.consumption]],vt=2*Math.PI*17,gn={grid:["sg","gh","gb","bg"],battery:["sb","bh","gb","bg"]};function m(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var mn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function yn(t){if(!t||typeof t!="object")throw m("Configuration invalide","Invalid configuration");let e=Pt(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(i=>typeof i=="string"&&i.length>0)))throw m("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw m("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.layout!==void 0&&!["standard","side"].includes(e.layout))throw m("layout : standard ou side","layout: standard or side");if(e.cell_tap!==void 0&&!["auto","more-info","card"].includes(e.cell_tap))throw m("cell_tap : auto, more-info ou card","cell_tap: auto, more-info or card");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>D)throw m(`cells : une liste de ${D} cases au plus`,`cells: a list of at most ${D} cells`);for(let i of e.cells){let a=i&&typeof i=="object"?i:{},d=typeof i=="string"?W.includes(i):typeof a.entity=="string"&&!!a.entity||W.includes(a.type);if(d&&a.tap_action!==void 0&&!(a.tap_action&&typeof a.tap_action=="object"&&typeof a.tap_action.action=="string"))throw m("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)");if(!d)throw m(`cells : \xAB ${String(typeof i=="object"?JSON.stringify(i):i)} \xBB n'est ni ${W.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${String(typeof i=="object"?JSON.stringify(i):i)}" is neither ${W.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}}for(let[i,a]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(a!==void 0&&typeof a!="boolean")throw m(`${i} doit valoir true ou false`,`${i} must be true or false`);let r=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[i,a]of r)if(!mn(a))throw m(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(e.expandable!==void 0&&typeof e.expandable!="boolean")throw m("expandable doit valoir true ou false","expandable must be true or false");if(e.animate!==void 0&&typeof e.animate!="boolean")throw m("animate doit valoir true ou false","animate must be true or false");let s=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[i,a]of s)if(a!==void 0&&(typeof a!="number"||!Number.isFinite(a)||a<0))throw m(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`);if(e.tariff_palettes!==void 0){let i=e.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw m("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,d]of Object.entries(i))if(!Array.isArray(d)||d.length!==3||!d.every(Gt))throw m(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e}var Et=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new Q(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=yn(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let o=n&&this.config?.expandable===!0;if(o===this.open&&this.hasAttribute("data-expanded")===o)return;this.open=o,this.toggleAttribute("data-expanded",o);let r=this.refs?.flow;r&&(r.panel.hidden=!o),this.config?.expandable&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit()}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,o=lt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),this.toggleAttribute("data-expandable",n.expandable===!0),this.flowWidth=0,this.root.innerHTML=`
            <style>${ee}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${bn()}</div>
                    <div class="layer night">${ne()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    ${n.expandable?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${o.map(i=>`
                        <div class="metric" data-metric="${i.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span><span class="value-tight"></span><span class="extra extra-tight"></span><span class="value-bare"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.expandable?xn():""}
            </ha-card>`;let r=(i,a=this.root)=>a.querySelector(i);this.refs={card:r("ha-card"),flow:n.expandable?this.flowRefs():void 0,heroValue:r(".hero-value"),heroUnit:r(".hero-unit"),context:r(".context"),contextFull:r(".context-full"),contextShort:r(".context-short"),metrics:new Map(o.map(i=>{let a=r(`[data-metric="${i.key}"]`),d=r("ha-icon",a);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||st:T[i.kind]),[i.key,{el:a,icon:d,label:r(".label-text",a),value:r(".value-main",a),extra:r(".extra-full",a),extraShort:r(".extra-short",a),valueTight:r(".value-tight",a),extraTight:r(".extra-tight",a),valueBare:r(".value-bare",a)}]}))},this.actions=de(n,M(n)[0]);let s=Wt(n);if(this.cellTargets=new Map(o.flatMap(i=>{let a=It(n,i),d=wt(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:a,tap:d}]]:s&&a?[[i.key,{entity:a}]]:[]})),n.expandable){let i=this.refs.heroValue.parentElement;for(let a of[i,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false");for(let[a]of _t){let d=qt(n,a);if(!d)continue;this.cellTargets.set(`node:${a}`,{entity:d});let u=this.refs.flow.nodes.get(a).el;u.dataset.cellTarget="",u.setAttribute("role","button"),u.tabIndex=0}}for(let[i,a]of this.cellTargets){if(i.startsWith("node:"))continue;let d=r(`[data-metric="${i}"]`);d.dataset.cellTarget="",a.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}ce(this.refs.card,this,i=>this.actionsFor(i)),ue(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let o=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(o?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let r=o?.dataset.node?`node:${o.dataset.node}`:o?.dataset.metric??"",s=o?this.cellTargets.get(r):void 0;if(!s)return this.actions;let{tap_action:i,...a}=this.actions;return{...a,entity:s.entity??this.actions.entity,...s.tap?{tap_action:s.tap}:{}}}fit(){this.fitLayout(),this.fitExtras(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let o=Math.round(n.box.clientWidth);if(!o||o===this.flowWidth)return;this.flowWidth=o;let r=Qt(o);n.svg.setAttribute("viewBox",`0 0 ${o} ${C}`),n.box.style.setProperty("--esc-node-w",`${r.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${r.centreWidth}px`),n.box.toggleAttribute("data-narrow",r.nodeWidth<112);for(let[s,i]of n.wires)for(let a of i.paths)a.setAttribute("d",r.paths[s]);n.keyframes.textContent=r.keyframes}flowRefs(){let n=(o,r=this.root)=>r.querySelector(o);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(S.map(o=>{let r=n(`[data-wire="${o}"]`);return[o,{g:r,paths:[...r.querySelectorAll("path")]}]})),nodes:new Map(_t.map(([o])=>{let r=n(`[data-node="${o}"]`);return[o,{el:r,label:n(".nlab",r),value:n(".nval",r),centre:n(".centre",r),segs:[...r.querySelectorAll(".seg")]}]}))}}updateFlow(){let n=this.refs?.flow;if(!n)return;let o=Yt(this.config,this._hass);for(let[s,i]of n.nodes){let a=o.nodes[s];i.el.hidden===a.present&&(i.el.hidden=!a.present),y(i.label,a.label),y(i.value,a.value),y(i.centre,a.centre??""),i.el.toggleAttribute("data-centre",a.centre!==void 0);let d=0;i.segs.forEach((u,l)=>{let c=a.ring[l],f=c?Math.max(vt*c[0]-(a.ring.length>1?3:0),0):0;z(u,"stroke-dasharray",`${f.toFixed(1)} ${vt.toFixed(1)}`),z(u,"stroke-dashoffset",(-d).toFixed(1)),z(u,"data-source",c&&f>=1.5?c[1]:""),c&&(d+=vt*c[0])})}let r=new Set;for(let s of["grid","battery"])if(!o.nodes[s].present)for(let i of gn[s])r.add(i);for(let[s,i]of n.wires)z(i.g,"data-level",String(o.levels[s])),z(i.g,"data-off",r.has(s)?"":null)}textBoxes(){let n=this.root,o=[...n.querySelectorAll(".hero-value, .hero-unit, .context-full, .context-short, .label ha-icon, .label-text, .value-main, .extra, .value-tight, .value-bare")].map(s=>s.getBoundingClientRect()),r=n.querySelector(".grid")?.getBoundingClientRect();return r&&this.side?o.push({left:r.left-1,right:r.left+1,top:r.top,bottom:r.bottom}):r&&o.push({left:r.left,right:r.right,top:r.top-1,bottom:r.top+1}),o.filter(s=>s.right>s.left&&s.bottom>s.top)}clearText(){let n=this.refs?.card;if(!n)return;let o=n.getBoundingClientRect();if(!o.width||!o.height)return;let r=this.textBoxes();for(let s of n.querySelectorAll(".star")){let i=o.left+parseFloat(s.style.left)/100*o.width,a=o.top+parseFloat(s.style.top)/100*o.height,d=oe(i,a,Number(s.dataset.reach),r);s.hidden!==d&&(s.hidden=d)}}fitLayout(){let n=this.refs;if(!n)return;let o=n.card.querySelector(".content"),r=n.heroValue.parentElement,s=n.context,i=()=>parseFloat(getComputedStyle(s).lineHeight)||20,a=()=>this.side&&!s.hidden&&(s.scrollWidth>s.clientWidth+1||s.scrollHeight>i()+1),d=f=>r.scrollWidth>r.clientWidth+1||o.scrollHeight>o.clientHeight+1||o.scrollWidth>o.clientWidth+1||f&&a(),u=this.side?fn:pn,l=this.side?hn:[[]],c=f=>{for(let p of[!1,!0]){this.toggleAttribute("data-compact",p);for(let x of l){for(let h of pe)this.toggleAttribute(h,x.includes(h));for(let h of u)if(h===u[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(h)),!d(f))return!0}}return!1};if(!this.side){c(!1);return}this.removeAttribute("data-short-context"),!c(!0)&&(this.setAttribute("data-short-context",""),!c(!0)&&(this.removeAttribute("data-short-context"),c(!1),!s.hidden&&s.scrollHeight>s.clientHeight+1&&this.setAttribute("data-short-context","")))}fitExtras(){if(!this.refs||this.side)return;let n=r=>r.scrollWidth>r.clientWidth+1;this.removeAttribute("data-short-context"),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","");for(let r of pe)this.removeAttribute(r);let o=[...this.refs.metrics.values()].map(r=>r.value.parentElement);o.some(n)&&this.setAttribute("data-short-extra",""),o.some(n)&&this.setAttribute("data-tight-extra","")}stateKey(n){let o=Ft(this.config);return[rt(n),n.locale?.number_format??"",...o.map(r=>n.states[r]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let o=Vt(this.config,this._hass),r=this.refs;this.paintSky();let s=this.fitSensitiveText();y(r.heroValue,o.hero.value),y(r.heroUnit,o.hero.unit),r.context.hidden=o.context===void 0,y(r.contextFull,o.context??""),y(r.contextShort,o.contextShort??"");for(let i of o.metrics){let a=r.metrics.get(i.key);a&&(y(a.label,i.label),this.side&&a.el.title!==i.label&&(a.el.title=i.label),y(a.value,i.value),y(a.extra,i.extra),y(a.extraShort,i.extraShort),y(a.valueTight,i.tight?.value??""),y(a.extraTight,i.tight?.extra??""),a.value.parentElement.toggleAttribute("data-tight",!!i.tight),y(a.valueBare,i.bare??""),a.value.parentElement.toggleAttribute("data-bare",!!i.bare),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}this.updateFlow(),s!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(o=>[o.value,o.extra])].map(o=>o.textContent).join("|")}paintSky(){let n=Ut(this.config,this._hass),o=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((r,s)=>o.style.setProperty(`--esc-c${s}`,r)),o.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.expandable?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return re(n,await ie(n))}static async getConfigElement(){return customElements.get(k)||await Tt(),document.createElement(k)}};function bn(){return Bt.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function xn(){let t=[1,2,3].map(o=>`<g class="comet c${o}"><circle cx="-8" r="1.3" opacity="0.25"></circle><circle cx="-4" r="1.8" opacity="0.5"></circle><circle r="2.5"></circle></g>`).join(""),e=S.map(o=>`<g class="wire ${ht[o]}" data-wire="${o}" data-level="0"><path class="glow"></path><path class="line"></path>${t}</g>`).join(""),n=_t.map(([o,r])=>`
        <div class="node" data-node="${o}">
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon icon="${r}"></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${C}">${e}</svg>${n}</div></div>`}function z(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function y(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(A)||(customElements.define(A,Et),window.customCards=window.customCards||[],window.customCards.push({type:A,name:nt,description:St,preview:!0,documentationURL:At}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${nt} %c ${kt} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
