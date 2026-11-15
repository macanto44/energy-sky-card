"use strict";(()=>{var g="energy-sky-card",y=`${g}-editor`,L="Energy Sky Card",V="Solar production, battery and grid on a sky that follows the tariff colour and the sun",F="https://github.com/macanto44/energy-sky-card",z="0.2.1";function bt(t,e){let n=`${g}.js`;for(let{src:r}of e){let i=new URL(r,"http://local/"),a=i.pathname.lastIndexOf("/");if(i.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var w;function K(){return customElements.get(y)?Promise.resolve():(w??(w=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=bt(y,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(y)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw w=void 0,t})),w)}var U=`
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
}
.star.twinkle { opacity: 0.6; }
/* A shooting star, high in the empty sky right of the hero; hidden unless animated */
.shooting {
    position: absolute;
    left: 52%;
    top: 7%;
    width: 64px;
    height: 1.5px;
    border-radius: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff);
    opacity: 0;
    transform-origin: 100% 50%;
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
    from { opacity: 0.15; transform: translate(-50%, -50%) scale(0.6); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1.4); }
}
/* One pass in the first 0.9 s of each 11 s, quiet the rest of the time */
@keyframes esc-shoot {
    0% { opacity: 0; transform: rotate(20deg) translateX(0) scaleX(0.3); }
    2% { opacity: 1; }
    8% { opacity: 0; transform: rotate(20deg) translateX(110px) scaleX(1); }
    100% { opacity: 0; transform: rotate(20deg) translateX(110px) scaleX(1); }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
:host([data-motion="on"][data-mode="day"][data-producing]) .halo,
:host([data-motion="paused"][data-mode="day"][data-producing]) .halo { animation: esc-breathe 3s ease-in-out infinite alternate; animation-play-state: var(--esc-play); transform-origin: 88% 12%; }
:host([data-motion="on"][data-mode="night"]) .star.twinkle,
:host([data-motion="paused"][data-mode="night"]) .star.twinkle { animation: esc-twinkle 2s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .shooting,
:host([data-motion="paused"][data-mode="night"]) .shooting { animation: esc-shoot 11s ease-out 4s infinite; animation-play-state: var(--esc-play); }
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .layer { animation: none !important; transition: none !important; }
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
`;var xt=new Set(["unavailable","unknown","none",""]);function f(t){if(!t||xt.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var vt={mw:1e6,kw:1e3,w:1},_t={mwh:1e3,kwh:1,wh:.001};function W(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function b(t){let e=f(t);return e===void 0?void 0:e*(vt[W(t)]??1)}function T(t){let e=f(t);return e===void 0?void 0:e*(_t[W(t)]??1)}var wt={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function M(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function d(t,e,n={}){return wt[t][e].replace(/\{(\w+)\}/g,(r,i)=>n[i]??"")}function Ct(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return j(void 0);default:return j(t?.locale?.language||t?.language||"en")}}function j(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function B(t){return{lang:M(t),decimal:Ct(t)}}function l(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function C(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:l(Math.round(t),0,e),unit:"W"}:{value:l(t/1e3,1,e),unit:"kW"}}function R({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function E(t,e){return R(C(t,e))}function H(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":l(t,1,e)}function X(t,e){let n=H(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function G(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${l(Math.round(t),0,e)}\xA0V`}function q(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${l(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function Y(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${l(Math.round(t),0,n)} ${e||"\xB0C"}`}var Et=20,St=["warning","alarm"];function Q(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:r,...i}=t,{lock_entities:a,...o}=t.battery??{};return n&&(o.soc_reached_entities??(o.soc_reached_entities=a)),e&&(o.power_threshold??(o.power_threshold=r)),{...i,battery:o}}var O={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},N="mdi:gauge",S=Object.keys(O),v=4,Z=t=>typeof t=="object"&&t!==null;function At(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function P(t){if(!t.cells)return At(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,v).flatMap((n,r)=>Z(n)?[{key:`custom-${r}`,kind:"custom",custom:n}]:e.has(n)?[]:(e.add(n),[{key:n,kind:n}]))}function A(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function D(t,e){let n=A(t).map(r=>b(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,i)=>r+i,0):void 0}var tt=(t,e)=>t===void 0||!e?t:-t;function kt(t,e){return tt(b(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Lt(t,e){return tt(b(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function et(t){let e=[...A(t),t.consumption_entity,...(t.cells??[]).filter(Z).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Tt(t,e){let n=(t.daily_production_entities??[]).map(r=>T(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,i)=>r+i,0):void 0}function Mt(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Rt(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Ht(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??St).map(i=>String(i).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Ot(t,e,n,r){let i=f(e.states[t.battery?.soc_entity??""]),a=Mt(Lt(t,e),r),o=i===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=Rt(t,e),u=e.states[t.battery?.temperature_entity??""],m=f(u),h=q(i,n)+o,yt=String(u?.attributes.unit_of_measurement??"");return{key:"battery",label:d(n.lang,"battery"),value:m===void 0?h:`${h} \xB7 ${Y(m,yt,n)}`,extra:s?` \xB7 ${d(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${d(n.lang,"soc_reached_short")}`:"",...m===void 0?{}:{tight:{value:`${h}\u202F\xB7\u202F${l(Math.round(m),0,n)}\xB0`,extra:s?"\u202F\u2713":""}}}}function Nt(t,e,n){return{key:"grid",label:d(n.lang,"grid"),value:E(kt(t,e),n),extra:"",extraShort:""}}function Pt(t,e,n){let r=t.grid?.voltage_entity?f(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:d(n.lang,"voltage"),value:Ht(t,e)?d(n.lang,"outage"):G(r,n),extra:"",extraShort:""}}function Dt(t,e,n){return{key:"tomorrow",label:d(n.lang,"tomorrow"),value:X(T(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function $t(t,e,n){return{key:"consumption",label:d(n.lang,"consumption"),value:E(b(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function It(t,e,n){let r=t.custom,i=e.states[r.entity],a=String(i?.attributes.unit_of_measurement??""),o;if(!i||f(i)===void 0&&["unavailable","unknown",""].includes(i.state))o="\u2014";else if(/^[mk]?w$/i.test(a))o=E(b(i),n);else if(e.formatEntityState)o=e.formatEntityState(i);else{let u=f(i);o=u===void 0?i.state:R({value:l(u,Number.isInteger(u)?0:1,n),unit:a})}let s=r.icon||(typeof i?.attributes.icon=="string"?i.attributes.icon:"")||N;return{key:t.key,label:r.name||String(i?.attributes.friendly_name??r.entity),value:o,extra:"",extraShort:"",icon:s}}function Vt(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Ft(t,e,n){let r=Vt(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:C(b(e.states[t.consumption_entity]),n),label:d(n.lang,"consumption"),labelShort:d(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let i=f(e.states[t.battery.soc_entity]);return{hero:i===void 0?{value:"\u2014",unit:""}:{value:l(Math.round(i),0,n),unit:"%"},label:d(n.lang,"battery")}}return{hero:C(D(t,e),n)}}function nt(t,e){let n=B(e),r=t.battery?.power_threshold??Et,i=t.daily_production_entities?.length?d(n.lang,"produced",{value:H(Tt(t,e),n)}):void 0,a=P(t).map(h=>{switch(h.kind){case"battery":return Ot(t,e,n,r);case"grid":return Nt(t,e,n);case"voltage":return Pt(t,e,n);case"tomorrow":return Dt(t,e,n);case"consumption":return $t(t,e,n);case"custom":return It(h,e,n)}}),{hero:o,label:s,labelShort:u=s}=Ft(t,e,n),m=h=>h?[h,i].filter(Boolean).join(" \xB7 "):i;return{hero:o,context:m(s),contextShort:m(u),metrics:a}}var rt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},it="Bleu";var le=[255/255,214/255,140/255],zt=.55;var Kt=6e3,Ut=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,ot=t=>typeof t=="string"&&Ut.test(t);function Wt(t,e){let n={...rt,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),i=Object.keys(n).find(a=>a.toLowerCase()===r);return i?n[i]:t.tariff_palettes?.[it]??rt[it]}function at(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=D(t,e)??0,i=t.production_max&&t.production_max>0?t.production_max:Kt,a=Math.min(Math.max(r,0)/i,1);return{mode:n==="below_horizon"?"night":"day",palette:Wt(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*zt*1e3)/1e3,producing:r>0}}function jt(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var dt=46,st={right:46,bottom:47},Bt=(t,e)=>e>dt||t<st.right&&e<st.bottom;function Xt(t=24301){let e=jt(t),n=(i,a=1)=>Math.round(i*10**a)/10**a,r=[];for(;r.length<38;){let i=n(2+e()*96),a=n(3+e()*(dt-3));Bt(i,a)||r.push({x:i,y:a,size:n(1.4+e()*.8,2),twinkle:r.length>=24,delay:n(e()*5,2)})}return r}function ut(t=Xt()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;animation-delay:-${e.delay}s"></i>`).join("")+'<i class="shooting"></i>'}var Gt="(prefers-reduced-motion: reduce)";function qt(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var k=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Gt),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return qt({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var Yt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",x=t=>t!==void 0&&t.action!=="none";function pt(t,e){let n=t??{},r={entity:e};for(let i of["tap_action","hold_action","double_tap_action"])Yt(n[i])&&(r[i]=n[i]);return r}function ht(t){return t.tap_action===void 0?!!t.entity:x(t.tap_action)}function ct(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function _(t,e,n){let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&ct(t,"hass-more-info",{entityId:e.entity});return}x(r)&&ct(t,"hass-action",{config:e,action:n})}var $=class{constructor(e,n,r){this.el=e;this.host=n;this.config=r;this.origin=null;this.holdFired=!1;e.addEventListener("pointerdown",i=>this.down(i)),e.addEventListener("pointermove",i=>this.move(i)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",i=>this.key(i)),e.addEventListener("contextmenu",i=>{x(this.config().hold_action)&&i.preventDefault()})}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.holdFired=!1,x(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,_(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!x(e.double_tap_action)){_(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,_(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,_(this.host,this.config(),"tap")},250)}key(e){e.target!==this.el||e.key!=="Enter"&&e.key!==" "||ht(this.config())&&(e.preventDefault(),_(this.host,this.config(),"tap"))}},lt=new WeakSet;function ft(t,e,n){lt.has(t)||(lt.add(t),new $(t,e,n))}function mt(t,e){let n=ht(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=x(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var gt=[56,48,40];function c(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Jt=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function Qt(t){if(!t||typeof t!="object")throw c("Configuration invalide","Invalid configuration");let e=Q(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw c("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw c("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>v)throw c(`cells : une liste de ${v} cases au plus`,`cells: a list of at most ${v} cells`);for(let o of e.cells)if(!(typeof o=="string"?S.includes(o):!!o&&typeof o=="object"&&typeof o.entity=="string"&&!!o.entity))throw c(`cells : \xAB ${String(typeof o=="object"?JSON.stringify(o):o)} \xBB n'est ni ${S.join(", ")}, ni { entity: \u2026 }`,`cells: "${String(typeof o=="object"?JSON.stringify(o):o)}" is neither ${S.join(", ")} nor { entity: \u2026 }`)}for(let[o,s]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(s!==void 0&&typeof s!="boolean")throw c(`${o} doit valoir true ou false`,`${o} must be true or false`);let i=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[o,s]of i)if(!Jt(s))throw c(`${o} doit \xEAtre une liste`,`${o} must be a list`);if(e.animate!==void 0&&typeof e.animate!="boolean")throw c("animate doit valoir true ou false","animate must be true or false");let a=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[o,s]of a)if(s!==void 0&&(typeof s!="number"||!Number.isFinite(s)||s<0))throw c(`${o} doit \xEAtre un nombre positif`,`${o} must be a positive number`);if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw c("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,u]of Object.entries(o))if(!Array.isArray(u)||u.length!==3||!u.every(ot))throw c(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e}var I=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new k(this);this.actions={};this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Qt(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit()}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=P(n);this.root.innerHTML=`
            <style>${U}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div></div>
                    <div class="layer night">${ut()}</div>
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
            </ha-card>`;let i=(a,o=this.root)=>o.querySelector(a);this.refs={card:i("ha-card"),heroValue:i(".hero-value"),heroUnit:i(".hero-unit"),context:i(".context"),contextFull:i(".context-full"),contextShort:i(".context-short"),metrics:new Map(r.map(a=>{let o=i(`[data-metric="${a.key}"]`),s=i("ha-icon",o);return s.setAttribute("icon",a.kind==="custom"?a.custom.icon||N:O[a.kind]),[a.key,{icon:s,label:i(".label-text",o),value:i(".value-main",o),extra:i(".extra-full",o),extraShort:i(".extra-short",o),valueTight:i(".value-tight",o),extraTight:i(".extra-tight",o)}]}))},this.actions=pt(n,A(n)[0]),ft(this.refs.card,this,()=>this.actions),mt(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}fit(){this.fitLayout(),this.fitExtras()}fitLayout(){let n=this.refs;if(!n)return;let r=n.card.querySelector(".content"),i=n.heroValue.parentElement,a=()=>i.scrollWidth>i.clientWidth+1||r.scrollHeight>r.clientHeight+1;for(let o of[!1,!0]){this.toggleAttribute("data-compact",o);for(let s of gt)if(s===gt[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(s)),!a())return}}fitExtras(){if(!this.refs)return;let n=i=>i.scrollWidth>i.clientWidth+1;this.removeAttribute("data-short-extra"),this.removeAttribute("data-tight-extra"),this.removeAttribute("data-short-context");let r=[...this.refs.metrics.values()].map(i=>i.value.parentElement);r.some(n)&&this.setAttribute("data-short-extra",""),r.some(n)&&this.setAttribute("data-tight-extra",""),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","")}stateKey(n){let r=et(this.config);return[M(n),n.locale?.number_format??"",...r.map(i=>n.states[i]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=nt(this.config,this._hass),i=this.refs;this.paintSky();let a=this.fitSensitiveText();p(i.heroValue,r.hero.value),p(i.heroUnit,r.hero.unit),i.context.hidden=r.context===void 0,p(i.contextFull,r.context??""),p(i.contextShort,r.contextShort??"");for(let o of r.metrics){let s=i.metrics.get(o.key);s&&(p(s.label,o.label),p(s.value,o.value),p(s.extra,o.extra),p(s.extraShort,o.extraShort),p(s.valueTight,o.tight?.value??""),p(s.extraTight,o.tight?.extra??""),s.value.parentElement.toggleAttribute("data-tight",!!o.tight),o.icon&&s.icon.getAttribute("icon")!==o.icon&&s.icon.setAttribute("icon",o.icon))}a!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(r=>[r.value,r.extra])].map(r=>r.textContent).join("|")}paintSky(){let n=at(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((i,a)=>r.style.setProperty(`--esc-c${a}`,i)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return 4}static getStubConfig(n){let r=n?.states??{};return{production_entity:Object.values(r).find(a=>a.entity_id.startsWith("sensor.")&&(a.attributes.device_class==="power"||a.attributes.unit_of_measurement==="W"))?.entity_id??"sensor.production_pv",sun_entity:"sun.sun"}}static async getConfigElement(){return customElements.get(y)||await K(),document.createElement(y)}};function p(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(g)||(customElements.define(g,I),window.customCards=window.customCards||[],window.customCards.push({type:g,name:L,description:V,preview:!0,documentationURL:F}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${L} %c ${z} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
