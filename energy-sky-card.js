"use strict";(()=>{var m="energy-sky-card",h=`${m}-editor`,k="Energy Sky Card",$="Solar production, battery and grid on a sky that follows the tariff colour and the sun",F="https://github.com/macanto44/energy-sky-card",z="0.2.0";function gt(t,e){let n=`${m}.js`;for(let{src:o}of e){let r=new URL(o,"http://local/"),s=r.pathname.lastIndexOf("/");if(r.pathname.slice(s+1)===n)return o.replace(n,`${t}.js`)}return`${t}.js`}var _;function K(){return customElements.get(h)?Promise.resolve():(_??(_=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=gt(h,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(h)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw _=void 0,t})),_)}var U=`
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
`;var yt=new Set(["unavailable","unknown","none",""]);function l(t){if(!t||yt.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var bt={mw:1e6,kw:1e3,w:1},xt={mwh:1e3,kwh:1,wh:.001};function W(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function g(t){let e=l(t);return e===void 0?void 0:e*(bt[W(t)]??1)}function L(t){let e=l(t);return e===void 0?void 0:e*(xt[W(t)]??1)}var vt={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function T(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function d(t,e,n={}){return vt[t][e].replace(/\{(\w+)\}/g,(o,r)=>n[r]??"")}function _t(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return j(void 0);default:return j(t?.locale?.language||t?.language||"en")}}function j(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function B(t){return{lang:T(t),decimal:_t(t)}}function p(t,e,n){let o=t.toFixed(e);return(/^-0(\.0+)?$/.test(o)?o.slice(1):o).replace(".",n.decimal)}function w(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:p(Math.round(t),0,e),unit:"W"}:{value:p(t/1e3,1,e),unit:"kW"}}function M({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function C(t,e){return M(w(t,e))}function R(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":p(t,1,e)}function X(t,e){let n=R(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function G(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${p(Math.round(t),0,e)}\xA0V`}function q(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${p(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}var wt=20,Ct=["warning","alarm"];function J(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:o,...r}=t,{lock_entities:s,...i}=t.battery??{};return n&&(i.soc_reached_entities??(i.soc_reached_entities=s)),e&&(i.power_threshold??(i.power_threshold=o)),{...r,battery:i}}var H={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},O="mdi:gauge",E=Object.keys(H),x=4,Q=t=>typeof t=="object"&&t!==null;function Et(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function N(t){if(!t.cells)return Et(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,x).flatMap((n,o)=>Q(n)?[{key:`custom-${o}`,kind:"custom",custom:n}]:e.has(n)?[]:(e.add(n),[{key:n,kind:n}]))}function S(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function P(t,e){let n=S(t).map(o=>g(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}var Z=(t,e)=>t===void 0||!e?t:-t;function St(t,e){return Z(g(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function At(t,e){return Z(g(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function tt(t){let e=[...S(t),t.consumption_entity,...(t.cells??[]).filter(Q).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function kt(t,e){let n=(t.daily_production_entities??[]).map(o=>L(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}function Lt(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Tt(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(o=>e.states[o]?.state==="on")}function Mt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Ct).map(r=>String(r).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Rt(t,e,n,o){let r=l(e.states[t.battery?.soc_entity??""]),s=Lt(At(t,e),o),i=r===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=Tt(t,e);return{key:"battery",label:d(n.lang,"battery"),value:q(r,n)+i,extra:a?` \xB7 ${d(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${d(n.lang,"soc_reached_short")}`:""}}function Ht(t,e,n){return{key:"grid",label:d(n.lang,"grid"),value:C(St(t,e),n),extra:"",extraShort:""}}function Ot(t,e,n){let o=t.grid?.voltage_entity?l(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:d(n.lang,"voltage"),value:Mt(t,e)?d(n.lang,"outage"):G(o,n),extra:"",extraShort:""}}function Nt(t,e,n){return{key:"tomorrow",label:d(n.lang,"tomorrow"),value:X(L(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Pt(t,e,n){return{key:"consumption",label:d(n.lang,"consumption"),value:C(g(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Dt(t,e,n){let o=t.custom,r=e.states[o.entity],s=String(r?.attributes.unit_of_measurement??""),i;if(!r||l(r)===void 0&&["unavailable","unknown",""].includes(r.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=C(g(r),n);else if(e.formatEntityState)i=e.formatEntityState(r);else{let u=l(r);i=u===void 0?r.state:M({value:p(u,Number.isInteger(u)?0:1,n),unit:s})}let a=o.icon||(typeof r?.attributes.icon=="string"?r.attributes.icon:"")||O;return{key:t.key,label:o.name||String(r?.attributes.friendly_name??o.entity),value:i,extra:"",extraShort:"",icon:a}}function It(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Vt(t,e,n){let o=It(t,e)?t.night_hero??"production":"production";if(o==="consumption"&&t.consumption_entity)return{hero:w(g(e.states[t.consumption_entity]),n),label:d(n.lang,"consumption"),labelShort:d(n.lang,"consumption_short")};if(o==="battery"&&t.battery?.soc_entity){let r=l(e.states[t.battery.soc_entity]);return{hero:r===void 0?{value:"\u2014",unit:""}:{value:p(Math.round(r),0,n),unit:"%"},label:d(n.lang,"battery")}}return{hero:w(P(t,e),n)}}function et(t,e){let n=B(e),o=t.battery?.power_threshold??wt,r=t.daily_production_entities?.length?d(n.lang,"produced",{value:R(kt(t,e),n)}):void 0,s=N(t).map(b=>{switch(b.kind){case"battery":return Rt(t,e,n,o);case"grid":return Ht(t,e,n);case"voltage":return Ot(t,e,n);case"tomorrow":return Nt(t,e,n);case"consumption":return Pt(t,e,n);case"custom":return Dt(b,e,n)}}),{hero:i,label:a,labelShort:u=a}=Vt(t,e,n),V=b=>b?[b,r].filter(Boolean).join(" \xB7 "):r;return{hero:i,context:V(a),contextShort:V(u),metrics:s}}var nt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},ot="Bleu";var ce=[255/255,214/255,140/255],$t=.55;var Ft=6e3,zt=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,rt=t=>typeof t=="string"&&zt.test(t);function Kt(t,e){let n={...nt,...t.tariff_palettes??{}},o=String(e??"").toLowerCase(),r=Object.keys(n).find(s=>s.toLowerCase()===o);return r?n[r]:t.tariff_palettes?.[ot]??nt[ot]}function it(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,o=P(t,e)??0,r=t.production_max&&t.production_max>0?t.production_max:Ft,s=Math.min(Math.max(o,0)/r,1);return{mode:n==="below_horizon"?"night":"day",palette:Kt(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(s*$t*1e3)/1e3,producing:o>0}}function Ut(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var at=46,st={right:46,bottom:47},Wt=(t,e)=>e>at||t<st.right&&e<st.bottom;function jt(t=24301){let e=Ut(t),n=(r,s=1)=>Math.round(r*10**s)/10**s,o=[];for(;o.length<38;){let r=n(2+e()*96),s=n(3+e()*(at-3));Wt(r,s)||o.push({x:r,y:s,size:n(1.4+e()*.8,2),twinkle:o.length>=24,delay:n(e()*5,2)})}return o}function dt(t=jt()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;animation-delay:-${e.delay}s"></i>`).join("")+'<i class="shooting"></i>'}var Bt="(prefers-reduced-motion: reduce)";function Xt(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var A=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Bt),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let o=n.at(-1);o&&(this.outOfView=!o.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return Xt({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var Gt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",y=t=>t!==void 0&&t.action!=="none";function lt(t,e){let n=t??{},o={entity:e};for(let r of["tap_action","hold_action","double_tap_action"])Gt(n[r])&&(o[r]=n[r]);return o}function pt(t){return t.tap_action===void 0?!!t.entity:y(t.tap_action)}function ct(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function v(t,e,n){let o=e[`${n}_action`];if(o===void 0){n==="tap"&&e.entity&&ct(t,"hass-more-info",{entityId:e.entity});return}y(o)&&ct(t,"hass-action",{config:e,action:n})}var D=class{constructor(e,n,o){this.el=e;this.host=n;this.config=o;this.origin=null;this.holdFired=!1;e.addEventListener("pointerdown",r=>this.down(r)),e.addEventListener("pointermove",r=>this.move(r)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",r=>this.key(r)),e.addEventListener("contextmenu",r=>{y(this.config().hold_action)&&r.preventDefault()})}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.holdFired=!1,y(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,v(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,o=e.clientY-this.origin.y;n*n+o*o>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!y(e.double_tap_action)){v(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,v(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,v(this.host,this.config(),"tap")},250)}key(e){e.target!==this.el||e.key!=="Enter"&&e.key!==" "||pt(this.config())&&(e.preventDefault(),v(this.host,this.config(),"tap"))}},ut=new WeakSet;function ft(t,e,n){ut.has(t)||(ut.add(t),new D(t,e,n))}function mt(t,e){let n=pt(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let o=y(e.hold_action)?"none":"";t.style.userSelect=o,t.style.setProperty("-webkit-user-select",o),t.style.setProperty("-webkit-touch-callout",o)}var ht=[56,48,40];function c(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var qt=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function Yt(t){if(!t||typeof t!="object")throw c("Configuration invalide","Invalid configuration");let e=J(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(i=>typeof i=="string"&&i.length>0)))throw c("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw c("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>x)throw c(`cells : une liste de ${x} cases au plus`,`cells: a list of at most ${x} cells`);for(let i of e.cells)if(!(typeof i=="string"?E.includes(i):!!i&&typeof i=="object"&&typeof i.entity=="string"&&!!i.entity))throw c(`cells : \xAB ${String(typeof i=="object"?JSON.stringify(i):i)} \xBB n'est ni ${E.join(", ")}, ni { entity: \u2026 }`,`cells: "${String(typeof i=="object"?JSON.stringify(i):i)}" is neither ${E.join(", ")} nor { entity: \u2026 }`)}for(let[i,a]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(a!==void 0&&typeof a!="boolean")throw c(`${i} doit valoir true ou false`,`${i} must be true or false`);let r=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[i,a]of r)if(!qt(a))throw c(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(e.animate!==void 0&&typeof e.animate!="boolean")throw c("animate doit valoir true ou false","animate must be true or false");let s=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[i,a]of s)if(a!==void 0&&(typeof a!="number"||!Number.isFinite(a)||a<0))throw c(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`);if(e.tariff_palettes!==void 0){let i=e.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw c("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,u]of Object.entries(i))if(!Array.isArray(u)||u.length!==3||!u.every(rt))throw c(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e}var I=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new A(this);this.actions={};this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Yt(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit()}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,o=N(n);this.root.innerHTML=`
            <style>${U}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div></div>
                    <div class="layer night">${dt()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    <div class="grid">${o.map(s=>`
                        <div class="metric" data-metric="${s.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span></div>
                        </div>`).join("")}</div>
                </div>
            </ha-card>`;let r=(s,i=this.root)=>i.querySelector(s);this.refs={card:r("ha-card"),heroValue:r(".hero-value"),heroUnit:r(".hero-unit"),context:r(".context"),contextFull:r(".context-full"),contextShort:r(".context-short"),metrics:new Map(o.map(s=>{let i=r(`[data-metric="${s.key}"]`),a=r("ha-icon",i);return a.setAttribute("icon",s.kind==="custom"?s.custom.icon||O:H[s.kind]),[s.key,{icon:a,label:r(".label-text",i),value:r(".value-main",i),extra:r(".extra-full",i),extraShort:r(".extra-short",i)}]}))},this.actions=lt(n,S(n)[0]),ft(this.refs.card,this,()=>this.actions),mt(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}fit(){this.fitLayout(),this.fitExtras()}fitLayout(){let n=this.refs;if(!n)return;let o=n.card.querySelector(".content"),r=n.heroValue.parentElement,s=()=>r.scrollWidth>r.clientWidth+1||o.scrollHeight>o.clientHeight+1;for(let i of[!1,!0]){this.toggleAttribute("data-compact",i);for(let a of ht)if(a===ht[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(a)),!s())return}}fitExtras(){if(!this.refs)return;let n=r=>r.scrollWidth>r.clientWidth+1;this.removeAttribute("data-short-extra"),this.removeAttribute("data-short-context"),[...this.refs.metrics.values()].map(r=>r.value.parentElement).some(n)&&this.setAttribute("data-short-extra",""),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","")}stateKey(n){let o=tt(this.config);return[T(n),n.locale?.number_format??"",...o.map(r=>n.states[r]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let o=et(this.config,this._hass),r=this.refs;this.paintSky();let s=this.fitSensitiveText();f(r.heroValue,o.hero.value),f(r.heroUnit,o.hero.unit),r.context.hidden=o.context===void 0,f(r.contextFull,o.context??""),f(r.contextShort,o.contextShort??"");for(let i of o.metrics){let a=r.metrics.get(i.key);a&&(f(a.label,i.label),f(a.value,i.value),f(a.extra,i.extra),f(a.extraShort,i.extraShort),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}s!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(o=>[o.value,o.extra])].map(o=>o.textContent).join("|")}paintSky(){let n=it(this.config,this._hass),o=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((r,s)=>o.style.setProperty(`--esc-c${s}`,r)),o.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return 4}static getStubConfig(n){let o=n?.states??{};return{production_entity:Object.values(o).find(s=>s.entity_id.startsWith("sensor.")&&(s.attributes.device_class==="power"||s.attributes.unit_of_measurement==="W"))?.entity_id??"sensor.production_pv",sun_entity:"sun.sun"}}static async getConfigElement(){return customElements.get(h)||await K(),document.createElement(h)}};function f(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(m)||(customElements.define(m,I),window.customCards=window.customCards||[],window.customCards.push({type:m,name:k,description:$,preview:!0,documentationURL:F}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${k} %c ${z} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
