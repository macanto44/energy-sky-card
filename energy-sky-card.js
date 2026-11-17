"use strict";(()=>{var V="energy-sky-card",W=`${V}-editor`,xt="Energy Sky Card",Gt="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Bt="https://github.com/macanto44/energy-sky-card",Xt="0.3.6";function Fe(t,e){let n=`${V}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),s=o.pathname.lastIndexOf("/");if(o.pathname.slice(s+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var lt;function qt(){return customElements.get(W)?Promise.resolve():(lt??(lt=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=Fe(W,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(W)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw lt=void 0,t})),lt)}var Ie=new Set(["unavailable","unknown","none",""]);function C(t){if(!t||Ie.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var De={mw:1e6,kw:1e3,w:1},Ve={mwh:1e3,kwh:1,wh:.001};function Yt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function S(t){let e=C(t);return e===void 0?void 0:e*(De[Yt(t)]??1)}function _t(t){let e=C(t);return e===void 0?void 0:e*(Ve[Yt(t)]??1)}var We={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function vt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return We[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Ke(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return Jt(void 0);default:return Jt(t?.locale?.language||t?.language||"en")}}function Jt(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function ut(t){return{lang:vt(t),decimal:Ke(t)}}function L(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function pt(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:L(Math.round(t),0,e),unit:"W"}:{value:L(t/1e3,1,e),unit:"kW"}}function Et({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function M(t,e){return Et(pt(t,e))}function Ct(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":L(t,1,e)}function Qt(t,e){let n=Ct(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function Zt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${L(Math.round(t),0,e)}\xA0V`}function ft(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${L(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function te(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${L(Math.round(t),0,n)} ${e||"\xB0C"}`}var St=20,je=["warning","alarm"],K={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},kt="mdi:gauge",nt=Object.keys(K),ot=4,R=4;function ne(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var At=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",oe=t=>typeof t=="object"&&t!==null&&!At(t)&&typeof t.type=="string",ze=t=>typeof t=="string"?t:oe(t)?t.type:void 0;function Ue(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function Lt(t){if(!t.cells)return Ue(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,ot).flatMap((n,r)=>{if(At(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=ze(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...oe(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function re(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function q(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function rt(t,e){let n=q(t).map(r=>S(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var ie=(t,e)=>t===void 0||!e?t:-t;function Mt(t,e){return ie(S(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function $t(t,e){return ie(S(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function se(t){let e=[...q(t),t.consumption_entity,...(t.cells??[]).filter(At).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Ge(t,e){let n=(t.daily_production_entities??[]).map(r=>_t(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function Be(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Xe(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function qe(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??je).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Ye(t,e,n,r){let o=C(e.states[t.battery?.soc_entity??""]),s=Be($t(t,e),r),i=o===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=Xe(t,e),d=e.states[t.battery?.temperature_entity??""],l=C(d),c=ft(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${te(l,u,n)}`,extra:a?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${L(Math.round(l),0,n)}\xB0`,extra:a?"\u202F\u2713":""},bare:c}}}function Je(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:M(Mt(t,e),n),extra:"",extraShort:""}}function Qe(t,e,n){let r=t.grid?.voltage_entity?C(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:qe(t,e)?y(n.lang,"outage"):Zt(r,n),extra:"",extraShort:""}}function Ze(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:Qt(_t(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function tn(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:M(S(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function en(t,e,n){let r=t.custom,o=e.states[r.entity],s=String(o?.attributes.unit_of_measurement??""),i;if(!o||C(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=M(S(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=C(o);i=d===void 0?o.state:Et({value:L(d,Number.isInteger(d)?0:1,n),unit:s})}let a=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||kt;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:a}}function nn(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function on(t,e,n){let r=nn(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:pt(S(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=C(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:L(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:pt(rt(t,e),n)}}function ae(t,e){let n=ut(e),r=t.battery?.power_threshold??St,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:Ct(Ge(t,e),n)}):void 0,s=Lt(t).map(c=>{switch(c.kind){case"battery":return Ye(t,e,n,r);case"grid":return Je(t,e,n);case"voltage":return Qe(t,e,n);case"tomorrow":return Ze(t,e,n);case"consumption":return tn(t,e,n);case"custom":return en(c,e,n)}}),{hero:i,label:a,labelShort:d=a}=on(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(a),contextShort:l(d),metrics:s}}var de={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},ce="Bleu";var no=[255/255,214/255,140/255],rn=.55;var Tt=6e3,ht=.45,mt={x:0,y:-30,radius:100},le=[8,18,40],Ot=.2,ue=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],sn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,pe=t=>typeof t=="string"&&sn.test(t);function an(t,e){let n={...de,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(s=>s.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[ce]??de[ce]}function fe(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=rt(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:Tt,s=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:an(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(s*rn*1e3)/1e3,producing:r>0}}var Rt={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},dn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},P=Object.keys(Rt),me=20,j=t=>Math.max(t??0,0);function cn(t,e,n,r){let o=j(t),s=j(e===void 0?void 0:-e),i=j(e),a=j(n),d=j(n===void 0?void 0:-n),l=Math.min(s,o);o-=l;let c=Math.min(s-l,d),u=Math.min(a,o);o-=u;let f=Math.min(a-u,i),p={sh:o,sg:l,sb:u,gh:i-f,bh:d-c,gb:f,bg:c};for(let g of P)p[g]<me&&(p[g]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function he(t){return t<me?0:t<500?1:t<1500?2:t<3e3?3:4}function Ht(t,e){switch(e){case"solar":return q(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}var ln="mdi:power-plug-outline",un=10;function ge(t,e){let n=ut(e),r=rt(t,e),o=Mt(t,e),s=$t(t,e),i=t.battery?.power_threshold??St,a=s!==void 0&&Math.abs(s)<=i?0:s,d=S(e.states[t.consumption_entity??""]),l=cn(r,o,a,d),c=t.production_max&&t.production_max>0?t.production_max:Tt,u=C(e.states[t.battery?.soc_entity??""]),f={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},p=f.sun+f.grid+f.batt,h=m=>m==="solar"||m==="home"||!!Ht(t,m),g=Object.fromEntries(P.map(m=>[m,he(l.wires[m])]));return{nodes:{solar:{present:h("solar"),label:y(n.lang,"solar"),value:M(r,n),ring:[[Math.min(j(r)/c,1),"sun"]]},grid:{present:h("grid"),label:y(n.lang,"grid"),value:M(o,n),ring:[]},battery:{present:h("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?M(s,n):ft(u,n),ring:u===void 0?[]:[[Math.min(Math.max(u,0),100)/100,"batt"]],centre:u===void 0?void 0:String(Math.round(u))},home:{present:h("home"),label:y(n.lang,"home"),value:M(l.home,n),ring:p>0?["sun","batt","grid"].filter(m=>f[m]>0).map(m=>[f[m]/p,m]):[]}},consumers:(t.consumers??[]).slice(0,R).map(m=>{let v=e.states[m.entity],A=S(v),U=j(A),N=t.consumer_threshold??un,G=et=>typeof v?.attributes[et]=="string"?v.attributes[et]:void 0;return{label:m.name||G("friendly_name")||m.entity,icon:m.icon||G("icon")||ln,value:M(S(v),n),share:l.home?Math.min(U/l.home,1):0,level:he(U),shown:N<=0||A!==void 0&&U>=N}}),levels:g,off:P.filter(m=>!dn[m].every(h))}}var $=220,H=46,pn=12,fn=46;function hn([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,s]=e,i=1-r,a=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*s[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(s[l]-o[l])+3*r*r*(n[l]-s[l]);return{at:[a(0),a(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var z=t=>Math.round(t*10)/10,Y=([t,e])=>`${z(t)},${z(e)}`,gt=27;function ye(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),s=o/2,i=H/2,a=$/2,d=3+i,l=$-3-i,c=n/2,u=r-gt,f=n-r+gt,p=c-s+gt,h=c+s-gt,g=(b,w)=>{let T=(w[1]-b[1])/2;return[b,[[b[0],b[1]+T],[w[0],w[1]-T]],w]},m={sh:[[r,a],null,[n-r,a]],sg:g([u,a-i],[p,d+i]),gh:g([h,d+i],[f,a-i]),sb:g([u,a+i],[p,l-i]),bh:g([h,l-i],[f,a+i]),gb:[[c,d+i],null,[c,l-i]],bg:[[c,l-i],null,[c,d+i]]},v=n-(c+s)-8,A=e>2||v<110,U=A&&v<100?1:2,N=[];for(let b=0;b<e;b++){let w=b%2===1,T=Math.floor(b/2),F=Math.min(w?Math.floor(e/2):Math.ceil(e/2),U),I=w?$-3-H:3,D=w?a+i:a-i,B=w?I:I+H;if(T>=U){N.push({visible:!1,compact:A,below:w,left:0,top:I,width:0,path:""});continue}let E,O;if(A){let X=v/F,ct=n-v+X*(T+.5)+4;O=fn,E=ct-O/2,m[`c${b}`]=g([n-r/2+(F>1?(T-.5)*30:10),D],[ct,B])}else{O=Math.min(r,v),E=n-O;let X=E+O/2+10;m[`c${b}`]=[[X,D],null,[X,B]]}N.push({visible:!0,compact:A,below:w,left:z(E),top:I,width:z(O),path:""})}let G={},et="";for(let[b,w]of Object.entries(m)){let[T,F,I]=w;G[b]=F?`M${Y(T)} C${Y(F[0])} ${Y(F[1])} ${Y(I)}`:`M${Y(T)} L${Y(I)}`;let D=F?pn:1,B=[];for(let E=0;E<=D;E++){let{at:O,deg:X}=hn(w,E/D),ct=E===0||E===D?" opacity: 0;":"";B.push(`${z(E/D*100)}% { transform: translate(${z(O[0])}px, ${z(O[1])}px) rotate(${Math.round(X)}deg);${ct} }`)}B.push("10%, 90% { opacity: 1; }"),et+=`@keyframes esc-flow-${b} { ${B.join(" ")} }
`}return N.forEach((b,w)=>{b.path=G[`c${w}`]??""}),{nodeWidth:r,centreWidth:o,paths:G,consumers:N,keyframes:et}}var Pt=t=>`rgba(${le.join(", ")}, ${t})`,be=t=>`${Math.round(t*1e3)/10}%`,mn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${be(1-ht/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${be((.6-ht)/(1-ht))}, var(--esc-c2, #1d4f87) 100%)`,we=`${mt.x}px ${mt.y}px`,Nt={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},J={sun:"--energy-sky-card-solar",grid:"--energy-sky-card-grid",batt:"--energy-sky-card-battery",use:"--energy-sky-card-consumption"},xe=t=>`var(${J[t]}, ${Nt[t]})`,gn=.14,yn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],bn=($-H)/2,it=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,_e=`
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
    background: radial-gradient(closest-side, ${Pt(Ot)}, ${Pt(Ot/2)} 50%, ${Pt(0)} 100%);
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
${it('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${it('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${it('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${it('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${it("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${mn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${mt.radius}px at ${we}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${we};
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
.flow { position: relative; height: ${$}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${yn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.keys(Nt).map(t=>`.wire.${t} { color: ${xe(t)}; }`).join(" ")}
${[...P,...Array.from({length:R},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: ${bn}px;
    width: var(--esc-node-w);
    height: ${H}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${H/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${gn}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: ${$-3-H}px; }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.keys(Nt).map(t=>`.seg[data-source="${t}"] { stroke: ${xe(t)}; }`).join(" ")}
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
`;var Ft={cols:10,rows:6},wn=[1,.9,.8,.7,.6,.5],xn=.4,_n=3,vn=1.4;function En(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var Q=(t,e=1)=>Math.round(t*10**e)/10**e;function Cn(t,e,n,r){return{x:Q((e+.1+t()*.8)/r.cols*100),y:Q((n+.1+t()*.8)/r.rows*100)}}function Sn(t=24301){let e=En(t),n=[];for(let r=0;r<Ft.rows;r++)for(let o=0;o<Ft.cols;o++){let s=e()<wn[r],{x:i,y:a}=Cn(e,o,r,Ft),d=1.4+e()*.8,l=e()<xn,c=Q(e()*5,2);if(!s)continue;let u=a/100;n.push({x:i,y:a,size:Q(d*(1-.3*u),2),opacity:Q(1-.45*u,2),twinkle:l,delay:c})}return n}var kn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],An=t=>Q(t.size/2*(t.twinkle?vn:1)+_n,2);function ve(t=Sn()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${An(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+kn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var Ee=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var Ln="(prefers-reduced-motion: reduce)";function Mn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var yt=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Ln),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return Mn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var $n=["bleu","blanc","rouge"],Dt=/tomorrow|demain/i,Tn=/today|daily|jour|_day(_|$)/i,On=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function Rn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function Hn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!Dt.test(e.entity_id)&&$n.includes(String(e.state).toLowerCase()))?.entity_id}function st(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var bt=t=>(e,n)=>n===t,wt=t=>t[0];function It(t,e,n){return(e&&t.states[e]?e:void 0)??wt(st(t,n,bt("power")))}function Pn(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),s=[...new Set(o.map(c=>It(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];s.length&&(r.production_entity=s.length===1?s[0]:s);let i=[...new Set(o.flatMap(c=>st(e,c.stat_energy_from,(u,f)=>f==="energy"&&Tn.test(u)&&!On.test(u)&&!Dt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&Dt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let a=n.find(c=>c.type==="battery");if(a){let c=a.stat_energy_from??a.stat_energy_to,u=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??wt(st(e,c,bt("battery"))),f=a.power_config?.stat_rate??a.stat_rate,p=It(e,f,c),h=wt(st(e,c,bt("temperature"))),g={};u&&(g.soc_entity=u),p&&(g.power_entity=p),p&&f&&p===f&&(g.invert=!0),h&&(g.temperature_entity=h),Object.keys(g).length&&(r.battery=g)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,f=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let g=It(e,f,c);g&&(p.power_entity=g)}let h=wt(st(e,c,bt("voltage")));h&&(p.voltage_entity=h),Object.keys(p).length&&(r.grid=p)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function Ce(t,e){let n=t?Pn(e,t):{},r=Hn(t);return{production_entity:Rn(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Se(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var tt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",Z=t=>t!==void 0&&t.action!=="none";function Le(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])tt(n[o])&&(r[o]=n[o]);return r}function Me(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:Z(t.tap_action)}function ke(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function at(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&ke(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...s}=e;Z(r)&&ke(t,"hass-action",{config:s,action:n})}var Vt=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{Z(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,Z(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,at(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!Z(e.double_tap_action)){at(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,at(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,at(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());Me(o)&&(e.preventDefault(),at(this.host,o,"tap"))}},Ae=new WeakSet;function $e(t,e,n){Ae.has(t)||(Ae.add(t),new Vt(t,e,n))}function Te(t,e){let n=Me(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=Z(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var Nn=[56,48,40],Fn=[44,40,36],Oe=[0,1,2],Wt=[0,1,2,3],zt=[["solar",K.tomorrow],["grid",K.grid],["battery",K.battery],["home",K.consumption]],Kt=2*Math.PI*17;function x(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var In=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),jt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),Re=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,Dn=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]]],Vn=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],Ne={solar:J.sun,grid:J.grid,battery:J.batt,consumption:J.use},Wn=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],In,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold","consumer_threshold"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Kn(t){if(!t||typeof t!="object")throw x("Configuration invalide","Invalid configuration");let e=t;for(let[o,s]of Vn)if(jt(e,o)!==void 0)throw x(`${o} n'existe plus : ${s.fr}`,`${o} is gone: ${s.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw x("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,s]of Dn){let i=jt(e,o);if(i!==void 0&&!s.includes(i))throw x(`${o} : ${Re(s,"ou")}`,`${o}: ${Re(s,"or")}`)}for(let[o,s,i,a]of Wn)for(let d of o)if(!s(jt(e,d)))throw x(`${d} ${i}`,`${d} ${a}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>ot)throw x(`cells : une liste de ${ot} cases au plus`,`cells: a list of at most ${ot} cells`);for(let o of e.cells){let s=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?nt.includes(o):typeof s.entity=="string"&&!!s.entity||nt.includes(s.type))){let a=String(typeof o=="object"?JSON.stringify(o):o);throw x(`cells : \xAB ${a} \xBB n'est ni ${nt.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${a}" is neither ${nt.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(s.tap_action!==void 0&&!tt(s.tap_action))throw x("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>R)throw x(`consumers : une liste de ${R} appareils au plus`,`consumers: a list of at most ${R} appliances`);for(let o of e.consumers){let s=o&&typeof o=="object"?o:{};if(typeof s.entity!="string"||!s.entity)throw x("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(s.tap_action!==void 0&&!tt(s.tap_action))throw x("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.flow_colors!==void 0){let o=e.flow_colors;if(!o||typeof o!="object"||Array.isArray(o))throw x("flow_colors : solar, grid, battery et consumption, chacun une couleur","flow_colors: solar, grid, battery and consumption, each a colour");for(let[s,i]of Object.entries(o))if(!(s in Ne)||typeof i!="string"||!i)throw x(`flow_colors.${s} : solar, grid, battery ou consumption, une couleur CSS`,`flow_colors.${s}: solar, grid, battery or consumption, a CSS colour`)}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw x("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(pe))throw x(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var Ut=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new yt(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Kn(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=Lt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),_(this,"data-flow",n.flow??null);for(let[i,a]of Object.entries(Ne)){let d=n.flow_colors?.[i];d?this.style.setProperty(a,d):this.style.removeProperty(a)}this.flowWidth=0,this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${_e}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${jn()}</div>
                    <div class="layer night">${ve()}</div>
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
                ${n.flow?zn(n.consumers?.length??0):""}
            </ha-card>`;let o=(i,a=this.root)=>dt(a,i);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let a=o(`[data-metric="${i.key}"]`),d=o("ha-icon",a);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||kt:K[i.kind]),[i.key,{el:a,icon:d,label:o(".label-text",a),value:o(".value-main",a),extra:o(".extra",a)}]}))},this.actions=Le(n,q(n)[0]);let s=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let a=re(n,i),d=tt(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:a,tap:d}]]:s&&a?[[i.key,{entity:a}]]:[]})),n.flow==="tap"){let i=this.refs.heroValue.parentElement;for(let a of[i,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false")}if(n.flow){for(let[i]of zt){let a=Ht(n,i);if(!a)continue;this.cellTargets.set(`node:${i}`,{entity:a});let d=this.refs.flow.nodes.get(i).el;d.dataset.cellTarget="",d.setAttribute("role","button"),d.tabIndex=0}(n.consumers??[]).forEach((i,a)=>{let d=tt(i.tap_action)?i.tap_action:void 0;this.cellTargets.set(`consumer:${a}`,{entity:i.entity,tap:d});let l=this.refs.flow.consumers[a].el;l.dataset.cellTarget="",d?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0)})}for(let[i,a]of this.cellTargets){if(i.includes(":"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",a.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}$e(this.refs.card,this,i=>this.actionsFor(i)),Te(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",s=r?this.cellTargets.get(o):void 0;if(!s)return this.actions;let{tap_action:i,...a}=this.actions;return{...a,entity:s.entity??this.actions.entity,...s.tap?{tap_action:s.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=this.shownConsumers,s=ye(r,o.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${$}`),n.box.style.setProperty("--esc-node-w",`${s.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${s.centreWidth}px`),n.box.toggleAttribute("data-narrow",s.nodeWidth<112);for(let[i,a]of n.wires)for(let d of a.paths)d.setAttribute("d",s.paths[i]);n.box.toggleAttribute("data-compact",s.consumers.some(i=>i.compact)),n.consumers.forEach(({el:i,wire:a,paths:d},l)=>{let c=o.indexOf(l),u=s.consumers[c];if(i.hidden=!u?.visible,_(a,"data-off",u?.visible?null:""),!!u?.visible){i.dataset.side=u.below?"below":"above",Object.assign(i.style,{left:`${u.left}px`,top:`${u.top}px`,width:`${u.width}px`}),a.style.setProperty("--esc-flow",`esc-flow-c${c}`);for(let f of d)f.setAttribute("d",u.path)}}),n.keyframes.textContent=s.keyframes}flowRefs(){let n=(r,o=this.root)=>dt(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(P.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(zt.map(([r])=>[r,He(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let s=n(`[data-wire="c${o}"]`);return{...He(r),icon:n("ha-icon",r),wire:s,paths:[...s.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=ge(this.config,this._hass);for(let[s,i]of n.nodes){let a=r.nodes[s];i.el.hidden===a.present&&(i.el.hidden=!a.present),k(i.label,a.label),k(i.value,a.value),k(i.centre,a.centre??""),i.el.toggleAttribute("data-centre",a.centre!==void 0),Pe(i.segs,a.ring)}r.consumers.forEach((s,i)=>{let a=n.consumers[i];a&&(k(a.label,s.label),_(a.el,"title",s.label),_(a.el,"aria-label",`${s.label} ${s.value}`),k(a.value,s.value),_(a.icon,"icon",s.icon),a.el.toggleAttribute("data-idle",s.level===0),Pe(a.segs,[[s.share,"use"]]),_(a.wire,"data-level",String(s.level)),s.shown||(a.el.hidden=!0,_(a.wire,"data-off","")))});let o=r.consumers.flatMap((s,i)=>s.shown?[i]:[]);o.join()!==this.shownConsumers.join()&&(this.shownConsumers=o,this.flowWidth=0,this.layoutFlow());for(let[s,i]of n.wires)_(i.g,"data-level",String(r.levels[s])),_(i.g,"data-off",r.off.includes(s)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(s=>s.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(s=>s.right>s.left&&s.bottom>s.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let s of n.querySelectorAll(".star")){let i=r.left+parseFloat(s.style.left)/100*r.width,a=r.top+parseFloat(s.style.top)/100*r.height,d=Ee(i,a,Number(s.dataset.reach),o);s.hidden!==d&&(s.hidden=d)}}writeForms(n){this.form=n,_(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:s,extra:i}=ne(r,n);k(o.value,s),k(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&k(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),s=n.heroValue.parentElement,i=n.context,a=[...n.metrics.values()].map(h=>h.value.parentElement),d=h=>h.scrollWidth>h.clientWidth+1,l=()=>parseFloat(getComputedStyle(i).lineHeight)||20,c=()=>!i.hidden&&(d(i)||i.scrollHeight>l()+1),u=h=>!d(s)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!h||(r?!c():!a.some(d))),f=r?Fn:Nn,p=(h,g)=>{for(let m of[!1,!0]){this.toggleAttribute("data-compact",m);for(let v of g){this.writeForms(v);for(let A of f)if(_(this,"data-hero",A===f[0]?null:String(A)),u(h))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,Oe)||p(!1,Oe.slice(-1)),this.writeContext(!i.hidden&&d(i));return}p(!0,Wt)||(this.writeContext(!0),!p(!0,Wt)&&(this.writeContext(!1),p(!1,Wt),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=se(this.config);return[vt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=ae(this.config,this._hass),o=this.refs;this.paintSky(),k(o.heroValue,r.hero.value),k(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let a=o.metrics.get(i.key);a&&(k(a.label,i.label),this.side&&a.el.title!==i.label&&(a.el.title=i.label),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow();let s=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);s!==this.fitted&&(this.fitted=s,this.fit())}paintSky(){let n=fe(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,s)=>r.style.setProperty(`--esc-c${s}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return Ce(n,await Se(n))}static async getConfigElement(){return customElements.get(W)||await qt(),document.createElement(W)}};function jn(){return ue.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function zn(t){let e=[1,2,3].map(a=>`<g class="comet c${a}"><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...P.filter(a=>a!=="gb"&&a!=="bg")].map(a=>`<g class="wire ${Rt[a]}" data-wire="${a}" data-level="0">${a==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(a,d)=>`<g class="wire use" data-wire="c${d}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),s=(a,d)=>`
        <div class="node" ${a}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${d?` icon="${d}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,i=zt.map(([a,d])=>s(`data-node="${a}"`,d)).join("")+Array.from({length:t},(a,d)=>s(`data-consumer="${d}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${$}">${o}${r}</svg>${i}</div></div>`}function He(t){return{el:t,label:dt(t,".nlab"),value:dt(t,".nval"),centre:dt(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function Pe(t,e){let n=0;t.forEach((r,o)=>{let s=e[o],i=s?Math.max(Kt*s[0]-(e.length>1?3:0),0):0;_(r,"stroke-dasharray",`${i.toFixed(1)} ${Kt.toFixed(1)}`),_(r,"stroke-dashoffset",(-n).toFixed(1)),_(r,"data-source",s&&i>=1.5?s[1]:""),s&&(n+=Kt*s[0])})}function dt(t,e){return t.querySelector(e)}function _(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function k(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(V)||(customElements.define(V,Ut),window.customCards=window.customCards||[],window.customCards.push({type:V,name:xt,description:Gt,preview:!0,documentationURL:Bt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${xt} %c ${Xt} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
