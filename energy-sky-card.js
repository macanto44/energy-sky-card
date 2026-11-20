"use strict";(()=>{var B="energy-sky-card",X=`${B}-editor`,Vt="Energy Sky Card",pe="Solar production, battery and grid on a sky that follows the tariff colour and the sun",he="https://github.com/macanto44/energy-sky-card",fe="0.3.9";function yn(t,e){let n=`${B}.js`;for(let{src:o}of e){let r=new URL(o,"http://local/"),i=r.pathname.lastIndexOf("/");if(r.pathname.slice(i+1)===n)return o.replace(n,`${t}.js`)}return`${t}.js`}var vt;function me(){return customElements.get(X)?Promise.resolve():(vt??(vt=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=yn(X,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(X)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw vt=void 0,t})),vt)}var bn=new Set(["unavailable","unknown","none",""]);function F(t){if(!t||bn.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var wn={mw:1e6,kw:1e3,w:1},xn={mwh:1e3,kwh:1,wh:.001};function ge(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function k(t){let e=F(t);return e===void 0?void 0:e*(wn[ge(t)]??1)}function Dt(t){let e=F(t);return e===void 0?void 0:e*(xn[ge(t)]??1)}var be={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",stale:"Pas de nouvelle valeur depuis {age}",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso.",full_at:"Pleine \xE0 {time}",full_in:"Pleine dans {time}",reserve_at:"R\xE9serve atteinte \xE0 {time}",reserve_in:"R\xE9serve dans {time}",empty_at:"Vide \xE0 {time}",empty_in:"Vide dans {time}"},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",stale:"No new reading for {age}",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use",full_at:"Full at {time}",full_in:"Full in {time}",reserve_at:"Reserve at {time}",reserve_in:"Reserve in {time}",empty_at:"Empty at {time}",empty_in:"Empty in {time}"},de:{produced:"{value} kWh erzeugt",battery:"Batterie",grid:"Netz",solar:"Solar",home:"Haus",stale:"Kein neuer Wert seit {age}",voltage:"Spannung",outage:"Ausfall",tomorrow:"Morgen",soc_reached:"SOC erreicht",soc_reached_short:"SOC \u2713",consumption:"Verbrauch",consumption_short:"Verbr.",full_at:"Voll um {time}",full_in:"Voll in {time}",reserve_at:"Reserve um {time}",reserve_in:"Reserve in {time}",empty_at:"Leer um {time}",empty_in:"Leer in {time}"},es:{produced:"{value} kWh producidos",battery:"Bater\xEDa",grid:"Red",solar:"Solar",home:"Casa",stale:"Sin valor nuevo desde hace {age}",voltage:"Tensi\xF3n",outage:"Corte",tomorrow:"Ma\xF1ana",soc_reached:"SOC alcanzado",soc_reached_short:"SOC \u2713",consumption:"Consumo",consumption_short:"Cons.",full_at:"Llena a las {time}",full_in:"Llena en {time}",reserve_at:"Reserva a las {time}",reserve_in:"Reserva en {time}",empty_at:"Vac\xEDa a las {time}",empty_in:"Vac\xEDa en {time}"},it:{produced:"{value} kWh prodotti",battery:"Batteria",grid:"Rete",solar:"Solare",home:"Casa",stale:"Nessun nuovo valore da {age}",voltage:"Tensione",outage:"Blackout",tomorrow:"Domani",soc_reached:"SOC raggiunto",soc_reached_short:"SOC \u2713",consumption:"Consumo",consumption_short:"Cons.",full_at:"Piena alle {time}",full_in:"Piena tra {time}",reserve_at:"Riserva alle {time}",reserve_in:"Riserva tra {time}",empty_at:"Scarica alle {time}",empty_in:"Scarica tra {time}"},nl:{produced:"{value} kWh opgewekt",battery:"Batterij",grid:"Net",solar:"Zon",home:"Huis",stale:"Geen nieuwe waarde sinds {age}",voltage:"Spanning",outage:"Storing",tomorrow:"Morgen",soc_reached:"SOC bereikt",soc_reached_short:"SOC \u2713",consumption:"Verbruik",consumption_short:"Verbr.",full_at:"Vol om {time}",full_in:"Vol over {time}",reserve_at:"Reserve om {time}",reserve_in:"Reserve over {time}",empty_at:"Leeg om {time}",empty_in:"Leeg over {time}"}};var _n=Object.keys(be);function Et(t){let e=(t?.locale?.language||t?.language||"en").toLowerCase().split(/[-_]/)[0];return _n.includes(e)?e:"en"}function b(t,e,n={}){return be[t][e].replace(/\{(\w+)\}/g,(o,r)=>n[r]??"")}function vn(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return ye(void 0);default:return ye(t?.locale?.language||t?.language||"en")}}function ye(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function En(t){let e=t?.locale?.language||t?.language||"en";switch(t?.locale?.time_format){case"12":return{locale:e,hour12:!0};case"24":return{locale:e,hour12:!1};case"system":return{};default:return{locale:e}}}function Ct(t){return{lang:Et(t),decimal:vn(t),time:En(t)}}function M(t,e,n){let o=t.toFixed(e);return(/^-0(\.0+)?$/.test(o)?o.slice(1):o).replace(".",n.decimal)}function St(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:M(Math.round(t),0,e),unit:"W"}:{value:M(t/1e3,1,e),unit:"kW"}}function Wt({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function $(t,e){return Wt(St(t,e))}function jt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":M(t,1,e)}function we(t,e){let n=jt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function xe(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}\xA0V`}var Cn=["fr","de","es"];function At(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,e)}${Cn.includes(e.lang)?"\xA0":""}%`}function _e(t,e){let{locale:n,hour12:o}=e.time??{},r={hour:"numeric",minute:"2-digit",...o===void 0?{}:{hour12:o}};try{return new Intl.DateTimeFormat(n,r).format(t)}catch{return new Intl.DateTimeFormat(void 0,r).format(t)}}function ve(t){if(t<60)return`${t}\xA0min`;let e=Math.floor(t/60),n=t%60;return n?`${e}\xA0h\xA0${String(n).padStart(2,"0")}`:`${e}\xA0h`}function Ee(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${M(Math.round(t),0,n)} ${e||"\xB0C"}`}var Mt=20,Sn=["warning","alarm"],q={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},zt="mdi:gauge",pt=Object.keys(q),ht=4,V=4;function Se(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var $t=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",Ae=t=>typeof t=="object"&&t!==null&&!$t(t)&&typeof t.type=="string",An=t=>typeof t=="string"?t:Ae(t)?t.type:void 0;function kn(t){let e=[];return D(t).length&&e.push("battery"),W(t).length&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function Ut(t){if(!t.cells)return kn(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,ht).flatMap((n,o)=>{if($t(n))return[{key:`custom-${o}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let r=An(n);return!r||e.has(r)?[]:(e.add(r),[{key:r,kind:r,...Ae(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function Gt(t,e){switch(e.kind){case"battery":return D(t)[0];case"grid":return W(t)[0]??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function H(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function ft(t,e){let n=H(t).map(r=>k(e.states[r])).filter(r=>r!==void 0);if(!n.length)return;let o=n.reduce((r,i)=>r+i,0);return t.production_threshold&&o<t.production_threshold?0:o}var ke=(t,e)=>t===void 0||!e?t:-t,C=t=>(Array.isArray(t)?t:t?[t]:[]).filter(e=>typeof e=="string"&&e.length>0),D=t=>C(t.battery?.soc_entity),N=t=>[...C(t.battery?.power_entity),...C(t.battery?.charge_entity),...C(t.battery?.discharge_entity)],W=t=>[...C(t.grid?.power_entity),...C(t.grid?.import_entity),...C(t.grid?.export_entity)];function Kt(t,e,n=!1){let o=t.map(r=>k(e.states[r])).filter(r=>r!==void 0);return o.length?o.reduce((r,i)=>r+(n?Math.abs(i):i),0):void 0}function Me(t,e,n){let o=Kt(t,n,!0),r=Kt(e,n,!0);return o===void 0&&r===void 0?void 0:(o??0)-(r??0)}var Mn=30;function $e(t,e,n=Date.now()){let o=t.stale_after??Mn,r=new Map;if(!(o>0))return r;let i=[...H(t),t.consumption_entity,...D(t),...N(t),t.battery?.temperature_entity,...W(t),t.grid?.voltage_entity,...(t.cells??[]).filter($t).map(s=>s.entity),...(t.consumers??[]).map(s=>s.entity)];for(let s of i){let a=Date.parse(e.states[s??""]?.last_reported??"");if(!Number.isFinite(a))continue;let l=(n-a)/6e4;l>=o&&r.set(s,Math.floor(l))}return r}function Bt(t){let e=t.battery?.capacity,n=Array.isArray(e)?e.reduce((o,r)=>o+r,0):e;return n!==void 0&&n>0?n:void 0}var kt=10,Te=5*6e4,$n=1440;function Tn(t,e,n,o=Y(t,e),r=Date.now()){let i=t.battery,s=Bt(t),a=mt(t,e),l=i?.power_threshold??Mt;if(!s||a===void 0||o===void 0||Math.abs(o)<=l)return;let d=o>0,u=(d?i?.estimate?.charge:i?.estimate?.discharge)??(d?"time":"duration");if(u==="off")return;let c=i?.reserve_soc??0,m=d?(i?.max_soc??100)-a:a-c;if(m<=0)return;let p=m/100*s*1e3/Math.abs(o)*60;if(p>$n)return;let h=kt*6e4,y=u==="time"?_e(new Date(Math.round((r+p*6e4)/h)*h),n):ve(Math.max(kt,Math.round(p/kt)*kt)),f=d?"full":c>0?"reserve":"empty";return{text:y,title:b(n.lang,`${f}_${u==="time"?"at":"in"}`,{time:y})}}function Xt(t,e,n,o={}){if(!Oe(t,e))return Tn(t,e,n,o.estimatePower??Y(t,e),o.now)}function qt(t,e){let n=t.grid;return n?.import_entity||n?.export_entity?Me(C(n.import_entity),C(n.export_entity),e):ke(k(e.states[n?.power_entity??""]),n?.invert)}function Y(t,e){let n=t.battery;return n?.charge_entity||n?.discharge_entity?Me(C(n.charge_entity),C(n.discharge_entity),e):ke(Kt(C(n?.power_entity),e),n?.invert)}function mt(t,e){let n=D(t),o=t.battery?.capacity,r=Array.isArray(o)&&o.length===n.length?o:void 0,i=0,s=0;return n.forEach((a,l)=>{let d=F(e.states[a]);if(d===void 0)return;let u=r?r[l]:1;i+=d*u,s+=u}),s>0?i/s:void 0}function Le(t){let e=[...H(t),t.consumption_entity,...(t.cells??[]).filter($t).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],...D(t),...N(t),t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],...W(t),t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function Ln(t,e){let n=(t.daily_production_entities??[]).map(o=>Dt(e.states[o])).filter(o=>o!==void 0);return n.length?n.reduce((o,r)=>o+r,0):void 0}function On(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function Oe(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(o=>e.states[o]?.state==="on")}function Yt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??Sn).map(r=>String(r).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function Rn(t,e,n,o,r){let i=mt(t,e),s=On(Y(t,e),o),a=i===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",l=Oe(t,e),d=e.states[t.battery?.temperature_entity??""],u=F(d),c=At(i,n)+a,m=String(d?.attributes.unit_of_measurement??""),p=Xt(t,e,n,r),h=t.battery?.estimate?.with_temperature==="both",y=u!==void 0&&(!p||h),f=[...y?[Ee(u,m,n)]:[],...p?[p.text]:[]],L=[...y?[`${M(Math.round(u),0,n)}\xB0`]:[],...p?[p.text]:[]];return{key:"battery",label:b(n.lang,"battery"),value:[c,...f].join(" \xB7 "),extra:l?` \xB7 ${b(n.lang,"soc_reached")}`:"",extraShort:l?` \xB7 ${b(n.lang,"soc_reached_short")}`:"",...f.length?{tight:{value:[c,...L].join("\u202F\xB7\u202F"),extra:l?"\u202F\u2713":""},bare:c}:{},...p?{note:p.title}:{}}}function Pn(t,e,n){return{key:"grid",label:b(n.lang,"grid"),value:$(qt(t,e),n),extra:"",extraShort:""}}function Hn(t,e,n){let o=t.grid?.voltage_entity?F(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:b(n.lang,"voltage"),value:Yt(t,e)?b(n.lang,"outage"):xe(o,n),extra:"",extraShort:""}}function Nn(t,e,n){return{key:"tomorrow",label:b(n.lang,"tomorrow"),value:we(Dt(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function In(t,e,n){return{key:"consumption",label:b(n.lang,"consumption"),value:$(k(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function Fn(t,e,n){let o=t.custom,r=e.states[o.entity],i=String(r?.attributes.unit_of_measurement??""),s;if(!r||F(r)===void 0&&["unavailable","unknown",""].includes(r.state))s="\u2014";else if(/^[mk]?w$/i.test(i))s=$(k(r),n);else if(e.formatEntityState)s=e.formatEntityState(r);else{let l=F(r);s=l===void 0?r.state:Wt({value:M(l,Number.isInteger(l)?0:1,n),unit:i})}let a=o.icon||(typeof r?.attributes.icon=="string"?r.attributes.icon:"")||zt;return{key:t.key,label:o.name||String(r?.attributes.friendly_name??o.entity),value:s,extra:"",extraShort:"",icon:a}}function Vn(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function Dn(t,e,n){let o=Vn(t,e)?t.night_hero??"production":"production";if(o==="consumption"&&t.consumption_entity)return{hero:St(k(e.states[t.consumption_entity]),n),label:b(n.lang,"consumption"),labelShort:b(n.lang,"consumption_short")};if(o==="battery"&&D(t).length){let r=mt(t,e);return{hero:r===void 0?{value:"\u2014",unit:""}:{value:M(Math.round(r),0,n),unit:"%"},label:b(n.lang,"battery")}}return{hero:St(ft(t,e),n)}}function Re(t,e,n={}){let o=Ct(e),r=t.battery?.power_threshold??Mt,i=t.daily_production_entities?.length?b(o.lang,"produced",{value:jt(Ln(t,e),o)}):void 0,s=Ut(t).map(c=>{switch(c.kind){case"battery":return Rn(t,e,o,r,n);case"grid":return Pn(t,e,o);case"voltage":return Hn(t,e,o);case"tomorrow":return Nn(t,e,o);case"consumption":return In(t,e,o);case"custom":return Fn(c,e,o)}}),{hero:a,label:l,labelShort:d=l}=Dn(t,e,o),u=c=>c?[c,i].filter(Boolean).join(" \xB7 "):i;return{hero:a,context:u(l),contextShort:u(d),metrics:s}}var Pe={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},He="Bleu",Jt=["#1d2b4d","#121b36","#0b1026"],er=[255/255,214/255,140/255],Wn=.55;var te=6e3,Tt={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},Lt=.45,Ot={x:0,y:-30,radius:100},Ie=[8,18,40],ee=.2,Fe=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],jn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Rt=t=>typeof t=="string"&&jn.test(t);function Ve(t){let e=t.slice(1);return e.length===3&&(e=e.split("").map(n=>n+n).join("")),[0,2,4].map(n=>parseInt(e.slice(n,n+2),16)/255)}function Kn(t){return t>.04045?((t+.055)/1.055)**2.4:t/12.92}function Ne(t){let e=[.2126,.7152,.0722];return t.reduce((n,o,r)=>n+e[r]*Kn(o),0)}function zn(t,e){let[n,o]=[Ne(t),Ne(e)].sort((r,i)=>i-r);return(n+.05)/(o+.05)}function nt(t,e,n){return[0,1,2].map(o=>t[o]+(e[o]-t[o])*n)}function Un(t,e){let[n,o,r]=t.map(Ve);return e<=.6?nt(n,o,e/.6):nt(o,r,(e-.6)/.4)}var Gn=[.36,.5,.64,.76,.86,.98],Qt=[1,1,1];function Bn(t,e=0){return Math.min(...Gn.map(n=>zn(Qt,nt(Un(t,n),Qt,e))))}var Zt=t=>"#"+t.map(e=>Math.round(Math.min(Math.max(e,0),1)*255).toString(16).padStart(2,"0")).join(""),De="#3a6b8c";function Xn(t){let e=Ve(Rt(t)?t:De),n=r=>[Zt(nt(r,Qt,.12)),Zt(r),Zt(nt(r,[0,0,0],.35))],o=n(e);for(let r=0;r<40&&Bn(o)<4.6;r++)e=nt(e,[0,0,0],.06),o=n(e);return o}var We=.12,ot={sunny:{day:["#4b90d5","#2169b0","#1d4f87"],night:Jt,clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,halo:!0,stars:"all"},partlycloudy:{day:["#4d78a6","#2a5b8b","#20446c"],night:["#202c47","#141c31","#0d1222"],clouds:3,cloudAlpha:.12,nightCloudAlpha:.1,rain:0,snow:0,halo:!0,stars:"few"},cloudy:{day:["#647285","#475567","#35404f"],night:["#262c3a","#1a1f2b","#11141c"],clouds:6,cloudAlpha:.14,nightCloudAlpha:.1,rain:0,snow:0,stars:"none"},rainy:{day:["#5a6879","#405062","#2f3a48"],night:["#20252f","#161a22","#0e1117"],clouds:5,cloudAlpha:.13,nightCloudAlpha:.08,rain:40,snow:0,stars:"none"},pouring:{day:["#4a5664","#343f4c","#262e38"],night:["#1b1f27","#12151b","#0b0d11"],clouds:5,cloudAlpha:.11,nightCloudAlpha:.06,rain:80,snow:0,stars:"none"},lightning:{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:0,flash:!0,stars:"none"},"lightning-rainy":{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:60,snow:0,flash:!0,stars:"none"},snowy:{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:40,stars:"none"},"snowy-rainy":{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:20,snow:24,stars:"none"},fog:{day:["#6a737c","#525a64","#404750"],night:["#2a2f37","#1e2229","#15181d"],clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,fog:!0,stars:"none"},windy:{day:["#4c79a7","#2a5a8b","#1f446b"],night:["#1f2b46","#131b30","#0c1121"],clouds:5,cloudAlpha:.12,nightCloudAlpha:.09,windy:!0,rain:0,snow:0,halo:!0,stars:"few"}},qn={"clear-night":"sunny",hail:"pouring","windy-variant":"windy",exceptional:"cloudy"};function Yn(t){let e=String(t??"").toLowerCase();return ot[e]?e:qn[e]??"cloudy"}function Zn(t,e){let n={...Pe,...t.tariff_palettes??{}},o=String(e??"").toLowerCase(),r=Object.keys(n).find(i=>i.toLowerCase()===o);return r?n[r]:t.tariff_palettes?.[He]??Pe[He]}function je(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,o=ft(t,e)??0,r=t.production_max&&t.production_max>0?t.production_max:te,i=Math.min(Math.max(o,0)/r,1),s=Math.round(i*Wn*1e3)/1e3,a={mode:n==="below_horizon"?"night":"day",producing:o>0};if(t.background==="solid")return{...a,sky:"solid",palette:Xn(t.background_color??De),nightPalette:Jt,haloAlpha:0};if(t.background==="weather"){let l=Yn(e.states[t.weather_entity??""]?.state),d=ot[l];return{...a,sky:"weather",weather:l,palette:d.day,nightPalette:d.night,haloAlpha:d.halo?s:0}}return{...a,sky:"tempo",palette:Zn(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),nightPalette:Jt,haloAlpha:s}}var ne={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},Jn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},K=Object.keys(ne),ze=20,Z=t=>Math.max(t??0,0);function Qn(t,e,n,o){let r=Z(t),i=Z(e===void 0?void 0:-e),s=Z(e),a=Z(n),l=Z(n===void 0?void 0:-n),d=Math.min(i,r);r-=d;let u=Math.min(i-d,l),c=Math.min(a,r);r-=c;let m=Math.min(a-c,s),p={sh:r,sg:d,sb:c,gh:s-m,bh:l-u,gb:m,bg:u};for(let y of K)p[y]<ze&&(p[y]=0);return{wires:p,home:o??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function Ke(t){return t<ze?0:t<500?1:t<1500?2:t<3e3?3:4}function to(t,e,n,o){let r=t.battery?.estimate?.flow===!1?void 0:Xt(t,e,n,o);return r?{sub:r.text,note:r.title}:{}}function Ht(t,e){switch(e){case"solar":return H(t)[0];case"grid":return W(t)[0];case"battery":return N(t)[0]??D(t)[0];case"home":return t.consumption_entity}}var eo="mdi:power-plug-outline",no=10;function Ue(t,e,n={}){let o=Ct(e),r=ft(t,e),i=Yt(t,e),s=i?0:qt(t,e),a=Y(t,e),l=t.battery?.power_threshold??Mt,d=a!==void 0&&Math.abs(a)<=l?0:a,u=k(e.states[t.consumption_entity??""]),c=Qn(r,s,d,u),m=t.production_max&&t.production_max>0?t.production_max:te,p=mt(t,e),h={sun:c.wires.sh,grid:c.wires.gh,batt:c.wires.bh},y=h.sun+h.grid+h.batt,f=g=>g==="solar"||g==="home"||!!Ht(t,g),L=Object.fromEntries(K.map(g=>[g,Ke(c.wires[g])]));return{nodes:{solar:{present:f("solar"),label:b(o.lang,"solar"),value:$(r,o),ring:[[Math.min(Z(r)/m,1),"sun"]]},grid:{present:f("grid"),label:b(o.lang,"grid"),value:i?b(o.lang,"outage"):$(s,o),ring:i?[[1,"alert"]]:[],alert:i},battery:{present:f("battery"),label:b(o.lang,"battery"),...to(t,e,o,n),value:N(t).length?$(a,o):At(p,o),ring:p===void 0?[]:[[Math.min(Math.max(p,0),100)/100,"batt"]],centre:p===void 0?void 0:String(Math.round(p))},home:{present:f("home"),label:b(o.lang,"home"),value:$(c.home,o),ring:y>0?["sun","batt","grid"].filter(g=>h[g]>0).map(g=>[h[g]/y,g]):[]}},consumers:(t.consumers??[]).slice(0,V).map(g=>{let O=e.states[g.entity],ct=k(O),I=Z(ct),Q=t.consumer_threshold??no,ut=w=>typeof O?.attributes[w]=="string"?O.attributes[w]:void 0;return{label:g.name||ut("friendly_name")||g.entity,icon:g.icon||ut("icon")||eo,value:$(k(O),o),share:c.home?Math.min(I/c.home,1):0,level:Ke(I),shown:Q<=0||ct!==void 0&&I>=Q}}),levels:L,off:K.filter(g=>!Jn[g].every(f))}}var gt=220,oo=.65,ro=360,j=46,io=12,so=46;function ao([t,e,n],o){if(!e)return{at:[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[r,i]=e,s=1-o,a=d=>s*s*s*t[d]+3*s*s*o*r[d]+3*s*o*o*i[d]+o*o*o*n[d],l=d=>3*s*s*(r[d]-t[d])+6*s*o*(i[d]-r[d])+3*o*o*(n[d]-i[d]);return{at:[a(0),a(1)],deg:Math.atan2(l(1),l(0))*180/Math.PI}}var J=t=>Math.round(t*10)/10,rt=([t,e])=>`${J(t)},${J(e)}`,Pt=27;function Ge(t,e=0){let n=Math.max(t,160),o=Math.round(Math.min(Math.max((n-48)/2,96),128)),r=Math.round(Math.min(o+20,n-o-32)),i=Math.round(Math.min(Math.max(n*oo,gt),ro)),s=r/2,a=j/2,l=i/2,d=3+a,u=i-3-a,c=n/2,m=o-Pt,p=n-o+Pt,h=c-s+Pt,y=c+s-Pt,f=(w,v)=>{let R=(v[1]-w[1])/2;return[w,[[w[0],w[1]+R],[v[0],v[1]-R]],v]},L={sh:[[o,l],null,[n-o,l]],sg:f([m,l-a],[h,d+a]),gh:f([y,d+a],[p,l-a]),sb:f([m,l+a],[h,u-a]),bh:f([y,u-a],[p,l+a]),gb:[[c,d+a],null,[c,u-a]],bg:[[c,u-a],null,[c,d+a]]},g=n-(c+s)-8,O=e>2||g<110,ct=O&&g<100?1:2,I=[];for(let w=0;w<e;w++){let v=w%2===1,R=Math.floor(w/2),z=Math.min(v?Math.floor(e/2):Math.ceil(e/2),ct),U=v?i-3-j:3,G=v?l+a:l-a,tt=v?U:U+j;if(R>=ct){I.push({visible:!1,compact:O,below:v,left:0,top:U,width:0,path:""});continue}let A,P;if(O){let et=g/z,_t=n-g+et*(R+.5)+4;P=so,A=_t-P/2,L[`c${w}`]=f([n-o/2+(z>1?(R-.5)*30:10),G],[_t,tt])}else{P=Math.min(o,g),A=n-P;let et=A+P/2+10;L[`c${w}`]=[[et,G],null,[et,tt]]}I.push({visible:!0,compact:O,below:v,left:J(A),top:U,width:J(P),path:""})}let Q={},ut="";for(let[w,v]of Object.entries(L)){let[R,z,U]=v;Q[w]=z?`M${rt(R)} C${rt(z[0])} ${rt(z[1])} ${rt(U)}`:`M${rt(R)} L${rt(U)}`;let G=z?io:1,tt=[];for(let A=0;A<=G;A++){let{at:P,deg:et}=ao(v,A/G),_t=A===0||A===G?" opacity: 0;":"";tt.push(`${J(A/G*100)}% { transform: translate(${J(P[0])}px, ${J(P[1])}px) rotate(${Math.round(et)}deg);${_t} }`)}tt.push("10%, 90% { opacity: 1; }"),ut+=`@keyframes esc-flow-${w} { ${tt.join(" ")} }
`}return I.forEach((w,v)=>{w.path=Q[`c${v}`]??""}),{nodeWidth:o,centreWidth:r,height:i,paths:Q,consumers:I,keyframes:ut}}var oe=t=>`rgba(${Ie.join(", ")}, ${t})`,Be=t=>`${Math.round(t*1e3)/10}%`,lo=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${Be(1-Lt/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${Be((.6-Lt)/(1-Lt))}, var(--esc-c2, #1d4f87) 100%)`,Xe=`${Ot.x}px ${Ot.y}px`;var it={sun:"--energy-sky-card-solar",grid:"--energy-sky-card-grid",batt:"--energy-sky-card-battery",use:"--energy-sky-card-consumption"},qe=t=>`var(${it[t]}, ${Tt[t]})`,co=.14,uo=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],T=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,Ye=`
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
.fogband { position: absolute; left: -40%; width: 180%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, ${We}), rgba(255, 255, 255, 0)); }
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
    background: radial-gradient(closest-side, ${oe(ee)}, ${oe(ee/2)} 50%, ${oe(0)} 100%);
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
${T('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${T('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${T('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${T('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
${T('[data-sky="weather"]',".cloudband","animation: esc-drift 60s linear infinite;")}
${T('[data-sky="weather"]',".drop","display: block; animation: esc-rain 0.7s linear infinite;")}
${T('[data-sky="weather"]',".flake","display: block; animation: esc-snow 8s linear infinite;")}
${T('[data-sky="weather"]',".fogband","animation: esc-fog 18s ease-in-out infinite alternate;")}
${T('[data-sky="weather"]',".flash","animation: esc-flash 7s infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${T("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${lo}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${Ot.radius}px at ${Xe}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${Xe};
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
.flow { position: relative; height: var(--esc-flow-h); --esc-flow-h: ${gt}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${uo.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.keys(Tt).map(t=>`.wire.${t} { color: ${qe(t)}; }`).join(" ")}
${[...K,...Array.from({length:V},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: calc((var(--esc-flow-h) - ${j}px) / 2);
    width: var(--esc-node-w);
    height: ${j}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${j/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${co}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: calc(var(--esc-flow-h) - ${3+j}px); }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.keys(Tt).map(t=>`.seg[data-source="${t}"] { stroke: ${qe(t)}; }`).join(" ")}
.disc ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; display: inline-flex; }
.centre { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.node[data-centre] .disc ha-icon, .node:not([data-centre]) .centre { display: none; }
.ntext { min-width: 0; display: flex; flex-direction: column; }
.nlab { font-size: 9.5px; font-weight: 600; line-height: 12px; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.78; }
.nval { font-size: 15px; font-weight: 500; line-height: 19px; font-variant-numeric: tabular-nums; }
/* The battery's estimate, a small third line under its power (\xAB 14:20 \xBB); none elsewhere */
.nsub { font-size: 10px; font-weight: 500; line-height: 11px; font-variant-numeric: tabular-nums; opacity: 0.85; }
.nsub:empty { display: none; }
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
`;function po(t){let e=t;return()=>(e=e*16807%2147483647)/2147483647}var E=t=>t.toFixed(1),ho=[[[24,34,13],[40,25,17],[58,21,15],[72,29,13],[84,36,9]],[[20,36,10],[34,28,14],[52,24,18],[70,31,12]]];function fo(t,e,n){let o=ho[e%2],r=26+t()*22,i=t()*62-6,s=e*37%60+10,a=n?35+t()*15:55+t()*25,l=o[0][0],d=o[o.length-1][0],u=o.map(([c,m,p])=>`<circle cx="${c}" cy="${m}" r="${p}"></circle>`).join("")+`<rect x="${l}" y="30" width="${d-l}" height="14" rx="7"></rect>`;return`<div class="cloudband" style="animation-duration:${E(a)}s;animation-delay:-${E(t()*a)}s"><svg class="cumulus" viewBox="0 0 100 50" style="left:${s}%;top:${E(i)}%;width:${E(r)}%"><g>${u}</g></svg></div>`}function Ze(t){let e=ot[t];if(!e)return"";let n=po(7),o="";for(let r=0;r<e.clouds;r++)o+=fo(n,r,!!e.windy);if(e.fog)for(let r=0;r<4;r++){let i=14+n()*10;o+=`<div class="fogband" style="top:${-10+r*28}%;height:${E(45+n()*20)}%;animation-duration:${E(i)}s;animation-delay:-${E(n()*10)}s"></div>`}for(let r=0;r<e.rain;r++){let i=.55+n()*.35;o+=`<i class="drop" style="left:${E(n()*115)}%;opacity:${(.35+n()*.5).toFixed(2)};animation-duration:${i.toFixed(2)}s;animation-delay:-${(n()*i).toFixed(2)}s"></i>`}for(let r=0;r<e.snow;r++){let i=2+n()*2.6,s=6+n()*6;o+=`<i class="flake" style="left:${E(n()*100)}%;width:${E(i)}px;height:${E(i)}px;opacity:${(.5+n()*.45).toFixed(2)};animation-duration:${E(s)}s;animation-delay:-${E(n()*s)}s"></i>`}return e.flash&&(o+='<div class="flash"></div>'),o}var re={cols:10,rows:6},mo=[1,.9,.8,.7,.6,.5],go=.4,yo=3,bo=1.4;function wo(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var st=(t,e=1)=>Math.round(t*10**e)/10**e;function xo(t,e,n,o){return{x:st((e+.1+t()*.8)/o.cols*100),y:st((n+.1+t()*.8)/o.rows*100)}}function _o(t=24301){let e=wo(t),n=[];for(let o=0;o<re.rows;o++)for(let r=0;r<re.cols;r++){let i=e()<mo[o],{x:s,y:a}=xo(e,r,o,re),l=1.4+e()*.8,d=e()<go,u=st(e()*5,2);if(!i)continue;let c=a/100;n.push({x:s,y:a,size:st(l*(1-.3*c),2),opacity:st(1-.45*c,2),twinkle:d,delay:u})}return n}var vo=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],Eo=t=>st(t.size/2*(t.twinkle?bo:1)+yo,2);function Je(t=_o()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${Eo(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+vo.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var Qe=(t,e,n,o)=>o.some(r=>t>r.left-n&&t<r.right+n&&e>r.top-n&&e<r.bottom+n);var Co="(prefers-reduced-motion: reduce)";function So(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var Nt=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(Co),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let o=n.at(-1);o&&(this.outOfView=!o.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return So({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};function tn(t){let e=[...H(t),t.consumption_entity,...N(t),...W(t),...(t.consumers??[]).map(n=>n.entity)];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}var Ao=5e3,yt=class{constructor(e){this.windowMs=e;this.samples=new Map;this.held=new Map;this.heldAt=-1/0;this.refreshMs=Math.min(e,Ao)}record(e,n,o){for(let r of n){let i=e.states[r],s=i?Number.parseFloat(i.state):Number.NaN;if(!i||!Number.isFinite(s)){this.samples.delete(r);continue}let a=i.attributes.unit_of_measurement,l=this.samples.get(r);if((!l||l.unit!==a)&&(l={at:"",unit:a,list:[]},this.samples.set(r,l)),l.at===i.last_updated)continue;l.at=i.last_updated,l.list.push({t:o,v:s});let d=o-this.windowMs;for(;l.list.length>1&&l.list[1].t<=d;)l.list.shift()}}average(e,n){let o=this.samples.get(e)?.list;if(!o?.length)return;let r=n-this.windowMs,i=0,s=0;for(let a=0;a<o.length;a++){let l=Math.max(o[a].t,r),d=a+1<o.length?o[a+1].t:n;d<=l||(i+=o[a].v*(d-l),s+=d-l)}return s>0?i/s:o[o.length-1].v}smoothed(e,n,o){for(let s of this.held.keys())this.samples.has(s)||this.held.delete(s);let r=s=>this.samples.has(s)&&!this.held.has(s);if(o-this.heldAt>=this.refreshMs||n.some(r)){this.heldAt=o,this.held.clear();for(let s of n){let a=this.average(s,o);a!==void 0&&this.held.set(s,String(Math.round(a*1e3)/1e3))}}let i={...e.states};for(let s of n){let a=this.held.get(s);a!==void 0&&i[s]&&this.samples.has(s)&&(i[s]={...i[s],state:a})}return{...e,states:i}}};function en(t,e){let n=e?.stat_rate_from,o=e?.stat_rate_to;return n&&o&&t.states[n]&&t.states[o]?[n,o]:void 0}var ko=["bleu","blanc","rouge"],se=/tomorrow|demain/i,Mo=/today|daily|jour|_day(_|$)/i,$o=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function To(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function Lo(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!se.test(e.entity_id)&&ko.includes(String(e.state).toLowerCase()))?.entity_id}function bt(t,e,n){let o=e?t.entities?.[e]?.device_id:void 0;return o?Object.values(t.entities??{}).filter(r=>r.device_id===o&&r.entity_id.startsWith("sensor.")&&t.states[r.entity_id]).map(r=>r.entity_id).filter(r=>n(r,t.states[r].attributes.device_class)):[]}var It=t=>(e,n)=>n===t,Ft=t=>t[0];function ie(t,e,n){return(e&&t.states[e]?e:void 0)??Ft(bt(t,n,It("power")))}function Oo(t,e){let n=t?.energy_sources??[],o={},r=n.filter(u=>u.type==="solar"),i=[...new Set(r.map(u=>ie(e,u.stat_rate,u.stat_energy_from)).filter(u=>!!u))];i.length&&(o.production_entity=i.length===1?i[0]:i);let s=[...new Set(r.flatMap(u=>bt(e,u.stat_energy_from,(c,m)=>m==="energy"&&Mo.test(c)&&!$o.test(c)&&!se.test(c))))];if(s.length&&(o.daily_production_entities=s),r.some(u=>u.config_entry_solar_forecast?.length)){let u=Object.values(e.entities??{}).find(c=>c.entity_id.startsWith("sensor.")&&se.test(c.entity_id)&&/forecast|solcast|production/i.test(`${c.platform} ${c.entity_id}`)&&e.states[c.entity_id]?.attributes.device_class==="energy")?.entity_id;u&&(o.forecast_tomorrow_entity=u)}let a=n.find(u=>u.type==="battery");if(a){let u=a.stat_energy_from??a.stat_energy_to,c=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??Ft(bt(e,u,It("battery"))),m=a.power_config?.stat_rate??a.stat_rate,p=en(e,a.power_config),h=p?void 0:ie(e,m,u),y=Ft(bt(e,u,It("temperature"))),f={};c&&(f.soc_entity=c),h&&(f.power_entity=h),p&&Object.assign(f,{charge_entity:p[1],discharge_entity:p[0]}),h&&m&&h===m&&(f.invert=!0),y&&(f.temperature_entity=y),Object.keys(f).length&&(o.battery=f)}let l=n.find(u=>u.type==="grid");if(l){let u=l.stat_energy_from??l.flow_from?.[0]?.stat_energy_from??l.stat_energy_to??l.flow_to?.[0]?.stat_energy_to,c=l.power_config?.stat_rate_inverted,m=l.power_config?.stat_rate??l.stat_rate??l.power?.[0]?.stat_rate,p={},h=en(e,l.power_config);if(h)Object.assign(p,{import_entity:h[0],export_entity:h[1]});else if(c&&e.states[c])Object.assign(p,{power_entity:c,invert:!0});else{let f=ie(e,m,u);f&&(p.power_entity=f)}let y=Ft(bt(e,u,It("voltage")));y&&(p.voltage_entity=y),Object.keys(p).length&&(o.grid=p)}let d=n.find(u=>u.type==="home");return d?.stat_rate&&e.states[d.stat_rate]&&(o.consumption_entity=d.stat_rate),o}function nn(t,e){let n=t?Oo(e,t):{},o=Lo(t);return{production_entity:To(t)??"sensor.production_pv",...n,...o?{tariff_color_entity:o}:{},sun_entity:"sun.sun"}}async function on(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var lt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",at=t=>t!==void 0&&t.action!=="none";function an(t,e){let n=t??{},o={entity:e};for(let r of["tap_action","hold_action","double_tap_action"])lt(n[r])&&(o[r]=n[r]);return o}function ln(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:at(t.tap_action)}function rn(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function wt(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let o=e[`${n}_action`];if(o===void 0){n==="tap"&&e.entity&&rn(t,"hass-more-info",{entityId:e.entity});return}let{toggle:r,...i}=e;at(o)&&rn(t,"hass-action",{config:i,action:n})}var ae=class{constructor(e,n,o){this.el=e;this.host=n;this.resolve=o;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",r=>this.down(r)),e.addEventListener("pointermove",r=>this.move(r)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",r=>this.key(r)),e.addEventListener("contextmenu",r=>{at(this.resolve(r.composedPath()).hold_action)&&r.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,at(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,wt(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,o=e.clientY-this.origin.y;n*n+o*o>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!at(e.double_tap_action)){wt(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,wt(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,wt(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let r=this.resolve(e.composedPath());ln(r)&&(e.preventDefault(),wt(this.host,r,"tap"))}},sn=new WeakSet;function dn(t,e,n){sn.has(t)||(sn.add(t),new ae(t,e,n))}function cn(t,e){let n=ln(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let o=at(e.hold_action)?"none":"";t.style.userSelect=o,t.style.setProperty("-webkit-user-select",o),t.style.setProperty("-webkit-touch-callout",o)}var Ro=[56,48,40],Po=[44,40,36],un=[0,1,2],le=[0,1,2,3],ce=[["solar",q.tomorrow],["grid",q.grid],["battery",q.battery],["home",q.consumption]],de=2*Math.PI*17;function _(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var Ho=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),xt=(t,e)=>e.split(".").reduce((n,o)=>n?.[o],t),pn=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,No=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]],["background",["tempo","solid","weather"]],["battery.estimate.charge",["time","duration","off"]],["battery.estimate.discharge",["duration","time","off"]],["battery.estimate.with_temperature",["replace","both"]]],Io=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],gn={solar:it.sun,grid:it.grid,battery:it.batt,consumption:it.use},Fo=t=>t===void 0||typeof t=="string"&&t.length>0||Array.isArray(t)&&t.length>0&&t.every(e=>typeof e=="string"&&e.length>0),hn=t=>typeof t=="number"&&Number.isFinite(t)&&t>0,Vo=[["grid","power_entity",["import_entity","export_entity"]],["battery","power_entity",["charge_entity","discharge_entity"]]],Do=[[["battery.soc_entity","battery.power_entity","battery.charge_entity","battery.discharge_entity","grid.import_entity","grid.export_entity"],Fo,"doit \xEAtre une entit\xE9 ou une liste d'entit\xE9s","must be an entity or a list of entities"],[["battery.capacity"],t=>t===void 0||hn(t)||Array.isArray(t)&&t.length>0&&t.every(hn),"doit \xEAtre un nombre positif (kWh) ou une liste","must be a positive number (kWh) or a list of them"],[["battery.max_soc","battery.reserve_soc"],t=>t===void 0||typeof t=="number"&&t>=0&&t<=100,"doit \xEAtre un pourcentage (0 \xE0 100)","must be a percentage (0 to 100)"],[["battery.estimate"],t=>t===void 0||!!t&&typeof t=="object"&&!Array.isArray(t),"doit regrouper charge, discharge, with_temperature, flow","must hold charge, discharge, with_temperature, flow"],[["battery.invert","grid.invert","expandable","animate","battery.estimate.flow"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],Ho,"doit \xEAtre une liste","must be a list"],[["production_max","production_threshold","smoothing","battery.power_threshold","consumer_threshold","stale_after"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function Wo(t){if(!t||typeof t!="object")throw _("Configuration invalide","Invalid configuration");let e=t;for(let[r,i]of Io)if(xt(e,r)!==void 0)throw _(`${r} n'existe plus : ${i.fr}`,`${r} is gone: ${i.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(r=>typeof r=="string"&&r.length>0)))throw _("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[r,i]of No){let s=xt(e,r);if(s!==void 0&&!i.includes(s))throw _(`${r} : ${pn(i,"ou")}`,`${r}: ${pn(i,"or")}`)}for(let[r,i,s,a]of Do)for(let l of r)if(!i(xt(e,l)))throw _(`${l} ${s}`,`${l} ${a}`);for(let[r,i,s]of Vo)if(xt(e,`${r}.${i}`)!==void 0&&s.some(a=>xt(e,`${r}.${a}`)!==void 0))throw _(`${r} : ${i} ou ${s.join(" / ")}, pas les deux`,`${r}: ${i} or ${s.join(" / ")}, not both`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>ht)throw _(`cells : une liste de ${ht} cases au plus`,`cells: a list of at most ${ht} cells`);for(let r of e.cells){let i=r&&typeof r=="object"?r:{};if(!(typeof r=="string"?pt.includes(r):typeof i.entity=="string"&&!!i.entity||pt.includes(i.type))){let a=String(typeof r=="object"?JSON.stringify(r):r);throw _(`cells : \xAB ${a} \xBB n'est ni ${pt.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${a}" is neither ${pt.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(i.tap_action!==void 0&&!lt(i.tap_action))throw _("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>V)throw _(`consumers : une liste de ${V} appareils au plus`,`consumers: a list of at most ${V} appliances`);for(let r of e.consumers){let i=r&&typeof r=="object"?r:{};if(typeof i.entity!="string"||!i.entity)throw _("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(i.tap_action!==void 0&&!lt(i.tap_action))throw _("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.background_color!==void 0&&!Rt(e.background_color))throw _("background_color : une couleur hexad\xE9cimale (#rrggbb)","background_color: a hex colour (#rrggbb)");if(e.flow_colors!==void 0){let r=e.flow_colors;if(!r||typeof r!="object"||Array.isArray(r))throw _("flow_colors : solar, grid, battery et consumption, chacun une couleur","flow_colors: solar, grid, battery and consumption, each a colour");for(let[i,s]of Object.entries(r))if(!(i in gn)||typeof s!="string"||!s)throw _(`flow_colors.${i} : solar, grid, battery ou consumption, une couleur CSS`,`flow_colors.${i}: solar, grid, battery or consumption, a CSS colour`)}if(e.tariff_palettes!==void 0){let r=e.tariff_palettes;if(!r||typeof r!="object"||Array.isArray(r))throw _("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[i,s]of Object.entries(r))if(!Array.isArray(s)||s.length!==3||!s.every(Rt))throw _(`tariff_palettes.${i} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${i}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var ue=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new Nt(this);this.actions={};this.cellTargets=new Map;this.estimateIds=[];this.viewOptions={};this.smoothIds=[];this.open=!1;this.flowWidth=0;this.weatherDrawn="";this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=Wo(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1);let o=this.config.smoothing??0;this.smoother=o>0?new yt(o*1e3):void 0,this.smoothIds=this.smoother?tn(this.config):[];let r=!!Bt(this.config);this.estimateSmoother=r&&!this.smoother?new yt(Te):void 0,this.estimateIds=r?N(this.config):[],this.viewOptions={},this.syncSmoothTimer(),this._hass&&this.update()}syncSmoothTimer(){let n=!!this.smoother&&this.isConnected;n&&!this.smoothTimer&&(this.smoothTimer=setInterval(()=>this.update(),1e3)),!n&&this.smoothTimer&&(clearInterval(this.smoothTimer),this.smoothTimer=void 0)}connectedCallback(){this.motion.start(),this.staleTimer??(this.staleTimer=setInterval(()=>this.markStale(),6e4)),this.syncSmoothTimer(),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),clearInterval(this.staleTimer),this.staleTimer=void 0,this.syncSmoothTimer(),this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let o=this.config?.flow,r=o==="always"||n&&o==="tap";r===this.open&&this.hasAttribute("data-expanded")===r||(this.open=r,this.toggleAttribute("data-expanded",r),this.refs?.flow&&(this.refs.flow.panel.hidden=!r),o==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(r)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,o=Ut(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),x(this,"data-flow",n.flow??null);for(let[s,a]of Object.entries(gn)){let l=n.flow_colors?.[s];l?this.style.setProperty(a,l):this.style.removeProperty(a)}this.flowWidth=0,this.weatherDrawn="",this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${Ye}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${jo()}</div>
                    <div class="layer night">${Je()}</div>
                    ${n.background==="weather"?'<div class="wx"></div>':""}
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    ${n.flow==="tap"?'<i class="grabber" aria-hidden="true"></i>':""}
                    <div class="grid">${o.map(s=>`
                        <div class="metric" data-metric="${s.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join("")}</div>
                </div>
                ${n.flow?Ko(n.consumers?.length??0):""}
            </ha-card>`;let r=(s,a=this.root)=>dt(a,s);this.refs={card:r("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:r(".hero-value"),heroUnit:r(".hero-unit"),context:r(".context"),contextText:r(".context-text"),metrics:new Map(o.map(s=>{let a=r(`[data-metric="${s.key}"]`),l=r("ha-icon",a);return l.setAttribute("icon",s.kind==="custom"?s.custom.icon||zt:q[s.kind]),[s.key,{el:a,icon:l,label:r(".label-text",a),value:r(".value-main",a),extra:r(".extra",a),entity:Gt(n,s)}]}))},this.actions=an(n,H(n)[0]);let i=n.tap_action===void 0;if(this.cellTargets=new Map(o.flatMap(s=>{let a=Gt(n,s),l=lt(s.tapAction)?s.tapAction:void 0;return l?[[s.key,{entity:a,tap:l}]]:i&&a?[[s.key,{entity:a}]]:[]})),n.flow==="tap"){let s=this.refs.heroValue.parentElement;for(let a of[s,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";s.setAttribute("role","button"),s.tabIndex=0,s.setAttribute("aria-controls","esc-flow"),s.setAttribute("aria-expanded","false")}if(n.flow){for(let[s]of ce){let a=Ht(n,s);if(!a)continue;this.cellTargets.set(`node:${s}`,{entity:a});let l=this.refs.flow.nodes.get(s).el;l.dataset.cellTarget="",l.setAttribute("role","button"),l.tabIndex=0}(n.consumers??[]).forEach((s,a)=>{let l=lt(s.tap_action)?s.tap_action:void 0;this.cellTargets.set(`consumer:${a}`,{entity:s.entity,tap:l});let d=this.refs.flow.consumers[a].el;d.dataset.cellTarget="",l?.action!=="none"&&(d.setAttribute("role","button"),d.tabIndex=0)})}for(let[s,a]of this.cellTargets){if(s.includes(":"))continue;let l=r(`[data-metric="${s}"]`);l.dataset.cellTarget="",a.tap?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0,l.style.cursor="pointer")}dn(this.refs.card,this,s=>this.actionsFor(s)),cn(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let o=n.find(l=>l instanceof HTMLElement&&l.dataset.cellTarget!==void 0);if(o?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let r=o?.dataset.node?`node:${o.dataset.node}`:o?.dataset.consumer?`consumer:${o.dataset.consumer}`:o?.dataset.metric??"",i=o?this.cellTargets.get(r):void 0;if(!i)return this.actions;let{tap_action:s,...a}=this.actions;return{...a,entity:i.entity??this.actions.entity,...i.tap?{tap_action:i.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let o=Math.round(n.box.clientWidth);if(!o||o===this.flowWidth)return;this.flowWidth=o;let r=this.shownConsumers,i=Ge(o,r.length);n.svg.setAttribute("viewBox",`0 0 ${o} ${i.height}`),n.box.style.setProperty("--esc-flow-h",`${i.height}px`),n.box.style.setProperty("--esc-node-w",`${i.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${i.centreWidth}px`),n.box.toggleAttribute("data-narrow",i.nodeWidth<112);for(let[s,a]of n.wires)for(let l of a.paths)l.setAttribute("d",i.paths[s]);n.box.toggleAttribute("data-compact",i.consumers.some(s=>s.compact)),n.consumers.forEach(({el:s,wire:a,paths:l},d)=>{let u=r.indexOf(d),c=i.consumers[u];if(s.hidden=!c?.visible,x(a,"data-off",c?.visible?null:""),!!c?.visible){s.dataset.side=c.below?"below":"above",Object.assign(s.style,{left:`${c.left}px`,top:`${c.top}px`,width:`${c.width}px`}),a.style.setProperty("--esc-flow",`esc-flow-c${u}`);for(let m of l)m.setAttribute("d",c.path)}}),n.keyframes.textContent=i.keyframes}flowRefs(){let n=(o,r=this.root)=>dt(r,o);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(K.map(o=>{let r=n(`[data-wire="${o}"]`);return[o,{g:r,paths:[...r.querySelectorAll("path")]}]})),nodes:new Map(ce.map(([o])=>[o,fn(n(`[data-node="${o}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((o,r)=>{let i=n(`[data-wire="c${r}"]`);return{...fn(o),icon:n("ha-icon",o),wire:i,paths:[...i.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let o=Ue(this.config,this.shown??this._hass,this.viewOptions);for(let[i,s]of n.nodes){let a=o.nodes[i];s.el.hidden===a.present&&(s.el.hidden=!a.present),S(s.label,a.label),S(s.value,a.value),S(s.sub,a.sub??""),s.el.dataset.note=a.note??"",S(s.centre,a.centre??""),s.el.toggleAttribute("data-centre",a.centre!==void 0),s.el.toggleAttribute("data-alert",!!a.alert),mn(s.segs,a.ring)}o.consumers.forEach((i,s)=>{let a=n.consumers[s];a&&(S(a.label,i.label),x(a.el,"title",i.label),x(a.el,"aria-label",`${i.label} ${i.value}`),S(a.value,i.value),x(a.icon,"icon",i.icon),a.el.toggleAttribute("data-idle",i.level===0),mn(a.segs,[[i.share,"use"]]),x(a.wire,"data-level",String(i.level)),i.shown||(a.el.hidden=!0,x(a.wire,"data-off","")))});let r=o.consumers.flatMap((i,s)=>i.shown?[s]:[]);r.join()!==this.shownConsumers.join()&&(this.shownConsumers=r,this.flowWidth=0,this.layoutFlow());for(let[i,s]of n.wires)x(s.g,"data-level",String(o.levels[i])),x(s.g,"data-off",o.off.includes(i)?"":null)}textBoxes(){let n=this.root,o=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(i=>i.getBoundingClientRect()),r=n.querySelector(".grid")?.getBoundingClientRect();return r&&this.side?o.push({left:r.left-1,right:r.left+1,top:r.top,bottom:r.bottom}):r&&o.push({left:r.left,right:r.right,top:r.top-1,bottom:r.top+1}),o.filter(i=>i.right>i.left&&i.bottom>i.top)}clearText(){let n=this.refs?.card;if(!n)return;let o=n.getBoundingClientRect();if(!o.width||!o.height)return;let r=this.textBoxes();for(let i of n.querySelectorAll(".star")){let s=o.left+parseFloat(i.style.left)/100*o.width,a=o.top+parseFloat(i.style.top)/100*o.height,l=Qe(s,a,Number(i.dataset.reach),r);i.hidden!==l&&(i.hidden=l)}}writeForms(n){this.form=n,x(this,"data-form",n?String(n):null);for(let o of this.view?.metrics??[]){let r=this.refs?.metrics.get(o.key);if(!r)continue;let{value:i,extra:s}=Se(o,n);S(r.value,i),S(r.extra,s)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&S(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let o=this.side,r=n.card.querySelector(".content"),i=n.heroValue.parentElement,s=n.context,a=[...n.metrics.values()].map(h=>h.value.parentElement),l=h=>h.scrollWidth>h.clientWidth+1,d=()=>parseFloat(getComputedStyle(s).lineHeight)||20,u=()=>!s.hidden&&(l(s)||s.scrollHeight>d()+1),c=h=>!l(i)&&!l(r)&&r.scrollHeight<=r.clientHeight+1&&(!h||(o?!u():!a.some(l))),m=o?Po:Ro,p=(h,y)=>{for(let f of[!1,!0]){this.toggleAttribute("data-compact",f);for(let L of y){this.writeForms(L);for(let g of m)if(x(this,"data-hero",g===m[0]?null:String(g)),c(h))return!0}}return!1};if(this.writeContext(!1),!o){!p(!0,un)&&!p(!0,[3])&&p(!1,un.slice(-1)),this.writeContext(!s.hidden&&l(s));return}p(!0,le)||(this.writeContext(!0),!p(!0,le)&&(this.writeContext(!1),p(!1,le),this.writeContext(!s.hidden&&s.scrollHeight>s.clientHeight+1)))}stateKey(n){let o=Le(this.config);return[Et(n),n.locale?.number_format??"",...o.map(r=>n.states[r]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this._hass,o=this.stateKey(this._hass);if(this.smoother){let l=Date.now();this.smoother.record(this._hass,this.smoothIds,l),n=this.smoother.smoothed(this._hass,this.smoothIds,l),o+="|"+this.smoothIds.map(d=>Number(n.states[d]?.state).toPrecision(3)).join("|")}let r={};if(this.estimateIds.length){let l=Date.now();r.now=l,this.estimateSmoother&&(this.estimateSmoother.record(this._hass,this.estimateIds,l),r.estimatePower=Y(this.config,this.estimateSmoother.smoothed(this._hass,this.estimateIds,l))),o+=`|${r.estimatePower?.toPrecision(2)??""}|${Math.floor(l/6e4)}`}if(o===this.renderedKey)return;this.renderedKey=o,this.shown=n,this.viewOptions=r;let i=this.view=Re(this.config,n,r),s=this.refs;this.paintSky(),S(s.heroValue,i.hero.value),S(s.heroUnit,i.hero.unit),s.context.hidden=i.context===void 0;for(let l of i.metrics){let d=s.metrics.get(l.key);d&&(S(d.label,l.label),this.side&&d.el.title!==l.label&&(d.el.title=l.label),l.icon&&d.icon.getAttribute("icon")!==l.icon&&d.icon.setAttribute("icon",l.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow(),this.markStale();let a=JSON.stringify([i.hero,i.context,i.metrics.map(l=>[l.value,l.extra,l.tight,l.bare])]);a!==this.fitted&&(this.fitted=a,this.fit())}markStale(){if(!this.config||!this.refs||!this._hass)return;let n=$e(this.config,this._hass),o=Et(this._hass),r=a=>a<120?`${a} min`:`${Math.floor(a/60)} h`,i=a=>{let l=a===void 0?void 0:n.get(a);return l===void 0?void 0:b(o,"stale",{age:r(l)})};for(let a of this.view?.metrics??[]){let l=this.refs.metrics.get(a.key);if(!l)continue;let d=i(l.entity);l.el.toggleAttribute("data-stale",!!d);let u=d?"mdi:clock-alert-outline":a.icon??l.icon.dataset.icon;l.icon.dataset.icon||(l.icon.dataset.icon=l.icon.getAttribute("icon")??""),u&&l.icon.getAttribute("icon")!==u&&l.icon.setAttribute("icon",u);let c=[this.side?a.label:"",a.note??"",d??""].filter(Boolean).join(" \xB7 ");x(l.el,"title",c||null)}let s=this.refs.flow;if(s){for(let[a,l]of s.nodes){let d=i(Ht(this.config,a));l.el.toggleAttribute("data-stale",!!d);let u=[l.el.dataset.note??"",d??""].filter(Boolean).join(" \xB7 ");x(l.el,"title",u||null)}(this.config.consumers??[]).forEach((a,l)=>{let d=s.consumers[l];if(!d)return;let u=i(a.entity);d.el.toggleAttribute("data-stale",!!u);let c=d.label.textContent??"";x(d.el,"title",u?`${c} \xB7 ${u}`:c)})}}paintSky(){let n=je(this.config,this.shown??this._hass),o=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((s,a)=>o.style.setProperty(`--esc-c${a}`,s)),n.nightPalette.forEach((s,a)=>o.style.setProperty(`--esc-n${a}`,s)),o.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),this.dataset.sky=n.sky;let r=n.weather?ot[n.weather]:void 0;x(this,"data-stars",r?r.stars:null),o.style.setProperty("--esc-cloud-a",String(r?n.mode==="night"?r.nightCloudAlpha:r.cloudAlpha:0));let i=this.root.querySelector(".wx");i&&n.weather&&n.weather!==this.weatherDrawn&&(this.weatherDrawn=n.weather,i.innerHTML=Ze(n.weather)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return nn(n,await on(n))}static async getConfigElement(){return customElements.get(X)||await me(),document.createElement(X)}};function jo(){return Fe.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function Ko(t){let e=[1,2,3].map(a=>`<g class="comet c${a}"><circle r="2.5"></circle></g>`).join(""),o=["gb","bg",...K.filter(a=>a!=="gb"&&a!=="bg")].map(a=>`<g class="wire ${ne[a]}" data-wire="${a}" data-level="0">${a==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),r=Array.from({length:t},(a,l)=>`<g class="wire use" data-wire="c${l}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),i=(a,l)=>`
        <div class="node" ${a}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${l?` icon="${l}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span><span class="nsub line"></span></span>
        </div>`,s=ce.map(([a,l])=>i(`data-node="${a}"`,l)).join("")+Array.from({length:t},(a,l)=>i(`data-consumer="${l}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${gt}">${r}${o}</svg>${s}</div></div>`}function fn(t){return{el:t,label:dt(t,".nlab"),value:dt(t,".nval"),sub:dt(t,".nsub"),centre:dt(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function mn(t,e){let n=0;t.forEach((o,r)=>{let i=e[r],s=i?Math.max(de*i[0]-(e.length>1?3:0),0):0;x(o,"stroke-dasharray",`${s.toFixed(1)} ${de.toFixed(1)}`),x(o,"stroke-dashoffset",(-n).toFixed(1)),x(o,"data-source",i&&s>=1.5?i[1]:""),i&&(n+=de*i[0])})}function dt(t,e){return t.querySelector(e)}function x(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function S(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(B)||(customElements.define(B,ue),window.customCards=window.customCards||[],window.customCards.push({type:B,name:Vt,description:pe,preview:!0,documentationURL:he}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${Vt} %c ${fe} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
