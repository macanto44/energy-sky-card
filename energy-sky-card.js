"use strict";(()=>{var V="energy-sky-card",W=`${V}-editor`,wt="Energy Sky Card",jt="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Gt="https://github.com/macanto44/energy-sky-card",Ut="0.3.5";function He(t,e){let n=`${V}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),s=o.pathname.lastIndexOf("/");if(o.pathname.slice(s+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var ct;function Bt(){return customElements.get(W)?Promise.resolve():(ct??(ct=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=He(W,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(W)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw ct=void 0,t})),ct)}var Pe=new Set(["unavailable","unknown","none",""]);function C(t){if(!t||Pe.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ne={mw:1e6,kw:1e3,w:1},Ie={mwh:1e3,kwh:1,wh:.001};function Xt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function S(t){let e=C(t);return e===void 0?void 0:e*(Ne[Xt(t)]??1)}function xt(t){let e=C(t);return e===void 0?void 0:e*(Ie[Xt(t)]??1)}var De={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function _t(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return De[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Fe(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return qt(void 0);default:return qt(t?.locale?.language||t?.language||"en")}}function qt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function lt(t){return{lang:_t(t),decimal:Fe(t)}}function M(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function ut(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:M(Math.round(t),0,e),unit:"W"}:{value:M(t/1e3,1,e),unit:"kW"}}function vt({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function L(t,e){return vt(ut(t,e))}function Et(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":M(t,1,e)}function Yt(t,e){let n=Et(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Jt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}\xA0V`}function pt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function Qt(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,n)} ${e||"\xB0C"}`}var Ct=20,Ve=["warning","alarm"],K={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},St="mdi:gauge",et=Object.keys(K),nt=4,O=4;function te(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var At=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",ee=t=>typeof t=="object"&&t!==null&&!At(t)&&typeof t.type=="string",We=t=>typeof t=="string"?t:ee(t)?t.type:void 0;function Ke(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function kt(t){if(!t.cells)return Ke(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,nt).flatMap((n,r)=>{if(At(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=We(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...ee(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function ne(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function q(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function ot(t,e){let n=q(t).map(r=>S(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var oe=(t,e)=>t===void 0||!e?t:-t;function Mt(t,e){return oe(S(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Lt(t,e){return oe(S(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function re(t){let e=[...q(t),t.consumption_entity,...(t.cells??[]).filter(At).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function ze(t,e){let n=(t.daily_production_entities??[]).map(r=>xt(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function je(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Ge(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Ue(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Ve).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Be(t,e,n,r){let o=C(e.states[t.battery?.soc_entity??""]),s=je(Lt(t,e),r),i=o===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=Ge(t,e),d=e.states[t.battery?.temperature_entity??""],l=C(d),c=pt(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${Qt(l,u,n)}`,extra:a?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${M(Math.round(l),0,n)}\xB0`,extra:a?"\u202F\u2713":""},bare:c}}}function Xe(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:L(Mt(t,e),n),extra:"",extraShort:""}}function qe(t,e,n){let r=t.grid?.voltage_entity?C(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:Ue(t,e)?y(n.lang,"outage"):Jt(r,n),extra:"",extraShort:""}}function Ye(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:Yt(xt(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function Je(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:L(S(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Qe(t,e,n){let r=t.custom,o=e.states[r.entity],s=String(o?.attributes.unit_of_measurement??""),i;if(!o||C(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=L(S(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=C(o);i=d===void 0?o.state:vt({value:M(d,Number.isInteger(d)?0:1,n),unit:s})}let a=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||St;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:a}}function Ze(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function tn(t,e,n){let r=Ze(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:ut(S(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=C(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:M(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:ut(ot(t,e),n)}}function ie(t,e){let n=lt(e),r=t.battery?.power_threshold??Ct,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:Et(ze(t,e),n)}):void 0,s=kt(t).map(c=>{switch(c.kind){case"battery":return Be(t,e,n,r);case"grid":return Xe(t,e,n);case"voltage":return qe(t,e,n);case"tomorrow":return Ye(t,e,n);case"consumption":return Je(t,e,n);case"custom":return Qe(c,e,n)}}),{hero:i,label:a,labelShort:d=a}=tn(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(a),contextShort:l(d),metrics:s}}var se={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},ae="Bleu";var Zn=[255/255,214/255,140/255],en=.55;var Tt=6e3,ft=.45,ht={x:0,y:-30,radius:100},de=[8,18,40],$t=.2,ce=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],nn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,le=t=>typeof t=="string"&&nn.test(t);function on(t,e){let n={...se,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(s=>s.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[ae]??se[ae]}function ue(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=ot(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:Tt,s=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:on(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(s*en*1e3)/1e3,producing:r>0}}var Rt={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},rn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},P=Object.keys(Rt),fe=20,z=t=>Math.max(t??0,0);function sn(t,e,n,r){let o=z(t),s=z(e===void 0?void 0:-e),i=z(e),a=z(n),d=z(n===void 0?void 0:-n),l=Math.min(s,o);o-=l;let c=Math.min(s-l,d),u=Math.min(a,o);o-=u;let f=Math.min(a-u,i),p={sh:o,sg:l,sb:u,gh:i-f,bh:d-c,gb:f,bg:c};for(let g of P)p[g]<fe&&(p[g]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function pe(t){return t<fe?0:t<500?1:t<1500?2:t<3e3?3:4}function Ot(t,e){switch(e){case"solar":return q(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}var an="mdi:power-plug-outline",dn=10;function he(t,e){let n=lt(e),r=ot(t,e),o=Mt(t,e),s=Lt(t,e),i=t.battery?.power_threshold??Ct,a=s!==void 0&&Math.abs(s)<=i?0:s,d=S(e.states[t.consumption_entity??""]),l=sn(r,o,a,d),c=t.production_max&&t.production_max>0?t.production_max:Tt,u=C(e.states[t.battery?.soc_entity??""]),f={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},p=f.sun+f.grid+f.batt,h=m=>m==="solar"||m==="home"||!!Ot(t,m),g=Object.fromEntries(P.map(m=>[m,pe(l.wires[m])]));return{nodes:{solar:{present:h("solar"),label:y(n.lang,"solar"),value:L(r,n),ring:[[Math.min(z(r)/c,1),"sun"]]},grid:{present:h("grid"),label:y(n.lang,"grid"),value:L(o,n),ring:[]},battery:{present:h("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?L(s,n):pt(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:h("home"),label:y(n.lang,"home"),value:L(l.home,n),ring:p>0?["sun","batt","grid"].filter(m=>f[m]>0).map(m=>[f[m]/p,m]):[]}},consumers:(t.consumers??[]).slice(0,O).map(m=>{let v=e.states[m.entity],k=S(v),G=z(k),N=t.consumer_threshold??dn,U=tt=>typeof v?.attributes[tt]=="string"?v.attributes[tt]:void 0;return{label:m.name||U("friendly_name")||m.entity,icon:m.icon||U("icon")||an,value:L(S(v),n),share:l.home?Math.min(G/l.home,1):0,level:pe(G),shown:N<=0||k!==void 0&&G>=N}}),levels:g,off:P.filter(m=>!rn[m].every(h))}}var T=220,H=46,cn=12,ln=46;function un([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,s]=e,i=1-r,a=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*s[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(s[l]-o[l])+3*r*r*(n[l]-s[l]);return{at:[a(0),a(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var j=t=>Math.round(t*10)/10,Y=([t,e])=>`${j(t)},${j(e)}`,mt=27;function me(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),s=o/2,i=H/2,a=T/2,d=3+i,l=T-3-i,c=n/2,u=r-mt,f=n-r+mt,p=c-s+mt,h=c+s-mt,g=(b,w)=>{let $=(w[1]-b[1])/2;return[b,[[b[0],b[1]+$],[w[0],w[1]-$]],w]},m={sh:[[r,a],null,[n-r,a]],sg:g([u,a-i],[p,d+i]),gh:g([h,d+i],[f,a-i]),sb:g([u,a+i],[p,l-i]),bh:g([h,l-i],[f,a+i]),gb:[[c,d+i],null,[c,l-i]],bg:[[c,l-i],null,[c,d+i]]},v=n-(c+s)-8,k=e>2||v<110,G=k&&v<100?1:2,N=[];for(let b=0;b<e;b++){let w=b%2===1,$=Math.floor(b/2),I=Math.min(w?Math.floor(e/2):Math.ceil(e/2),G),D=w?T-3-H:3,F=w?a+i:a-i,B=w?D:D+H;if($>=G){N.push({visible:!1,compact:k,below:w,left:0,top:D,width:0,path:""});continue}let E,R;if(k){let X=v/I,dt=n-v+X*($+.5)+4;R=ln,E=dt-R/2,m[`c${b}`]=g([n-r/2+(I>1?($-.5)*30:10),F],[dt,B])}else{R=Math.min(r,v),E=n-R;let X=E+R/2+10;m[`c${b}`]=[[X,F],null,[X,B]]}N.push({visible:!0,compact:k,below:w,left:j(E),top:D,width:j(R),path:""})}let U={},tt="";for(let[b,w]of Object.entries(m)){let[$,I,D]=w;U[b]=I?`M${Y($)} C${Y(I[0])} ${Y(I[1])} ${Y(D)}`:`M${Y($)} L${Y(D)}`;let F=I?cn:1,B=[];for(let E=0;E<=F;E++){let{at:R,deg:X}=un(w,E/F),dt=E===0||E===F?" opacity: 0;":"";B.push(`${j(E/F*100)}% { transform: translate(${j(R[0])}px, ${j(R[1])}px) rotate(${Math.round(X)}deg);${dt} }`)}B.push("10%, 90% { opacity: 1; }"),tt+=`@keyframes esc-flow-${b} { ${B.join(" ")} }
`}return N.forEach((b,w)=>{b.path=U[`c${w}`]??""}),{nodeWidth:r,centreWidth:o,paths:U,consumers:N,keyframes:tt}}var Ht=t=>`rgba(${de.join(", ")}, ${t})`,ge=t=>`${Math.round(t*1e3)/10}%`,pn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${ge(1-ft/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${ge((.6-ft)/(1-ft))}, var(--esc-c2, #1d4f87) 100%)`,ye=`${ht.x}px ${ht.y}px`,be={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},fn=.14,hn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],mn=(T-H)/2,rt=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
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
    background: radial-gradient(closest-side, ${Ht($t)}, ${Ht($t/2)} 50%, ${Ht(0)} 100%);
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
${rt('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${rt('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${rt('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${rt('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${rt("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${pn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${ht.radius}px at ${ye}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
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
${hn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
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
    top: ${mn}px;
    width: var(--esc-node-w);
    height: ${H}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${H/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${fn}), rgba(255, 255, 255, 0.06));
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
`;var Pt={cols:10,rows:6},gn=[1,.9,.8,.7,.6,.5],yn=.4,bn=3,wn=1.4;function xn(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var J=(t,e=1)=>Math.round(t*10**e)/10**e;function _n(t,e,n,r){return{x:J((e+.1+t()*.8)/r.cols*100),y:J((n+.1+t()*.8)/r.rows*100)}}function vn(t=24301){let e=xn(t),n=[];for(let r=0;r<Pt.rows;r++)for(let o=0;o<Pt.cols;o++){let s=e()<gn[r],{x:i,y:a}=_n(e,o,r,Pt),d=1.4+e()*.8,l=e()<yn,c=J(e()*5,2);if(!s)continue;let u=a/100;n.push({x:i,y:a,size:J(d*(1-.3*u),2),opacity:J(1-.45*u,2),twinkle:l,delay:c})}return n}var En=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],Cn=t=>J(t.size/2*(t.twinkle?wn:1)+bn,2);function xe(t=vn()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${Cn(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+En.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var _e=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var Sn="(prefers-reduced-motion: reduce)";function An(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var gt=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Sn),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return An({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var kn=["bleu","blanc","rouge"],It=/tomorrow|demain/i,Mn=/today|daily|jour|_day(_|$)/i,Ln=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function Tn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function $n(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!It.test(e.entity_id)&&kn.includes(String(e.state).toLowerCase()))?.entity_id}function it(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var yt=t=>(e,n)=>n===t,bt=t=>t[0];function Nt(t,e,n){return(e&&t.states[e]?e:void 0)??bt(it(t,n,yt("power")))}function Rn(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),s=[...new Set(o.map(c=>Nt(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];s.length&&(r.production_entity=s.length===1?s[0]:s);let i=[...new Set(o.flatMap(c=>it(e,c.stat_energy_from,(u,f)=>f==="energy"&&Mn.test(u)&&!Ln.test(u)&&!It.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&It.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let a=n.find(c=>c.type==="battery");if(a){let c=a.stat_energy_from??a.stat_energy_to,u=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??bt(it(e,c,yt("battery"))),f=a.power_config?.stat_rate??a.stat_rate,p=Nt(e,f,c),h=bt(it(e,c,yt("temperature"))),g={};u&&(g.soc_entity=u),p&&(g.power_entity=p),p&&f&&p===f&&(g.invert=!0),h&&(g.temperature_entity=h),Object.keys(g).length&&(r.battery=g)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,f=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let g=Nt(e,f,c);g&&(p.power_entity=g)}let h=bt(it(e,c,yt("voltage")));h&&(p.voltage_entity=h),Object.keys(p).length&&(r.grid=p)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function ve(t,e){let n=t?Rn(e,t):{},r=$n(t);return{production_entity:Tn(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Ee(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var Z=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",Q=t=>t!==void 0&&t.action!=="none";function Ae(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])Z(n[o])&&(r[o]=n[o]);return r}function ke(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:Q(t.tap_action)}function Ce(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function st(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Ce(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...s}=e;Q(r)&&Ce(t,"hass-action",{config:s,action:n})}var Dt=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{Q(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,Q(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,st(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!Q(e.double_tap_action)){st(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,st(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,st(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());ke(o)&&(e.preventDefault(),st(this.host,o,"tap"))}},Se=new WeakSet;function Me(t,e,n){Se.has(t)||(Se.add(t),new Dt(t,e,n))}function Le(t,e){let n=ke(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=Q(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var On=[56,48,40],Hn=[44,40,36],Te=[0,1,2],Ft=[0,1,2,3],Kt=[["solar",K.tomorrow],["grid",K.grid],["battery",K.battery],["home",K.consumption]],Vt=2*Math.PI*17;function _(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Pn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),Wt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),$e=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,Nn=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]]],In=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],Dn=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],Pn,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold","consumer_threshold"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Fn(t){if(!t||typeof t!="object")throw _("Configuration invalide","Invalid configuration");let e=t;for(let[o,s]of In)if(Wt(e,o)!==void 0)throw _(`${o} n'existe plus : ${s.fr}`,`${o} is gone: ${s.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw _("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,s]of Nn){let i=Wt(e,o);if(i!==void 0&&!s.includes(i))throw _(`${o} : ${$e(s,"ou")}`,`${o}: ${$e(s,"or")}`)}for(let[o,s,i,a]of Dn)for(let d of o)if(!s(Wt(e,d)))throw _(`${d} ${i}`,`${d} ${a}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>nt)throw _(`cells : une liste de ${nt} cases au plus`,`cells: a list of at most ${nt} cells`);for(let o of e.cells){let s=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?et.includes(o):typeof s.entity=="string"&&!!s.entity||et.includes(s.type))){let a=String(typeof o=="object"?JSON.stringify(o):o);throw _(`cells : \xAB ${a} \xBB n'est ni ${et.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${a}" is neither ${et.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(s.tap_action!==void 0&&!Z(s.tap_action))throw _("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>O)throw _(`consumers : une liste de ${O} appareils au plus`,`consumers: a list of at most ${O} appliances`);for(let o of e.consumers){let s=o&&typeof o=="object"?o:{};if(typeof s.entity!="string"||!s.entity)throw _("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(s.tap_action!==void 0&&!Z(s.tap_action))throw _("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw _("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(le))throw _(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var zt=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new gt(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Fn(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=kt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),x(this,"data-flow",n.flow??null),this.flowWidth=0,this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${we}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Vn()}</div>
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
                ${n.flow?Wn(n.consumers?.length??0):""}
            </ha-card>`;let o=(i,a=this.root)=>at(a,i);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let a=o(`[data-metric="${i.key}"]`),d=o("ha-icon",a);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||St:K[i.kind]),[i.key,{el:a,icon:d,label:o(".label-text",a),value:o(".value-main",a),extra:o(".extra",a)}]}))},this.actions=Ae(n,q(n)[0]);let s=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let a=ne(n,i),d=Z(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:a,tap:d}]]:s&&a?[[i.key,{entity:a}]]:[]})),n.flow==="tap"){let i=this.refs.heroValue.parentElement;for(let a of[i,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false")}if(n.flow){for(let[i]of Kt){let a=Ot(n,i);if(!a)continue;this.cellTargets.set(`node:${i}`,{entity:a});let d=this.refs.flow.nodes.get(i).el;d.dataset.cellTarget="",d.setAttribute("role","button"),d.tabIndex=0}(n.consumers??[]).forEach((i,a)=>{let d=Z(i.tap_action)?i.tap_action:void 0;this.cellTargets.set(`consumer:${a}`,{entity:i.entity,tap:d});let l=this.refs.flow.consumers[a].el;l.dataset.cellTarget="",d?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0)})}for(let[i,a]of this.cellTargets){if(i.includes(":"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",a.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}Me(this.refs.card,this,i=>this.actionsFor(i)),Le(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",s=r?this.cellTargets.get(o):void 0;if(!s)return this.actions;let{tap_action:i,...a}=this.actions;return{...a,entity:s.entity??this.actions.entity,...s.tap?{tap_action:s.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=this.shownConsumers,s=me(r,o.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${T}`),n.box.style.setProperty("--esc-node-w",`${s.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${s.centreWidth}px`),n.box.toggleAttribute("data-narrow",s.nodeWidth<112);for(let[i,a]of n.wires)for(let d of a.paths)d.setAttribute("d",s.paths[i]);n.box.toggleAttribute("data-compact",s.consumers.some(i=>i.compact)),n.consumers.forEach(({el:i,wire:a,paths:d},l)=>{let c=o.indexOf(l),u=s.consumers[c];if(i.hidden=!u?.visible,x(a,"data-off",u?.visible?null:""),!!u?.visible){i.dataset.side=u.below?"below":"above",Object.assign(i.style,{left:`${u.left}px`,top:`${u.top}px`,width:`${u.width}px`}),a.style.setProperty("--esc-flow",`esc-flow-c${c}`);for(let f of d)f.setAttribute("d",u.path)}}),n.keyframes.textContent=s.keyframes}flowRefs(){let n=(r,o=this.root)=>at(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(P.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(Kt.map(([r])=>[r,Re(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let s=n(`[data-wire="c${o}"]`);return{...Re(r),icon:n("ha-icon",r),wire:s,paths:[...s.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=he(this.config,this._hass);for(let[s,i]of n.nodes){let a=r.nodes[s];i.el.hidden===a.present&&(i.el.hidden=!a.present),A(i.label,a.label),A(i.value,a.value),A(i.centre,a.centre??""),i.el.toggleAttribute("data-centre",a.centre!==void 0),Oe(i.segs,a.ring)}r.consumers.forEach((s,i)=>{let a=n.consumers[i];a&&(A(a.label,s.label),x(a.el,"title",s.label),x(a.el,"aria-label",`${s.label} ${s.value}`),A(a.value,s.value),x(a.icon,"icon",s.icon),a.el.toggleAttribute("data-idle",s.level===0),Oe(a.segs,[[s.share,"use"]]),x(a.wire,"data-level",String(s.level)),s.shown||(a.el.hidden=!0,x(a.wire,"data-off","")))});let o=r.consumers.flatMap((s,i)=>s.shown?[i]:[]);o.join()!==this.shownConsumers.join()&&(this.shownConsumers=o,this.flowWidth=0,this.layoutFlow());for(let[s,i]of n.wires)x(i.g,"data-level",String(r.levels[s])),x(i.g,"data-off",r.off.includes(s)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(s=>s.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(s=>s.right>s.left&&s.bottom>s.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let s of n.querySelectorAll(".star")){let i=r.left+parseFloat(s.style.left)/100*r.width,a=r.top+parseFloat(s.style.top)/100*r.height,d=_e(i,a,Number(s.dataset.reach),o);s.hidden!==d&&(s.hidden=d)}}writeForms(n){this.form=n,x(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:s,extra:i}=te(r,n);A(o.value,s),A(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&A(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),s=n.heroValue.parentElement,i=n.context,a=[...n.metrics.values()].map(h=>h.value.parentElement),d=h=>h.scrollWidth>h.clientWidth+1,l=()=>parseFloat(getComputedStyle(i).lineHeight)||20,c=()=>!i.hidden&&(d(i)||i.scrollHeight>l()+1),u=h=>!d(s)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!h||(r?!c():!a.some(d))),f=r?Hn:On,p=(h,g)=>{for(let m of[!1,!0]){this.toggleAttribute("data-compact",m);for(let v of g){this.writeForms(v);for(let k of f)if(x(this,"data-hero",k===f[0]?null:String(k)),u(h))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,Te)||p(!1,Te.slice(-1)),this.writeContext(!i.hidden&&d(i));return}p(!0,Ft)||(this.writeContext(!0),!p(!0,Ft)&&(this.writeContext(!1),p(!1,Ft),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=re(this.config);return[_t(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=ie(this.config,this._hass),o=this.refs;this.paintSky(),A(o.heroValue,r.hero.value),A(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let a=o.metrics.get(i.key);a&&(A(a.label,i.label),this.side&&a.el.title!==i.label&&(a.el.title=i.label),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow();let s=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);s!==this.fitted&&(this.fitted=s,this.fit())}paintSky(){let n=ue(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,s)=>r.style.setProperty(`--esc-c${s}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return ve(n,await Ee(n))}static async getConfigElement(){return customElements.get(W)||await Bt(),document.createElement(W)}};function Vn(){return ce.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Wn(t){let e=[1,2,3].map(a=>`<g class="comet c${a}"><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...P.filter(a=>a!=="gb"&&a!=="bg")].map(a=>`<g class="wire ${Rt[a]}" data-wire="${a}" data-level="0">${a==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(a,d)=>`<g class="wire use" data-wire="c${d}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),s=(a,d)=>`
        <div class="node" ${a}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${d?` icon="${d}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,i=Kt.map(([a,d])=>s(`data-node="${a}"`,d)).join("")+Array.from({length:t},(a,d)=>s(`data-consumer="${d}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${T}">${o}${r}</svg>${i}</div></div>`}function Re(t){return{el:t,label:at(t,".nlab"),value:at(t,".nval"),centre:at(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function Oe(t,e){let n=0;t.forEach((r,o)=>{let s=e[o],i=s?Math.max(Vt*s[0]-(e.length>1?3:0),0):0;x(r,"stroke-dasharray",`${i.toFixed(1)} ${Vt.toFixed(1)}`),x(r,"stroke-dashoffset",(-n).toFixed(1)),x(r,"data-source",s&&i>=1.5?s[1]:""),s&&(n+=Vt*s[0])})}function at(t,e){return t.querySelector(e)}function x(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function A(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(V)||(customElements.define(V,zt),window.customCards=window.customCards||[],window.customCards.push({type:V,name:wt,description:jt,preview:!0,documentationURL:Gt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${wt} %c ${Ut} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
