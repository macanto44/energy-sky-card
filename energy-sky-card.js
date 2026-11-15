"use strict";(()=>{var c="energy-sky-card",u=`${c}-editor`,x="Energy Sky Card",L="Solar production, battery and grid on a sky that follows the tariff colour and the sun",T="https://github.com/macanto44/energy-sky-card",M="0.1.0";function ie(e,t){let n=`${c}.js`;for(let{src:i}of t){let r=new URL(i,"http://local/"),o=r.pathname.lastIndexOf("/");if(r.pathname.slice(o+1)===n)return i.replace(n,`${e}.js`)}return`${e}.js`}var b;function R(){return customElements.get(u)?Promise.resolve():(b??(b=new Promise((e,t)=>{let n=document.createElement("script");n.type="module",n.src=ie(u,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(u)?e():t(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>t(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(e=>{throw b=void 0,e})),b)}var H=`
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
.layer.day { background: linear-gradient(180deg, var(--esc-c0, #4c92d7) 0%, var(--esc-c1, #236ab2) 60%, var(--esc-c2, #1d4f87) 100%); }
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
/*
 * Motion. data-motion on the host: "on" runs, "paused" holds (tab hidden,
 * card off-screen: the phase is kept), "off" never animates (animate: false,
 * prefers-reduced-motion). Every animation below is declared under on or
 * paused only; test/motion.test.ts holds the stylesheet to that.
 */
@keyframes esc-breathe {
    from { opacity: calc(var(--esc-halo-alpha, 0) * 0.9); }
    to { opacity: calc(var(--esc-halo-alpha, 0) * 1.1); }
}
@keyframes esc-twinkle {
    from { opacity: 0.25; }
    to { opacity: 1; }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
:host([data-motion="on"][data-mode="day"][data-producing]) .halo,
:host([data-motion="paused"][data-mode="day"][data-producing]) .halo { animation: esc-breathe 4s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
:host([data-motion="on"][data-mode="night"]) .star.twinkle,
:host([data-motion="paused"][data-mode="night"]) .star.twinkle { animation: esc-twinkle 2.5s ease-in-out infinite alternate; animation-play-state: var(--esc-play); }
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .layer { animation: none !important; transition: none !important; }
}
ha-card:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
.content {
    position: relative;
    z-index: 1;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 14px 20px 12px;
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
    margin-left: 0.12em;
}
.context {
    margin-top: 0;
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: -0.012em;
}
.grid {
    margin-top: auto;
    padding-top: 7px;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 4px;
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
}
.extra { font-size: 13px; font-weight: 400; opacity: 0.8; }
`;var re=new Set(["unavailable","unknown","none",""]);function h(e){if(!e||re.has(String(e.state).toLowerCase()))return;let t=Number(e.state);return Number.isFinite(t)?t:void 0}var oe={mw:1e6,kw:1e3,w:1},ae={mwh:1e3,kwh:1,wh:.001};function O(e){return String(e?.attributes.unit_of_measurement??"").toLowerCase()}function p(e){let t=h(e);return t===void 0?void 0:t*(oe[O(e)]??1)}function _(e){let t=h(e);return t===void 0?void 0:t*(ae[O(e)]??1)}var se={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",locked:"fig\xE9e",free:"libre"},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",locked:"locked",free:"free"}};function w(e){return(e?.locale?.language||e?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function s(e,t,n={}){return se[e][t].replace(/\{(\w+)\}/g,(i,r)=>n[r]??"")}function de(e){switch(e?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return N(void 0);default:return N(e?.locale?.language||e?.language||"en")}}function N(e){try{return new Intl.NumberFormat(e).formatToParts(1.5).find(t=>t.type==="decimal")?.value??"."}catch{return"."}}function P(e){return{lang:w(e),decimal:de(e)}}function g(e,t,n){let i=e.toFixed(t);return(/^-0(\.0+)?$/.test(i)?i.slice(1):i).replace(".",n.decimal)}function E(e,t){return e===void 0||!Number.isFinite(e)?{value:"\u2014",unit:""}:Math.abs(Math.round(e))<1e3?{value:g(Math.round(e),0,t),unit:"W"}:{value:g(e/1e3,1,t),unit:"kW"}}function ce({value:e,unit:t}){return t?`${e}\xA0${t}`:e}function D(e,t){return ce(E(e,t))}function A(e,t){return e===void 0||!Number.isFinite(e)?"\u2014":g(e,1,t)}function I(e,t){let n=A(e,t);return n==="\u2014"?n:`${n}\xA0kWh`}function V(e,t){return e===void 0||!Number.isFinite(e)?"\u2014":`${g(Math.round(e),0,t)}\xA0V`}function $(e,t){return e===void 0||!Number.isFinite(e)?"\u2014":`${g(Math.round(e),0,t)}${t.lang==="fr"?"\xA0":""}%`}var ue=20,le=["warning","alarm"],F={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline"};function C(e){let t=[];return e.battery?.soc_entity&&t.push("battery"),e.grid?.power_entity&&t.push("grid"),(e.grid?.voltage_entity||e.grid?.outage_entity)&&t.push("voltage"),e.forecast_tomorrow_entity&&t.push("tomorrow"),t}function z(e){let t=[e.production_entity,...e.daily_production_entities??[],e.battery?.soc_entity,e.battery?.power_entity,...e.battery?.lock_entities??[],e.grid?.power_entity,e.grid?.voltage_entity,e.grid?.outage_entity,e.forecast_tomorrow_entity,e.tariff_color_entity,e.sun_entity??"sun.sun"];return[...new Set(t.filter(n=>typeof n=="string"&&n.length>0))]}function pe(e,t){let n=(e.daily_production_entities??[]).map(i=>_(t.states[i])).filter(i=>i!==void 0);return n.length?n.reduce((i,r)=>i+r,0):void 0}function fe(e,t){return e===void 0?"none":e>t?"up":e<-t?"down":"none"}function me(e,t){let n=e.battery?.lock_entities??[];if(n.length)return n.some(i=>t.states[i]?.state==="on")}function he(e,t){let n=e.grid?.outage_entity;return n?(e.grid?.outage_states??le).map(r=>String(r).toLowerCase()).includes(String(t.states[n]?.state??"").toLowerCase()):!1}function ge(e,t,n,i){let r=h(t.states[e.battery.soc_entity]),o=e.battery?.power_entity?fe(p(t.states[e.battery.power_entity]),i):"none",a=r===void 0?"":o==="up"?"\xA0\u2191":o==="down"?"\xA0\u2193":"",d=me(e,t);return{key:"battery",label:s(n.lang,"battery"),value:$(r,n)+a,extra:d===void 0?"":` \xB7 ${s(n.lang,d?"locked":"free")}`}}function ye(e,t,n){return{key:"grid",label:s(n.lang,"grid"),value:D(p(t.states[e.grid.power_entity]),n),extra:""}}function be(e,t,n){let i=e.grid?.voltage_entity?h(t.states[e.grid.voltage_entity]):void 0;return{key:"voltage",label:s(n.lang,"voltage"),value:he(e,t)?s(n.lang,"outage"):V(i,n),extra:""}}function ve(e,t,n){return{key:"tomorrow",label:s(n.lang,"tomorrow"),value:I(_(t.states[e.forecast_tomorrow_entity]),n),extra:""}}function U(e,t){let n=P(t),i=e.power_threshold??ue,r=e.daily_production_entities?.length?s(n.lang,"produced",{value:A(pe(e,t),n)}):void 0,o=C(e).map(a=>{switch(a){case"battery":return ge(e,t,n,i);case"grid":return ye(e,t,n);case"voltage":return be(e,t,n);case"tomorrow":return ve(e,t,n)}});return{hero:E(p(t.states[e.production_entity]),n),context:r,metrics:o}}var W={Bleu:["#4c92d7","#236ab2","#1d4f87"],Blanc:["#7c8a9d","#5d6c82","#4f5d72"],Rouge:["#d4776b","#ae453b","#76261f"]},K="Bleu";var Ke=[255/255,214/255,140/255],xe=.55,_e=6e3,we=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,B=e=>typeof e=="string"&&we.test(e);function Ee(e,t){let n={...W,...e.tariff_palettes??{}},i=String(t??"").toLowerCase(),r=Object.keys(n).find(o=>o.toLowerCase()===i);return r?n[r]:e.tariff_palettes?.[K]??W[K]}function G(e,t){let n=t.states[e.sun_entity??"sun.sun"]?.state,i=p(t.states[e.production_entity])??0,r=e.production_max&&e.production_max>0?e.production_max:_e,o=Math.min(Math.max(i,0)/r,1);return{mode:n==="below_horizon"?"night":"day",palette:Ee(e,e.tariff_color_entity?t.states[e.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(o*xe*1e3)/1e3,producing:i>0}}function Ae(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let n=t;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var X=46,j={right:46,bottom:47},Ce=(e,t)=>t>X||e<j.right&&t<j.bottom;function Se(e=24301){let t=Ae(e),n=(r,o=1)=>Math.round(r*10**o)/10**o,i=[];for(;i.length<34;){let r=n(2+t()*96),o=n(3+t()*(X-3));Ce(r,o)||i.push({x:r,y:o,size:n(1.4+t()*.8,2),twinkle:i.length>=24,delay:n(t()*5,2)})}return i}function q(e=Se()){return e.map(t=>`<i class="star${t.twinkle?" twinkle":""}" style="left:${t.x}%;top:${t.y}%;width:${t.size}px;height:${t.size}px;animation-delay:-${t.delay}s"></i>`).join("")}var ke="(prefers-reduced-motion: reduce)";function Le(e){return!e.animate||e.reducedMotion?"off":e.tabHidden||e.offscreen?"paused":"on"}var v=class{constructor(t){this.host=t;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=t=>{this.reducedMotion=t.matches,this.apply()}}setAnimate(t){this.animate=t,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(ke),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let t="100px";this.observer=new IntersectionObserver(n=>{let i=n.at(-1);i&&(this.outOfView=!i.isIntersecting),this.apply()},{rootMargin:t}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return Le({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let t=this.state;this.host.dataset.motion!==t&&(this.host.dataset.motion=t)}};var Te=e=>typeof e=="object"&&e!==null&&typeof e.action=="string",f=e=>e!==void 0&&e.action!=="none";function Z(e,t){let n=e??{},i={entity:t};for(let r of["tap_action","hold_action","double_tap_action"])Te(n[r])&&(i[r]=n[r]);return i}function J(e){return e.tap_action===void 0?!!e.entity:f(e.tap_action)}function Y(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}function y(e,t,n){let i=t[`${n}_action`];if(i===void 0){n==="tap"&&t.entity&&Y(e,"hass-more-info",{entityId:t.entity});return}f(i)&&Y(e,"hass-action",{config:t,action:n})}var S=class{constructor(t,n,i){this.el=t;this.host=n;this.config=i;this.origin=null;this.holdFired=!1;t.addEventListener("pointerdown",r=>this.down(r)),t.addEventListener("pointermove",r=>this.move(r)),t.addEventListener("pointerup",()=>this.up()),t.addEventListener("pointercancel",()=>this.reset()),t.addEventListener("pointerleave",()=>this.reset()),t.addEventListener("keydown",r=>this.key(r)),t.addEventListener("contextmenu",r=>{f(this.config().hold_action)&&r.preventDefault()})}down(t){t.button===0&&(this.reset(),this.origin={x:t.clientX,y:t.clientY},this.holdFired=!1,f(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,y(this.host,this.config(),"hold")},500)))}move(t){if(!this.origin)return;let n=t.clientX-this.origin.x,i=t.clientY-this.origin.y;n*n+i*i>100&&this.reset()}up(){let t=this.origin!==null&&!this.holdFired;this.reset(),t&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let t=this.config();if(!f(t.double_tap_action)){y(this.host,t,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,y(this.host,t,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,y(this.host,this.config(),"tap")},250)}key(t){t.target!==this.el||t.key!=="Enter"&&t.key!==" "||J(this.config())&&(t.preventDefault(),y(this.host,this.config(),"tap"))}},Q=new WeakSet;function ee(e,t,n){Q.has(e)||(Q.add(e),new S(e,t,n))}function te(e,t){let n=J(t);n?(e.setAttribute("role","button"),e.tabIndex=0):(e.removeAttribute("role"),e.removeAttribute("tabindex")),e.style.cursor=n?"pointer":"";let i=f(t.hold_action)?"none":"";e.style.userSelect=i,e.style.setProperty("-webkit-user-select",i),e.style.setProperty("-webkit-touch-callout",i)}var ne=[56,48,40];function l(e,t){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?e:t)}var Me=e=>e===void 0||Array.isArray(e)&&e.every(t=>typeof t=="string");function Re(e){if(!e||typeof e!="object")throw l("Configuration invalide","Invalid configuration");let t=e;if(typeof t.production_entity!="string"||!t.production_entity)throw l("production_entity est obligatoire","production_entity is required");let n=[["daily_production_entities",t.daily_production_entities],["battery.lock_entities",t.battery?.lock_entities],["grid.outage_states",t.grid?.outage_states]];for(let[i,r]of n)if(!Me(r))throw l(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(t.animate!==void 0&&typeof t.animate!="boolean")throw l("animate doit valoir true ou false","animate must be true or false");for(let i of["production_max","power_threshold"]){let r=t[i];if(r!==void 0&&(typeof r!="number"||!Number.isFinite(r)||r<0))throw l(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`)}if(t.tariff_palettes!==void 0){let i=t.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw l("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[r,o]of Object.entries(i))if(!Array.isArray(o)||o.length!==3||!o.every(B))throw l(`tariff_palettes.${r} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${r}: expected 3 hex colours (#rrggbb)`)}return t}var k=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new v(this);this.actions={};this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Re(n),this.build(),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit()}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,i=C(n);this.root.innerHTML=`
            <style>${H}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div></div>
                    <div class="layer night">${q()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line"${n.daily_production_entities?.length?"":" hidden"}></div>
                    <div class="grid">${i.map(o=>`
                        <div class="metric" data-metric="${o}">
                            <div class="label line"><ha-icon icon="${F[o]}"></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join("")}</div>
                </div>
            </ha-card>`;let r=(o,a=this.root)=>a.querySelector(o);this.refs={card:r("ha-card"),heroValue:r(".hero-value"),heroUnit:r(".hero-unit"),context:r(".context"),metrics:new Map(i.map(o=>{let a=r(`[data-metric="${o}"]`);return[o,{label:r(".label-text",a),value:r(".value-main",a),extra:r(".extra",a)}]}))},this.actions=Z(n,n.production_entity),ee(this.refs.card,this,()=>this.actions),te(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}fit(){let n=this.refs;if(!n)return;let i=n.card.querySelector(".content"),r=n.heroValue.parentElement,o=()=>r.scrollWidth>r.clientWidth+1||i.scrollHeight>i.clientHeight+1;for(let a of ne)if(a===ne[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(a)),!o())return}stateKey(n){let i=z(this.config);return[w(n),n.locale?.number_format??"",...i.map(r=>n.states[r]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let i=U(this.config,this._hass),r=this.refs;this.paintSky();let o=r.heroValue.textContent+r.heroUnit.textContent;m(r.heroValue,i.hero.value),m(r.heroUnit,i.hero.unit),i.context!==void 0&&m(r.context,i.context);for(let a of i.metrics){let d=r.metrics.get(a.key);d&&(m(d.label,a.label),m(d.value,a.value),m(d.extra,a.extra))}o!==r.heroValue.textContent+r.heroUnit.textContent&&this.fit()}paintSky(){let n=G(this.config,this._hass),i=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((r,o)=>i.style.setProperty(`--esc-c${o}`,r)),i.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return{columns:12,rows:3,min_columns:6,min_rows:2}}getCardSize(){return 3}static getStubConfig(n){let i=n?.states??{};return{production_entity:Object.values(i).find(o=>o.entity_id.startsWith("sensor.")&&(o.attributes.device_class==="power"||o.attributes.unit_of_measurement==="W"))?.entity_id??"sensor.production_pv",sun_entity:"sun.sun"}}static async getConfigElement(){return customElements.get(u)||await R(),document.createElement(u)}};function m(e,t){e.textContent!==t&&(e.textContent=t)}customElements.get(c)||(customElements.define(c,k),window.customCards=window.customCards||[],window.customCards.push({type:c,name:x,description:L,preview:!0,documentationURL:T}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${x} %c ${M} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
