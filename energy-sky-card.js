"use strict";(()=>{var W="energy-sky-card",V=`${W}-editor`,St="Energy Sky Card",qt="Solar production, battery and grid on a sky that follows the tariff colour and the sun",Yt="https://github.com/macanto44/energy-sky-card",Jt="0.3.6";function We(t,e){let n=`${W}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),a=o.pathname.lastIndexOf("/");if(o.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var ut;function Qt(){return customElements.get(V)?Promise.resolve():(ut??(ut=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=We(V,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(V)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw ut=void 0,t})),ut)}var Ve=new Set(["unavailable","unknown","none",""]);function C(t){if(!t||Ve.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ke={mw:1e6,kw:1e3,w:1},je={mwh:1e3,kwh:1,wh:.001};function Zt(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function S(t){let e=C(t);return e===void 0?void 0:e*(Ke[Zt(t)]??1)}function At(t){let e=C(t);return e===void 0?void 0:e*(je[Zt(t)]??1)}var ze={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",stale:"Pas de nouvelle valeur depuis {age}",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",stale:"No new reading for {age}",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function pt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return ze[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function Ue(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return te(void 0);default:return te(t?.locale?.language||t?.language||"en")}}function te(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function ft(t){return{lang:pt(t),decimal:Ue(t)}}function k(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function ht(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:k(Math.round(t),0,e),unit:"W"}:{value:k(t/1e3,1,e),unit:"kW"}}function kt({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function L(t,e){return kt(ht(t,e))}function Lt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":k(t,1,e)}function ee(t,e){let n=Lt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function ne(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${k(Math.round(t),0,e)}\xA0V`}function mt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${k(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function oe(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${k(Math.round(t),0,n)} ${e||"\xB0C"}`}var Mt=20,Ge=["warning","alarm"],K={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},Tt="mdi:gauge",nt=Object.keys(K),ot=4,O=4;function ie(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var gt=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",se=t=>typeof t=="object"&&t!==null&&!gt(t)&&typeof t.type=="string",Be=t=>typeof t=="string"?t:se(t)?t.type:void 0;function Xe(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function $t(t){if(!t.cells)return Xe(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,ot).flatMap((n,r)=>{if(gt(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=Be(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...se(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function Ot(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function j(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function rt(t,e){let n=j(t).map(r=>S(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var ae=(t,e)=>t===void 0||!e?t:-t,qe=30;function de(t,e,n=Date.now()){let r=t.stale_after??qe,o=new Map;if(!(r>0))return o;let a=[...j(t),t.consumption_entity,t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,t.grid?.power_entity,t.grid?.voltage_entity,...(t.cells??[]).filter(gt).map(i=>i.entity),...(t.consumers??[]).map(i=>i.entity)];for(let i of a){let s=Date.parse(e.states[i??""]?.last_reported??"");if(!Number.isFinite(s))continue;let d=(n-s)/6e4;d>=r&&o.set(i,Math.floor(d))}return o}function Rt(t,e){return ae(S(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function Ht(t,e){return ae(S(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function ce(t){let e=[...j(t),t.consumption_entity,...(t.cells??[]).filter(gt).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Ye(t,e){let n=(t.daily_production_entities??[]).map(r=>At(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function Je(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Qe(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Pt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Ge).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Ze(t,e,n,r){let o=C(e.states[t.battery?.soc_entity??""]),a=Je(Ht(t,e),r),i=o===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",s=Qe(t,e),d=e.states[t.battery?.temperature_entity??""],l=C(d),c=mt(o,n)+i,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:l===void 0?c:`${c} \xB7 ${oe(l,u,n)}`,extra:s?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:s?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...l===void 0?{}:{tight:{value:`${c}\u202F\xB7\u202F${k(Math.round(l),0,n)}\xB0`,extra:s?"\u202F\u2713":""},bare:c}}}function tn(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:L(Rt(t,e),n),extra:"",extraShort:""}}function en(t,e,n){let r=t.grid?.voltage_entity?C(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:Pt(t,e)?y(n.lang,"outage"):ne(r,n),extra:"",extraShort:""}}function nn(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:ee(At(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function on(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:L(S(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function rn(t,e,n){let r=t.custom,o=e.states[r.entity],a=String(o?.attributes.unit_of_measurement??""),i;if(!o||C(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(a))i=L(S(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let d=C(o);i=d===void 0?o.state:kt({value:k(d,Number.isInteger(d)?0:1,n),unit:a})}let s=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||Tt;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:s}}function sn(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function an(t,e,n){let r=sn(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:ht(S(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=C(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:k(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:ht(rt(t,e),n)}}function le(t,e){let n=ft(e),r=t.battery?.power_threshold??Mt,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:Lt(Ye(t,e),n)}):void 0,a=$t(t).map(c=>{switch(c.kind){case"battery":return Ze(t,e,n,r);case"grid":return tn(t,e,n);case"voltage":return en(t,e,n);case"tomorrow":return nn(t,e,n);case"consumption":return on(t,e,n);case"custom":return rn(c,e,n)}}),{hero:i,label:s,labelShort:d=s}=an(t,e,n),l=c=>c?[c,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:l(s),contextShort:l(d),metrics:a}}var ue={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},pe="Bleu";var so=[255/255,214/255,140/255],dn=.55;var Nt=6e3,yt={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},bt=.45,wt={x:0,y:-30,radius:100},fe=[8,18,40],Ft=.2,he=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],cn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,me=t=>typeof t=="string"&&cn.test(t);function ln(t,e){let n={...ue,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(a=>a.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[pe]??ue[pe]}function ge(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=rt(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:Nt,a=Math.min(Math.max(r,0)/o,1);return{mode:n==="below_horizon"?"night":"day",palette:ln(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),haloAlpha:Math.round(a*dn*1e3)/1e3,producing:r>0}}var It={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},un={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},H=Object.keys(It),be=20,z=t=>Math.max(t??0,0);function pn(t,e,n,r){let o=z(t),a=z(e===void 0?void 0:-e),i=z(e),s=z(n),d=z(n===void 0?void 0:-n),l=Math.min(a,o);o-=l;let c=Math.min(a-l,d),u=Math.min(s,o);o-=u;let f=Math.min(s-u,i),p={sh:o,sg:l,sb:u,gh:i-f,bh:d-c,gb:f,bg:c};for(let m of H)p[m]<be&&(p[m]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function ye(t){return t<be?0:t<500?1:t<1500?2:t<3e3?3:4}function _t(t,e){switch(e){case"solar":return j(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}var fn="mdi:power-plug-outline",hn=10;function we(t,e){let n=ft(e),r=rt(t,e),o=Pt(t,e),a=o?0:Rt(t,e),i=Ht(t,e),s=t.battery?.power_threshold??Mt,d=i!==void 0&&Math.abs(i)<=s?0:i,l=S(e.states[t.consumption_entity??""]),c=pn(r,a,d,l),u=t.production_max&&t.production_max>0?t.production_max:Nt,f=C(e.states[t.battery?.soc_entity??""]),p={sun:c.wires.sh,grid:c.wires.gh,batt:c.wires.bh},g=p.sun+p.grid+p.batt,m=h=>h==="solar"||h==="home"||!!_t(t,h),M=Object.fromEntries(H.map(h=>[h,ye(c.wires[h])]));return{nodes:{solar:{present:m("solar"),label:y(n.lang,"solar"),value:L(r,n),ring:[[Math.min(z(r)/u,1),"sun"]]},grid:{present:m("grid"),label:y(n.lang,"grid"),value:o?y(n.lang,"outage"):L(a,n),ring:o?[[1,"alert"]]:[],alert:o},battery:{present:m("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?L(i,n):mt(f,n),ring:f===void 0?[]:[[Math.min(Math.max(f,0),100)/100,"batt"]],centre:f===void 0?void 0:String(Math.round(f))},home:{present:m("home"),label:y(n.lang,"home"),value:L(c.home,n),ring:g>0?["sun","batt","grid"].filter(h=>p[h]>0).map(h=>[p[h]/g,h]):[]}},consumers:(t.consumers??[]).slice(0,O).map(h=>{let v=e.states[h.entity],P=S(v),G=z(P),N=t.consumer_threshold??hn,B=et=>typeof v?.attributes[et]=="string"?v.attributes[et]:void 0;return{label:h.name||B("friendly_name")||h.entity,icon:h.icon||B("icon")||fn,value:L(S(v),n),share:c.home?Math.min(G/c.home,1):0,level:ye(G),shown:N<=0||P!==void 0&&G>=N}}),levels:M,off:H.filter(h=>!un[h].every(m))}}var it=220,mn=.65,gn=360,R=46,yn=12,bn=46;function wn([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,a]=e,i=1-r,s=l=>i*i*i*t[l]+3*i*i*r*o[l]+3*i*r*r*a[l]+r*r*r*n[l],d=l=>3*i*i*(o[l]-t[l])+6*i*r*(a[l]-o[l])+3*r*r*(n[l]-a[l]);return{at:[s(0),s(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var U=t=>Math.round(t*10)/10,Y=([t,e])=>`${U(t)},${U(e)}`,xt=27;function xe(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),a=Math.round(Math.min(Math.max(n*mn,it),gn)),i=o/2,s=R/2,d=a/2,l=3+s,c=a-3-s,u=n/2,f=r-xt,p=n-r+xt,g=u-i+xt,m=u+i-xt,M=(w,x)=>{let T=(x[1]-w[1])/2;return[w,[[w[0],w[1]+T],[x[0],x[1]-T]],x]},h={sh:[[r,d],null,[n-r,d]],sg:M([f,d-s],[g,l+s]),gh:M([m,l+s],[p,d-s]),sb:M([f,d+s],[g,c-s]),bh:M([m,c-s],[p,d+s]),gb:[[u,l+s],null,[u,c-s]],bg:[[u,c-s],null,[u,l+s]]},v=n-(u+i)-8,P=e>2||v<110,G=P&&v<100?1:2,N=[];for(let w=0;w<e;w++){let x=w%2===1,T=Math.floor(w/2),F=Math.min(x?Math.floor(e/2):Math.ceil(e/2),G),I=x?a-3-R:3,D=x?d+s:d-s,X=x?I:I+R;if(T>=G){N.push({visible:!1,compact:P,below:x,left:0,top:I,width:0,path:""});continue}let E,$;if(P){let q=v/F,lt=n-v+q*(T+.5)+4;$=bn,E=lt-$/2,h[`c${w}`]=M([n-r/2+(F>1?(T-.5)*30:10),D],[lt,X])}else{$=Math.min(r,v),E=n-$;let q=E+$/2+10;h[`c${w}`]=[[q,D],null,[q,X]]}N.push({visible:!0,compact:P,below:x,left:U(E),top:I,width:U($),path:""})}let B={},et="";for(let[w,x]of Object.entries(h)){let[T,F,I]=x;B[w]=F?`M${Y(T)} C${Y(F[0])} ${Y(F[1])} ${Y(I)}`:`M${Y(T)} L${Y(I)}`;let D=F?yn:1,X=[];for(let E=0;E<=D;E++){let{at:$,deg:q}=wn(x,E/D),lt=E===0||E===D?" opacity: 0;":"";X.push(`${U(E/D*100)}% { transform: translate(${U($[0])}px, ${U($[1])}px) rotate(${Math.round(q)}deg);${lt} }`)}X.push("10%, 90% { opacity: 1; }"),et+=`@keyframes esc-flow-${w} { ${X.join(" ")} }
`}return N.forEach((w,x)=>{w.path=B[`c${x}`]??""}),{nodeWidth:r,centreWidth:o,height:a,paths:B,consumers:N,keyframes:et}}var Dt=t=>`rgba(${fe.join(", ")}, ${t})`,_e=t=>`${Math.round(t*1e3)/10}%`,xn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${_e(1-bt/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${_e((.6-bt)/(1-bt))}, var(--esc-c2, #1d4f87) 100%)`,ve=`${wt.x}px ${wt.y}px`;var J={sun:"--energy-sky-card-solar",grid:"--energy-sky-card-grid",batt:"--energy-sky-card-battery",use:"--energy-sky-card-consumption"},Ee=t=>`var(${J[t]}, ${yt[t]})`,_n=.14,vn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],st=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,Ce=`
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
    background: radial-gradient(closest-side, ${Dt(Ft)}, ${Dt(Ft/2)} 50%, ${Dt(0)} 100%);
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
${st('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${st('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${st('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${st('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${st("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${xn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${wt.radius}px at ${ve}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${ve};
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
.flow { position: relative; height: var(--esc-flow-h); --esc-flow-h: ${it}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${vn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.keys(yt).map(t=>`.wire.${t} { color: ${Ee(t)}; }`).join(" ")}
${[...H,...Array.from({length:O},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: calc((var(--esc-flow-h) - ${R}px) / 2);
    width: var(--esc-node-w);
    height: ${R}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${R/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${_n}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: calc(var(--esc-flow-h) - ${3+R}px); }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.keys(yt).map(t=>`.seg[data-source="${t}"] { stroke: ${Ee(t)}; }`).join(" ")}
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
/* The grid down: a red ring and border, its value reads \xAB Coupure \xBB */
.node[data-alert] { border-color: rgba(255, 138, 128, 0.9); }
.seg[data-source="alert"] { stroke: #ff8a80; }
/* A reading gone quiet: a dashed border (a cell's icon turns to a clock instead) */
.node[data-stale] { border-style: dashed; }
/* Compact appliances (more than two, or a narrow corner): the icon in its ring and the power; the name on hover (title) and for screen readers (aria-label) */
.flow[data-compact] .node[data-consumer] { flex-direction: column; justify-content: flex-start; gap: 3px; padding: 0; border: none; background: none; border-radius: 0; }
.flow[data-compact] .node[data-consumer][data-side="below"] { flex-direction: column-reverse; }
.flow[data-compact] .node[data-consumer] .disc { width: 30px; height: 30px; }
.flow[data-compact] .node[data-consumer] .ring { width: 36px; height: 36px; }
.flow[data-compact] .node[data-consumer] .ntext { align-items: center; max-width: 100%; }
.flow[data-compact] .node[data-consumer] .nlab { display: none; }
.flow[data-compact] .node[data-consumer] .nval { font-size: 11.5px; font-weight: 600; line-height: 13px; }
`;var Wt={cols:10,rows:6},En=[1,.9,.8,.7,.6,.5],Cn=.4,Sn=3,An=1.4;function kn(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var Q=(t,e=1)=>Math.round(t*10**e)/10**e;function Ln(t,e,n,r){return{x:Q((e+.1+t()*.8)/r.cols*100),y:Q((n+.1+t()*.8)/r.rows*100)}}function Mn(t=24301){let e=kn(t),n=[];for(let r=0;r<Wt.rows;r++)for(let o=0;o<Wt.cols;o++){let a=e()<En[r],{x:i,y:s}=Ln(e,o,r,Wt),d=1.4+e()*.8,l=e()<Cn,c=Q(e()*5,2);if(!a)continue;let u=s/100;n.push({x:i,y:s,size:Q(d*(1-.3*u),2),opacity:Q(1-.45*u,2),twinkle:l,delay:c})}return n}var Tn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],$n=t=>Q(t.size/2*(t.twinkle?An:1)+Sn,2);function Se(t=Mn()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${$n(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+Tn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var Ae=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var On="(prefers-reduced-motion: reduce)";function Rn(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var vt=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(On),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return Rn({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var Hn=["bleu","blanc","rouge"],Kt=/tomorrow|demain/i,Pn=/today|daily|jour|_day(_|$)/i,Nn=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function Fn(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function In(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!Kt.test(e.entity_id)&&Hn.includes(String(e.state).toLowerCase()))?.entity_id}function at(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var Et=t=>(e,n)=>n===t,Ct=t=>t[0];function Vt(t,e,n){return(e&&t.states[e]?e:void 0)??Ct(at(t,n,Et("power")))}function Dn(t,e){let n=t?.energy_sources??[],r={},o=n.filter(c=>c.type==="solar"),a=[...new Set(o.map(c=>Vt(e,c.stat_rate,c.stat_energy_from)).filter(c=>!!c))];a.length&&(r.production_entity=a.length===1?a[0]:a);let i=[...new Set(o.flatMap(c=>at(e,c.stat_energy_from,(u,f)=>f==="energy"&&Pn.test(u)&&!Nn.test(u)&&!Kt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(c=>c.config_entry_solar_forecast?.length)){let c=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&Kt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;c&&(r.forecast_tomorrow_entity=c)}let s=n.find(c=>c.type==="battery");if(s){let c=s.stat_energy_from??s.stat_energy_to,u=(s.stat_soc&&e.states[s.stat_soc]?s.stat_soc:void 0)??Ct(at(e,c,Et("battery"))),f=s.power_config?.stat_rate??s.stat_rate,p=Vt(e,f,c),g=Ct(at(e,c,Et("temperature"))),m={};u&&(m.soc_entity=u),p&&(m.power_entity=p),p&&f&&p===f&&(m.invert=!0),g&&(m.temperature_entity=g),Object.keys(m).length&&(r.battery=m)}let d=n.find(c=>c.type==="grid");if(d){let c=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,f=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let m=Vt(e,f,c);m&&(p.power_entity=m)}let g=Ct(at(e,c,Et("voltage")));g&&(p.voltage_entity=g),Object.keys(p).length&&(r.grid=p)}let l=n.find(c=>c.type==="home");return l?.stat_rate&&e.states[l.stat_rate]&&(r.consumption_entity=l.stat_rate),r}function ke(t,e){let n=t?Dn(e,t):{},r=In(t);return{production_entity:Fn(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Le(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var tt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",Z=t=>t!==void 0&&t.action!=="none";function $e(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])tt(n[o])&&(r[o]=n[o]);return r}function Oe(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:Z(t.tap_action)}function Me(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function dt(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Me(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...a}=e;Z(r)&&Me(t,"hass-action",{config:a,action:n})}var jt=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{Z(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,Z(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,dt(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!Z(e.double_tap_action)){dt(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,dt(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,dt(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());Oe(o)&&(e.preventDefault(),dt(this.host,o,"tap"))}},Te=new WeakSet;function Re(t,e,n){Te.has(t)||(Te.add(t),new jt(t,e,n))}function He(t,e){let n=Oe(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=Z(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var Wn=[56,48,40],Vn=[44,40,36],Pe=[0,1,2],zt=[0,1,2,3],Bt=[["solar",K.tomorrow],["grid",K.grid],["battery",K.battery],["home",K.consumption]],Ut=2*Math.PI*17;function _(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Kn=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),Gt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),Ne=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,jn=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]]],zn=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],De={solar:J.sun,grid:J.grid,battery:J.batt,consumption:J.use},Un=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],Kn,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold","consumer_threshold","stale_after"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Gn(t){if(!t||typeof t!="object")throw _("Configuration invalide","Invalid configuration");let e=t;for(let[o,a]of zn)if(Gt(e,o)!==void 0)throw _(`${o} n'existe plus : ${a.fr}`,`${o} is gone: ${a.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw _("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,a]of jn){let i=Gt(e,o);if(i!==void 0&&!a.includes(i))throw _(`${o} : ${Ne(a,"ou")}`,`${o}: ${Ne(a,"or")}`)}for(let[o,a,i,s]of Un)for(let d of o)if(!a(Gt(e,d)))throw _(`${d} ${i}`,`${d} ${s}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>ot)throw _(`cells : une liste de ${ot} cases au plus`,`cells: a list of at most ${ot} cells`);for(let o of e.cells){let a=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?nt.includes(o):typeof a.entity=="string"&&!!a.entity||nt.includes(a.type))){let s=String(typeof o=="object"?JSON.stringify(o):o);throw _(`cells : \xAB ${s} \xBB n'est ni ${nt.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${s}" is neither ${nt.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(a.tap_action!==void 0&&!tt(a.tap_action))throw _("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>O)throw _(`consumers : une liste de ${O} appareils au plus`,`consumers: a list of at most ${O} appliances`);for(let o of e.consumers){let a=o&&typeof o=="object"?o:{};if(typeof a.entity!="string"||!a.entity)throw _("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(a.tap_action!==void 0&&!tt(a.tap_action))throw _("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.flow_colors!==void 0){let o=e.flow_colors;if(!o||typeof o!="object"||Array.isArray(o))throw _("flow_colors : solar, grid, battery et consumption, chacun une couleur","flow_colors: solar, grid, battery and consumption, each a colour");for(let[a,i]of Object.entries(o))if(!(a in De)||typeof i!="string"||!i)throw _(`flow_colors.${a} : solar, grid, battery ou consumption, une couleur CSS`,`flow_colors.${a}: solar, grid, battery or consumption, a CSS colour`)}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw _("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(me))throw _(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var Xt=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new vt(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Gn(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.staleTimer??(this.staleTimer=setInterval(()=>this.markStale(),6e4)),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),clearInterval(this.staleTimer),this.staleTimer=void 0,this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=$t(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),b(this,"data-flow",n.flow??null);for(let[i,s]of Object.entries(De)){let d=n.flow_colors?.[i];d?this.style.setProperty(s,d):this.style.removeProperty(s)}this.flowWidth=0,this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${Ce}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Bn()}</div>
                    <div class="layer night">${Se()}</div>
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
                ${n.flow?Xn(n.consumers?.length??0):""}
            </ha-card>`;let o=(i,s=this.root)=>ct(s,i);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let s=o(`[data-metric="${i.key}"]`),d=o("ha-icon",s);return d.setAttribute("icon",i.kind==="custom"?i.custom.icon||Tt:K[i.kind]),[i.key,{el:s,icon:d,label:o(".label-text",s),value:o(".value-main",s),extra:o(".extra",s),entity:Ot(n,i)}]}))},this.actions=$e(n,j(n)[0]);let a=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let s=Ot(n,i),d=tt(i.tapAction)?i.tapAction:void 0;return d?[[i.key,{entity:s,tap:d}]]:a&&s?[[i.key,{entity:s}]]:[]})),n.flow==="tap"){let i=this.refs.heroValue.parentElement;for(let s of[i,this.refs.context,this.refs.flow.panel])s.dataset.cellTarget="",s.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false")}if(n.flow){for(let[i]of Bt){let s=_t(n,i);if(!s)continue;this.cellTargets.set(`node:${i}`,{entity:s});let d=this.refs.flow.nodes.get(i).el;d.dataset.cellTarget="",d.setAttribute("role","button"),d.tabIndex=0}(n.consumers??[]).forEach((i,s)=>{let d=tt(i.tap_action)?i.tap_action:void 0;this.cellTargets.set(`consumer:${s}`,{entity:i.entity,tap:d});let l=this.refs.flow.consumers[s].el;l.dataset.cellTarget="",d?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0)})}for(let[i,s]of this.cellTargets){if(i.includes(":"))continue;let d=o(`[data-metric="${i}"]`);d.dataset.cellTarget="",s.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}Re(this.refs.card,this,i=>this.actionsFor(i)),He(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",a=r?this.cellTargets.get(o):void 0;if(!a)return this.actions;let{tap_action:i,...s}=this.actions;return{...s,entity:a.entity??this.actions.entity,...a.tap?{tap_action:a.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=this.shownConsumers,a=xe(r,o.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${a.height}`),n.box.style.setProperty("--esc-flow-h",`${a.height}px`),n.box.style.setProperty("--esc-node-w",`${a.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${a.centreWidth}px`),n.box.toggleAttribute("data-narrow",a.nodeWidth<112);for(let[i,s]of n.wires)for(let d of s.paths)d.setAttribute("d",a.paths[i]);n.box.toggleAttribute("data-compact",a.consumers.some(i=>i.compact)),n.consumers.forEach(({el:i,wire:s,paths:d},l)=>{let c=o.indexOf(l),u=a.consumers[c];if(i.hidden=!u?.visible,b(s,"data-off",u?.visible?null:""),!!u?.visible){i.dataset.side=u.below?"below":"above",Object.assign(i.style,{left:`${u.left}px`,top:`${u.top}px`,width:`${u.width}px`}),s.style.setProperty("--esc-flow",`esc-flow-c${c}`);for(let f of d)f.setAttribute("d",u.path)}}),n.keyframes.textContent=a.keyframes}flowRefs(){let n=(r,o=this.root)=>ct(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(H.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(Bt.map(([r])=>[r,Fe(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let a=n(`[data-wire="c${o}"]`);return{...Fe(r),icon:n("ha-icon",r),wire:a,paths:[...a.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=we(this.config,this._hass);for(let[a,i]of n.nodes){let s=r.nodes[a];i.el.hidden===s.present&&(i.el.hidden=!s.present),A(i.label,s.label),A(i.value,s.value),A(i.centre,s.centre??""),i.el.toggleAttribute("data-centre",s.centre!==void 0),i.el.toggleAttribute("data-alert",!!s.alert),Ie(i.segs,s.ring)}r.consumers.forEach((a,i)=>{let s=n.consumers[i];s&&(A(s.label,a.label),b(s.el,"title",a.label),b(s.el,"aria-label",`${a.label} ${a.value}`),A(s.value,a.value),b(s.icon,"icon",a.icon),s.el.toggleAttribute("data-idle",a.level===0),Ie(s.segs,[[a.share,"use"]]),b(s.wire,"data-level",String(a.level)),a.shown||(s.el.hidden=!0,b(s.wire,"data-off","")))});let o=r.consumers.flatMap((a,i)=>a.shown?[i]:[]);o.join()!==this.shownConsumers.join()&&(this.shownConsumers=o,this.flowWidth=0,this.layoutFlow());for(let[a,i]of n.wires)b(i.g,"data-level",String(r.levels[a])),b(i.g,"data-off",r.off.includes(a)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(a=>a.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let a of n.querySelectorAll(".star")){let i=r.left+parseFloat(a.style.left)/100*r.width,s=r.top+parseFloat(a.style.top)/100*r.height,d=Ae(i,s,Number(a.dataset.reach),o);a.hidden!==d&&(a.hidden=d)}}writeForms(n){this.form=n,b(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:a,extra:i}=ie(r,n);A(o.value,a),A(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&A(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),a=n.heroValue.parentElement,i=n.context,s=[...n.metrics.values()].map(g=>g.value.parentElement),d=g=>g.scrollWidth>g.clientWidth+1,l=()=>parseFloat(getComputedStyle(i).lineHeight)||20,c=()=>!i.hidden&&(d(i)||i.scrollHeight>l()+1),u=g=>!d(a)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!g||(r?!c():!s.some(d))),f=r?Vn:Wn,p=(g,m)=>{for(let M of[!1,!0]){this.toggleAttribute("data-compact",M);for(let h of m){this.writeForms(h);for(let v of f)if(b(this,"data-hero",v===f[0]?null:String(v)),u(g))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,Pe)||p(!1,Pe.slice(-1)),this.writeContext(!i.hidden&&d(i));return}p(!0,zt)||(this.writeContext(!0),!p(!0,zt)&&(this.writeContext(!1),p(!1,zt),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=ce(this.config);return[pt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=le(this.config,this._hass),o=this.refs;this.paintSky(),A(o.heroValue,r.hero.value),A(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let s=o.metrics.get(i.key);s&&(A(s.label,i.label),this.side&&s.el.title!==i.label&&(s.el.title=i.label),i.icon&&s.icon.getAttribute("icon")!==i.icon&&s.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow(),this.markStale();let a=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);a!==this.fitted&&(this.fitted=a,this.fit())}markStale(){if(!this.config||!this.refs||!this._hass)return;let n=de(this.config,this._hass),r=pt(this._hass),o=s=>s<120?`${s} min`:`${Math.floor(s/60)} h`,a=s=>{let d=s===void 0?void 0:n.get(s);return d===void 0?void 0:y(r,"stale",{age:o(d)})};for(let s of this.view?.metrics??[]){let d=this.refs.metrics.get(s.key);if(!d)continue;let l=a(d.entity);d.el.toggleAttribute("data-stale",!!l);let c=l?"mdi:clock-alert-outline":s.icon??d.icon.dataset.icon;d.icon.dataset.icon||(d.icon.dataset.icon=d.icon.getAttribute("icon")??""),c&&d.icon.getAttribute("icon")!==c&&d.icon.setAttribute("icon",c);let u=[this.side?s.label:"",l??""].filter(Boolean).join(" \xB7 ");b(d.el,"title",u||null)}let i=this.refs.flow;if(i){for(let[s,d]of i.nodes){let l=a(_t(this.config,s));d.el.toggleAttribute("data-stale",!!l),b(d.el,"title",l??null)}(this.config.consumers??[]).forEach((s,d)=>{let l=i.consumers[d];if(!l)return;let c=a(s.entity);l.el.toggleAttribute("data-stale",!!c);let u=l.label.textContent??"";b(l.el,"title",c?`${u} \xB7 ${c}`:u)})}}paintSky(){let n=ge(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((o,a)=>r.style.setProperty(`--esc-c${a}`,o)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return ke(n,await Le(n))}static async getConfigElement(){return customElements.get(V)||await Qt(),document.createElement(V)}};function Bn(){return he.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Xn(t){let e=[1,2,3].map(s=>`<g class="comet c${s}"><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...H.filter(s=>s!=="gb"&&s!=="bg")].map(s=>`<g class="wire ${It[s]}" data-wire="${s}" data-level="0">${s==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(s,d)=>`<g class="wire use" data-wire="c${d}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),a=(s,d)=>`
        <div class="node" ${s}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${d?` icon="${d}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,i=Bt.map(([s,d])=>a(`data-node="${s}"`,d)).join("")+Array.from({length:t},(s,d)=>a(`data-consumer="${d}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${it}">${o}${r}</svg>${i}</div></div>`}function Fe(t){return{el:t,label:ct(t,".nlab"),value:ct(t,".nval"),centre:ct(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function Ie(t,e){let n=0;t.forEach((r,o)=>{let a=e[o],i=a?Math.max(Ut*a[0]-(e.length>1?3:0),0):0;b(r,"stroke-dasharray",`${i.toFixed(1)} ${Ut.toFixed(1)}`),b(r,"stroke-dashoffset",(-n).toFixed(1)),b(r,"data-source",a&&i>=1.5?a[1]:""),a&&(n+=Ut*a[0])})}function ct(t,e){return t.querySelector(e)}function b(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function A(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(W)||(customElements.define(W,Xt),window.customCards=window.customCards||[],window.customCards.push({type:W,name:St,description:qt,preview:!0,documentationURL:Yt}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${St} %c ${Jt} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
