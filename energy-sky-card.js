"use strict";(()=>{var c="energy-sky-card",u=`${c}-editor`,x="Energy Sky Card",L="Solar production, battery and grid on a sky that follows the tariff colour and the sun",k="https://github.com/macanto44/energy-sky-card",M="0.1.2";function it(t,e){let n=`${c}.js`;for(let{src:r}of e){let i=new URL(r,"http://local/"),o=i.pathname.lastIndexOf("/");if(i.pathname.slice(o+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var b;function R(){return customElements.get(u)?Promise.resolve():(b??(b=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=it(u,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(u)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw b=void 0,t})),b)}var H=`
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
:host([data-short-extra]) .extra-short { display: inline; }
`;var ot=new Set(["unavailable","unknown","none",""]);function m(t){if(!t||ot.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var at={mw:1e6,kw:1e3,w:1},st={mwh:1e3,kwh:1,wh:.001};function O(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function f(t){let e=m(t);return e===void 0?void 0:e*(at[O(t)]??1)}function _(t){let e=m(t);return e===void 0?void 0:e*(st[O(t)]??1)}var dt={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713"},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713"}};function w(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function d(t,e,n={}){return dt[t][e].replace(/\{(\w+)\}/g,(r,i)=>n[i]??"")}function ct(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return P(void 0);default:return P(t?.locale?.language||t?.language||"en")}}function P(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function N(t){return{lang:w(t),decimal:ct(t)}}function g(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function E(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:g(Math.round(t),0,e),unit:"W"}:{value:g(t/1e3,1,e),unit:"kW"}}function ut({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function D(t,e){return ut(E(t,e))}function A(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":g(t,1,e)}function I(t,e){let n=A(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function V(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${g(Math.round(t),0,e)}\xA0V`}function $(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${g(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}var lt=20,pt=["warning","alarm"];function z(t){let e=t.battery;if(!e||!("lock_entities"in e))return t;let{lock_entities:n,...r}=e;return{...t,battery:{...r,soc_reached_entities:r.soc_reached_entities??n}}}var F={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline"};function S(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function W(t){let e=[t.production_entity,...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function ft(t,e){let n=(t.daily_production_entities??[]).map(r=>_(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,i)=>r+i,0):void 0}function ht(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function mt(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function gt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??pt).map(i=>String(i).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function yt(t,e,n,r){let i=m(e.states[t.battery.soc_entity]),o=t.battery?.power_entity?ht(f(e.states[t.battery.power_entity]),r):"none",a=i===void 0?"":o==="up"?"\xA0\u2191":o==="down"?"\xA0\u2193":"",s=mt(t,e);return{key:"battery",label:d(n.lang,"battery"),value:$(i,n)+a,extra:s?` \xB7 ${d(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${d(n.lang,"soc_reached_short")}`:""}}function bt(t,e,n){return{key:"grid",label:d(n.lang,"grid"),value:D(f(e.states[t.grid.power_entity]),n),extra:"",extraShort:""}}function vt(t,e,n){let r=t.grid?.voltage_entity?m(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:d(n.lang,"voltage"),value:gt(t,e)?d(n.lang,"outage"):V(r,n),extra:"",extraShort:""}}function xt(t,e,n){return{key:"tomorrow",label:d(n.lang,"tomorrow"),value:I(_(e.states[t.forecast_tomorrow_entity]),n),extra:"",extraShort:""}}function U(t,e){let n=N(e),r=t.power_threshold??lt,i=t.daily_production_entities?.length?d(n.lang,"produced",{value:A(ft(t,e),n)}):void 0,o=S(t).map(a=>{switch(a){case"battery":return yt(t,e,n,r);case"grid":return bt(t,e,n);case"voltage":return vt(t,e,n);case"tomorrow":return xt(t,e,n)}});return{hero:E(f(e.states[t.production_entity]),n),context:i,metrics:o}}var K={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},B="Bleu";var Bt=[255/255,214/255,140/255],_t=.55;var wt=6e3,Et=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,G=t=>typeof t=="string"&&Et.test(t);function At(t,e){let n={...K,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),i=Object.keys(n).find(o=>o.toLowerCase()===r);return i?n[i]:t.tariff_palettes?.[B]??K[B]}function X(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=f(e.states[t.production_entity])??0,i=t.production_max&&t.production_max>0?t.production_max:wt,o=Math.min(Math.max(r,0)/i,1);return{mode:n==="below_horizon"?"night":"day",palette:At(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(o*_t*1e3)/1e3,producing:r>0}}function St(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var q=46,j={right:46,bottom:47},Ct=(t,e)=>e>q||t<j.right&&e<j.bottom;function Tt(t=24301){let e=St(t),n=(i,o=1)=>Math.round(i*10**o)/10**o,r=[];for(;r.length<38;){let i=n(2+e()*96),o=n(3+e()*(q-3));Ct(i,o)||r.push({x:i,y:o,size:n(1.4+e()*.8,2),twinkle:r.length>=24,delay:n(e()*5,2)})}return r}function Y(t=Tt()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;animation-delay:-${e.delay}s"></i>`).join("")+'<i class="shooting"></i>'}var Lt="(prefers-reduced-motion: reduce)";function kt(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var v=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Lt),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return kt({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var Mt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",h=t=>t!==void 0&&t.action!=="none";function J(t,e){let n=t??{},r={entity:e};for(let i of["tap_action","hold_action","double_tap_action"])Mt(n[i])&&(r[i]=n[i]);return r}function tt(t){return t.tap_action===void 0?!!t.entity:h(t.tap_action)}function Q(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function y(t,e,n){let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Q(t,"hass-more-info",{entityId:e.entity});return}h(r)&&Q(t,"hass-action",{config:e,action:n})}var C=class{constructor(e,n,r){this.el=e;this.host=n;this.config=r;this.origin=null;this.holdFired=!1;e.addEventListener("pointerdown",i=>this.down(i)),e.addEventListener("pointermove",i=>this.move(i)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",i=>this.key(i)),e.addEventListener("contextmenu",i=>{h(this.config().hold_action)&&i.preventDefault()})}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.holdFired=!1,h(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,y(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!h(e.double_tap_action)){y(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,y(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,y(this.host,this.config(),"tap")},250)}key(e){e.target!==this.el||e.key!=="Enter"&&e.key!==" "||tt(this.config())&&(e.preventDefault(),y(this.host,this.config(),"tap"))}},Z=new WeakSet;function et(t,e,n){Z.has(t)||(Z.add(t),new C(t,e,n))}function nt(t,e){let n=tt(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=h(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var rt=[56,48,40];function l(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Rt=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function Ht(t){if(!t||typeof t!="object")throw l("Configuration invalide","Invalid configuration");let e=z(t);if(typeof e.production_entity!="string"||!e.production_entity)throw l("production_entity est obligatoire","production_entity is required");let n=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[r,i]of n)if(!Rt(i))throw l(`${r} doit \xEAtre une liste`,`${r} must be a list`);if(e.animate!==void 0&&typeof e.animate!="boolean")throw l("animate doit valoir true ou false","animate must be true or false");for(let r of["production_max","power_threshold"]){let i=e[r];if(i!==void 0&&(typeof i!="number"||!Number.isFinite(i)||i<0))throw l(`${r} doit \xEAtre un nombre positif`,`${r} must be a positive number`)}if(e.tariff_palettes!==void 0){let r=e.tariff_palettes;if(!r||typeof r!="object"||Array.isArray(r))throw l("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[i,o]of Object.entries(r))if(!Array.isArray(o)||o.length!==3||!o.every(G))throw l(`tariff_palettes.${i} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${i}: expected 3 hex colours (#rrggbb)`)}return e}var T=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new v(this);this.actions={};this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Ht(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit()}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=S(n);this.root.innerHTML=`
            <style>${H}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div></div>
                    <div class="layer night">${Y()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line"${n.daily_production_entities?.length?"":" hidden"}></div>
                    <div class="grid">${r.map(o=>`
                        <div class="metric" data-metric="${o}">
                            <div class="label line"><ha-icon icon="${F[o]}"></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span></div>
                        </div>`).join("")}</div>
                </div>
            </ha-card>`;let i=(o,a=this.root)=>a.querySelector(o);this.refs={card:i("ha-card"),heroValue:i(".hero-value"),heroUnit:i(".hero-unit"),context:i(".context"),metrics:new Map(r.map(o=>{let a=i(`[data-metric="${o}"]`);return[o,{label:i(".label-text",a),value:i(".value-main",a),extra:i(".extra-full",a),extraShort:i(".extra-short",a)}]}))},this.actions=J(n,n.production_entity),et(this.refs.card,this,()=>this.actions),nt(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}fit(){this.fitLayout(),this.fitExtras()}fitLayout(){let n=this.refs;if(!n)return;let r=n.card.querySelector(".content"),i=n.heroValue.parentElement,o=()=>i.scrollWidth>i.clientWidth+1||r.scrollHeight>r.clientHeight+1;for(let a of[!1,!0]){this.toggleAttribute("data-compact",a);for(let s of rt)if(s===rt[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(s)),!o())return}}fitExtras(){if(!this.refs)return;this.removeAttribute("data-short-extra"),[...this.refs.metrics.values()].map(r=>r.value.parentElement).some(r=>r.scrollWidth>r.clientWidth+1)&&this.setAttribute("data-short-extra","")}stateKey(n){let r=W(this.config);return[w(n),n.locale?.number_format??"",...r.map(i=>n.states[i]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=U(this.config,this._hass),i=this.refs;this.paintSky();let o=this.fitSensitiveText();p(i.heroValue,r.hero.value),p(i.heroUnit,r.hero.unit),r.context!==void 0&&p(i.context,r.context);for(let a of r.metrics){let s=i.metrics.get(a.key);s&&(p(s.label,a.label),p(s.value,a.value),p(s.extra,a.extra),p(s.extraShort,a.extraShort))}o!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,...[...n.metrics.values()].flatMap(r=>[r.value,r.extra])].map(r=>r.textContent).join("|")}paintSky(){let n=X(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((i,o)=>r.style.setProperty(`--esc-c${o}`,i)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return 4}static getStubConfig(n){let r=n?.states??{};return{production_entity:Object.values(r).find(o=>o.entity_id.startsWith("sensor.")&&(o.attributes.device_class==="power"||o.attributes.unit_of_measurement==="W"))?.entity_id??"sensor.production_pv",sun_entity:"sun.sun"}}static async getConfigElement(){return customElements.get(u)||await R(),document.createElement(u)}};function p(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(c)||(customElements.define(c,T),window.customCards=window.customCards||[],window.customCards.push({type:c,name:x,description:L,preview:!0,documentationURL:k}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${x} %c ${M} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
