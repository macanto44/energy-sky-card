"use strict";(()=>{var V="energy-sky-card",W=`${V}-editor`,bt="Energy Sky Card",jt="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Gt="https://github.com/macanto44/energy-sky-card",Ut="0.3.5";function He(t,e){let n=`${V}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),a=o.pathname.lastIndexOf("/");if(o.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var st;function Bt(){return customElements.get(W)?Promise.resolve():(st??(st=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=He(W,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(W)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw st=void 0,t})),st)}var Pe=new Set(["unavailable","unknown","none",""]);function C(t){if(!t||Pe.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ne={mw:1e6,kw:1e3,w:1},Ie={mwh:1e3,kwh:1,wh:.001};function Xt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function S(t){let e=C(t);return e===void 0?void 0:e*(Ne[Xt(t)]??1)}function wt(t){let e=C(t);return e===void 0?void 0:e*(Ie[Xt(t)]??1)}var De={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function xt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return De[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Fe(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return qt(void 0);default:return qt(t?.locale?.language||t?.language||"en")}}function qt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function dt(t){return{lang:xt(t),decimal:Fe(t)}}function M(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function ct(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:M(Math.round(t),0,e),unit:"W"}:{value:M(t/1e3,1,e),unit:"kW"}}function _t({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function L(t,e){return _t(ct(t,e))}function vt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":M(t,1,e)}function Yt(t,e){let n=vt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Jt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}\xA0V`}function lt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function Qt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,n)} ${e||"\xB0C"}`}var Et=20,Ve=["warning","alarm"],K={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},Ct="mdi:gauge",Z=Object.keys(K),tt=4,O=4;function te(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var St=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",ee=t=>typeof t=="object"&&t!==null&&!St(t)&&typeof t.type=="string",We=t=>typeof t=="string"?t:ee(t)?t.type:void 0;function Ke(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function At(t){if(!t.cells)return Ke(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,tt).flatMap((n,r)=>{if(St(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=We(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...ee(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function ne(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function B(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function et(t,e){let n=B(t).map(r=>S(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var oe=(t,e)=>t===void 0||!e?t:-t;function kt(t,e){return oe(S(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Mt(t,e){return oe(S(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function re(t){let e=[...B(t),t.consumption_entity,...(t.cells??[]).filter(St).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function ze(t,e){let n=(t.daily_production_entities??[]).map(r=>wt(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function je(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Ge(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Ue(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Ve).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Be(t,e,n,r){let o=C(e.states[t.battery?.soc_entity??""]),a=je(Mt(t,e),r),i=o===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=Ge(t,e),d=e.states[t.battery?.temperature_entity??""],l=C(d),c=lt(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${Qt(l,u,n)}`,extra:s?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${M(Math.round(l),0,n)}\xB0`,extra:s?"\u202F\u2713":""},bare:c}}}function Xe(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:L(kt(t,e),n),extra:"",extraShort:""}}function qe(t,e,n){let r=t.grid?.voltage_entity?C(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:Ue(t,e)?y(n.lang,"outage"):Jt(r,n),extra:"",extraShort:""}}function Ye(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:Yt(wt(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Je(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:L(S(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Qe(t,e,n){let r=t.custom,o=e.states[r.entity],a=String(o?.attributes.unit_of_measurement??""),i;if(!o||C(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(a))i=L(S(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=C(o);i=d===void 0?o.state:_t({value:M(d,Number.isInteger(d)?0:1,n),unit:a})}let s=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||Ct;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:s}}function Ze(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function tn(t,e,n){let r=Ze(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:ct(S(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=C(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:M(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:ct(et(t,e),n)}}function ie(t,e){let n=dt(e),r=t.battery?.power_threshold??Et,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:vt(ze(t,e),n)}):void 0,a=At(t).map(c=>{switch(c.kind){case"battery":return Be(t,e,n,r);case"grid":return Xe(t,e,n);case"voltage":return qe(t,e,n);case"tomorrow":return Ye(t,e,n);case"consumption":return Je(t,e,n);case"custom":return Qe(c,e,n)}}),{hero:i,label:s,labelShort:d=s}=tn(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(s),contextShort:l(d),metrics:a}}var ae={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},se="Bleu";var Qn=[255/255,214/255,140/255],en=.55;var Lt=6e3,ut=.45,pt={x:0,y:-30,radius:100},de=[8,18,40],Tt=.2,ce=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],nn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,le=t=>typeof t=="string"&&nn.test(t);function on(t,e){let n={...ae,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(a=>a.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[se]??ae[se]}function ue(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=et(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:Lt,a=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:on(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*en*1e3)/1e3,producing:r>0}}var $t={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},rn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},P=Object.keys($t),fe=20,z=t=>Math.max(t??0,0);function an(t,e,n,r){let o=z(t),a=z(e===void 0?void 0:-e),i=z(e),s=z(n),d=z(n===void 0?void 0:-n),l=Math.min(a,o);o-=l;let c=Math.min(a-l,d),u=Math.min(s,o);o-=u;let m=Math.min(s-u,i),p={sh:o,sg:l,sb:u,gh:i-m,bh:d-c,gb:m,bg:c};for(let g of P)p[g]<fe&&(p[g]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function pe(t){return t<fe?0:t<500?1:t<1500?2:t<3e3?3:4}function Rt(t,e){switch(e){case"solar":return B(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}var sn="mdi:power-plug-outline";function he(t,e){let n=dt(e),r=et(t,e),o=kt(t,e),a=Mt(t,e),i=t.battery?.power_threshold??Et,s=a!==void 0&&Math.abs(a)<=i?0:a,d=S(e.states[t.consumption_entity??""]),l=an(r,o,s,d),c=t.production_max&&t.production_max>0?t.production_max:Lt,u=C(e.states[t.battery?.soc_entity??""]),m={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},p=m.sun+m.grid+m.batt,f=h=>h==="solar"||h==="home"||!!Rt(t,h),g=Object.fromEntries(P.map(h=>[h,pe(l.wires[h])]));return{nodes:{solar:{present:f("solar"),label:y(n.lang,"solar"),value:L(r,n),ring:[[Math.min(z(r)/c,1),"sun"]]},grid:{present:f("grid"),label:y(n.lang,"grid"),value:L(o,n),ring:[]},battery:{present:f("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?L(a,n):lt(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:f("home"),label:y(n.lang,"home"),value:L(l.home,n),ring:p>0?["sun","batt","grid"].filter(h=>m[h]>0).map(h=>[m[h]/p,h]):[]}},consumers:(t.consumers??[]).slice(0,O).map(h=>{let v=e.states[h.entity],k=z(S(v)),Q=N=>typeof v?.attributes[N]=="string"?v.attributes[N]:void 0;return{label:h.name||Q("friendly_name")||h.entity,icon:h.icon||Q("icon")||sn,value:L(S(v),n),share:l.home?Math.min(k/l.home,1):0,level:pe(k)}}),levels:g,off:P.filter(h=>!rn[h].every(f))}}var T=220,H=46,dn=12,cn=46;function ln([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,a]=e,i=1-r,s=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*a[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(a[l]-o[l])+3*r*r*(n[l]-a[l]);return{at:[s(0),s(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var j=t=>Math.round(t*10)/10,X=([t,e])=>`${j(t)},${j(e)}`,ft=27;function me(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),a=o/2,i=H/2,s=T/2,d=3+i,l=T-3-i,c=n/2,u=r-ft,m=n-r+ft,p=c-a+ft,f=c+a-ft,g=(b,w)=>{let $=(w[1]-b[1])/2;return[b,[[b[0],b[1]+$],[w[0],w[1]-$]],w]},h={sh:[[r,s],null,[n-r,s]],sg:g([u,s-i],[p,d+i]),gh:g([f,d+i],[m,s-i]),sb:g([u,s+i],[p,l-i]),bh:g([f,l-i],[m,s+i]),gb:[[c,d+i],null,[c,l-i]],bg:[[c,l-i],null,[c,d+i]]},v=n-(c+a)-8,k=e>2||v<110,Q=k&&v<100?1:2,N=[];for(let b=0;b<e;b++){let w=b%2===1,$=Math.floor(b/2),I=Math.min(w?Math.floor(e/2):Math.ceil(e/2),Q),D=w?T-3-H:3,F=w?s+i:s-i,G=w?D:D+H;if($>=Q){N.push({visible:!1,compact:k,below:w,left:0,top:D,width:0,path:""});continue}let E,R;if(k){let U=v/I,at=n-v+U*($+.5)+4;R=cn,E=at-R/2,h[`c${b}`]=g([n-r/2+(I>1?($-.5)*30:10),F],[at,G])}else{R=Math.min(r,v),E=n-R;let U=E+R/2+10;h[`c${b}`]=[[U,F],null,[U,G]]}N.push({visible:!0,compact:k,below:w,left:j(E),top:D,width:j(R),path:""})}let yt={},zt="";for(let[b,w]of Object.entries(h)){let[$,I,D]=w;yt[b]=I?`M${X($)} C${X(I[0])} ${X(I[1])} ${X(D)}`:`M${X($)} L${X(D)}`;let F=I?dn:1,G=[];for(let E=0;E<=F;E++){let{at:R,deg:U}=ln(w,E/F),at=E===0||E===F?" opacity: 0;":"";G.push(`${j(E/F*100)}% { transform: translate(${j(R[0])}px, ${j(R[1])}px) rotate(${Math.round(U)}deg);${at} }`)}G.push("10%, 90% { opacity: 1; }"),zt+=`@keyframes esc-flow-${b} { ${G.join(" ")} }
`}return N.forEach((b,w)=>{b.path=yt[`c${w}`]??""}),{nodeWidth:r,centreWidth:o,paths:yt,consumers:N,keyframes:zt}}var Ot=t=>`rgba(${de.join(", ")}, ${t})`,ge=t=>`${Math.round(t*1e3)/10}%`,un=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${ge(1-ut/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${ge((.6-ut)/(1-ut))}, var(--esc-c2, #1d4f87) 100%)`,ye=`${pt.x}px ${pt.y}px`,be={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},pn=.14,fn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],hn=(T-H)/2,nt=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,we=`
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
    background: radial-gradient(closest-side, ${Ot(Tt)}, ${Ot(Tt/2)} 50%, ${Ot(0)} 100%);
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
${nt('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${nt('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${nt('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${nt('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${nt("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${un}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${pt.radius}px at ${ye}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${ye};
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
 * The energy flow (flow: tap or always): the card sets its own height (the grid's
 * rows: auto), the sky stays on the top part at its usual height, and the
 * flow unfolds below on the gradient's last colour (the darkest).
 */
:host([data-flow]) { height: auto; --esc-top-h: 248px; }
:host([data-flow][data-layout="side"]) { --esc-top-h: 120px; }
:host([data-flow]) ha-card { height: auto; }
:host([data-flow]) .content { height: var(--esc-top-h); }
:host([data-flow]) .sky { bottom: auto; height: var(--esc-top-h); }
:host([data-flow][data-mode="day"]) ha-card { background: var(--esc-c2, #1d4f87); }
:host([data-ready][data-flow]:not([data-motion="off"])) ha-card { transition: background-color 3s ease-in-out; }
:host([data-flow="tap"]) .hero, :host([data-flow="tap"]) .context { cursor: pointer; }
:host([data-flow="tap"]) .hero:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }
.grabber { position: absolute; left: 50%; bottom: 5px; width: 28px; height: 3px; margin-left: -14px; border-radius: 2px; background: rgba(255, 255, 255, 0.35); }
.panel { position: relative; z-index: 1; margin: 0 20px; padding: 10px 0 14px; border-top: 1px solid rgba(255, 255, 255, 0.22); font-family: var(--esc-font); }
:host([data-layout="side"]) .panel { margin: 0 18px 0 20px; }
.flow { position: relative; height: ${T}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${fn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.entries(be).map(([t,e])=>`.wire.${t} { color: ${e}; }`).join(" ")}
${[...P,...Array.from({length:O},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: ${hn}px;
    width: var(--esc-node-w);
    height: ${H}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${H/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${pn}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: ${T-3-H}px; }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.entries(be).map(([t,e])=>`.seg[data-source="${t}"] { stroke: ${e}; }`).join(" ")}
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
/* An appliance at rest: its disc dims, its text stays readable */
.node[data-idle] .disc { opacity: 0.55; }
/* Compact appliances (more than two, or a narrow corner): the icon in its ring and the power; the name on hover (title) and for screen readers (aria-label) */
.flow[data-compact] .node[data-consumer] { flex-direction: column; justify-content: flex-start; gap: 3px; padding: 0; border: none; background: none; border-radius: 0; }
.flow[data-compact] .node[data-consumer][data-side="below"] { flex-direction: column-reverse; }
.flow[data-compact] .node[data-consumer] .disc { width: 30px; height: 30px; }
.flow[data-compact] .node[data-consumer] .ring { width: 36px; height: 36px; }
.flow[data-compact] .node[data-consumer] .ntext { align-items: center; max-width: 100%; }
.flow[data-compact] .node[data-consumer] .nlab { display: none; }
.flow[data-compact] .node[data-consumer] .nval { font-size: 11.5px; font-weight: 600; line-height: 13px; }
`;var Ht={cols:10,rows:6},mn=[1,.9,.8,.7,.6,.5],gn=.4,yn=3,bn=1.4;function wn(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var q=(t,e=1)=>Math.round(t*10**e)/10**e;function xn(t,e,n,r){return{x:q((e+.1+t()*.8)/r.cols*100),y:q((n+.1+t()*.8)/r.rows*100)}}function _n(t=24301){let e=wn(t),n=[];for(let r=0;r<Ht.rows;r++)for(let o=0;o<Ht.cols;o++){let a=e()<mn[r],{x:i,y:s}=xn(e,o,r,Ht),d=1.4+e()*.8,l=e()<gn,c=q(e()*5,2);if(!a)continue;let u=s/100;n.push({x:i,y:s,size:q(d*(1-.3*u),2),opacity:q(1-.45*u,2),twinkle:l,delay:c})}return n}var vn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],En=t=>q(t.size/2*(t.twinkle?bn:1)+yn,2);function xe(t=_n()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${En(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+vn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var _e=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var Cn="(prefers-reduced-motion: reduce)";function Sn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var ht=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Cn),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return Sn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var An=["bleu","blanc","rouge"],Nt=/tomorrow|demain/i,kn=/today|daily|jour|_day(_|$)/i,Mn=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function Ln(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function Tn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!Nt.test(e.entity_id)&&An.includes(String(e.state).toLowerCase()))?.entity_id}function ot(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var mt=t=>(e,n)=>n===t,gt=t=>t[0];function Pt(t,e,n){return(e&&t.states[e]?e:void 0)??gt(ot(t,n,mt("power")))}function $n(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),a=[...new Set(o.map(c=>Pt(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];a.length&&(r.production_entity=a.length===1?a[0]:a);let i=[...new Set(o.flatMap(c=>ot(e,c.stat_energy_from,(u,m)=>m==="energy"&&kn.test(u)&&!Mn.test(u)&&!Nt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&Nt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let s=n.find(c=>c.type==="battery");if(s){let c=s.stat_energy_from??s.stat_energy_to,u=(s.stat_soc&&e.states[s.stat_soc]?s.stat_soc:void 0)??gt(ot(e,c,mt("battery"))),m=s.power_config?.stat_rate??s.stat_rate,p=Pt(e,m,c),f=gt(ot(e,c,mt("temperature"))),g={};u&&(g.soc_entity=u),p&&(g.power_entity=p),p&&m&&p===m&&(g.invert=!0),f&&(g.temperature_entity=f),Object.keys(g).length&&(r.battery=g)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,m=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let g=Pt(e,m,c);g&&(p.power_entity=g)}let f=gt(ot(e,c,mt("voltage")));f&&(p.voltage_entity=f),Object.keys(p).length&&(r.grid=p)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function ve(t,e){let n=t?$n(e,t):{},r=Tn(t);return{production_entity:Ln(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Ee(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var J=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",Y=t=>t!==void 0&&t.action!=="none";function Ae(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])J(n[o])&&(r[o]=n[o]);return r}function ke(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:Y(t.tap_action)}function Ce(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function rt(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Ce(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...a}=e;Y(r)&&Ce(t,"hass-action",{config:a,action:n})}var It=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{Y(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,Y(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,rt(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!Y(e.double_tap_action)){rt(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,rt(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,rt(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());ke(o)&&(e.preventDefault(),rt(this.host,o,"tap"))}},Se=new WeakSet;function Me(t,e,n){Se.has(t)||(Se.add(t),new It(t,e,n))}function Le(t,e){let n=ke(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=Y(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var Rn=[56,48,40],On=[44,40,36],Te=[0,1,2],Dt=[0,1,2,3],Wt=[["solar",K.tomorrow],["grid",K.grid],["battery",K.battery],["home",K.consumption]],Ft=2*Math.PI*17;function x(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Hn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),Vt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),$e=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,Pn=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]]],Nn=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],In=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],Hn,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Dn(t){if(!t||typeof t!="object")throw x("Configuration invalide","Invalid configuration");let e=t;for(let[o,a]of Nn)if(Vt(e,o)!==void 0)throw x(`${o} n'existe plus : ${a.fr}`,`${o} is gone: ${a.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw x("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,a]of Pn){let i=Vt(e,o);if(i!==void 0&&!a.includes(i))throw x(`${o} : ${$e(a,"ou")}`,`${o}: ${$e(a,"or")}`)}for(let[o,a,i,s]of In)for(let d of o)if(!a(Vt(e,d)))throw x(`${d} ${i}`,`${d} ${s}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>tt)throw x(`cells : une liste de ${tt} cases au plus`,`cells: a list of at most ${tt} cells`);for(let o of e.cells){let a=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?Z.includes(o):typeof a.entity=="string"&&!!a.entity||Z.includes(a.type))){let s=String(typeof o=="object"?JSON.stringify(o):o);throw x(`cells : \xAB ${s} \xBB n'est ni ${Z.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${s}" is neither ${Z.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(a.tap_action!==void 0&&!J(a.tap_action))throw x("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>O)throw x(`consumers : une liste de ${O} appareils au plus`,`consumers: a list of at most ${O} appliances`);for(let o of e.consumers){let a=o&&typeof o=="object"?o:{};if(typeof a.entity!="string"||!a.entity)throw x("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(a.tap_action!==void 0&&!J(a.tap_action))throw x("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw x("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(le))throw x(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var Kt=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new ht(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Dn(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=At(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),_(this,"data-flow",n.flow??null),this.flowWidth=0,this.fitted="",this.root.innerHTML=`
            <style>${we}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Fn()}</div>
                    <div class="layer night">${xe()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    ${n.flow==="tap"?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${r.map(i=>`
                        <div class="metric" data-metric="${i.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.flow?Vn(n.consumers?.length??0):""}
            </ha-card>`;let o=(i,s=this.root)=>it(s,i);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let s=o(`[data-metric="${i.key}"]`),d=o("ha-icon",s);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||Ct:K[i.kind]),[i.key,{el:s,icon:d,label:o(".label-text",s),value:o(".value-main",s),extra:o(".extra",s)}]}))},this.actions=Ae(n,B(n)[0]);let a=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let s=ne(n,i),d=J(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:s,tap:d}]]:a&&s?[[i.key,{entity:s}]]:[]})),n.flow==="tap"){let i=this.refs.heroValue.parentElement;for(let s of[i,this.refs.context,this.refs.flow.panel])s.dataset.cellTarget="",s.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false")}if(n.flow){for(let[i]of Wt){let s=Rt(n,i);if(!s)continue;this.cellTargets.set(`node:${i}`,{entity:s});let d=this.refs.flow.nodes.get(i).el;d.dataset.cellTarget="",d.setAttribute("role","button"),d.tabIndex=0}(n.consumers??[]).forEach((i,s)=>{let d=J(i.tap_action)?i.tap_action:void 0;this.cellTargets.set(`consumer:${s}`,{entity:i.entity,tap:d});let l=this.refs.flow.consumers[s].el;l.dataset.cellTarget="",d?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0)})}for(let[i,s]of this.cellTargets){if(i.includes(":"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",s.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}Me(this.refs.card,this,i=>this.actionsFor(i)),Le(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",a=r?this.cellTargets.get(o):void 0;if(!a)return this.actions;let{tap_action:i,...s}=this.actions;return{...s,entity:a.entity??this.actions.entity,...a.tap?{tap_action:a.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=me(r,n.consumers.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${T}`),n.box.style.setProperty("--esc-node-w",`${o.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${o.centreWidth}px`),n.box.toggleAttribute("data-narrow",o.nodeWidth<112);for(let[a,i]of n.wires)for(let s of i.paths)s.setAttribute("d",o.paths[a]);n.box.toggleAttribute("data-compact",o.consumers.some(a=>a.compact)),o.consumers.forEach((a,i)=>{let{el:s,wire:d,paths:l}=n.consumers[i];s.hidden=!a.visible,_(d,"data-off",a.visible?null:""),s.dataset.side=a.below?"below":"above",Object.assign(s.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`});for(let c of l)c.setAttribute("d",a.path)}),n.keyframes.textContent=o.keyframes}flowRefs(){let n=(r,o=this.root)=>it(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(P.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(Wt.map(([r])=>[r,Re(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let a=n(`[data-wire="c${o}"]`);return{...Re(r),icon:n("ha-icon",r),wire:a,paths:[...a.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=he(this.config,this._hass);for(let[o,a]of n.nodes){let i=r.nodes[o];a.el.hidden===i.present&&(a.el.hidden=!i.present),A(a.label,i.label),A(a.value,i.value),A(a.centre,i.centre??""),a.el.toggleAttribute("data-centre",i.centre!==void 0),Oe(a.segs,i.ring)}r.consumers.forEach((o,a)=>{let i=n.consumers[a];i&&(A(i.label,o.label),_(i.el,"title",o.label),_(i.el,"aria-label",`${o.label} ${o.value}`),A(i.value,o.value),_(i.icon,"icon",o.icon),i.el.toggleAttribute("data-idle",o.level===0),Oe(i.segs,[[o.share,"use"]]),_(i.wire,"data-level",String(o.level)))});for(let[o,a]of n.wires)_(a.g,"data-level",String(r.levels[o])),_(a.g,"data-off",r.off.includes(o)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(a=>a.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let a of n.querySelectorAll(".star")){let i=r.left+parseFloat(a.style.left)/100*r.width,s=r.top+parseFloat(a.style.top)/100*r.height,d=_e(i,s,Number(a.dataset.reach),o);a.hidden!==d&&(a.hidden=d)}}writeForms(n){this.form=n,_(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:a,extra:i}=te(r,n);A(o.value,a),A(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&A(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),a=n.heroValue.parentElement,i=n.context,s=[...n.metrics.values()].map(f=>f.value.parentElement),d=f=>f.scrollWidth>f.clientWidth+1,l=()=>parseFloat(getComputedStyle(i).lineHeight)||20,c=()=>!i.hidden&&(d(i)||i.scrollHeight>l()+1),u=f=>!d(a)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!f||(r?!c():!s.some(d))),m=r?On:Rn,p=(f,g)=>{for(let h of[!1,!0]){this.toggleAttribute("data-compact",h);for(let v of g){this.writeForms(v);for(let k of m)if(_(this,"data-hero",k===m[0]?null:String(k)),u(f))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,Te)||p(!1,Te.slice(-1)),this.writeContext(!i.hidden&&d(i));return}p(!0,Dt)||(this.writeContext(!0),!p(!0,Dt)&&(this.writeContext(!1),p(!1,Dt),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=re(this.config);return[xt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=ie(this.config,this._hass),o=this.refs;this.paintSky(),A(o.heroValue,r.hero.value),A(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let s=o.metrics.get(i.key);s&&(A(s.label,i.label),this.side&&s.el.title!==i.label&&(s.el.title=i.label),i.icon&&s.icon.getAttribute("icon")!==i.icon&&s.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow();let a=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);a!==this.fitted&&(this.fitted=a,this.fit())}paintSky(){let n=ue(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,a)=>r.style.setProperty(`--esc-c${a}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return ve(n,await Ee(n))}static async getConfigElement(){return customElements.get(W)||await Bt(),document.createElement(W)}};function Fn(){return ce.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Vn(t){let e=[1,2,3].map(s=>`<g class="comet c${s}"><circle cx="-8" r="1.3" opacity="0.25"></circle><circle cx="-4" r="1.8" opacity="0.5"></circle><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...P.filter(s=>s!=="gb"&&s!=="bg")].map(s=>`<g class="wire ${$t[s]}" data-wire="${s}" data-level="0">${s==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(s,d)=>`<g class="wire use" data-wire="c${d}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),a=(s,d)=>`
        <div class="node" ${s}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${d?` icon="${d}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,i=Wt.map(([s,d])=>a(`data-node="${s}"`,d)).join("")+Array.from({length:t},(s,d)=>a(`data-consumer="${d}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${T}">${o}${r}</svg>${i}</div></div>`}function Re(t){return{el:t,label:it(t,".nlab"),value:it(t,".nval"),centre:it(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function Oe(t,e){let n=0;t.forEach((r,o)=>{let a=e[o],i=a?Math.max(Ft*a[0]-(e.length>1?3:0),0):0;_(r,"stroke-dasharray",`${i.toFixed(1)} ${Ft.toFixed(1)}`),_(r,"stroke-dashoffset",(-n).toFixed(1)),_(r,"data-source",a&&i>=1.5?a[1]:""),a&&(n+=Ft*a[0])})}function it(t,e){return t.querySelector(e)}function _(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function A(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(V)||(customElements.define(V,Kt),window.customCards=window.customCards||[],window.customCards.push({type:V,name:bt,description:jt,preview:!0,documentationURL:Gt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${bt} %c ${Ut} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
