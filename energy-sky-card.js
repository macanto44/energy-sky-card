"use strict";(()=>{var x="energy-sky-card",v=`${x}-editor`,D="Energy Sky Card",Z="Solar production, battery and grid on a sky that follows the tariff colour and the sun",tt="https://github.com/macanto44/energy-sky-card",et="0.3.1";function $t(t,e){let n=`${x}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),a=o.pathname.lastIndexOf("/");if(o.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var L;function nt(){return customElements.get(v)?Promise.resolve():(L??(L=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=$t(v,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(v)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw L=void 0,t})),L)}var Dt=new Set(["unavailable","unknown","none",""]);function b(t){if(!t||Dt.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var It={mw:1e6,kw:1e3,w:1},Vt={mwh:1e3,kwh:1,wh:.001};function rt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function w(t){let e=b(t);return e===void 0?void 0:e*(It[rt(t)]??1)}function I(t){let e=b(t);return e===void 0?void 0:e*(Vt[rt(t)]??1)}var Ft={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function V(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function p(t,e,n={}){return Ft[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function zt(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return ot(void 0);default:return ot(t?.locale?.language||t?.language||"en")}}function ot(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function it(t){return{lang:V(t),decimal:zt(t)}}function h(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function M(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:h(Math.round(t),0,e),unit:"W"}:{value:h(t/1e3,1,e),unit:"kW"}}function F({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function O(t,e){return F(M(t,e))}function z(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":h(t,1,e)}function at(t,e){let n=z(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function st(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${h(Math.round(t),0,e)}\xA0V`}function dt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${h(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function ct(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${h(Math.round(t),0,n)} ${e||"\xB0C"}`}var Ut=20,Bt=["warning","alarm"];function lt(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:r,...o}=t,{lock_entities:a,...i}=t.battery??{};return n&&(i.soc_reached_entities??(i.soc_reached_entities=a)),e&&(i.power_threshold??(i.power_threshold=r)),{...o,battery:i}}var U={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},B="mdi:gauge",R=Object.keys(U),A=4,pt=t=>typeof t=="object"&&t!==null;function jt(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function j(t){if(!t.cells)return jt(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,A).flatMap((n,r)=>pt(n)?[{key:`custom-${r}`,kind:"custom",custom:n}]:e.has(n)?[]:(e.add(n),[{key:n,kind:n}]))}function ft(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function mt(t){return t.cell_tap==="card"?!1:t.cell_tap==="more-info"||t.tap_action===void 0}function H(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function W(t,e){let n=H(t).map(r=>w(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var ht=(t,e)=>t===void 0||!e?t:-t;function Wt(t,e){return ht(w(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Kt(t,e){return ht(w(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function gt(t){let e=[...H(t),t.consumption_entity,...(t.cells??[]).filter(pt).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Xt(t,e){let n=(t.daily_production_entities??[]).map(r=>I(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function Gt(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function qt(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Yt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Bt).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Jt(t,e,n,r){let o=b(e.states[t.battery?.soc_entity??""]),a=Gt(Kt(t,e),r),i=o===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=qt(t,e),c=e.states[t.battery?.temperature_entity??""],l=b(c),d=dt(o,n)+i,u=String(c?.attributes.unit_of_measurement??"");return{key:"battery",label:p(n.lang,"battery"),value:l===void 0?d:`${d} \xB7 ${ct(l,u,n)}`,extra:s?` \xB7 ${p(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${p(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${d}\u202F\xB7\u202F${h(Math.round(l),0,n)}\xB0`,extra:s?"\u202F\u2713":""}}}}function Qt(t,e,n){return{key:"grid",label:p(n.lang,"grid"),value:O(Wt(t,e),n),extra:"",extraShort:""}}function Zt(t,e,n){let r=t.grid?.voltage_entity?b(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:p(n.lang,"voltage"),value:Yt(t,e)?p(n.lang,"outage"):st(r,n),extra:"",extraShort:""}}function te(t,e,n){return{key:"tomorrow",label:p(n.lang,"tomorrow"),value:at(I(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function ee(t,e,n){return{key:"consumption",label:p(n.lang,"consumption"),value:O(w(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function ne(t,e,n){let r=t.custom,o=e.states[r.entity],a=String(o?.attributes.unit_of_measurement??""),i;if(!o||b(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(a))i=O(w(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let c=b(o);i=c===void 0?o.state:F({value:h(c,Number.isInteger(c)?0:1,n),unit:a})}let s=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||B;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:s}}function re(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function oe(t,e,n){let r=re(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:M(w(e.states[t.consumption_entity]),n),label:p(n.lang,"consumption"),labelShort:p(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=b(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:h(Math.round(o),0,n),unit:"%"},label:p(n.lang,"battery")}}return{hero:M(W(t,e),n)}}function yt(t,e){let n=it(e),r=t.battery?.power_threshold??Ut,o=t.daily_production_entities?.length?p(n.lang,"produced",{value:z(Xt(t,e),n)}):void 0,a=j(t).map(d=>{switch(d.kind){case"battery":return Jt(t,e,n,r);case"grid":return Qt(t,e,n);case"voltage":return Zt(t,e,n);case"tomorrow":return te(t,e,n);case"consumption":return ee(t,e,n);case"custom":return ne(d,e,n)}}),{hero:i,label:s,labelShort:c=s}=oe(t,e,n),l=d=>d?[d,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(s),contextShort:l(c),metrics:a}}var bt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},_t="Bleu";var ze=[255/255,214/255,140/255],ie=.55;var ae=6e3,xt=[8,18,40],K=.2,vt=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],se=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,wt=t=>typeof t=="string"&&se.test(t);function de(t,e){let n={...bt,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(a=>a.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[_t]??bt[_t]}function Ct(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=W(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:ae,a=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:de(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*ie*1e3)/1e3,producing:r>0}}var X=t=>`rgba(${xt.join(", ")}, ${t})`,Et=`
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
/*
 * By day, cloud shadows: soft dark bands, each in a card-wide .drift that
 * crosses from -110 % to 110 % (the cloud fully off both edges). They only
 * darken the sky; without motion they rest where they are.
 */
.drift { position: absolute; inset: 0; }
.cloud {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(closest-side, ${X(K)}, ${X(K/2)} 50%, ${X(0)} 100%);
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
:host([data-motion="paused"][data-mode="day"][data-producing]) .halo { animation: esc-breathe 3s ease-in-out infinite alternate; animation-play-state: var(--esc-play); transform-origin: 88% 12%; }
:host([data-motion="on"][data-mode="night"]) .star.twinkle,
:host([data-motion="paused"][data-mode="night"]) .star.twinkle { animation: esc-twinkle 2s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .shooting,
:host([data-motion="paused"][data-mode="night"]) .shooting { animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="day"]) .drift,
:host([data-motion="paused"][data-mode="day"]) .drift { animation: esc-drift 60s linear infinite; animation-play-state: var(--esc-play); }
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .drift, .layer { animation: none !important; transition: none !important; }
}
/* Compact: the tight spacing, for a card shorter than four rows (fit() sets it last) */
:host([data-compact]) .content { padding: 14px 20px 12px; }
:host([data-compact]) .context { margin: 0 0 6px; }
:host([data-compact]) .grid { padding-top: 7px; row-gap: 4px; }
:host([data-compact]) .value { margin-top: 0; }
ha-card:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
/* A cell that opens its own entity (cell_tap) */
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
`;var G={cols:10,rows:6},ce=[1,.9,.8,.7,.6,.5],ue=.4,le=3,pe=1.4;function fe(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var C=(t,e=1)=>Math.round(t*10**e)/10**e;function me(t,e,n,r){return{x:C((e+.1+t()*.8)/r.cols*100),y:C((n+.1+t()*.8)/r.rows*100)}}function he(t=24301){let e=fe(t),n=[];for(let r=0;r<G.rows;r++)for(let o=0;o<G.cols;o++){let a=e()<ce[r],{x:i,y:s}=me(e,o,r,G),c=1.4+e()*.8,l=e()<ue,d=C(e()*5,2);if(!a)continue;let u=s/100;n.push({x:i,y:s,size:C(c*(1-.3*u),2),opacity:C(1-.45*u,2),twinkle:l,delay:d})}return n}var ge=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],ye=t=>C(t.size/2*(t.twinkle?pe:1)+le,2);function St(t=he()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${ye(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+ge.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var At=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var be="(prefers-reduced-motion: reduce)";function _e(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var P=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(be),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return _e({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var xe=["bleu","blanc","rouge"],Y=/tomorrow|demain/i,ve=/today|daily|jour|_day(_|$)/i,we=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function Ce(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function Ee(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!Y.test(e.entity_id)&&xe.includes(String(e.state).toLowerCase()))?.entity_id}function k(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var N=t=>(e,n)=>n===t,$=t=>t[0];function q(t,e,n){return(e&&t.states[e]?e:void 0)??$(k(t,n,N("power")))}function Se(t,e){let n=t?.energy_sources??[],r={},o=n.filter(d=>d.type==="solar"),a=[...new Set(o.map(d=>q(e,d.stat_rate,d.stat_energy_from)).filter(d=>!!d))];a.length&&(r.production_entity=a.length===1?a[0]:a);let i=[...new Set(o.flatMap(d=>k(e,d.stat_energy_from,(u,_)=>_==="energy"&&ve.test(u)&&!we.test(u)&&!Y.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(d=>d.config_entry_solar_forecast?.length)){let d=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&Y.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;d&&(r.forecast_tomorrow_entity=d)}let s=n.find(d=>d.type==="battery");if(s){let d=s.stat_energy_from??s.stat_energy_to,u=(s.stat_soc&&e.states[s.stat_soc]?s.stat_soc:void 0)??$(k(e,d,N("battery"))),_=s.power_config?.stat_rate??s.stat_rate,m=q(e,_,d),S=$(k(e,d,N("temperature"))),y={};u&&(y.soc_entity=u),m&&(y.power_entity=m),m&&_&&m===_&&(y.invert=!0),S&&(y.temperature_entity=S),Object.keys(y).length&&(r.battery=y)}let c=n.find(d=>d.type==="grid");if(c){let d=c.stat_energy_from??c.flow_from?.[0]?.stat_energy_from??c.stat_energy_to??c.flow_to?.[0]?.stat_energy_to,u=c.power_config?.stat_rate_inverted,_=c.power_config?.stat_rate??c.stat_rate??c.power?.[0]?.stat_rate,m={};if(u&&e.states[u])Object.assign(m,{power_entity:u,invert:!0});else{let y=q(e,_,d);y&&(m.power_entity=y)}let S=$(k(e,d,N("voltage")));S&&(m.voltage_entity=S),Object.keys(m).length&&(r.grid=m)}let l=n.find(d=>d.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function kt(t,e){let n=t?Se(e,t):{},r=Ee(t);return{production_entity:Ce(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Tt(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var Ae=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",E=t=>t!==void 0&&t.action!=="none";function Ot(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])Ae(n[o])&&(r[o]=n[o]);return r}function Rt(t){return t.tap_action===void 0?!!t.entity:E(t.tap_action)}function Lt(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function T(t,e,n){let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Lt(t,"hass-more-info",{entityId:e.entity});return}E(r)&&Lt(t,"hass-action",{config:e,action:n})}var J=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{E(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,E(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,T(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!E(e.double_tap_action)){T(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,T(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,T(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());Rt(o)&&(e.preventDefault(),T(this.host,o,"tap"))}},Mt=new WeakSet;function Ht(t,e,n){Mt.has(t)||(Mt.add(t),new J(t,e,n))}function Pt(t,e){let n=Rt(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=E(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var Nt=[56,48,40];function f(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var ke=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function Te(t){if(!t||typeof t!="object")throw f("Configuration invalide","Invalid configuration");let e=lt(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(i=>typeof i=="string"&&i.length>0)))throw f("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw f("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.cell_tap!==void 0&&!["auto","more-info","card"].includes(e.cell_tap))throw f("cell_tap : auto, more-info ou card","cell_tap: auto, more-info or card");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>A)throw f(`cells : une liste de ${A} cases au plus`,`cells: a list of at most ${A} cells`);for(let i of e.cells)if(!(typeof i=="string"?R.includes(i):!!i&&typeof i=="object"&&typeof i.entity=="string"&&!!i.entity))throw f(`cells : \xAB ${String(typeof i=="object"?JSON.stringify(i):i)} \xBB n'est ni ${R.join(", ")}, ni { entity: \u2026 }`,`cells: "${String(typeof i=="object"?JSON.stringify(i):i)}" is neither ${R.join(", ")} nor { entity: \u2026 }`)}for(let[i,s]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(s!==void 0&&typeof s!="boolean")throw f(`${i} doit valoir true ou false`,`${i} must be true or false`);let o=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[i,s]of o)if(!ke(s))throw f(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(e.animate!==void 0&&typeof e.animate!="boolean")throw f("animate doit valoir true ou false","animate must be true or false");let a=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[i,s]of a)if(s!==void 0&&(typeof s!="number"||!Number.isFinite(s)||s<0))throw f(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`);if(e.tariff_palettes!==void 0){let i=e.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw f("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,c]of Object.entries(i))if(!Array.isArray(c)||c.length!==3||!c.every(wt))throw f(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e}var Q=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new P(this);this.actions={};this.cellTargets=new Map;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Te(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=j(n);this.root.innerHTML=`
            <style>${Et}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Le()}</div>
                    <div class="layer night">${St()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    <div class="grid">${r.map(a=>`
                        <div class="metric" data-metric="${a.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span><span class="value-tight"></span><span class="extra extra-tight"></span></div>
                        </div>`).join("")}</div>
                </div>
            </ha-card>`;let o=(a,i=this.root)=>i.querySelector(a);this.refs={card:o("ha-card"),heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextFull:o(".context-full"),contextShort:o(".context-short"),metrics:new Map(r.map(a=>{let i=o(`[data-metric="${a.key}"]`),s=o("ha-icon",i);return s.setAttribute("icon",a.kind==="custom"?a.custom.icon||B:U[a.kind]),[a.key,{icon:s,label:o(".label-text",i),value:o(".value-main",i),extra:o(".extra-full",i),extraShort:o(".extra-short",i),valueTight:o(".value-tight",i),extraTight:o(".extra-tight",i)}]}))},this.actions=Ot(n,H(n)[0]),this.cellTargets=new Map(mt(n)?r.flatMap(a=>{let i=ft(n,a);return i?[[a.key,i]]:[]}):[]);for(let[a]of this.cellTargets){let i=o(`[data-metric="${a}"]`);i.dataset.cellTarget="",i.setAttribute("role","button"),i.tabIndex=0,i.style.cursor="pointer"}Ht(this.refs.card,this,a=>this.actionsFor(a)),Pt(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(s=>s instanceof HTMLElement&&s.dataset.cellTarget!==void 0),o=r?this.cellTargets.get(r.dataset.metric??""):void 0;if(!o)return this.actions;let{tap_action:a,...i}=this.actions;return{...i,entity:o}}fit(){this.fitLayout(),this.fitExtras(),this.clearText()}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-full, .context-short, .label ha-icon, .label-text, .value-main, .extra, .value-tight")].map(a=>a.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let a of n.querySelectorAll(".star")){let i=r.left+parseFloat(a.style.left)/100*r.width,s=r.top+parseFloat(a.style.top)/100*r.height,c=At(i,s,Number(a.dataset.reach),o);a.hidden!==c&&(a.hidden=c)}}fitLayout(){let n=this.refs;if(!n)return;let r=n.card.querySelector(".content"),o=n.heroValue.parentElement,a=()=>o.scrollWidth>o.clientWidth+1||r.scrollHeight>r.clientHeight+1;for(let i of[!1,!0]){this.toggleAttribute("data-compact",i);for(let s of Nt)if(s===Nt[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(s)),!a())return}}fitExtras(){if(!this.refs)return;let n=o=>o.scrollWidth>o.clientWidth+1;this.removeAttribute("data-short-extra"),this.removeAttribute("data-tight-extra"),this.removeAttribute("data-short-context");let r=[...this.refs.metrics.values()].map(o=>o.value.parentElement);r.some(n)&&this.setAttribute("data-short-extra",""),r.some(n)&&this.setAttribute("data-tight-extra",""),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","")}stateKey(n){let r=gt(this.config);return[V(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=yt(this.config,this._hass),o=this.refs;this.paintSky();let a=this.fitSensitiveText();g(o.heroValue,r.hero.value),g(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0,g(o.contextFull,r.context??""),g(o.contextShort,r.contextShort??"");for(let i of r.metrics){let s=o.metrics.get(i.key);s&&(g(s.label,i.label),g(s.value,i.value),g(s.extra,i.extra),g(s.extraShort,i.extraShort),g(s.valueTight,i.tight?.value??""),g(s.extraTight,i.tight?.extra??""),s.value.parentElement.toggleAttribute("data-tight",!!i.tight),i.icon&&s.icon.getAttribute("icon")!==i.icon&&s.icon.setAttribute("icon",i.icon))}a!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(r=>[r.value,r.extra])].map(r=>r.textContent).join("|")}paintSky(){let n=Ct(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,a)=>r.style.setProperty(`--esc-c${a}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return 4}static async getStubConfig(n){return kt(n,await Tt(n))}static async getConfigElement(){return customElements.get(v)||await nt(),document.createElement(v)}};function Le(){return vt.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function g(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(x)||(customElements.define(x,Q),window.customCards=window.customCards||[],window.customCards.push({type:x,name:D,description:Z,preview:!0,documentationURL:tt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${D} %c ${et} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
