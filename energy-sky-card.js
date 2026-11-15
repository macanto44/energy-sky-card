"use strict";(()=>{var y="energy-sky-card",b=`${y}-editor`,M="Energy Sky Card",K="Solar production, battery and grid on a sky that follows the tariff colour and the sun",U="https://github.com/macanto44/energy-sky-card",j="0.2.1";function Ct(t,e){let n=`${y}.js`;for(let{src:o}of e){let r=new URL(o,"http://local/"),a=r.pathname.lastIndexOf("/");if(r.pathname.slice(a+1)===n)return o.replace(n,`${t}.js`)}return`${t}.js`}var C;function W(){return customElements.get(b)?Promise.resolve():(C??(C=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=Ct(b,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(b)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw C=void 0,t})),C)}var G=`
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
/* By day, motes of sunlight: soft warm dots, brighter with production */
.mote {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(255, 244, 214) 0, rgba(255, 244, 214, 0.35) 30%, rgba(255, 244, 214, 0) 70%);
    transform: translate(-50%, -50%);
    opacity: calc(0.3 + var(--esc-halo-alpha, 0) * 0.8);
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
/* A mote drifts 3 px up and down while it glows and fades */
@keyframes esc-float {
    from { opacity: calc((0.3 + var(--esc-halo-alpha, 0) * 0.8) * 0.25); transform: translate(-50%, -50%) translateY(3px); }
    to { opacity: calc(0.3 + var(--esc-halo-alpha, 0) * 0.8); transform: translate(-50%, -50%) translateY(-3px); }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
:host([data-motion="on"][data-mode="day"][data-producing]) .halo,
:host([data-motion="paused"][data-mode="day"][data-producing]) .halo { animation: esc-breathe 3s ease-in-out infinite alternate; animation-play-state: var(--esc-play); transform-origin: 88% 12%; }
:host([data-motion="on"][data-mode="night"]) .star.twinkle,
:host([data-motion="paused"][data-mode="night"]) .star.twinkle { animation: esc-twinkle 2s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .shooting,
:host([data-motion="paused"][data-mode="night"]) .shooting { animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="day"]) .mote,
:host([data-motion="paused"][data-mode="day"]) .mote { animation: esc-float 5s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .mote, .layer { animation: none !important; transition: none !important; }
}
/* Compact: the tight spacing, for a card shorter than four rows (fit() sets it last) */
:host([data-compact]) .content { padding: 14px 20px 12px; }
:host([data-compact]) .context { margin: 0 0 6px; }
:host([data-compact]) .grid { padding-top: 7px; row-gap: 4px; }
:host([data-compact]) .value { margin-top: 0; }
ha-card:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
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
:host([data-hero="48"]) { --esc-hero-size: 48px; }
:host([data-hero="40"]) { --esc-hero-size: 40px; }
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
`;var St=new Set(["unavailable","unknown","none",""]);function g(t){if(!t||St.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var At={mw:1e6,kw:1e3,w:1},kt={mwh:1e3,kwh:1,wh:.001};function X(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function x(t){let e=g(t);return e===void 0?void 0:e*(At[X(t)]??1)}function R(t){let e=g(t);return e===void 0?void 0:e*(kt[X(t)]??1)}var Lt={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function H(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function c(t,e,n={}){return Lt[t][e].replace(/\{(\w+)\}/g,(o,r)=>n[r]??"")}function Tt(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return q(void 0);default:return q(t?.locale?.language||t?.language||"en")}}function q(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function Y(t){return{lang:H(t),decimal:Tt(t)}}function p(t,e,n){let o=t.toFixed(e);return(/^-0(\.0+)?$/.test(o)?o.slice(1):o).replace(".",n.decimal)}function S(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:p(Math.round(t),0,e),unit:"W"}:{value:p(t/1e3,1,e),unit:"kW"}}function O({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function A(t,e){return O(S(t,e))}function N(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":p(t,1,e)}function J(t,e){let n=N(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Q(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${p(Math.round(t),0,e)}\xA0V`}function Z(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${p(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function tt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${p(Math.round(t),0,n)} ${e||"\xB0C"}`}var Mt=20,Rt=["warning","alarm"];function nt(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:o,...r}=t,{lock_entities:a,...i}=t.battery??{};return n&&(i.soc_reached_entities??(i.soc_reached_entities=a)),e&&(i.power_threshold??(i.power_threshold=o)),{...r,battery:i}}var P={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},$="mdi:gauge",k=Object.keys(P),_=4,ot=t=>typeof t=="object"&&t!==null;function Ht(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function D(t){if(!t.cells)return Ht(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,_).flatMap((n,o)=>ot(n)?[{key:`custom-${o}`,kind:"custom",custom:n}]:e.has(n)?[]:(e.add(n),[{key:n,kind:n}]))}function L(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function I(t,e){let n=L(t).map(o=>x(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}var rt=(t,e)=>t===void 0||!e?t:-t;function Ot(t,e){return rt(x(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Nt(t,e){return rt(x(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function it(t){let e=[...L(t),t.consumption_entity,...(t.cells??[]).filter(ot).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Pt(t,e){let n=(t.daily_production_entities??[]).map(o=>R(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}function $t(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Dt(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(o=>e.states[o]?.state==="on")}function It(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Rt).map(r=>String(r).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Vt(t,e,n,o){let r=g(e.states[t.battery?.soc_entity??""]),a=$t(Nt(t,e),o),i=r===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=Dt(t,e),d=e.states[t.battery?.temperature_entity??""],m=g(d),u=Z(r,n)+i,E=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:c(n.lang,"battery"),value:m===void 0?u:`${u} \xB7 ${tt(m,E,n)}`,extra:s?` \xB7 ${c(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${c(n.lang,"soc_reached_short")}`:"",...m===void 0?{}:{tight:{value:`${u}\u202F\xB7\u202F${p(Math.round(m),0,n)}\xB0`,extra:s?"\u202F\u2713":""}}}}function zt(t,e,n){return{key:"grid",label:c(n.lang,"grid"),value:A(Ot(t,e),n),extra:"",extraShort:""}}function Ft(t,e,n){let o=t.grid?.voltage_entity?g(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:c(n.lang,"voltage"),value:It(t,e)?c(n.lang,"outage"):Q(o,n),extra:"",extraShort:""}}function Bt(t,e,n){return{key:"tomorrow",label:c(n.lang,"tomorrow"),value:J(R(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Kt(t,e,n){return{key:"consumption",label:c(n.lang,"consumption"),value:A(x(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Ut(t,e,n){let o=t.custom,r=e.states[o.entity],a=String(r?.attributes.unit_of_measurement??""),i;if(!r||g(r)===void 0&&["unavailable","unknown",""].includes(r.state))i="\u2014";else if(/^[mk]?w$/i.test(a))i=A(x(r),n);else if(e.formatEntityState)i=e.formatEntityState(r);else{let d=g(r);i=d===void 0?r.state:O({value:p(d,Number.isInteger(d)?0:1,n),unit:a})}let s=o.icon||(typeof r?.attributes.icon=="string"?r.attributes.icon:"")||$;return{key:t.key,label:o.name||String(r?.attributes.friendly_name??o.entity),value:i,extra:"",extraShort:"",icon:s}}function jt(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Wt(t,e,n){let o=jt(t,e)?t.night_hero??"production":"production";if(o==="consumption"&&t.consumption_entity)return{hero:S(x(e.states[t.consumption_entity]),n),label:c(n.lang,"consumption"),labelShort:c(n.lang,"consumption_short")};if(o==="battery"&&t.battery?.soc_entity){let r=g(e.states[t.battery.soc_entity]);return{hero:r===void 0?{value:"\u2014",unit:""}:{value:p(Math.round(r),0,n),unit:"%"},label:c(n.lang,"battery")}}return{hero:S(I(t,e),n)}}function at(t,e){let n=Y(e),o=t.battery?.power_threshold??Mt,r=t.daily_production_entities?.length?c(n.lang,"produced",{value:N(Pt(t,e),n)}):void 0,a=D(t).map(u=>{switch(u.kind){case"battery":return Vt(t,e,n,o);case"grid":return zt(t,e,n);case"voltage":return Ft(t,e,n);case"tomorrow":return Bt(t,e,n);case"consumption":return Kt(t,e,n);case"custom":return Ut(u,e,n)}}),{hero:i,label:s,labelShort:d=s}=Wt(t,e,n),m=u=>u?[u,r].filter(Boolean).join(" \xB7 "):r;return{hero:i,context:m(s),contextShort:m(d),metrics:a}}var st={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},dt="Bleu";var Ee=[255/255,214/255,140/255],Gt=.55;var Xt=6e3,qt=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,ct=t=>typeof t=="string"&&qt.test(t);function Yt(t,e){let n={...st,...t.tariff_palettes??{}},o=String(e??"").toLowerCase(),r=Object.keys(n).find(a=>a.toLowerCase()===o);return r?n[r]:t.tariff_palettes?.[dt]??st[dt]}function ut(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,o=I(t,e)??0,r=t.production_max&&t.production_max>0?t.production_max:Xt,a=Math.min(Math.max(o,0)/r,1);return{mode:n==="below_horizon"?"night":"day",palette:Yt(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*Gt*1e3)/1e3,producing:o>0}}var V={cols:10,rows:6},Jt=[1,.9,.8,.7,.6,.5],Qt=.4,z={cols:8,rows:5},Zt=3,lt=3,te=1.4;function pt(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var h=(t,e=1)=>Math.round(t*10**e)/10**e;function ht(t,e,n,o){return{x:h((e+.1+t()*.8)/o.cols*100),y:h((n+.1+t()*.8)/o.rows*100)}}function ee(t=24301){let e=pt(t),n=[];for(let o=0;o<V.rows;o++)for(let r=0;r<V.cols;r++){let a=e()<Jt[o],{x:i,y:s}=ht(e,r,o,V),d=1.4+e()*.8,m=e()<Qt,u=h(e()*5,2);if(!a)continue;let E=s/100;n.push({x:i,y:s,size:h(d*(1-.3*E),2),opacity:h(1-.45*E,2),twinkle:m,delay:u})}return n}function ne(t=20705){let e=pt(t),n=[];for(let o=0;o<z.rows;o++)for(let r=0;r<z.cols;r++){let{x:a,y:i}=ht(e,r,o,z);n.push({x:a,y:i,size:h(7+e()*5),delay:h(e()*8,2),duration:h(4+e()*3,1)})}return n}var oe=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],re=t=>h(t.size/2*(t.twinkle?te:1)+lt,2),ie=t=>h(t.size/2+Zt+lt,2);function ft(t=ee()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${re(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+oe.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}function mt(t=ne()){return t.map(e=>`<i class="mote" data-reach="${ie(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;animation-delay:-${e.delay}s;animation-duration:${e.duration}s"></i>`).join("")}var gt=(t,e,n,o)=>o.some(r=>t>r.left-n&&t<r.right+n&&e>r.top-n&&e<r.bottom+n);var ae="(prefers-reduced-motion: reduce)";function se(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var T=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(ae),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let o=n.at(-1);o&&(this.outOfView=!o.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return se({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var de=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",v=t=>t!==void 0&&t.action!=="none";function xt(t,e){let n=t??{},o={entity:e};for(let r of["tap_action","hold_action","double_tap_action"])de(n[r])&&(o[r]=n[r]);return o}function vt(t){return t.tap_action===void 0?!!t.entity:v(t.tap_action)}function yt(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function w(t,e,n){let o=e[`${n}_action`];if(o===void 0){n==="tap"&&e.entity&&yt(t,"hass-more-info",{entityId:e.entity});return}v(o)&&yt(t,"hass-action",{config:e,action:n})}var F=class{constructor(e,n,o){this.el=e;this.host=n;this.config=o;this.origin=null;this.holdFired=!1;e.addEventListener("pointerdown",r=>this.down(r)),e.addEventListener("pointermove",r=>this.move(r)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",r=>this.key(r)),e.addEventListener("contextmenu",r=>{v(this.config().hold_action)&&r.preventDefault()})}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.holdFired=!1,v(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,w(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,o=e.clientY-this.origin.y;n*n+o*o>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!v(e.double_tap_action)){w(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,w(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,w(this.host,this.config(),"tap")},250)}key(e){e.target!==this.el||e.key!=="Enter"&&e.key!==" "||vt(this.config())&&(e.preventDefault(),w(this.host,this.config(),"tap"))}},bt=new WeakSet;function _t(t,e,n){bt.has(t)||(bt.add(t),new F(t,e,n))}function wt(t,e){let n=vt(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let o=v(e.hold_action)?"none":"";t.style.userSelect=o,t.style.setProperty("-webkit-user-select",o),t.style.setProperty("-webkit-touch-callout",o)}var Et=[56,48,40];function l(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var ce=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function ue(t){if(!t||typeof t!="object")throw l("Configuration invalide","Invalid configuration");let e=nt(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(i=>typeof i=="string"&&i.length>0)))throw l("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw l("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>_)throw l(`cells : une liste de ${_} cases au plus`,`cells: a list of at most ${_} cells`);for(let i of e.cells)if(!(typeof i=="string"?k.includes(i):!!i&&typeof i=="object"&&typeof i.entity=="string"&&!!i.entity))throw l(`cells : \xAB ${String(typeof i=="object"?JSON.stringify(i):i)} \xBB n'est ni ${k.join(", ")}, ni { entity: \u2026 }`,`cells: "${String(typeof i=="object"?JSON.stringify(i):i)}" is neither ${k.join(", ")} nor { entity: \u2026 }`)}for(let[i,s]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(s!==void 0&&typeof s!="boolean")throw l(`${i} doit valoir true ou false`,`${i} must be true or false`);let r=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[i,s]of r)if(!ce(s))throw l(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(e.animate!==void 0&&typeof e.animate!="boolean")throw l("animate doit valoir true ou false","animate must be true or false");let a=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[i,s]of a)if(s!==void 0&&(typeof s!="number"||!Number.isFinite(s)||s<0))throw l(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`);if(e.tariff_palettes!==void 0){let i=e.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw l("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,d]of Object.entries(i))if(!Array.isArray(d)||d.length!==3||!d.every(ct))throw l(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e}var B=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new T(this);this.actions={};this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=ue(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,o=D(n);this.root.innerHTML=`
            <style>${G}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${mt()}</div>
                    <div class="layer night">${ft()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    <div class="grid">${o.map(a=>`
                        <div class="metric" data-metric="${a.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span><span class="value-tight"></span><span class="extra extra-tight"></span></div>
                        </div>`).join("")}</div>
                </div>
            </ha-card>`;let r=(a,i=this.root)=>i.querySelector(a);this.refs={card:r("ha-card"),heroValue:r(".hero-value"),heroUnit:r(".hero-unit"),context:r(".context"),contextFull:r(".context-full"),contextShort:r(".context-short"),metrics:new Map(o.map(a=>{let i=r(`[data-metric="${a.key}"]`),s=r("ha-icon",i);return s.setAttribute("icon",a.kind==="custom"?a.custom.icon||$:P[a.kind]),[a.key,{icon:s,label:r(".label-text",i),value:r(".value-main",i),extra:r(".extra-full",i),extraShort:r(".extra-short",i),valueTight:r(".value-tight",i),extraTight:r(".extra-tight",i)}]}))},this.actions=xt(n,L(n)[0]),_t(this.refs.card,this,()=>this.actions),wt(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}fit(){this.fitLayout(),this.fitExtras(),this.clearText()}textBoxes(){let n=this.root,o=[...n.querySelectorAll(".hero-value, .hero-unit, .context-full, .context-short, .label ha-icon, .label-text, .value-main, .extra, .value-tight")].map(a=>a.getBoundingClientRect()),r=n.querySelector(".grid")?.getBoundingClientRect();return r&&o.push({left:r.left,right:r.right,top:r.top-1,bottom:r.top+1}),o.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let o=n.getBoundingClientRect();if(!o.width||!o.height)return;let r=this.textBoxes();for(let a of n.querySelectorAll(".star, .mote")){let i=o.left+parseFloat(a.style.left)/100*o.width,s=o.top+parseFloat(a.style.top)/100*o.height,d=gt(i,s,Number(a.dataset.reach),r);a.hidden!==d&&(a.hidden=d)}}fitLayout(){let n=this.refs;if(!n)return;let o=n.card.querySelector(".content"),r=n.heroValue.parentElement,a=()=>r.scrollWidth>r.clientWidth+1||o.scrollHeight>o.clientHeight+1;for(let i of[!1,!0]){this.toggleAttribute("data-compact",i);for(let s of Et)if(s===Et[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(s)),!a())return}}fitExtras(){if(!this.refs)return;let n=r=>r.scrollWidth>r.clientWidth+1;this.removeAttribute("data-short-extra"),this.removeAttribute("data-tight-extra"),this.removeAttribute("data-short-context");let o=[...this.refs.metrics.values()].map(r=>r.value.parentElement);o.some(n)&&this.setAttribute("data-short-extra",""),o.some(n)&&this.setAttribute("data-tight-extra",""),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","")}stateKey(n){let o=it(this.config);return[H(n),n.locale?.number_format??"",...o.map(r=>n.states[r]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let o=at(this.config,this._hass),r=this.refs;this.paintSky();let a=this.fitSensitiveText();f(r.heroValue,o.hero.value),f(r.heroUnit,o.hero.unit),r.context.hidden=o.context===void 0,f(r.contextFull,o.context??""),f(r.contextShort,o.contextShort??"");for(let i of o.metrics){let s=r.metrics.get(i.key);s&&(f(s.label,i.label),f(s.value,i.value),f(s.extra,i.extra),f(s.extraShort,i.extraShort),f(s.valueTight,i.tight?.value??""),f(s.extraTight,i.tight?.extra??""),s.value.parentElement.toggleAttribute("data-tight",!!i.tight),i.icon&&s.icon.getAttribute("icon")!==i.icon&&s.icon.setAttribute("icon",i.icon))}a!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(o=>[o.value,o.extra])].map(o=>o.textContent).join("|")}paintSky(){let n=ut(this.config,this._hass),o=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((r,a)=>o.style.setProperty(`--esc-c${a}`,r)),o.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return 4}static getStubConfig(n){let o=n?.states??{};return{production_entity:Object.values(o).find(a=>a.entity_id.startsWith("sensor.")&&(a.attributes.device_class==="power"||a.attributes.unit_of_measurement==="W"))?.entity_id??"sensor.production_pv",sun_entity:"sun.sun"}}static async getConfigElement(){return customElements.get(b)||await W(),document.createElement(b)}};function f(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(y)||(customElements.define(y,B),window.customCards=window.customCards||[],window.customCards.push({type:y,name:M,description:K,preview:!0,documentationURL:U}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${M} %c ${j} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
