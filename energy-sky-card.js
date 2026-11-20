"use strict";(()=>{var G="energy-sky-card",B=`${G}-editor`,Nt="Energy Sky Card",le="Solar production, battery and grid on a sky that follows the tariff colour and the sun",ce="https://github.com/macanto44/energy-sky-card",ue="0.3.9";function cn(t,e){let n=`${G}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),a=o.pathname.lastIndexOf("/");if(o.pathname.slice(a+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var wt;function pe(){return customElements.get(B)?Promise.resolve():(wt??(wt=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=cn(B,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(B)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw wt=void 0,t})),wt)}var un=new Set(["unavailable","unknown","none",""]);function P(t){if(!t||un.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var pn={mw:1e6,kw:1e3,w:1},hn={mwh:1e3,kwh:1,wh:.001};function he(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function A(t){let e=P(t);return e===void 0?void 0:e*(pn[he(t)]??1)}function It(t){let e=P(t);return e===void 0?void 0:e*(hn[he(t)]??1)}var ge={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",stale:"Pas de nouvelle valeur depuis {age}",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",stale:"No new reading for {age}",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"},de:{produced:"{value} kWh erzeugt",battery:"Batterie",grid:"Netz",solar:"Solar",home:"Haus",stale:"Kein neuer Wert seit {age}",voltage:"Spannung",outage:"Ausfall",tomorrow:"Morgen",soc_reached:"SOC erreicht",soc_reached_short:"SOC \u2713",consumption:"Verbrauch",consumption_short:"Verbr."},es:{produced:"{value} kWh producidos",battery:"Bater\xEDa",grid:"Red",solar:"Solar",home:"Casa",stale:"Sin valor nuevo desde hace {age}",voltage:"Tensi\xF3n",outage:"Corte",tomorrow:"Ma\xF1ana",soc_reached:"SOC alcanzado",soc_reached_short:"SOC \u2713",consumption:"Consumo",consumption_short:"Cons."},it:{produced:"{value} kWh prodotti",battery:"Batteria",grid:"Rete",solar:"Solare",home:"Casa",stale:"Nessun nuovo valore da {age}",voltage:"Tensione",outage:"Blackout",tomorrow:"Domani",soc_reached:"SOC raggiunto",soc_reached_short:"SOC \u2713",consumption:"Consumo",consumption_short:"Cons."},nl:{produced:"{value} kWh opgewekt",battery:"Batterij",grid:"Net",solar:"Zon",home:"Huis",stale:"Geen nieuwe waarde sinds {age}",voltage:"Spanning",outage:"Storing",tomorrow:"Morgen",soc_reached:"SOC bereikt",soc_reached_short:"SOC \u2713",consumption:"Verbruik",consumption_short:"Verbr."}};var fn=Object.keys(ge);function xt(t){let e=(t?.locale?.language||t?.language||"en").toLowerCase().split(/[-_]/)[0];return fn.includes(e)?e:"en"}function m(t,e,n={}){return ge[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function gn(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return fe(void 0);default:return fe(t?.locale?.language||t?.language||"en")}}function fe(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function _t(t){return{lang:xt(t),decimal:gn(t)}}function M(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function vt(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:M(Math.round(t),0,e),unit:"W"}:{value:M(t/1e3,1,e),unit:"kW"}}function Ft({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function T(t,e){return Ft(vt(t,e))}function Wt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":M(t,1,e)}function me(t,e){let n=Wt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function ye(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}\xA0V`}var mn=["fr","de","es"];function Et(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}${mn.includes(e.lang)?"\xA0":""}%`}function be(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,n)} ${e||"\xB0C"}`}var Vt=20,yn=["warning","alarm"],X={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},jt="mdi:gauge",ct=Object.keys(X),ut=4,N=4;function xe(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var Ct=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",_e=t=>typeof t=="object"&&t!==null&&!Ct(t)&&typeof t.type=="string",bn=t=>typeof t=="string"?t:_e(t)?t.type:void 0;function wn(t){let e=[];return I(t).length&&e.push("battery"),F(t).length&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function Kt(t){if(!t.cells)return wn(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,ut).flatMap((n,r)=>{if(Ct(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=bn(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,..._e(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function zt(t,e){switch(e.kind){case"battery":return I(t)[0];case"grid":return F(t)[0]??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function H(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function pt(t,e){let n=H(t).map(o=>A(e.states[o])).filter(o=>o!==void 0);if(!n.length)return;let r=n.reduce((o,a)=>o+a,0);return t.production_threshold&&r<t.production_threshold?0:r}var ve=(t,e)=>t===void 0||!e?t:-t,S=t=>(Array.isArray(t)?t:t?[t]:[]).filter(e=>typeof e=="string"&&e.length>0),I=t=>S(t.battery?.soc_entity),q=t=>[...S(t.battery?.power_entity),...S(t.battery?.charge_entity),...S(t.battery?.discharge_entity)],F=t=>[...S(t.grid?.power_entity),...S(t.grid?.import_entity),...S(t.grid?.export_entity)];function Dt(t,e,n=!1){let r=t.map(o=>A(e.states[o])).filter(o=>o!==void 0);return r.length?r.reduce((o,a)=>o+(n?Math.abs(a):a),0):void 0}function Ee(t,e,n){let r=Dt(t,n,!0),o=Dt(e,n,!0);return r===void 0&&o===void 0?void 0:(r??0)-(o??0)}var xn=30;function Ce(t,e,n=Date.now()){let r=t.stale_after??xn,o=new Map;if(!(r>0))return o;let a=[...H(t),t.consumption_entity,...I(t),...q(t),t.battery?.temperature_entity,...F(t),t.grid?.voltage_entity,...(t.cells??[]).filter(Ct).map(s=>s.entity),...(t.consumers??[]).map(s=>s.entity)];for(let s of a){let i=Date.parse(e.states[s??""]?.last_reported??"");if(!Number.isFinite(i))continue;let d=(n-i)/6e4;d>=r&&o.set(s,Math.floor(d))}return o}function Ut(t,e){let n=t.grid;return n?.import_entity||n?.export_entity?Ee(S(n.import_entity),S(n.export_entity),e):ve(A(e.states[n?.power_entity??""]),n?.invert)}function Gt(t,e){let n=t.battery;return n?.charge_entity||n?.discharge_entity?Ee(S(n.charge_entity),S(n.discharge_entity),e):ve(Dt(S(n?.power_entity),e),n?.invert)}function St(t,e){let n=I(t),r=t.battery?.capacity,o=Array.isArray(r)&&r.length===n.length?r:void 0,a=0,s=0;return n.forEach((i,d)=>{let c=P(e.states[i]);if(c===void 0)return;let l=o?o[d]:1;a+=c*l,s+=l}),s>0?a/s:void 0}function Se(t){let e=[...H(t),t.consumption_entity,...(t.cells??[]).filter(Ct).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],...I(t),...q(t),t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],...F(t),t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function _n(t,e){let n=(t.daily_production_entities??[]).map(r=>It(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function vn(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function En(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Bt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??yn).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Cn(t,e,n,r){let o=St(t,e),a=vn(Gt(t,e),r),s=o===void 0?"":a==="up"?"\xA0\u2191":a==="down"?"\xA0\u2193":"",i=En(t,e),d=e.states[t.battery?.temperature_entity??""],c=P(d),l=Et(o,n)+s,u=String(d?.attributes.unit_of_measurement??"");return{key:"battery",label:m(n.lang,"battery"),value:c===void 0?l:`${l} \xB7 ${be(c,u,n)}`,extra:i?` \xB7 ${m(n.lang,"soc_reached")}`:"",extraShort:i?` \xB7 ${m(n.lang,"soc_reached_short")}`:"",...c===void 0?{}:{tight:{value:`${l}\u202F\xB7\u202F${M(Math.round(c),0,n)}\xB0`,extra:i?"\u202F\u2713":""},bare:l}}}function Sn(t,e,n){return{key:"grid",label:m(n.lang,"grid"),value:T(Ut(t,e),n),extra:"",extraShort:""}}function kn(t,e,n){let r=t.grid?.voltage_entity?P(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:m(n.lang,"voltage"),value:Bt(t,e)?m(n.lang,"outage"):ye(r,n),extra:"",extraShort:""}}function An(t,e,n){return{key:"tomorrow",label:m(n.lang,"tomorrow"),value:me(It(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function $n(t,e,n){return{key:"consumption",label:m(n.lang,"consumption"),value:T(A(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Mn(t,e,n){let r=t.custom,o=e.states[r.entity],a=String(o?.attributes.unit_of_measurement??""),s;if(!o||P(o)===void 0&&["unavailable","unknown",""].includes(o.state))s="\u2014";else if(/^[mk]?w$/i.test(a))s=T(A(o),n);else if(e.formatEntityState)s=e.formatEntityState(o);else{let d=P(o);s=d===void 0?o.state:Ft({value:M(d,Number.isInteger(d)?0:1,n),unit:a})}let i=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||jt;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:s,extra:"",extraShort:"",icon:i}}function Tn(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Ln(t,e,n){let r=Tn(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:vt(A(e.states[t.consumption_entity]),n),label:m(n.lang,"consumption"),labelShort:m(n.lang,"consumption_short")};if(r==="battery"&&I(t).length){let o=St(t,e);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:M(Math.round(o),0,n),unit:"%"},label:m(n.lang,"battery")}}return{hero:vt(pt(t,e),n)}}function ke(t,e){let n=_t(e),r=t.battery?.power_threshold??Vt,o=t.daily_production_entities?.length?m(n.lang,"produced",{value:Wt(_n(t,e),n)}):void 0,a=Kt(t).map(l=>{switch(l.kind){case"battery":return Cn(t,e,n,r);case"grid":return Sn(t,e,n);case"voltage":return kn(t,e,n);case"tomorrow":return An(t,e,n);case"consumption":return $n(t,e,n);case"custom":return Mn(l,e,n)}}),{hero:s,label:i,labelShort:d=i}=Ln(t,e,n),c=l=>l?[l,o].filter(Boolean).join(" \xB7 "):o;return{hero:s,context:c(i),contextShort:c(d),metrics:a}}var Ae={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},$e="Bleu",qt=["#1d2b4d","#121b36","#0b1026"],Uo=[255/255,214/255,140/255],On=.55;var Zt=6e3,kt={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},At=.45,$t={x:0,y:-30,radius:100},Te=[8,18,40],Jt=.2,Le=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],Rn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Mt=t=>typeof t=="string"&&Rn.test(t);function Oe(t){let e=t.slice(1);return e.length===3&&(e=e.split("").map(n=>n+n).join("")),[0,2,4].map(n=>parseInt(e.slice(n,n+2),16)/255)}function Hn(t){return t>.04045?((t+.055)/1.055)**2.4:t/12.92}function Me(t){let e=[.2126,.7152,.0722];return t.reduce((n,r,o)=>n+e[o]*Hn(r),0)}function Pn(t,e){let[n,r]=[Me(t),Me(e)].sort((o,a)=>a-o);return(n+.05)/(r+.05)}function nt(t,e,n){return[0,1,2].map(r=>t[r]+(e[r]-t[r])*n)}function Nn(t,e){let[n,r,o]=t.map(Oe);return e<=.6?nt(n,r,e/.6):nt(r,o,(e-.6)/.4)}var In=[.36,.5,.64,.76,.86,.98],Yt=[1,1,1];function Fn(t,e=0){return Math.min(...In.map(n=>Pn(Yt,nt(Nn(t,n),Yt,e))))}var Xt=t=>"#"+t.map(e=>Math.round(Math.min(Math.max(e,0),1)*255).toString(16).padStart(2,"0")).join(""),Re="#3a6b8c";function Wn(t){let e=Oe(Mt(t)?t:Re),n=o=>[Xt(nt(o,Yt,.12)),Xt(o),Xt(nt(o,[0,0,0],.35))],r=n(e);for(let o=0;o<40&&Fn(r)<4.6;o++)e=nt(e,[0,0,0],.06),r=n(e);return r}var He=.12,ot={sunny:{day:["#4b90d5","#2169b0","#1d4f87"],night:qt,clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,halo:!0,stars:"all"},partlycloudy:{day:["#4d78a6","#2a5b8b","#20446c"],night:["#202c47","#141c31","#0d1222"],clouds:3,cloudAlpha:.12,nightCloudAlpha:.1,rain:0,snow:0,halo:!0,stars:"few"},cloudy:{day:["#647285","#475567","#35404f"],night:["#262c3a","#1a1f2b","#11141c"],clouds:6,cloudAlpha:.14,nightCloudAlpha:.1,rain:0,snow:0,stars:"none"},rainy:{day:["#5a6879","#405062","#2f3a48"],night:["#20252f","#161a22","#0e1117"],clouds:5,cloudAlpha:.13,nightCloudAlpha:.08,rain:40,snow:0,stars:"none"},pouring:{day:["#4a5664","#343f4c","#262e38"],night:["#1b1f27","#12151b","#0b0d11"],clouds:5,cloudAlpha:.11,nightCloudAlpha:.06,rain:80,snow:0,stars:"none"},lightning:{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:0,flash:!0,stars:"none"},"lightning-rainy":{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:60,snow:0,flash:!0,stars:"none"},snowy:{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:40,stars:"none"},"snowy-rainy":{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:20,snow:24,stars:"none"},fog:{day:["#6a737c","#525a64","#404750"],night:["#2a2f37","#1e2229","#15181d"],clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,fog:!0,stars:"none"},windy:{day:["#4c79a7","#2a5a8b","#1f446b"],night:["#1f2b46","#131b30","#0c1121"],clouds:5,cloudAlpha:.12,nightCloudAlpha:.09,windy:!0,rain:0,snow:0,halo:!0,stars:"few"}},Dn={"clear-night":"sunny",hail:"pouring","windy-variant":"windy",exceptional:"cloudy"};function Vn(t){let e=String(t??"").toLowerCase();return ot[e]?e:Dn[e]??"cloudy"}function jn(t,e){let n={...Ae,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(a=>a.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[$e]??Ae[$e]}function Pe(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=pt(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:Zt,a=Math.min(Math.max(r,0)/o,1),s=Math.round(a*On*1e3)/1e3,i={mode:n==="below_horizon"?"night":"day",producing:r>0};if(t.background==="solid")return{...i,sky:"solid",palette:Wn(t.background_color??Re),nightPalette:qt,haloAlpha:0};if(t.background==="weather"){let d=Vn(e.states[t.weather_entity??""]?.state),c=ot[d];return{...i,sky:"weather",weather:d,palette:c.day,nightPalette:c.night,haloAlpha:c.halo?s:0}}return{...i,sky:"tempo",palette:jn(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),nightPalette:qt,haloAlpha:s}}var Qt={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},Kn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},D=Object.keys(Qt),Ie=20,Y=t=>Math.max(t??0,0);function zn(t,e,n,r){let o=Y(t),a=Y(e===void 0?void 0:-e),s=Y(e),i=Y(n),d=Y(n===void 0?void 0:-n),c=Math.min(a,o);o-=c;let l=Math.min(a-c,d),u=Math.min(i,o);o-=u;let h=Math.min(i-u,s),p={sh:o,sg:c,sb:u,gh:s-h,bh:d-l,gb:h,bg:l};for(let b of D)p[b]<Ie&&(p[b]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function Ne(t){return t<Ie?0:t<500?1:t<1500?2:t<3e3?3:4}function Lt(t,e){switch(e){case"solar":return H(t)[0];case"grid":return F(t)[0];case"battery":return q(t)[0]??I(t)[0];case"home":return t.consumption_entity}}var Un="mdi:power-plug-outline",Gn=10;function Fe(t,e){let n=_t(e),r=pt(t,e),o=Bt(t,e),a=o?0:Ut(t,e),s=Gt(t,e),i=t.battery?.power_threshold??Vt,d=s!==void 0&&Math.abs(s)<=i?0:s,c=A(e.states[t.consumption_entity??""]),l=zn(r,a,d,c),u=t.production_max&&t.production_max>0?t.production_max:Zt,h=St(t,e),p={sun:l.wires.sh,grid:l.wires.gh,batt:l.wires.bh},f=p.sun+p.grid+p.batt,b=g=>g==="solar"||g==="home"||!!Lt(t,g),y=Object.fromEntries(D.map(g=>[g,Ne(l.wires[g])]));return{nodes:{solar:{present:b("solar"),label:m(n.lang,"solar"),value:T(r,n),ring:[[Math.min(Y(r)/u,1),"sun"]]},grid:{present:b("grid"),label:m(n.lang,"grid"),value:o?m(n.lang,"outage"):T(a,n),ring:o?[[1,"alert"]]:[],alert:o},battery:{present:b("battery"),label:m(n.lang,"battery"),value:q(t).length?T(s,n):Et(h,n),ring:h===void 0?[]:[[Math.min(Math.max(h,0),100)/100,"batt"]],centre:h===void 0?void 0:String(Math.round(h))},home:{present:b("home"),label:m(n.lang,"home"),value:T(l.home,n),ring:f>0?["sun","batt","grid"].filter(g=>p[g]>0).map(g=>[p[g]/f,g]):[]}},consumers:(t.consumers??[]).slice(0,N).map(g=>{let E=e.states[g.entity],V=A(E),J=Y(V),j=t.consumer_threshold??Gn,Q=lt=>typeof E?.attributes[lt]=="string"?E.attributes[lt]:void 0;return{label:g.name||Q("friendly_name")||g.entity,icon:g.icon||Q("icon")||Un,value:T(A(E),n),share:l.home?Math.min(J/l.home,1):0,level:Ne(J),shown:j<=0||V!==void 0&&J>=j}}),levels:y,off:D.filter(g=>!Kn[g].every(b))}}var ht=220,Bn=.65,Xn=360,W=46,qn=12,Yn=46;function Zn([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,a]=e,s=1-r,i=c=>s*s*s*t[c]+3*s*s*r*o[c]+3*s*r*r*a[c]+r*r*r*n[c],d=c=>3*s*s*(o[c]-t[c])+6*s*r*(a[c]-o[c])+3*r*r*(n[c]-a[c]);return{at:[i(0),i(1)],deg:Math.atan2(d(1),d(0))*180/Math.PI}}var Z=t=>Math.round(t*10)/10,rt=([t,e])=>`${Z(t)},${Z(e)}`,Tt=27;function We(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),a=Math.round(Math.min(Math.max(n*Bn,ht),Xn)),s=o/2,i=W/2,d=a/2,c=3+i,l=a-3-i,u=n/2,h=r-Tt,p=n-r+Tt,f=u-s+Tt,b=u+s-Tt,y=(_,v)=>{let O=(v[1]-_[1])/2;return[_,[[_[0],_[1]+O],[v[0],v[1]-O]],v]},g={sh:[[r,d],null,[n-r,d]],sg:y([h,d-i],[f,c+i]),gh:y([b,c+i],[p,d-i]),sb:y([h,d+i],[f,l-i]),bh:y([b,l-i],[p,d+i]),gb:[[u,c+i],null,[u,l-i]],bg:[[u,l-i],null,[u,c+i]]},E=n-(u+s)-8,V=e>2||E<110,J=V&&E<100?1:2,j=[];for(let _=0;_<e;_++){let v=_%2===1,O=Math.floor(_/2),K=Math.min(v?Math.floor(e/2):Math.ceil(e/2),J),z=v?a-3-W:3,U=v?d+i:d-i,tt=v?z:z+W;if(O>=J){j.push({visible:!1,compact:V,below:v,left:0,top:z,width:0,path:""});continue}let k,R;if(V){let et=E/K,bt=n-E+et*(O+.5)+4;R=Yn,k=bt-R/2,g[`c${_}`]=y([n-r/2+(K>1?(O-.5)*30:10),U],[bt,tt])}else{R=Math.min(r,E),k=n-R;let et=k+R/2+10;g[`c${_}`]=[[et,U],null,[et,tt]]}j.push({visible:!0,compact:V,below:v,left:Z(k),top:z,width:Z(R),path:""})}let Q={},lt="";for(let[_,v]of Object.entries(g)){let[O,K,z]=v;Q[_]=K?`M${rt(O)} C${rt(K[0])} ${rt(K[1])} ${rt(z)}`:`M${rt(O)} L${rt(z)}`;let U=K?qn:1,tt=[];for(let k=0;k<=U;k++){let{at:R,deg:et}=Zn(v,k/U),bt=k===0||k===U?" opacity: 0;":"";tt.push(`${Z(k/U*100)}% { transform: translate(${Z(R[0])}px, ${Z(R[1])}px) rotate(${Math.round(et)}deg);${bt} }`)}tt.push("10%, 90% { opacity: 1; }"),lt+=`@keyframes esc-flow-${_} { ${tt.join(" ")} }
`}return j.forEach((_,v)=>{_.path=Q[`c${v}`]??""}),{nodeWidth:r,centreWidth:o,height:a,paths:Q,consumers:j,keyframes:lt}}var te=t=>`rgba(${Te.join(", ")}, ${t})`,De=t=>`${Math.round(t*1e3)/10}%`,Jn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${De(1-At/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${De((.6-At)/(1-At))}, var(--esc-c2, #1d4f87) 100%)`,Ve=`${$t.x}px ${$t.y}px`;var it={sun:"--energy-sky-card-solar",grid:"--energy-sky-card-grid",batt:"--energy-sky-card-battery",use:"--energy-sky-card-consumption"},je=t=>`var(${it[t]}, ${kt[t]})`,Qn=.14,to=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],L=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,Ke=`
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
    background: var(--esc-n2, #0b1026);
    border: none;
    -webkit-tap-highlight-color: transparent;
}
/* The sky: two layers, day and night, one shown at a time */
.sky { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.layer { position: absolute; inset: 0; opacity: 0; }
:host([data-mode="day"]) .layer.day,
:host([data-mode="night"]) .layer.night { opacity: 1; }
.layer.day { background: linear-gradient(180deg, var(--esc-c0, #4b90d5) 0%, var(--esc-c1, #2169b0) 60%, var(--esc-c2, #1d4f87) 100%); }
.layer.night { background: linear-gradient(180deg, var(--esc-n0, #1d2b4d) 0%, var(--esc-n1, #121b36) 60%, var(--esc-n2, #0b1026) 100%); }
/*
 * The weather sky (background: weather): cumulus clouds drifting across,
 * rain, snow, fog bands, a lightning flash; all under the text. Raindrops
 * and snowflakes only show while they fall (motion on); clouds and fog
 * rest where they are without motion. The Tempo sky's cloud shadows give
 * way to the clouds.
 */
.wx { position: absolute; inset: 0; overflow: hidden; }
.cloudband { position: absolute; inset: 0; }
.cumulus { position: absolute; filter: blur(0.6px); }
.cumulus g { fill: #f4f7fb; opacity: var(--esc-cloud-a, 0.12); }
/* The side layout is short: smaller clouds, so one doesn't fill its height */
:host([data-layout="side"]) .cumulus { transform: scale(0.5); transform-origin: 0 0; }
.drop { position: absolute; top: 0; width: 1.2px; height: 16px; background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55)); display: none; }
.flake { position: absolute; top: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.85); display: none; }
.fogband { position: absolute; left: -40%; width: 180%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, ${He}), rgba(255, 255, 255, 0)); }
.flash { position: absolute; inset: 0; background: #f4f2ff; opacity: 0; }
:host([data-sky="weather"]) .drift { display: none; }
/* At night, the stars get through a clear sky only, or a few between clouds */
:host([data-stars="none"]) .layer.night .star, :host([data-stars="none"]) .layer.night .shooting { display: none; }
:host([data-stars="few"]) .layer.night .star:nth-of-type(3n+1), :host([data-stars="few"]) .layer.night .star:nth-of-type(3n+2) { display: none; }
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
    background: radial-gradient(closest-side, ${te(Jt)}, ${te(Jt/2)} 50%, ${te(0)} 100%);
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
/* Rain slanting down; snow drifting down, swaying; fog bands breathing to and fro; lightning: two quick flashes in 7 s */
@keyframes esc-rain { from { transform: translate(0, -30px) rotate(14deg); } to { transform: translate(-70px, 300px) rotate(14deg); } }
@keyframes esc-snow { 0% { transform: translate(0, -10px); } 25% { transform: translate(9px, 70px); } 50% { transform: translate(-7px, 145px); } 75% { transform: translate(8px, 215px); } 100% { transform: translate(0, 290px); } }
@keyframes esc-fog { from { transform: translateX(-12%); opacity: 0.7; } to { transform: translateX(12%); opacity: 1; } }
@keyframes esc-flash { 0%, 60%, 100% { opacity: 0; } 61% { opacity: 0.35; } 62% { opacity: 0.06; } 63.5% { opacity: 0.28; } 66% { opacity: 0; } }
/* A cloud's band crossing the card, left to right */
@keyframes esc-drift {
    from { transform: translateX(-110%); }
    to { transform: translateX(110%); }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
${L('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${L('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${L('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${L('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
${L('[data-sky="weather"]',".cloudband","animation: esc-drift 60s linear infinite;")}
${L('[data-sky="weather"]',".drop","display: block; animation: esc-rain 0.7s linear infinite;")}
${L('[data-sky="weather"]',".flake","display: block; animation: esc-snow 8s linear infinite;")}
${L('[data-sky="weather"]',".fogband","animation: esc-fog 18s ease-in-out infinite alternate;")}
${L('[data-sky="weather"]',".flash","animation: esc-flash 7s infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${L("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .drift, .layer, .comet, .cloudband, .drop, .flake, .fogband, .flash { animation: none !important; transition: none !important; }
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
:host([data-layout="side"]) .layer.day { background: ${Jn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${$t.radius}px at ${Ve}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${Ve};
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
.flow { position: relative; height: var(--esc-flow-h); --esc-flow-h: ${ht}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
:host([data-mode="night"]) .panel { --esc-panel: var(--esc-n2, #0b1026); }
.wire .gap { stroke: var(--esc-panel); stroke-opacity: 1; stroke-width: 10px; stroke-linecap: butt; }
${to.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.keys(kt).map(t=>`.wire.${t} { color: ${je(t)}; }`).join(" ")}
${[...D,...Array.from({length:N},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: calc((var(--esc-flow-h) - ${W}px) / 2);
    width: var(--esc-node-w);
    height: ${W}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${W/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${Qn}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: calc(var(--esc-flow-h) - ${3+W}px); }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.keys(kt).map(t=>`.seg[data-source="${t}"] { stroke: ${je(t)}; }`).join(" ")}
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
`;function eo(t){let e=t;return()=>(e=e*16807%2147483647)/2147483647}var C=t=>t.toFixed(1),no=[[[24,34,13],[40,25,17],[58,21,15],[72,29,13],[84,36,9]],[[20,36,10],[34,28,14],[52,24,18],[70,31,12]]];function oo(t,e,n){let r=no[e%2],o=26+t()*22,a=t()*62-6,s=e*37%60+10,i=n?35+t()*15:55+t()*25,d=r[0][0],c=r[r.length-1][0],l=r.map(([u,h,p])=>`<circle cx="${u}" cy="${h}" r="${p}"></circle>`).join("")+`<rect x="${d}" y="30" width="${c-d}" height="14" rx="7"></rect>`;return`<div class="cloudband" style="animation-duration:${C(i)}s;animation-delay:-${C(t()*i)}s"><svg class="cumulus" viewBox="0 0 100 50" style="left:${s}%;top:${C(a)}%;width:${C(o)}%"><g>${l}</g></svg></div>`}function ze(t){let e=ot[t];if(!e)return"";let n=eo(7),r="";for(let o=0;o<e.clouds;o++)r+=oo(n,o,!!e.windy);if(e.fog)for(let o=0;o<4;o++){let a=14+n()*10;r+=`<div class="fogband" style="top:${-10+o*28}%;height:${C(45+n()*20)}%;animation-duration:${C(a)}s;animation-delay:-${C(n()*10)}s"></div>`}for(let o=0;o<e.rain;o++){let a=.55+n()*.35;r+=`<i class="drop" style="left:${C(n()*115)}%;opacity:${(.35+n()*.5).toFixed(2)};animation-duration:${a.toFixed(2)}s;animation-delay:-${(n()*a).toFixed(2)}s"></i>`}for(let o=0;o<e.snow;o++){let a=2+n()*2.6,s=6+n()*6;r+=`<i class="flake" style="left:${C(n()*100)}%;width:${C(a)}px;height:${C(a)}px;opacity:${(.5+n()*.45).toFixed(2)};animation-duration:${C(s)}s;animation-delay:-${C(n()*s)}s"></i>`}return e.flash&&(r+='<div class="flash"></div>'),r}var ee={cols:10,rows:6},ro=[1,.9,.8,.7,.6,.5],io=.4,so=3,ao=1.4;function lo(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var st=(t,e=1)=>Math.round(t*10**e)/10**e;function co(t,e,n,r){return{x:st((e+.1+t()*.8)/r.cols*100),y:st((n+.1+t()*.8)/r.rows*100)}}function uo(t=24301){let e=lo(t),n=[];for(let r=0;r<ee.rows;r++)for(let o=0;o<ee.cols;o++){let a=e()<ro[r],{x:s,y:i}=co(e,o,r,ee),d=1.4+e()*.8,c=e()<io,l=st(e()*5,2);if(!a)continue;let u=i/100;n.push({x:s,y:i,size:st(d*(1-.3*u),2),opacity:st(1-.45*u,2),twinkle:c,delay:l})}return n}var po=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],ho=t=>st(t.size/2*(t.twinkle?ao:1)+so,2);function Ue(t=uo()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${ho(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+po.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var Ge=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var fo="(prefers-reduced-motion: reduce)";function go(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var Ot=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(fo),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return go({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};function Be(t){let e=[...H(t),t.consumption_entity,...q(t),...F(t),...(t.consumers??[]).map(n=>n.entity)];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}var mo=5e3,Rt=class{constructor(e){this.windowMs=e;this.samples=new Map;this.held=new Map;this.heldAt=-1/0;this.refreshMs=Math.min(e,mo)}record(e,n,r){for(let o of n){let a=e.states[o],s=a?Number.parseFloat(a.state):Number.NaN;if(!a||!Number.isFinite(s)){this.samples.delete(o);continue}let i=a.attributes.unit_of_measurement,d=this.samples.get(o);if((!d||d.unit!==i)&&(d={at:"",unit:i,list:[]},this.samples.set(o,d)),d.at===a.last_updated)continue;d.at=a.last_updated,d.list.push({t:r,v:s});let c=r-this.windowMs;for(;d.list.length>1&&d.list[1].t<=c;)d.list.shift()}}average(e,n){let r=this.samples.get(e)?.list;if(!r?.length)return;let o=n-this.windowMs,a=0,s=0;for(let i=0;i<r.length;i++){let d=Math.max(r[i].t,o),c=i+1<r.length?r[i+1].t:n;c<=d||(a+=r[i].v*(c-d),s+=c-d)}return s>0?a/s:r[r.length-1].v}smoothed(e,n,r){for(let s of this.held.keys())this.samples.has(s)||this.held.delete(s);let o=s=>this.samples.has(s)&&!this.held.has(s);if(r-this.heldAt>=this.refreshMs||n.some(o)){this.heldAt=r,this.held.clear();for(let s of n){let i=this.average(s,r);i!==void 0&&this.held.set(s,String(Math.round(i*1e3)/1e3))}}let a={...e.states};for(let s of n){let i=this.held.get(s);i!==void 0&&a[s]&&this.samples.has(s)&&(a[s]={...a[s],state:i})}return{...e,states:a}}};function Xe(t,e){let n=e?.stat_rate_from,r=e?.stat_rate_to;return n&&r&&t.states[n]&&t.states[r]?[n,r]:void 0}var yo=["bleu","blanc","rouge"],oe=/tomorrow|demain/i,bo=/today|daily|jour|_day(_|$)/i,wo=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function xo(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function _o(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!oe.test(e.entity_id)&&yo.includes(String(e.state).toLowerCase()))?.entity_id}function ft(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var Ht=t=>(e,n)=>n===t,Pt=t=>t[0];function ne(t,e,n){return(e&&t.states[e]?e:void 0)??Pt(ft(t,n,Ht("power")))}function vo(t,e){let n=t?.energy_sources??[],r={},o=n.filter(l=>l.type==="solar"),a=[...new Set(o.map(l=>ne(e,l.stat_rate,l.stat_energy_from)).filter(l=>!!l))];a.length&&(r.production_entity=a.length===1?a[0]:a);let s=[...new Set(o.flatMap(l=>ft(e,l.stat_energy_from,(u,h)=>h==="energy"&&bo.test(u)&&!wo.test(u)&&!oe.test(u))))];if(s.length&&(r.daily_production_entities=s),o.some(l=>l.config_entry_solar_forecast?.length)){let l=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&oe.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;l&&(r.forecast_tomorrow_entity=l)}let i=n.find(l=>l.type==="battery");if(i){let l=i.stat_energy_from??i.stat_energy_to,u=(i.stat_soc&&e.states[i.stat_soc]?i.stat_soc:void 0)??Pt(ft(e,l,Ht("battery"))),h=i.power_config?.stat_rate??i.stat_rate,p=Xe(e,i.power_config),f=p?void 0:ne(e,h,l),b=Pt(ft(e,l,Ht("temperature"))),y={};u&&(y.soc_entity=u),f&&(y.power_entity=f),p&&Object.assign(y,{charge_entity:p[1],discharge_entity:p[0]}),f&&h&&f===h&&(y.invert=!0),b&&(y.temperature_entity=b),Object.keys(y).length&&(r.battery=y)}let d=n.find(l=>l.type==="grid");if(d){let l=d.stat_energy_from??d.flow_from?.[0]?.stat_energy_from??d.stat_energy_to??d.flow_to?.[0]?.stat_energy_to,u=d.power_config?.stat_rate_inverted,h=d.power_config?.stat_rate??d.stat_rate??d.power?.[0]?.stat_rate,p={},f=Xe(e,d.power_config);if(f)Object.assign(p,{import_entity:f[0],export_entity:f[1]});else if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let y=ne(e,h,l);y&&(p.power_entity=y)}let b=Pt(ft(e,l,Ht("voltage")));b&&(p.voltage_entity=b),Object.keys(p).length&&(r.grid=p)}let c=n.find(l=>l.type==="home");return c?.stat_rate&&e.states[c.stat_rate]&&(r.consumption_entity=c.stat_rate),r}function qe(t,e){let n=t?vo(e,t):{},r=_o(t);return{production_entity:xo(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function Ye(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var dt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",at=t=>t!==void 0&&t.action!=="none";function Qe(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])dt(n[o])&&(r[o]=n[o]);return r}function tn(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:at(t.tap_action)}function Ze(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function gt(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&Ze(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...a}=e;at(r)&&Ze(t,"hass-action",{config:a,action:n})}var re=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{at(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,at(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,gt(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!at(e.double_tap_action)){gt(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,gt(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,gt(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());tn(o)&&(e.preventDefault(),gt(this.host,o,"tap"))}},Je=new WeakSet;function en(t,e,n){Je.has(t)||(Je.add(t),new re(t,e,n))}function nn(t,e){let n=tn(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=at(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var Eo=[56,48,40],Co=[44,40,36],on=[0,1,2],ie=[0,1,2,3],ae=[["solar",X.tomorrow],["grid",X.grid],["battery",X.battery],["home",X.consumption]],se=2*Math.PI*17;function x(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var So=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),mt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),rn=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,ko=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]],["background",["tempo","solid","weather"]]],Ao=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],ln={solar:it.sun,grid:it.grid,battery:it.batt,consumption:it.use},$o=t=>t===void 0||typeof t=="string"&&t.length>0||Array.isArray(t)&&t.length>0&&t.every(e=>typeof e=="string"&&e.length>0),sn=t=>typeof t=="number"&&Number.isFinite(t)&&t>0,Mo=[["grid","power_entity",["import_entity","export_entity"]],["battery","power_entity",["charge_entity","discharge_entity"]]],To=[[["battery.soc_entity","battery.power_entity","battery.charge_entity","battery.discharge_entity","grid.import_entity","grid.export_entity"],$o,"doit \xEAtre une entit\xE9 ou une liste d'entit\xE9s","must be an entity or a list of entities"],[["battery.capacity"],t=>t===void 0||sn(t)||Array.isArray(t)&&t.length>0&&t.every(sn),"doit \xEAtre un nombre positif (kWh) ou une liste","must be a positive number (kWh) or a list of them"],[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],So,"doit \xEAtre une liste","must be a list"],[["production_max","production_threshold","smoothing","battery.power_threshold","consumer_threshold","stale_after"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Lo(t){if(!t||typeof t!="object")throw x("Configuration invalide","Invalid configuration");let e=t;for(let[o,a]of Ao)if(mt(e,o)!==void 0)throw x(`${o} n'existe plus : ${a.fr}`,`${o} is gone: ${a.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw x("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,a]of ko){let s=mt(e,o);if(s!==void 0&&!a.includes(s))throw x(`${o} : ${rn(a,"ou")}`,`${o}: ${rn(a,"or")}`)}for(let[o,a,s,i]of To)for(let d of o)if(!a(mt(e,d)))throw x(`${d} ${s}`,`${d} ${i}`);for(let[o,a,s]of Mo)if(mt(e,`${o}.${a}`)!==void 0&&s.some(i=>mt(e,`${o}.${i}`)!==void 0))throw x(`${o} : ${a} ou ${s.join(" / ")}, pas les deux`,`${o}: ${a} or ${s.join(" / ")}, not both`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>ut)throw x(`cells : une liste de ${ut} cases au plus`,`cells: a list of at most ${ut} cells`);for(let o of e.cells){let a=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?ct.includes(o):typeof a.entity=="string"&&!!a.entity||ct.includes(a.type))){let i=String(typeof o=="object"?JSON.stringify(o):o);throw x(`cells : \xAB ${i} \xBB n'est ni ${ct.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${i}" is neither ${ct.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(a.tap_action!==void 0&&!dt(a.tap_action))throw x("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>N)throw x(`consumers : une liste de ${N} appareils au plus`,`consumers: a list of at most ${N} appliances`);for(let o of e.consumers){let a=o&&typeof o=="object"?o:{};if(typeof a.entity!="string"||!a.entity)throw x("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(a.tap_action!==void 0&&!dt(a.tap_action))throw x("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.background_color!==void 0&&!Mt(e.background_color))throw x("background_color : une couleur hexad\xE9cimale (#rrggbb)","background_color: a hex colour (#rrggbb)");if(e.flow_colors!==void 0){let o=e.flow_colors;if(!o||typeof o!="object"||Array.isArray(o))throw x("flow_colors : solar, grid, battery et consumption, chacun une couleur","flow_colors: solar, grid, battery and consumption, each a colour");for(let[a,s]of Object.entries(o))if(!(a in ln)||typeof s!="string"||!s)throw x(`flow_colors.${a} : solar, grid, battery ou consumption, une couleur CSS`,`flow_colors.${a}: solar, grid, battery or consumption, a CSS colour`)}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw x("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[a,s]of Object.entries(o))if(!Array.isArray(s)||s.length!==3||!s.every(Mt))throw x(`tariff_palettes.${a} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${a}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var de=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new Ot(this);this.actions={};this.cellTargets=new Map;this.smoothIds=[];this.open=!1;this.flowWidth=0;this.weatherDrawn="";this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Lo(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1);let r=this.config.smoothing??0;this.smoother=r>0?new Rt(r*1e3):void 0,this.smoothIds=this.smoother?Be(this.config):[],this.syncSmoothTimer(),this._hass&&this.update()}syncSmoothTimer(){let n=!!this.smoother&&this.isConnected;n&&!this.smoothTimer&&(this.smoothTimer=setInterval(()=>this.update(),1e3)),!n&&this.smoothTimer&&(clearInterval(this.smoothTimer),this.smoothTimer=void 0)}connectedCallback(){this.motion.start(),this.staleTimer??(this.staleTimer=setInterval(()=>this.markStale(),6e4)),this.syncSmoothTimer(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),clearInterval(this.staleTimer),this.staleTimer=void 0,this.syncSmoothTimer(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=Kt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),w(this,"data-flow",n.flow??null);for(let[s,i]of Object.entries(ln)){let d=n.flow_colors?.[s];d?this.style.setProperty(i,d):this.style.removeProperty(i)}this.flowWidth=0,this.weatherDrawn="",this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${Ke}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${Oo()}</div>
                    <div class="layer night">${Ue()}</div>
                    ${n.background==="weather"?'<div class="wx"></div>':""}
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    ${n.flow==="tap"?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${r.map(s=>`
                        <div class="metric" data-metric="${s.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.flow?Ro(n.consumers?.length??0):""}
            </ha-card>`;let o=(s,i=this.root)=>yt(i,s);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(s=>{let i=o(`[data-metric="${s.key}"]`),d=o("ha-icon",i);return d.setAttribute("icon",s.kind==="custom"?s.custom.icon||jt:X[s.kind]),[s.key,{el:i,icon:d,label:o(".label-text",i),value:o(".value-main",i),extra:o(".extra",i),entity:zt(n,s)}]}))},this.actions=Qe(n,H(n)[0]);let a=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(s=>{let i=zt(n,s),d=dt(s.tapAction)?s.tapAction:void 0;return d?[[s.key,{entity:i,tap:d}]]:a&&i?[[s.key,{entity:i}]]:[]})),n.flow==="tap"){let s=this.refs.heroValue.parentElement;for(let i of[s,this.refs.context,this.refs.flow.panel])i.dataset.cellTarget="",i.dataset.targetKey="toggle";s.setAttribute("role","button"),s.tabIndex=0,s.setAttribute("aria-controls","esc-flow"),s.setAttribute("aria-expanded","false")}if(n.flow){for(let[s]of ae){let i=Lt(n,s);if(!i)continue;this.cellTargets.set(`node:${s}`,{entity:i});let d=this.refs.flow.nodes.get(s).el;d.dataset.cellTarget="",d.setAttribute("role","button"),d.tabIndex=0}(n.consumers??[]).forEach((s,i)=>{let d=dt(s.tap_action)?s.tap_action:void 0;this.cellTargets.set(`consumer:${i}`,{entity:s.entity,tap:d});let c=this.refs.flow.consumers[i].el;c.dataset.cellTarget="",d?.action!=="none"&&(c.setAttribute("role","button"),c.tabIndex=0)})}for(let[s,i]of this.cellTargets){if(s.includes(":"))continue;let d=o(`[data-metric="${s}"]`);d.dataset.cellTarget="",i.tap?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0,d.style.cursor="pointer")}en(this.refs.card,this,s=>this.actionsFor(s)),nn(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(d=>d instanceof HTMLElement&&d.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",a=r?this.cellTargets.get(o):void 0;if(!a)return this.actions;let{tap_action:s,...i}=this.actions;return{...i,entity:a.entity??this.actions.entity,...a.tap?{tap_action:a.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=this.shownConsumers,a=We(r,o.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${a.height}`),n.box.style.setProperty("--esc-flow-h",`${a.height}px`),n.box.style.setProperty("--esc-node-w",`${a.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${a.centreWidth}px`),n.box.toggleAttribute("data-narrow",a.nodeWidth<112);for(let[s,i]of n.wires)for(let d of i.paths)d.setAttribute("d",a.paths[s]);n.box.toggleAttribute("data-compact",a.consumers.some(s=>s.compact)),n.consumers.forEach(({el:s,wire:i,paths:d},c)=>{let l=o.indexOf(c),u=a.consumers[l];if(s.hidden=!u?.visible,w(i,"data-off",u?.visible?null:""),!!u?.visible){s.dataset.side=u.below?"below":"above",Object.assign(s.style,{left:`${u.left}px`,top:`${u.top}px`,width:`${u.width}px`}),i.style.setProperty("--esc-flow",`esc-flow-c${l}`);for(let h of d)h.setAttribute("d",u.path)}}),n.keyframes.textContent=a.keyframes}flowRefs(){let n=(r,o=this.root)=>yt(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(D.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(ae.map(([r])=>[r,an(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let a=n(`[data-wire="c${o}"]`);return{...an(r),icon:n("ha-icon",r),wire:a,paths:[...a.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=Fe(this.config,this.shown??this._hass);for(let[a,s]of n.nodes){let i=r.nodes[a];s.el.hidden===i.present&&(s.el.hidden=!i.present),$(s.label,i.label),$(s.value,i.value),$(s.centre,i.centre??""),s.el.toggleAttribute("data-centre",i.centre!==void 0),s.el.toggleAttribute("data-alert",!!i.alert),dn(s.segs,i.ring)}r.consumers.forEach((a,s)=>{let i=n.consumers[s];i&&($(i.label,a.label),w(i.el,"title",a.label),w(i.el,"aria-label",`${a.label} ${a.value}`),$(i.value,a.value),w(i.icon,"icon",a.icon),i.el.toggleAttribute("data-idle",a.level===0),dn(i.segs,[[a.share,"use"]]),w(i.wire,"data-level",String(a.level)),a.shown||(i.el.hidden=!0,w(i.wire,"data-off","")))});let o=r.consumers.flatMap((a,s)=>a.shown?[s]:[]);o.join()!==this.shownConsumers.join()&&(this.shownConsumers=o,this.flowWidth=0,this.layoutFlow());for(let[a,s]of n.wires)w(s.g,"data-level",String(r.levels[a])),w(s.g,"data-off",r.off.includes(a)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(a=>a.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(a=>a.right>a.left&&a.bottom>a.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let a of n.querySelectorAll(".star")){let s=r.left+parseFloat(a.style.left)/100*r.width,i=r.top+parseFloat(a.style.top)/100*r.height,d=Ge(s,i,Number(a.dataset.reach),o);a.hidden!==d&&(a.hidden=d)}}writeForms(n){this.form=n,w(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:a,extra:s}=xe(r,n);$(o.value,a),$(o.extra,s)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&$(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),a=n.heroValue.parentElement,s=n.context,i=[...n.metrics.values()].map(f=>f.value.parentElement),d=f=>f.scrollWidth>f.clientWidth+1,c=()=>parseFloat(getComputedStyle(s).lineHeight)||20,l=()=>!s.hidden&&(d(s)||s.scrollHeight>c()+1),u=f=>!d(a)&&!d(o)&&o.scrollHeight<=o.clientHeight+1&&(!f||(r?!l():!i.some(d))),h=r?Co:Eo,p=(f,b)=>{for(let y of[!1,!0]){this.toggleAttribute("data-compact",y);for(let g of b){this.writeForms(g);for(let E of h)if(w(this,"data-hero",E===h[0]?null:String(E)),u(f))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,on)||p(!1,on.slice(-1)),this.writeContext(!s.hidden&&d(s));return}p(!0,ie)||(this.writeContext(!0),!p(!0,ie)&&(this.writeContext(!1),p(!1,ie),this.writeContext(!s.hidden&&s.scrollHeight>s.clientHeight+1)))}stateKey(n){let r=Se(this.config);return[xt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this._hass,r=this.stateKey(this._hass);if(this.smoother){let i=Date.now();this.smoother.record(this._hass,this.smoothIds,i),n=this.smoother.smoothed(this._hass,this.smoothIds,i),r+="|"+this.smoothIds.map(d=>Number(n.states[d]?.state).toPrecision(3)).join("|")}if(r===this.renderedKey)return;this.renderedKey=r,this.shown=n;let o=this.view=ke(this.config,n),a=this.refs;this.paintSky(),$(a.heroValue,o.hero.value),$(a.heroUnit,o.hero.unit),a.context.hidden=o.context===void 0;for(let i of o.metrics){let d=a.metrics.get(i.key);d&&($(d.label,i.label),this.side&&d.el.title!==i.label&&(d.el.title=i.label),i.icon&&d.icon.getAttribute("icon")!==i.icon&&d.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow(),this.markStale();let s=JSON.stringify([o.hero,o.context,o.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);s!==this.fitted&&(this.fitted=s,this.fit())}markStale(){if(!this.config||!this.refs||!this._hass)return;let n=Ce(this.config,this._hass),r=xt(this._hass),o=i=>i<120?`${i} min`:`${Math.floor(i/60)} h`,a=i=>{let d=i===void 0?void 0:n.get(i);return d===void 0?void 0:m(r,"stale",{age:o(d)})};for(let i of this.view?.metrics??[]){let d=this.refs.metrics.get(i.key);if(!d)continue;let c=a(d.entity);d.el.toggleAttribute("data-stale",!!c);let l=c?"mdi:clock-alert-outline":i.icon??d.icon.dataset.icon;d.icon.dataset.icon||(d.icon.dataset.icon=d.icon.getAttribute("icon")??""),l&&d.icon.getAttribute("icon")!==l&&d.icon.setAttribute("icon",l);let u=[this.side?i.label:"",c??""].filter(Boolean).join(" \xB7 ");w(d.el,"title",u||null)}let s=this.refs.flow;if(s){for(let[i,d]of s.nodes){let c=a(Lt(this.config,i));d.el.toggleAttribute("data-stale",!!c),w(d.el,"title",c??null)}(this.config.consumers??[]).forEach((i,d)=>{let c=s.consumers[d];if(!c)return;let l=a(i.entity);c.el.toggleAttribute("data-stale",!!l);let u=c.label.textContent??"";w(c.el,"title",l?`${u} \xB7 ${l}`:u)})}}paintSky(){let n=Pe(this.config,this.shown??this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((s,i)=>r.style.setProperty(`--esc-c${i}`,s)),n.nightPalette.forEach((s,i)=>r.style.setProperty(`--esc-n${i}`,s)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),this.dataset.sky=n.sky;let o=n.weather?ot[n.weather]:void 0;w(this,"data-stars",o?o.stars:null),r.style.setProperty("--esc-cloud-a",String(o?n.mode==="night"?o.nightCloudAlpha:o.cloudAlpha:0));let a=this.root.querySelector(".wx");a&&n.weather&&n.weather!==this.weatherDrawn&&(this.weatherDrawn=n.weather,a.innerHTML=ze(n.weather)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return qe(n,await Ye(n))}static async getConfigElement(){return customElements.get(B)||await pe(),document.createElement(B)}};function Oo(){return Le.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Ro(t){let e=[1,2,3].map(i=>`<g class="comet c${i}"><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...D.filter(i=>i!=="gb"&&i!=="bg")].map(i=>`<g class="wire ${Qt[i]}" data-wire="${i}" data-level="0">${i==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(i,d)=>`<g class="wire use" data-wire="c${d}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),a=(i,d)=>`
        <div class="node" ${i}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${d?` icon="${d}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,s=ae.map(([i,d])=>a(`data-node="${i}"`,d)).join("")+Array.from({length:t},(i,d)=>a(`data-consumer="${d}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${ht}">${o}${r}</svg>${s}</div></div>`}function an(t){return{el:t,label:yt(t,".nlab"),value:yt(t,".nval"),centre:yt(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function dn(t,e){let n=0;t.forEach((r,o)=>{let a=e[o],s=a?Math.max(se*a[0]-(e.length>1?3:0),0):0;w(r,"stroke-dasharray",`${s.toFixed(1)} ${se.toFixed(1)}`),w(r,"stroke-dashoffset",(-n).toFixed(1)),w(r,"data-source",a&&s>=1.5?a[1]:""),a&&(n+=se*a[0])})}function yt(t,e){return t.querySelector(e)}function w(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function $(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(G)||(customElements.define(G,de),window.customCards=window.customCards||[],window.customCards.push({type:G,name:Nt,description:le,preview:!0,documentationURL:ce}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${Nt} %c ${ue} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
