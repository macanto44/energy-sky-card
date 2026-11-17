"use strict";(()=>{var k="energy-sky-card",T=`${k}-editor`,rt="Energy Sky Card",$t="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Ht="https://github.com/macanto44/energy-sky-card",Rt="0.3.3";function ve(t,e){let n=`${k}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),s=o.pathname.lastIndexOf("/");if(o.pathname.slice(s+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var U;function Ot(){return customElements.get(T)?Promise.resolve():(U??(U=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=ve(T,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(T)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw U=void 0,t})),U)}var _e=new Set(["unavailable","unknown","none",""]);function x(t){if(!t||_e.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ee={mw:1e6,kw:1e3,w:1},Se={mwh:1e3,kwh:1,wh:.001};function Pt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function v(t){let e=x(t);return e===void 0?void 0:e*(Ee[Pt(t)]??1)}function it(t){let e=x(t);return e===void 0?void 0:e*(Se[Pt(t)]??1)}var Ce={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function at(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function g(t,e,n={}){return Ce[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Ae(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return Nt(void 0);default:return Nt(t?.locale?.language||t?.language||"en")}}function Nt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function X(t){return{lang:at(t),decimal:Ae(t)}}function w(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function q(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:w(Math.round(t),0,e),unit:"W"}:{value:w(t/1e3,1,e),unit:"kW"}}function st({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function _(t,e){return st(q(t,e))}function dt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":w(t,1,e)}function It(t,e){let n=dt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Wt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,e)}\xA0V`}function Y(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function Dt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${w(Math.round(t),0,n)} ${e||"\xB0C"}`}var lt=20,ke=["warning","alarm"];function Vt(t){let e="power_threshold"in t,n=!!t.battery&&"lock_entities"in t.battery;if(!e&&!n)return t;let{power_threshold:r,...o}=t,{lock_entities:s,...i}=t.battery??{};return n&&(i.soc_reached_entities??(i.soc_reached_entities=s)),e&&(i.power_threshold??(i.power_threshold=r)),{...o,battery:i}}var L={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},ct="mdi:gauge",W=Object.keys(L),D=4,ut=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",Kt=t=>typeof t=="object"&&t!==null&&!ut(t)&&typeof t.type=="string",Te=t=>typeof t=="string"?t:Kt(t)?t.type:void 0;function Le(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function pt(t){if(!t.cells)return Le(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,D).flatMap((n,r)=>{if(ut(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=Te(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...Kt(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function zt(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function jt(t){return t.cell_tap==="card"?!1:t.cell_tap==="more-info"||t.tap_action===void 0}function $(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function F(t,e){let n=$(t).map(r=>v(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var Bt=(t,e)=>t===void 0||!e?t:-t;function ft(t,e){return Bt(v(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function ht(t,e){return Bt(v(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function Gt(t){let e=[...$(t),t.consumption_entity,...(t.cells??[]).filter(ut).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Me(t,e){let n=(t.daily_production_entities??[]).map(r=>it(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function $e(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function He(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Re(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??ke).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Oe(t,e,n,r){let o=x(e.states[t.battery?.soc_entity??""]),s=$e(ht(t,e),r),i=o===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=He(t,e),d=e.states[t.battery?.temperature_entity??""],l=x(d),c=Y(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:g(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${Dt(l,u,n)}`,extra:a?` \xB7 ${g(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${g(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${w(Math.round(l),0,n)}\xB0`,extra:a?"\u202F\u2713":""},bare:c}}}function Pe(t,e,n){return{key:"grid",label:g(n.lang,"grid"),value:_(ft(t,e),n),extra:"",extraShort:""}}function Ne(t,e,n){let r=t.grid?.voltage_entity?x(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:g(n.lang,"voltage"),value:Re(t,e)?g(n.lang,"outage"):Wt(r,n),extra:"",extraShort:""}}function Ie(t,e,n){return{key:"tomorrow",label:g(n.lang,"tomorrow"),value:It(it(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function We(t,e,n){return{key:"consumption",label:g(n.lang,"consumption"),value:_(v(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function De(t,e,n){let r=t.custom,o=e.states[r.entity],s=String(o?.attributes.unit_of_measurement??""),i;if(!o||x(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=_(v(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=x(o);i=d===void 0?o.state:st({value:w(d,Number.isInteger(d)?0:1,n),unit:s})}let a=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||ct;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:a}}function Fe(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Ve(t,e,n){let r=Fe(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:q(v(e.states[t.consumption_entity]),n),label:g(n.lang,"consumption"),labelShort:g(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=x(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:w(Math.round(o),0,n),unit:"%"},label:g(n.lang,"battery")}}return{hero:q(F(t,e),n)}}function Ut(t,e){let n=X(e),r=t.battery?.power_threshold??lt,o=t.daily_production_entities?.length?g(n.lang,"produced",{value:dt(Me(t,e),n)}):void 0,s=pt(t).map(c=>{switch(c.kind){case"battery":return Oe(t,e,n,r);case"grid":return Pe(t,e,n);case"voltage":return Ne(t,e,n);case"tomorrow":return Ie(t,e,n);case"consumption":return We(t,e,n);case"custom":return De(c,e,n)}}),{hero:i,label:a,labelShort:d=a}=Ve(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(a),contextShort:l(d),metrics:s}}var Xt={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},qt="Bleu";var Nn=[255/255,214/255,140/255],Ke=.55;var gt=6e3,J=.45,Q={x:0,y:-30,radius:100},Yt=[8,18,40],mt=.2,Jt=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],ze=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Qt=t=>typeof t=="string"&&ze.test(t);function je(t,e){let n={...Xt,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(s=>s.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[qt]??Xt[qt]}function Zt(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=F(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:gt,s=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:je(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(s*Ke*1e3)/1e3,producing:r>0}}var yt={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},C=Object.keys(yt),te=20,R=t=>Math.max(t??0,0);function Be(t,e,n,r){let o=R(t),s=R(e===void 0?void 0:-e),i=R(e),a=R(n),d=R(n===void 0?void 0:-n),l=Math.min(s,o);o-=l;let c=Math.min(s-l,d),u=Math.min(a,o);o-=u;let f=Math.min(a-u,i),h={sh:o,sg:l,sb:u,gh:i-f,bh:d-c,gb:f,bg:c};for(let p of C)h[p]<te&&(h[p]=0);return{wires:h,home:r??(t!==void 0||e!==void 0||n!==void 0?h.sh+h.gh+h.bh:void 0)}}function Ge(t){return t<te?0:t<500?1:t<1500?2:t<3e3?3:4}function ee(t,e){switch(e){case"solar":return $(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}function ne(t,e){let n=X(e),r=F(t,e),o=ft(t,e),s=ht(t,e),i=t.battery?.power_threshold??lt,a=s!==void 0&&Math.abs(s)<=i?0:s,d=v(e.states[t.consumption_entity??""]),l=Be(r,o,a,d),c=t.production_max&&t.production_max>0?t.production_max:gt,u=x(e.states[t.battery?.soc_entity??""]),f={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},h=f.sun+f.grid+f.batt,m=Object.fromEntries(C.map(p=>[p,Ge(l.wires[p])]));return{nodes:{solar:{present:!0,label:g(n.lang,"solar"),value:_(r,n),ring:[[Math.min(R(r)/c,1),"sun"]]},grid:{present:!!t.grid?.power_entity,label:g(n.lang,"grid"),value:_(o,n),ring:[]},battery:{present:!!(t.battery?.power_entity||t.battery?.soc_entity),label:g(n.lang,"battery"),value:t.battery?.power_entity?_(s,n):Y(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:!0,label:g(n.lang,"home"),value:_(l.home,n),ring:h>0?["sun","batt","grid"].filter(p=>f[p]>0).map(p=>[f[p]/h,p]):[]}},levels:m}}var E=220,O=46,Ue=12;function Xe([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,s]=e,i=1-r,a=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*s[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(s[l]-o[l])+3*r*r*(n[l]-s[l]);return{at:[a(0),a(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var V=t=>Math.round(t*10)/10,H=([t,e])=>`${V(t)},${V(e)}`,Z=27;function oe(t){let e=Math.max(t,160),n=Math.round(Math.min(Math.max((e-48)/2,96),128)),r=Math.round(Math.min(n+20,e-n-32)),o=r/2,s=O/2,i=E/2,a=3+s,d=E-3-s,l=e/2,c=n-Z,u=e-n+Z,f=l-o+Z,h=l+o-Z,m=(S,A)=>{let I=(A[1]-S[1])/2;return[S,[[S[0],S[1]+I],[A[0],A[1]-I]],A]},p={sh:[[n,i],null,[e-n,i]],sg:m([c,i-s],[f,a+s]),gh:m([h,a+s],[u,i-s]),sb:m([c,i+s],[f,d-s]),bh:m([h,d-s],[u,i+s]),gb:[[l,a+s],null,[l,d-s]],bg:[[l,d-s],null,[l,a+s]]},kt={},Tt="";for(let S of C){let A=p[S],[I,B,Lt]=A;kt[S]=B?`M${H(I)} C${H(B[0])} ${H(B[1])} ${H(Lt)}`:`M${H(I)} L${H(Lt)}`;let G=B?Ue:1,ot=[];for(let M=0;M<=G;M++){let{at:Mt,deg:xe}=Xe(A,M/G),we=M===0||M===G?" opacity: 0;":"";ot.push(`${V(M/G*100)}% { transform: translate(${V(Mt[0])}px, ${V(Mt[1])}px) rotate(${Math.round(xe)}deg);${we} }`)}ot.push("10%, 90% { opacity: 1; }"),Tt+=`@keyframes esc-flow-${S} { ${ot.join(" ")} }
`}return{nodeWidth:n,centreWidth:r,paths:kt,keyframes:Tt}}var bt=t=>`rgba(${Yt.join(", ")}, ${t})`,re=t=>`${Math.round(t*1e3)/10}%`,qe=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${re(1-J/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${re((.6-J)/(1-J))}, var(--esc-c2, #1d4f87) 100%)`,ie=`${Q.x}px ${Q.y}px`,ae={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8"},Ye=.14,Je=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],Qe=(E-O)/2,se=`
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
    background: radial-gradient(closest-side, ${bt(mt)}, ${bt(mt/2)} 50%, ${bt(0)} 100%);
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
:host([data-layout="side"]) .layer.day { background: ${qe}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${Q.radius}px at ${ie}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${ie};
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
.flow { position: relative; height: ${E}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${Je.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.entries(ae).map(([t,e])=>`.wire.${t} { color: ${e}; }`).join(" ")}
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
    top: ${Qe}px;
    width: var(--esc-node-w);
    height: ${O}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${O/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${Ye}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: ${E-3-O}px; }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.entries(ae).map(([t,e])=>`.seg[data-source="${t}"] { stroke: ${e}; }`).join(" ")}
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
`;var xt={cols:10,rows:6},Ze=[1,.9,.8,.7,.6,.5],tn=.4,en=3,nn=1.4;function on(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var P=(t,e=1)=>Math.round(t*10**e)/10**e;function rn(t,e,n,r){return{x:P((e+.1+t()*.8)/r.cols*100),y:P((n+.1+t()*.8)/r.rows*100)}}function an(t=24301){let e=on(t),n=[];for(let r=0;r<xt.rows;r++)for(let o=0;o<xt.cols;o++){let s=e()<Ze[r],{x:i,y:a}=rn(e,o,r,xt),d=1.4+e()*.8,l=e()<tn,c=P(e()*5,2);if(!s)continue;let u=a/100;n.push({x:i,y:a,size:P(d*(1-.3*u),2),opacity:P(1-.45*u,2),twinkle:l,delay:c})}return n}var sn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],dn=t=>P(t.size/2*(t.twinkle?nn:1)+en,2);function de(t=an()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${dn(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+sn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var le=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var ln="(prefers-reduced-motion: reduce)";function cn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var tt=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(ln),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return cn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var un=["bleu","blanc","rouge"],vt=/tomorrow|demain/i,pn=/today|daily|jour|_day(_|$)/i,fn=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function hn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function gn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!vt.test(e.entity_id)&&un.includes(String(e.state).toLowerCase()))?.entity_id}function K(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var et=t=>(e,n)=>n===t,nt=t=>t[0];function wt(t,e,n){return(e&&t.states[e]?e:void 0)??nt(K(t,n,et("power")))}function mn(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),s=[...new Set(o.map(c=>wt(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];s.length&&(r.production_entity=s.length===1?s[0]:s);let i=[...new Set(o.flatMap(c=>K(e,c.stat_energy_from,(u,f)=>f==="energy"&&pn.test(u)&&!fn.test(u)&&!vt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&vt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let a=n.find(c=>c.type==="battery");if(a){let c=a.stat_energy_from??a.stat_energy_to,u=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??nt(K(e,c,et("battery"))),f=a.power_config?.stat_rate??a.stat_rate,h=wt(e,f,c),m=nt(K(e,c,et("temperature"))),p={};u&&(p.soc_entity=u),h&&(p.power_entity=h),h&&f&&h===f&&(p.invert=!0),m&&(p.temperature_entity=m),Object.keys(p).length&&(r.battery=p)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,f=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,h={};if(u&&e.states[u])Object.assign(h,{power_entity:u,invert:!0});else{let p=wt(e,f,c);p&&(h.power_entity=p)}let m=nt(K(e,c,et("voltage")));m&&(h.voltage_entity=m),Object.keys(h).length&&(r.grid=h)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function ce(t,e){let n=t?mn(e,t):{},r=gn(t);return{production_entity:hn(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function ue(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var Et=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",N=t=>t!==void 0&&t.action!=="none";function he(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])Et(n[o])&&(r[o]=n[o]);return r}function ge(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:N(t.tap_action)}function pe(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function z(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&pe(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...s}=e;N(r)&&pe(t,"hass-action",{config:s,action:n})}var _t=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{N(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,N(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,z(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!N(e.double_tap_action)){z(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,z(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,z(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());ge(o)&&(e.preventDefault(),z(this.host,o,"tap"))}},fe=new WeakSet;function me(t,e,n){fe.has(t)||(fe.add(t),new _t(t,e,n))}function ye(t,e){let n=ge(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=N(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var yn=[56,48,40],bn=[44,40,36],xn=[[],["data-short-extra"],["data-short-extra","data-tight-extra"],["data-no-extra"]],be=["data-short-extra","data-tight-extra","data-no-extra"],Ct=[["solar",L.tomorrow],["grid",L.grid],["battery",L.battery],["home",L.consumption]],St=2*Math.PI*17,wn={grid:["sg","gh","gb","bg"],battery:["sb","bh","gb","bg"]};function y(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var vn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string");function _n(t){if(!t||typeof t!="object")throw y("Configuration invalide","Invalid configuration");let e=Vt(t),n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(i=>typeof i=="string"&&i.length>0)))throw y("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");if(e.night_hero!==void 0&&!["production","consumption","battery"].includes(e.night_hero))throw y("night_hero : production, consumption ou battery","night_hero: production, consumption or battery");if(e.layout!==void 0&&!["standard","side"].includes(e.layout))throw y("layout : standard ou side","layout: standard or side");if(e.cell_tap!==void 0&&!["auto","more-info","card"].includes(e.cell_tap))throw y("cell_tap : auto, more-info ou card","cell_tap: auto, more-info or card");if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>D)throw y(`cells : une liste de ${D} cases au plus`,`cells: a list of at most ${D} cells`);for(let i of e.cells){let a=i&&typeof i=="object"?i:{},d=typeof i=="string"?W.includes(i):typeof a.entity=="string"&&!!a.entity||W.includes(a.type);if(d&&a.tap_action!==void 0&&!(a.tap_action&&typeof a.tap_action=="object"&&typeof a.tap_action.action=="string"))throw y("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)");if(!d)throw y(`cells : \xAB ${String(typeof i=="object"?JSON.stringify(i):i)} \xBB n'est ni ${W.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${String(typeof i=="object"?JSON.stringify(i):i)}" is neither ${W.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}}for(let[i,a]of[["battery.invert",e.battery?.invert],["grid.invert",e.grid?.invert]])if(a!==void 0&&typeof a!="boolean")throw y(`${i} doit valoir true ou false`,`${i} must be true or false`);let o=[["daily_production_entities",e.daily_production_entities],["battery.soc_reached_entities",e.battery?.soc_reached_entities],["grid.outage_states",e.grid?.outage_states]];for(let[i,a]of o)if(!vn(a))throw y(`${i} doit \xEAtre une liste`,`${i} must be a list`);if(e.expandable!==void 0&&typeof e.expandable!="boolean")throw y("expandable doit valoir true ou false","expandable must be true or false");if(e.animate!==void 0&&typeof e.animate!="boolean")throw y("animate doit valoir true ou false","animate must be true or false");let s=[["production_max",e.production_max],["battery.power_threshold",e.battery?.power_threshold]];for(let[i,a]of s)if(a!==void 0&&(typeof a!="number"||!Number.isFinite(a)||a<0))throw y(`${i} doit \xEAtre un nombre positif`,`${i} must be a positive number`);if(e.tariff_palettes!==void 0){let i=e.tariff_palettes;if(!i||typeof i!="object"||Array.isArray(i))throw y("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,d]of Object.entries(i))if(!Array.isArray(d)||d.length!==3||!d.every(Qt))throw y(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e}var At=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new tt(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=_n(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=n&&this.config?.expandable===!0;if(r===this.open&&this.hasAttribute("data-expanded")===r)return;this.open=r,this.toggleAttribute("data-expanded",r);let o=this.refs?.flow;o&&(o.panel.hidden=!r),this.config?.expandable&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(r)),this.fit()}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=pt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),this.toggleAttribute("data-expandable",n.expandable===!0),this.flowWidth=0,this.root.innerHTML=`
            <style>${se}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${En()}</div>
                    <div class="layer night">${de()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    ${n.expandable?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${r.map(i=>`
                        <div class="metric" data-metric="${i.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span><span class="value-tight"></span><span class="extra extra-tight"></span><span class="value-bare"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.expandable?Sn():""}
            </ha-card>`;let o=(i,a=this.root)=>a.querySelector(i);this.refs={card:o("ha-card"),flow:n.expandable?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextFull:o(".context-full"),contextShort:o(".context-short"),metrics:new Map(r.map(i=>{let a=o(`[data-metric="${i.key}"]`),d=o("ha-icon",a);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||ct:L[i.kind]),[i.key,{el:a,icon:d,label:o(".label-text",a),value:o(".value-main",a),extra:o(".extra-full",a),extraShort:o(".extra-short",a),valueTight:o(".value-tight",a),extraTight:o(".extra-tight",a),valueBare:o(".value-bare",a)}]}))},this.actions=he(n,$(n)[0]);let s=jt(n);if(this.cellTargets=new Map(r.flatMap(i=>{let a=zt(n,i),d=Et(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:a,tap:d}]]:s&&a?[[i.key,{entity:a}]]:[]})),n.expandable){let i=this.refs.heroValue.parentElement;for(let a of[i,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false");for(let[a]of Ct){let d=ee(n,a);if(!d)continue;this.cellTargets.set(`node:${a}`,{entity:d});let l=this.refs.flow.nodes.get(a).el;l.dataset.cellTarget="",l.setAttribute("role","button"),l.tabIndex=0}}for(let[i,a]of this.cellTargets){if(i.startsWith("node:"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",a.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}me(this.refs.card,this,i=>this.actionsFor(i)),ye(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.metric??"",s=r?this.cellTargets.get(o):void 0;if(!s)return this.actions;let{tap_action:i,...a}=this.actions;return{...a,entity:s.entity??this.actions.entity,...s.tap?{tap_action:s.tap}:{}}}fit(){this.fitLayout(),this.fitExtras(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=oe(r);n.svg.setAttribute("viewBox",`0 0 ${r} ${E}`),n.box.style.setProperty("--esc-node-w",`${o.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${o.centreWidth}px`),n.box.toggleAttribute("data-narrow",o.nodeWidth<112);for(let[s,i]of n.wires)for(let a of i.paths)a.setAttribute("d",o.paths[s]);n.keyframes.textContent=o.keyframes}flowRefs(){let n=(r,o=this.root)=>o.querySelector(r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(C.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(Ct.map(([r])=>{let o=n(`[data-node="${r}"]`);return[r,{el:o,label:n(".nlab",o),value:n(".nval",o),centre:n(".centre",o),segs:[...o.querySelectorAll(".seg")]}]}))}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=ne(this.config,this._hass);for(let[s,i]of n.nodes){let a=r.nodes[s];i.el.hidden===a.present&&(i.el.hidden=!a.present),b(i.label,a.label),b(i.value,a.value),b(i.centre,a.centre??""),i.el.toggleAttribute("data-centre",a.centre!==void 0);let d=0;i.segs.forEach((l,c)=>{let u=a.ring[c],f=u?Math.max(St*u[0]-(a.ring.length>1?3:0),0):0;j(l,"stroke-dasharray",`${f.toFixed(1)} ${St.toFixed(1)}`),j(l,"stroke-dashoffset",(-d).toFixed(1)),j(l,"data-source",u&&f>=1.5?u[1]:""),u&&(d+=St*u[0])})}let o=new Set;for(let s of["grid","battery"])if(!r.nodes[s].present)for(let i of wn[s])o.add(i);for(let[s,i]of n.wires)j(i.g,"data-level",String(r.levels[s])),j(i.g,"data-off",o.has(s)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-full, .context-short, .label ha-icon, .label-text, .value-main, .extra, .value-tight, .value-bare")].map(s=>s.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(s=>s.right>s.left&&s.bottom>s.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let s of n.querySelectorAll(".star")){let i=r.left+parseFloat(s.style.left)/100*r.width,a=r.top+parseFloat(s.style.top)/100*r.height,d=le(i,a,Number(s.dataset.reach),o);s.hidden!==d&&(s.hidden=d)}}fitLayout(){let n=this.refs;if(!n)return;let r=n.card.querySelector(".content"),o=n.heroValue.parentElement,s=n.context,i=()=>parseFloat(getComputedStyle(s).lineHeight)||20,a=()=>this.side&&!s.hidden&&(s.scrollWidth>s.clientWidth+1||s.scrollHeight>i()+1),d=f=>o.scrollWidth>o.clientWidth+1||r.scrollHeight>r.clientHeight+1||r.scrollWidth>r.clientWidth+1||f&&a(),l=this.side?bn:yn,c=this.side?xn:[[]],u=f=>{for(let h of[!1,!0]){this.toggleAttribute("data-compact",h);for(let m of c){for(let p of be)this.toggleAttribute(p,m.includes(p));for(let p of l)if(p===l[0]?this.removeAttribute("data-hero"):this.setAttribute("data-hero",String(p)),!d(f))return!0}}return!1};if(!this.side){u(!1);return}this.removeAttribute("data-short-context"),!u(!0)&&(this.setAttribute("data-short-context",""),!u(!0)&&(this.removeAttribute("data-short-context"),u(!1),!s.hidden&&s.scrollHeight>s.clientHeight+1&&this.setAttribute("data-short-context","")))}fitExtras(){if(!this.refs||this.side)return;let n=o=>o.scrollWidth>o.clientWidth+1;this.removeAttribute("data-short-context"),!this.refs.context.hidden&&n(this.refs.context)&&this.setAttribute("data-short-context","");for(let o of be)this.removeAttribute(o);let r=[...this.refs.metrics.values()].map(o=>o.value.parentElement);r.some(n)&&this.setAttribute("data-short-extra",""),r.some(n)&&this.setAttribute("data-tight-extra","")}stateKey(n){let r=Gt(this.config);return[at(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=Ut(this.config,this._hass),o=this.refs;this.paintSky();let s=this.fitSensitiveText();b(o.heroValue,r.hero.value),b(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0,b(o.contextFull,r.context??""),b(o.contextShort,r.contextShort??"");for(let i of r.metrics){let a=o.metrics.get(i.key);a&&(b(a.label,i.label),this.side&&a.el.title!==i.label&&(a.el.title=i.label),b(a.value,i.value),b(a.extra,i.extra),b(a.extraShort,i.extraShort),b(a.valueTight,i.tight?.value??""),b(a.extraTight,i.tight?.extra??""),a.value.parentElement.toggleAttribute("data-tight",!!i.tight),b(a.valueBare,i.bare??""),a.value.parentElement.toggleAttribute("data-bare",!!i.bare),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}this.updateFlow(),s!==this.fitSensitiveText()&&this.fit()}fitSensitiveText(){let n=this.refs;return[n.heroValue,n.heroUnit,n.contextFull,...[...n.metrics.values()].flatMap(r=>[r.value,r.extra])].map(r=>r.textContent).join("|")}paintSky(){let n=Zt(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,s)=>r.style.setProperty(`--esc-c${s}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.expandable?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return ce(n,await ue(n))}static async getConfigElement(){return customElements.get(T)||await Ot(),document.createElement(T)}};function En(){return Jt.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Sn(){let t=[1,2,3].map(o=>`<g class="comet c${o}"><circle cx="-8" r="1.3" opacity="0.25"></circle><circle cx="-4" r="1.8" opacity="0.5"></circle><circle r="2.5"></circle></g>`).join(""),n=["gb","bg",...C.filter(o=>o!=="gb"&&o!=="bg")].map(o=>`<g class="wire ${yt[o]}" data-wire="${o}" data-level="0">${o==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${t}</g>`).join(""),r=Ct.map(([o,s])=>`
        <div class="node" data-node="${o}">
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon icon="${s}"></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${E}">${n}</svg>${r}</div></div>`}function j(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(k)||(customElements.define(k,At),window.customCards=window.customCards||[],window.customCards.push({type:k,name:rt,description:$t,preview:!0,documentationURL:Ht}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${rt} %c ${Rt} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
