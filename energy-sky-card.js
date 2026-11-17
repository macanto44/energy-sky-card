"use strict";(()=>{var K="energy-sky-card",j=`${K}-editor`,Lt="Energy Sky Card",ne="Solar production, battery and grid on a sky that follows the tariff colour and the sun",oe="https://github.com/macanto44/energy-sky-card",re="0.3.7";function Je(t,e){let n=`${K}.js`;for(let{src:r}of e){let o=new URL(r,"http://local/"),s=o.pathname.lastIndexOf("/");if(o.pathname.slice(s+1)===n)return r.replace(n,`${t}.js`)}return`${t}.js`}var ht;function ie(){return customElements.get(j)?Promise.resolve():(ht??(ht=new Promise((t,e)=>{let n=document.createElement("script");n.type="module",n.src=Je(j,Array.from(document.scripts)),n.addEventListener("load",()=>customElements.get(j)?t():e(new Error(`${n.src}: no editor registered`))),n.addEventListener("error",()=>e(new Error(`${n.src}: failed to load`))),document.head.append(n)}).catch(t=>{throw ht=void 0,t})),ht)}var Qe=new Set(["unavailable","unknown","none",""]);function k(t){if(!t||Qe.has(String(t.state).toLowerCase()))return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}var Ze={mw:1e6,kw:1e3,w:1},tn={mwh:1e3,kwh:1,wh:.001};function ae(t){return String(t?.attributes.unit_of_measurement??"").toLowerCase()}function A(t){let e=k(t);return e===void 0?void 0:e*(Ze[ae(t)]??1)}function Mt(t){let e=k(t);return e===void 0?void 0:e*(tn[ae(t)]??1)}var en={fr:{produced:"{value} kWh produits",battery:"Batterie",grid:"R\xE9seau",solar:"Solaire",home:"Maison",stale:"Pas de nouvelle valeur depuis {age}",voltage:"Tension",outage:"Coupure",tomorrow:"Pr\xE9vu demain",soc_reached:"SOC atteint",soc_reached_short:"SOC \u2713",consumption:"Consommation",consumption_short:"Conso."},en:{produced:"{value} kWh produced",battery:"Battery",grid:"Grid",solar:"Solar",home:"Home",stale:"No new reading for {age}",voltage:"Voltage",outage:"Outage",tomorrow:"Tomorrow",soc_reached:"SOC reached",soc_reached_short:"SOC \u2713",consumption:"Consumption",consumption_short:"Use"}};function gt(t){return(t?.locale?.language||t?.language||"en").toLowerCase().startsWith("fr")?"fr":"en"}function y(t,e,n={}){return en[t][e].replace(/\{(\w+)\}/g,(r,o)=>n[o]??"")}function nn(t){switch(t?.locale?.number_format){case"decimal_comma":case"space_comma":return",";case"comma_decimal":case"none":return".";case"system":return se(void 0);default:return se(t?.locale?.language||t?.language||"en")}}function se(t){try{return new Intl.NumberFormat(t).formatToParts(1.5).find(e=>e.type==="decimal")?.value??"."}catch{return"."}}function mt(t){return{lang:gt(t),decimal:nn(t)}}function $(t,e,n){let r=t.toFixed(e);return(/^-0(\.0+)?$/.test(r)?r.slice(1):r).replace(".",n.decimal)}function yt(t,e){return t===void 0||!Number.isFinite(t)?{value:"\u2014",unit:""}:Math.abs(Math.round(t))<1e3?{value:$(Math.round(t),0,e),unit:"W"}:{value:$(t/1e3,1,e),unit:"kW"}}function Tt({value:t,unit:e}){return e?`${t}\xA0${e}`:t}function L(t,e){return Tt(yt(t,e))}function Rt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":$(t,1,e)}function le(t,e){let n=Rt(t,e);return n==="\u2014"?n:`${n}\xA0kWh`}function de(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${$(Math.round(t),0,e)}\xA0V`}function bt(t,e){return t===void 0||!Number.isFinite(t)?"\u2014":`${$(Math.round(t),0,e)}${e.lang==="fr"?"\xA0":""}%`}function ce(t,e,n){return t===void 0||!Number.isFinite(t)?"\u2014":`${$(Math.round(t),0,n)} ${e||"\xB0C"}`}var Ot=20,on=["warning","alarm"],z={battery:"mdi:home-battery-outline",grid:"mdi:transmission-tower",voltage:"mdi:sine-wave",tomorrow:"mdi:solar-power-variant-outline",consumption:"mdi:home-lightning-bolt-outline"},Ht="mdi:gauge",at=Object.keys(z),st=4,H=4;function pe(t,e){return e>=3?{value:t.bare??t.value,extra:""}:e>=2&&t.tight?t.tight:{value:t.value,extra:e>=1?t.extraShort:t.extra}}var wt=t=>typeof t=="object"&&t!==null&&typeof t.entity=="string",fe=t=>typeof t=="object"&&t!==null&&!wt(t)&&typeof t.type=="string",rn=t=>typeof t=="string"?t:fe(t)?t.type:void 0;function an(t){let e=[];return t.battery?.soc_entity&&e.push("battery"),t.grid?.power_entity&&e.push("grid"),(t.grid?.voltage_entity||t.grid?.outage_entity)&&e.push("voltage"),t.forecast_tomorrow_entity&&e.push("tomorrow"),e}function Pt(t){if(!t.cells)return an(t).map(n=>({key:n,kind:n}));let e=new Set;return t.cells.slice(0,st).flatMap((n,r)=>{if(wt(n))return[{key:`custom-${r}`,kind:"custom",custom:n,...n.tap_action?{tapAction:n.tap_action}:{}}];let o=rn(n);return!o||e.has(o)?[]:(e.add(o),[{key:o,kind:o,...fe(n)&&n.tap_action?{tapAction:n.tap_action}:{}}])})}function Nt(t,e){switch(e.kind){case"battery":return t.battery?.soc_entity;case"grid":return t.grid?.power_entity??t.grid?.outage_entity;case"voltage":return t.grid?.voltage_entity??t.grid?.outage_entity;case"tomorrow":return t.forecast_tomorrow_entity;case"consumption":return t.consumption_entity;case"custom":return e.custom?.entity}}function U(t){let e=t.production_entity;return(Array.isArray(e)?e:[e]).filter(n=>typeof n=="string"&&n.length>0)}function lt(t,e){let n=U(t).map(r=>A(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}var he=(t,e)=>t===void 0||!e?t:-t,sn=30;function ge(t,e,n=Date.now()){let r=t.stale_after??sn,o=new Map;if(!(r>0))return o;let s=[...U(t),t.consumption_entity,t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,t.grid?.power_entity,t.grid?.voltage_entity,...(t.cells??[]).filter(wt).map(i=>i.entity),...(t.consumers??[]).map(i=>i.entity)];for(let i of s){let a=Date.parse(e.states[i??""]?.last_reported??"");if(!Number.isFinite(a))continue;let l=(n-a)/6e4;l>=r&&o.set(i,Math.floor(l))}return o}function Ft(t,e){return he(A(e.states[t.grid?.power_entity??""]),t.grid?.invert)}function It(t,e){return he(A(e.states[t.battery?.power_entity??""]),t.battery?.invert)}function me(t){let e=[...U(t),t.consumption_entity,...(t.cells??[]).filter(wt).map(n=>n.entity),...(t.consumers??[]).map(n=>n.entity),...t.daily_production_entities??[],t.battery?.soc_entity,t.battery?.power_entity,t.battery?.temperature_entity,...t.battery?.soc_reached_entities??[],t.grid?.power_entity,t.grid?.voltage_entity,t.grid?.outage_entity,t.forecast_tomorrow_entity,t.tariff_color_entity,t.sun_entity??"sun.sun"];return[...new Set(e.filter(n=>typeof n=="string"&&n.length>0))]}function ln(t,e){let n=(t.daily_production_entities??[]).map(r=>Mt(e.states[r])).filter(r=>r!==void 0);return n.length?n.reduce((r,o)=>r+o,0):void 0}function dn(t,e){return t===void 0?"none":t>e?"up":t<-e?"down":"none"}function cn(t,e){let n=t.battery?.soc_reached_entities??[];if(n.length)return n.some(r=>e.states[r]?.state==="on")}function Dt(t,e){let n=t.grid?.outage_entity;return n?(t.grid?.outage_states??on).map(o=>String(o).toLowerCase()).includes(String(e.states[n]?.state??"").toLowerCase()):!1}function un(t,e,n,r){let o=k(e.states[t.battery?.soc_entity??""]),s=dn(It(t,e),r),i=o===void 0?"":s==="up"?"\xA0\u2191":s==="down"?"\xA0\u2193":"",a=cn(t,e),l=e.states[t.battery?.temperature_entity??""],c=k(l),d=bt(o,n)+i,u=String(l?.attributes.unit_of_measurement??"");return{key:"battery",label:y(n.lang,"battery"),value:c===void 0?d:`${d} \xB7 ${ce(c,u,n)}`,extra:a?` \xB7 ${y(n.lang,"soc_reached")}`:"",extraShort:a?` \xB7 ${y(n.lang,"soc_reached_short")}`:"",...c===void 0?{}:{tight:{value:`${d}\u202F\xB7\u202F${$(Math.round(c),0,n)}\xB0`,extra:a?"\u202F\u2713":""},bare:d}}}function pn(t,e,n){return{key:"grid",label:y(n.lang,"grid"),value:L(Ft(t,e),n),extra:"",extraShort:""}}function fn(t,e,n){let r=t.grid?.voltage_entity?k(e.states[t.grid.voltage_entity]):void 0;return{key:"voltage",label:y(n.lang,"voltage"),value:Dt(t,e)?y(n.lang,"outage"):de(r,n),extra:"",extraShort:""}}function hn(t,e,n){return{key:"tomorrow",label:y(n.lang,"tomorrow"),value:le(Mt(e.states[t.forecast_tomorrow_entity??""]),n),extra:"",extraShort:""}}function gn(t,e,n){return{key:"consumption",label:y(n.lang,"consumption"),value:L(A(e.states[t.consumption_entity??""]),n),extra:"",extraShort:""}}function mn(t,e,n){let r=t.custom,o=e.states[r.entity],s=String(o?.attributes.unit_of_measurement??""),i;if(!o||k(o)===void 0&&["unavailable","unknown",""].includes(o.state))i="\u2014";else if(/^[mk]?w$/i.test(s))i=L(A(o),n);else if(e.formatEntityState)i=e.formatEntityState(o);else{let l=k(o);i=l===void 0?o.state:Tt({value:$(l,Number.isInteger(l)?0:1,n),unit:s})}let a=r.icon||(typeof o?.attributes.icon=="string"?o.attributes.icon:"")||Ht;return{key:t.key,label:r.name||String(o?.attributes.friendly_name??r.entity),value:i,extra:"",extraShort:"",icon:a}}function yn(t,e){return e.states[t.sun_entity??"sun.sun"]?.state==="below_horizon"}function bn(t,e,n){let r=yn(t,e)?t.night_hero??"production":"production";if(r==="consumption"&&t.consumption_entity)return{hero:yt(A(e.states[t.consumption_entity]),n),label:y(n.lang,"consumption"),labelShort:y(n.lang,"consumption_short")};if(r==="battery"&&t.battery?.soc_entity){let o=k(e.states[t.battery.soc_entity]);return{hero:o===void 0?{value:"\u2014",unit:""}:{value:$(Math.round(o),0,n),unit:"%"},label:y(n.lang,"battery")}}return{hero:yt(lt(t,e),n)}}function ye(t,e){let n=mt(e),r=t.battery?.power_threshold??Ot,o=t.daily_production_entities?.length?y(n.lang,"produced",{value:Rt(ln(t,e),n)}):void 0,s=Pt(t).map(d=>{switch(d.kind){case"battery":return un(t,e,n,r);case"grid":return pn(t,e,n);case"voltage":return fn(t,e,n);case"tomorrow":return hn(t,e,n);case"consumption":return gn(t,e,n);case"custom":return mn(d,e,n)}}),{hero:i,label:a,labelShort:l=a}=bn(t,e,n),c=d=>d?[d,o].filter(Boolean).join(" \xB7 "):o;return{hero:i,context:c(a),contextShort:c(l),metrics:s}}var be={Bleu:["#4b90d5","#2169b0","#1d4f87"],Blanc:["#7b899c","#5c6b81","#4f5d72"],Rouge:["#d2766a","#ac443a","#76261f"]},we="Bleu",Vt=["#1d2b4d","#121b36","#0b1026"],Lo=[255/255,214/255,140/255],wn=.55;var jt=6e3,xt={sun:"#ffd68c",grid:"#cfe0ff",batt:"#9ef0c8",use:"#f4d9ff"},_t=.45,vt={x:0,y:-30,radius:100},_e=[8,18,40],zt=.2,ve=[{width:110,height:38,top:2,period:47,delay:9},{width:95,height:32,top:38,period:61,delay:41},{width:120,height:36,top:70,period:73,delay:22}],xn=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Et=t=>typeof t=="string"&&xn.test(t);function Ee(t){let e=t.slice(1);return e.length===3&&(e=e.split("").map(n=>n+n).join("")),[0,2,4].map(n=>parseInt(e.slice(n,n+2),16)/255)}function _n(t){return t>.04045?((t+.055)/1.055)**2.4:t/12.92}function xe(t){let e=[.2126,.7152,.0722];return t.reduce((n,r,o)=>n+e[o]*_n(r),0)}function vn(t,e){let[n,r]=[xe(t),xe(e)].sort((o,s)=>s-o);return(n+.05)/(r+.05)}function Q(t,e,n){return[0,1,2].map(r=>t[r]+(e[r]-t[r])*n)}function En(t,e){let[n,r,o]=t.map(Ee);return e<=.6?Q(n,r,e/.6):Q(r,o,(e-.6)/.4)}var Cn=[.36,.5,.64,.76,.86,.98],Kt=[1,1,1];function kn(t,e=0){return Math.min(...Cn.map(n=>vn(Kt,Q(En(t,n),Kt,e))))}var Wt=t=>"#"+t.map(e=>Math.round(Math.min(Math.max(e,0),1)*255).toString(16).padStart(2,"0")).join(""),Ce="#3a6b8c";function An(t){let e=Ee(Et(t)?t:Ce),n=o=>[Wt(Q(o,Kt,.12)),Wt(o),Wt(Q(o,[0,0,0],.35))],r=n(e);for(let o=0;o<40&&kn(r)<4.6;o++)e=Q(e,[0,0,0],.06),r=n(e);return r}var ke=.12,Z={sunny:{day:["#4b90d5","#2169b0","#1d4f87"],night:Vt,clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,halo:!0,stars:"all"},partlycloudy:{day:["#4d78a6","#2a5b8b","#20446c"],night:["#202c47","#141c31","#0d1222"],clouds:3,cloudAlpha:.12,nightCloudAlpha:.1,rain:0,snow:0,halo:!0,stars:"few"},cloudy:{day:["#647285","#475567","#35404f"],night:["#262c3a","#1a1f2b","#11141c"],clouds:6,cloudAlpha:.14,nightCloudAlpha:.1,rain:0,snow:0,stars:"none"},rainy:{day:["#5a6879","#405062","#2f3a48"],night:["#20252f","#161a22","#0e1117"],clouds:5,cloudAlpha:.13,nightCloudAlpha:.08,rain:40,snow:0,stars:"none"},pouring:{day:["#4a5664","#343f4c","#262e38"],night:["#1b1f27","#12151b","#0b0d11"],clouds:5,cloudAlpha:.11,nightCloudAlpha:.06,rain:80,snow:0,stars:"none"},lightning:{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:0,flash:!0,stars:"none"},"lightning-rainy":{day:["#3e4360","#2b2f46","#1e2132"],night:["#1a1c2a","#11131e","#0a0b13"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:60,snow:0,flash:!0,stars:"none"},snowy:{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:0,snow:40,stars:"none"},"snowy-rainy":{day:["#67778b","#4e5e74","#3d4d60"],night:["#2a3142","#1d2331","#141924"],clouds:4,cloudAlpha:.1,nightCloudAlpha:.06,rain:20,snow:24,stars:"none"},fog:{day:["#6a737c","#525a64","#404750"],night:["#2a2f37","#1e2229","#15181d"],clouds:0,cloudAlpha:0,nightCloudAlpha:0,rain:0,snow:0,fog:!0,stars:"none"},windy:{day:["#4c79a7","#2a5a8b","#1f446b"],night:["#1f2b46","#131b30","#0c1121"],clouds:5,cloudAlpha:.12,nightCloudAlpha:.09,windy:!0,rain:0,snow:0,halo:!0,stars:"few"}},Sn={"clear-night":"sunny",hail:"pouring","windy-variant":"windy",exceptional:"cloudy"};function $n(t){let e=String(t??"").toLowerCase();return Z[e]?e:Sn[e]??"cloudy"}function Ln(t,e){let n={...be,...t.tariff_palettes??{}},r=String(e??"").toLowerCase(),o=Object.keys(n).find(s=>s.toLowerCase()===r);return o?n[o]:t.tariff_palettes?.[we]??be[we]}function Ae(t,e){let n=e.states[t.sun_entity??"sun.sun"]?.state,r=lt(t,e)??0,o=t.production_max&&t.production_max>0?t.production_max:jt,s=Math.min(Math.max(r,0)/o,1),i=Math.round(s*wn*1e3)/1e3,a={mode:n==="below_horizon"?"night":"day",producing:r>0};if(t.background==="solid")return{...a,sky:"solid",palette:An(t.background_color??Ce),nightPalette:Vt,haloAlpha:0};if(t.background==="weather"){let l=$n(e.states[t.weather_entity??""]?.state),c=Z[l];return{...a,sky:"weather",weather:l,palette:c.day,nightPalette:c.night,haloAlpha:c.halo?i:0}}return{...a,sky:"tempo",palette:Ln(t,t.tariff_color_entity?e.states[t.tariff_color_entity]?.state:void 0),nightPalette:Vt,haloAlpha:i}}var Ut={sh:"sun",sg:"sun",sb:"sun",gh:"grid",bh:"batt",gb:"grid",bg:"batt"},Mn={sh:["solar","home"],sg:["solar","grid"],sb:["solar","battery"],gh:["grid","home"],bh:["battery","home"],gb:["grid","battery"],bg:["battery","grid"]},N=Object.keys(Ut),$e=20,G=t=>Math.max(t??0,0);function Tn(t,e,n,r){let o=G(t),s=G(e===void 0?void 0:-e),i=G(e),a=G(n),l=G(n===void 0?void 0:-n),c=Math.min(s,o);o-=c;let d=Math.min(s-c,l),u=Math.min(a,o);o-=u;let f=Math.min(a-u,i),p={sh:o,sg:c,sb:u,gh:i-f,bh:l-d,gb:f,bg:d};for(let g of N)p[g]<$e&&(p[g]=0);return{wires:p,home:r??(t!==void 0||e!==void 0||n!==void 0?p.sh+p.gh+p.bh:void 0)}}function Se(t){return t<$e?0:t<500?1:t<1500?2:t<3e3?3:4}function kt(t,e){switch(e){case"solar":return U(t)[0];case"grid":return t.grid?.power_entity;case"battery":return t.battery?.power_entity||t.battery?.soc_entity;case"home":return t.consumption_entity}}var Rn="mdi:power-plug-outline",On=10;function Le(t,e){let n=mt(e),r=lt(t,e),o=Dt(t,e),s=o?0:Ft(t,e),i=It(t,e),a=t.battery?.power_threshold??Ot,l=i!==void 0&&Math.abs(i)<=a?0:i,c=A(e.states[t.consumption_entity??""]),d=Tn(r,s,l,c),u=t.production_max&&t.production_max>0?t.production_max:jt,f=k(e.states[t.battery?.soc_entity??""]),p={sun:d.wires.sh,grid:d.wires.gh,batt:d.wires.bh},m=p.sun+p.grid+p.batt,g=h=>h==="solar"||h==="home"||!!kt(t,h),T=Object.fromEntries(N.map(h=>[h,Se(d.wires[h])]));return{nodes:{solar:{present:g("solar"),label:y(n.lang,"solar"),value:L(r,n),ring:[[Math.min(G(r)/u,1),"sun"]]},grid:{present:g("grid"),label:y(n.lang,"grid"),value:o?y(n.lang,"outage"):L(s,n),ring:o?[[1,"alert"]]:[],alert:o},battery:{present:g("battery"),label:y(n.lang,"battery"),value:t.battery?.power_entity?L(i,n):bt(f,n),ring:f===void 0?[]:[[Math.min(Math.max(f,0),100)/100,"batt"]],centre:f===void 0?void 0:String(Math.round(f))},home:{present:g("home"),label:y(n.lang,"home"),value:L(d.home,n),ring:m>0?["sun","batt","grid"].filter(h=>p[h]>0).map(h=>[p[h]/m,h]):[]}},consumers:(t.consumers??[]).slice(0,H).map(h=>{let v=e.states[h.entity],F=A(v),X=G(F),I=t.consumer_threshold??On,q=it=>typeof v?.attributes[it]=="string"?v.attributes[it]:void 0;return{label:h.name||q("friendly_name")||h.entity,icon:h.icon||q("icon")||Rn,value:L(A(v),n),share:d.home?Math.min(X/d.home,1):0,level:Se(X),shown:I<=0||F!==void 0&&X>=I}}),levels:T,off:N.filter(h=>!Mn[h].every(g))}}var dt=220,Hn=.65,Pn=360,P=46,Nn=12,Fn=46;function In([t,e,n],r){if(!e)return{at:[t[0]+(n[0]-t[0])*r,t[1]+(n[1]-t[1])*r],deg:Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI};let[o,s]=e,i=1-r,a=c=>i*i*i*t[c]+3*i*i*r*o[c]+3*i*r*r*s[c]+r*r*r*n[c],l=c=>3*i*i*(o[c]-t[c])+6*i*r*(s[c]-o[c])+3*r*r*(n[c]-s[c]);return{at:[a(0),a(1)],deg:Math.atan2(l(1),l(0))*180/Math.PI}}var B=t=>Math.round(t*10)/10,tt=([t,e])=>`${B(t)},${B(e)}`,Ct=27;function Me(t,e=0){let n=Math.max(t,160),r=Math.round(Math.min(Math.max((n-48)/2,96),128)),o=Math.round(Math.min(r+20,n-r-32)),s=Math.round(Math.min(Math.max(n*Hn,dt),Pn)),i=o/2,a=P/2,l=s/2,c=3+a,d=s-3-a,u=n/2,f=r-Ct,p=n-r+Ct,m=u-i+Ct,g=u+i-Ct,T=(w,x)=>{let R=(x[1]-w[1])/2;return[w,[[w[0],w[1]+R],[x[0],x[1]-R]],x]},h={sh:[[r,l],null,[n-r,l]],sg:T([f,l-a],[m,c+a]),gh:T([g,c+a],[p,l-a]),sb:T([f,l+a],[m,d-a]),bh:T([g,d-a],[p,l+a]),gb:[[u,c+a],null,[u,d-a]],bg:[[u,d-a],null,[u,c+a]]},v=n-(u+i)-8,F=e>2||v<110,X=F&&v<100?1:2,I=[];for(let w=0;w<e;w++){let x=w%2===1,R=Math.floor(w/2),D=Math.min(x?Math.floor(e/2):Math.ceil(e/2),X),W=x?s-3-P:3,V=x?l+a:l-a,Y=x?W:W+P;if(R>=X){I.push({visible:!1,compact:F,below:x,left:0,top:W,width:0,path:""});continue}let C,O;if(F){let J=v/D,ft=n-v+J*(R+.5)+4;O=Fn,C=ft-O/2,h[`c${w}`]=T([n-r/2+(D>1?(R-.5)*30:10),V],[ft,Y])}else{O=Math.min(r,v),C=n-O;let J=C+O/2+10;h[`c${w}`]=[[J,V],null,[J,Y]]}I.push({visible:!0,compact:F,below:x,left:B(C),top:W,width:B(O),path:""})}let q={},it="";for(let[w,x]of Object.entries(h)){let[R,D,W]=x;q[w]=D?`M${tt(R)} C${tt(D[0])} ${tt(D[1])} ${tt(W)}`:`M${tt(R)} L${tt(W)}`;let V=D?Nn:1,Y=[];for(let C=0;C<=V;C++){let{at:O,deg:J}=In(x,C/V),ft=C===0||C===V?" opacity: 0;":"";Y.push(`${B(C/V*100)}% { transform: translate(${B(O[0])}px, ${B(O[1])}px) rotate(${Math.round(J)}deg);${ft} }`)}Y.push("10%, 90% { opacity: 1; }"),it+=`@keyframes esc-flow-${w} { ${Y.join(" ")} }
`}return I.forEach((w,x)=>{w.path=q[`c${x}`]??""}),{nodeWidth:r,centreWidth:o,height:s,paths:q,consumers:I,keyframes:it}}var Gt=t=>`rgba(${_e.join(", ")}, ${t})`,Te=t=>`${Math.round(t*1e3)/10}%`,Dn=`linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${Te(1-_t/.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${Te((.6-_t)/(1-_t))}, var(--esc-c2, #1d4f87) 100%)`,Re=`${vt.x}px ${vt.y}px`;var et={sun:"--energy-sky-card-solar",grid:"--energy-sky-card-grid",batt:"--energy-sky-card-battery",use:"--energy-sky-card-consumption"},Oe=t=>`var(${et[t]}, ${xt[t]})`,Wn=.14,Vn=[[1.6,3.2],[2.4,2.6],[3.2,2],[4,1.4]],M=(t,e,n)=>`:host([data-motion="on"]${t}) ${e},
:host([data-motion="paused"]${t}) ${e} { ${n} animation-play-state: var(--esc-play); }`,He=`
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
.fogband { position: absolute; left: -40%; width: 180%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, ${ke}), rgba(255, 255, 255, 0)); }
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
    background: radial-gradient(closest-side, ${Gt(zt)}, ${Gt(zt/2)} 50%, ${Gt(0)} 100%);
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
${M('[data-mode="day"][data-producing]',".halo","animation: esc-breathe 3s ease-in-out infinite alternate;")}
${M('[data-mode="night"]',".star.twinkle","animation: esc-twinkle 2s ease-in-out infinite alternate;")}
${M('[data-mode="night"]',".shooting","animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;")}
${M('[data-mode="day"]',".drift","animation: esc-drift 60s linear infinite;")}
${M('[data-sky="weather"]',".cloudband","animation: esc-drift 60s linear infinite;")}
${M('[data-sky="weather"]',".drop","display: block; animation: esc-rain 0.7s linear infinite;")}
${M('[data-sky="weather"]',".flake","display: block; animation: esc-snow 8s linear infinite;")}
${M('[data-sky="weather"]',".fogband","animation: esc-fog 18s ease-in-out infinite alternate;")}
${M('[data-sky="weather"]',".flash","animation: esc-flash 7s infinite;")}
/* Day \u21C4 night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${M("[data-expanded]",'.wire:not([data-level="0"]) .comet',"display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);")}
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
:host([data-layout="side"]) .layer.day { background: ${Dn}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${vt.radius}px at ${Re}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${Re};
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
.flow { position: relative; height: var(--esc-flow-h); --esc-flow-h: ${dt}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
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
${Vn.map(([t,e],n)=>`.wire[data-level="${n+1}"] { --esc-w: ${t}px; --esc-dur: ${e}s; }`).join(`
`)}
${Object.keys(xt).map(t=>`.wire.${t} { color: ${Oe(t)}; }`).join(" ")}
${[...N,...Array.from({length:H},(t,e)=>`c${e}`)].map(t=>`.wire[data-wire="${t}"] { --esc-flow: esc-flow-${t}; }`).join(" ")}
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
    top: calc((var(--esc-flow-h) - ${P}px) / 2);
    width: var(--esc-node-w);
    height: ${P}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${P/2}px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${Wn}), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: calc(var(--esc-flow-h) - ${3+P}px); }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${Object.keys(xt).map(t=>`.seg[data-source="${t}"] { stroke: ${Oe(t)}; }`).join(" ")}
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
`;function Kn(t){let e=t;return()=>(e=e*16807%2147483647)/2147483647}var E=t=>t.toFixed(1),jn=[[[24,34,13],[40,25,17],[58,21,15],[72,29,13],[84,36,9]],[[20,36,10],[34,28,14],[52,24,18],[70,31,12]]];function zn(t,e,n){let r=jn[e%2],o=26+t()*22,s=t()*62-6,i=e*37%60+10,a=n?35+t()*15:55+t()*25,l=r[0][0],c=r[r.length-1][0],d=r.map(([u,f,p])=>`<circle cx="${u}" cy="${f}" r="${p}"></circle>`).join("")+`<rect x="${l}" y="30" width="${c-l}" height="14" rx="7"></rect>`;return`<div class="cloudband" style="animation-duration:${E(a)}s;animation-delay:-${E(t()*a)}s"><svg class="cumulus" viewBox="0 0 100 50" style="left:${i}%;top:${E(s)}%;width:${E(o)}%"><g>${d}</g></svg></div>`}function Pe(t){let e=Z[t];if(!e)return"";let n=Kn(7),r="";for(let o=0;o<e.clouds;o++)r+=zn(n,o,!!e.windy);if(e.fog)for(let o=0;o<4;o++){let s=14+n()*10;r+=`<div class="fogband" style="top:${-10+o*28}%;height:${E(45+n()*20)}%;animation-duration:${E(s)}s;animation-delay:-${E(n()*10)}s"></div>`}for(let o=0;o<e.rain;o++){let s=.55+n()*.35;r+=`<i class="drop" style="left:${E(n()*115)}%;opacity:${(.35+n()*.5).toFixed(2)};animation-duration:${s.toFixed(2)}s;animation-delay:-${(n()*s).toFixed(2)}s"></i>`}for(let o=0;o<e.snow;o++){let s=2+n()*2.6,i=6+n()*6;r+=`<i class="flake" style="left:${E(n()*100)}%;width:${E(s)}px;height:${E(s)}px;opacity:${(.5+n()*.45).toFixed(2)};animation-duration:${E(i)}s;animation-delay:-${E(n()*i)}s"></i>`}return e.flash&&(r+='<div class="flash"></div>'),r}var Bt={cols:10,rows:6},Un=[1,.9,.8,.7,.6,.5],Gn=.4,Bn=3,Xn=1.4;function qn(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var nt=(t,e=1)=>Math.round(t*10**e)/10**e;function Yn(t,e,n,r){return{x:nt((e+.1+t()*.8)/r.cols*100),y:nt((n+.1+t()*.8)/r.rows*100)}}function Jn(t=24301){let e=qn(t),n=[];for(let r=0;r<Bt.rows;r++)for(let o=0;o<Bt.cols;o++){let s=e()<Un[r],{x:i,y:a}=Yn(e,o,r,Bt),l=1.4+e()*.8,c=e()<Gn,d=nt(e()*5,2);if(!s)continue;let u=a/100;n.push({x:i,y:a,size:nt(l*(1-.3*u),2),opacity:nt(1-.45*u,2),twinkle:c,delay:d})}return n}var Qn=[{left:52,top:7,angle:20,run:110,period:11,delay:4},{left:4,top:5,angle:12,run:170,period:17,delay:9},{left:44,top:36,angle:9,run:150,period:23,delay:15}],Zn=t=>nt(t.size/2*(t.twinkle?Xn:1)+Bn,2);function Ne(t=Jn()){return t.map(e=>`<i class="star${e.twinkle?" twinkle":""}" data-reach="${Zn(e)}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;--esc-o:${e.opacity};animation-delay:-${e.delay}s"></i>`).join("")+Qn.map(e=>`<i class="shooting" style="left:${e.left}%;top:${e.top}%;--esc-shoot-angle:${e.angle}deg;--esc-shoot-run:${e.run}px;--esc-shoot-period:${e.period}s;--esc-shoot-delay:${e.delay}s"></i>`).join("")}var Fe=(t,e,n,r)=>r.some(o=>t>o.left-n&&t<o.right+n&&e>o.top-n&&e<o.bottom+n);var to="(prefers-reduced-motion: reduce)";function eo(t){return!t.animate||t.reducedMotion?"off":t.tabHidden||t.offscreen?"paused":"on"}var At=class{constructor(e){this.host=e;this.hiddenTab=!1;this.outOfView=!1;this.reducedMotion=!1;this.animate=!0;this.onVisibility=()=>{this.hiddenTab=document.hidden,this.apply()};this.onMedia=e=>{this.reducedMotion=e.matches,this.apply()}}setAnimate(e){this.animate=e,this.apply()}start(){if(this.stop(),this.hiddenTab=document.hidden,document.addEventListener("visibilitychange",this.onVisibility),typeof window.matchMedia=="function"&&(this.media=window.matchMedia(to),this.reducedMotion=this.media.matches,this.media.addEventListener?.("change",this.onMedia)),"IntersectionObserver"in window){let e="100px";this.observer=new IntersectionObserver(n=>{let r=n.at(-1);r&&(this.outOfView=!r.isIntersecting),this.apply()},{rootMargin:e}),this.observer.observe(this.host)}this.apply()}stop(){document.removeEventListener("visibilitychange",this.onVisibility),this.media?.removeEventListener?.("change",this.onMedia),this.media=void 0,this.observer?.disconnect(),this.observer=void 0,this.outOfView=!1}get state(){return eo({animate:this.animate,reducedMotion:this.reducedMotion,tabHidden:this.hiddenTab,offscreen:this.outOfView})}apply(){let e=this.state;this.host.dataset.motion!==e&&(this.host.dataset.motion=e)}};var no=["bleu","blanc","rouge"],qt=/tomorrow|demain/i,oo=/today|daily|jour|_day(_|$)/i,ro=/yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;function io(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&(e.attributes.device_class==="power"||e.attributes.unit_of_measurement==="W"))?.entity_id}function ao(t){return Object.values(t?.states??{}).find(e=>e.entity_id.startsWith("sensor.")&&/tempo/i.test(e.entity_id)&&!qt.test(e.entity_id)&&no.includes(String(e.state).toLowerCase()))?.entity_id}function ct(t,e,n){let r=e?t.entities?.[e]?.device_id:void 0;return r?Object.values(t.entities??{}).filter(o=>o.device_id===r&&o.entity_id.startsWith("sensor.")&&t.states[o.entity_id]).map(o=>o.entity_id).filter(o=>n(o,t.states[o].attributes.device_class)):[]}var St=t=>(e,n)=>n===t,$t=t=>t[0];function Xt(t,e,n){return(e&&t.states[e]?e:void 0)??$t(ct(t,n,St("power")))}function so(t,e){let n=t?.energy_sources??[],r={},o=n.filter(d=>d.type==="solar"),s=[...new Set(o.map(d=>Xt(e,d.stat_rate,d.stat_energy_from)).filter(d=>!!d))];s.length&&(r.production_entity=s.length===1?s[0]:s);let i=[...new Set(o.flatMap(d=>ct(e,d.stat_energy_from,(u,f)=>f==="energy"&&oo.test(u)&&!ro.test(u)&&!qt.test(u))))];if(i.length&&(r.daily_production_entities=i),o.some(d=>d.config_entry_solar_forecast?.length)){let d=Object.values(e.entities??{}).find(u=>u.entity_id.startsWith("sensor.")&&qt.test(u.entity_id)&&/forecast|solcast|production/i.test(`${u.platform} ${u.entity_id}`)&&e.states[u.entity_id]?.attributes.device_class==="energy")?.entity_id;d&&(r.forecast_tomorrow_entity=d)}let a=n.find(d=>d.type==="battery");if(a){let d=a.stat_energy_from??a.stat_energy_to,u=(a.stat_soc&&e.states[a.stat_soc]?a.stat_soc:void 0)??$t(ct(e,d,St("battery"))),f=a.power_config?.stat_rate??a.stat_rate,p=Xt(e,f,d),m=$t(ct(e,d,St("temperature"))),g={};u&&(g.soc_entity=u),p&&(g.power_entity=p),p&&f&&p===f&&(g.invert=!0),m&&(g.temperature_entity=m),Object.keys(g).length&&(r.battery=g)}let l=n.find(d=>d.type==="grid");if(l){let d=l.stat_energy_from??l.flow_from?.[0]?.stat_energy_from??l.stat_energy_to??l.flow_to?.[0]?.stat_energy_to,u=l.power_config?.stat_rate_inverted,f=l.power_config?.stat_rate??l.stat_rate??l.power?.[0]?.stat_rate,p={};if(u&&e.states[u])Object.assign(p,{power_entity:u,invert:!0});else{let g=Xt(e,f,d);g&&(p.power_entity=g)}let m=$t(ct(e,d,St("voltage")));m&&(p.voltage_entity=m),Object.keys(p).length&&(r.grid=p)}let c=n.find(d=>d.type==="home");return c?.stat_rate&&e.states[c.stat_rate]&&(r.consumption_entity=c.stat_rate),r}function Ie(t,e){let n=t?so(e,t):{},r=ao(t);return{production_entity:io(t)??"sensor.production_pv",...n,...r?{tariff_color_entity:r}:{},sun_entity:"sun.sun"}}async function De(t){try{return await t?.callWS?.({type:"energy/get_prefs"})}catch{return}}var rt=t=>typeof t=="object"&&t!==null&&typeof t.action=="string",ot=t=>t!==void 0&&t.action!=="none";function Ke(t,e){let n=t??{},r={entity:e};for(let o of["tap_action","hold_action","double_tap_action"])rt(n[o])&&(r[o]=n[o]);return r}function je(t){return t.toggle?!0:t.tap_action===void 0?!!t.entity:ot(t.tap_action)}function We(t,e,n){t.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0,composed:!0}))}function ut(t,e,n){if(n==="tap"&&e.toggle){e.toggle();return}let r=e[`${n}_action`];if(r===void 0){n==="tap"&&e.entity&&We(t,"hass-more-info",{entityId:e.entity});return}let{toggle:o,...s}=e;ot(r)&&We(t,"hass-action",{config:s,action:n})}var Yt=class{constructor(e,n,r){this.el=e;this.host=n;this.resolve=r;this.origin=null;this.holdFired=!1;this.path=[];e.addEventListener("pointerdown",o=>this.down(o)),e.addEventListener("pointermove",o=>this.move(o)),e.addEventListener("pointerup",()=>this.up()),e.addEventListener("pointercancel",()=>this.reset()),e.addEventListener("pointerleave",()=>this.reset()),e.addEventListener("keydown",o=>this.key(o)),e.addEventListener("contextmenu",o=>{ot(this.resolve(o.composedPath()).hold_action)&&o.preventDefault()})}config(){return this.resolve(this.path)}down(e){e.button===0&&(this.reset(),this.origin={x:e.clientX,y:e.clientY},this.path=e.composedPath(),this.holdFired=!1,ot(this.config().hold_action)&&(this.holdTimer=setTimeout(()=>{this.holdTimer=void 0,this.holdFired=!0,ut(this.host,this.config(),"hold")},500)))}move(e){if(!this.origin)return;let n=e.clientX-this.origin.x,r=e.clientY-this.origin.y;n*n+r*r>100&&this.reset()}up(){let e=this.origin!==null&&!this.holdFired;this.reset(),e&&this.tap()}reset(){this.origin=null,this.holdTimer!==void 0&&clearTimeout(this.holdTimer),this.holdTimer=void 0}tap(){let e=this.config();if(!ot(e.double_tap_action)){ut(this.host,e,"tap");return}if(this.pendingTap!==void 0){clearTimeout(this.pendingTap),this.pendingTap=void 0,ut(this.host,e,"double_tap");return}this.pendingTap=setTimeout(()=>{this.pendingTap=void 0,ut(this.host,this.config(),"tap")},250)}key(e){let n=e.target;if(!(n===this.el||n.dataset?.cellTarget!==void 0&&this.el.contains(n))||e.key!=="Enter"&&e.key!==" ")return;let o=this.resolve(e.composedPath());je(o)&&(e.preventDefault(),ut(this.host,o,"tap"))}},Ve=new WeakSet;function ze(t,e,n){Ve.has(t)||(Ve.add(t),new Yt(t,e,n))}function Ue(t,e){let n=je(e);n?(t.setAttribute("role","button"),t.tabIndex=0):(t.removeAttribute("role"),t.removeAttribute("tabindex")),t.style.cursor=n?"pointer":"";let r=ot(e.hold_action)?"none":"";t.style.userSelect=r,t.style.setProperty("-webkit-user-select",r),t.style.setProperty("-webkit-touch-callout",r)}var lo=[56,48,40],co=[44,40,36],Ge=[0,1,2],Jt=[0,1,2,3],te=[["solar",z.tomorrow],["grid",z.grid],["battery",z.battery],["home",z.consumption]],Qt=2*Math.PI*17;function _(t,e){let n=(document.documentElement.lang||navigator.language||"en").toLowerCase();return new Error(n.startsWith("fr")?t:e)}var uo=t=>t===void 0||Array.isArray(t)&&t.every(e=>typeof e=="string"),Zt=(t,e)=>e.split(".").reduce((n,r)=>n?.[r],t),Be=(t,e)=>`${t.slice(0,-1).join(", ")} ${e} ${t[t.length-1]}`,po=[["night_hero",["production","consumption","battery"]],["layout",["standard","side"]],["flow",["tap","always"]],["background",["tempo","solid","weather"]]],fo=[["power_threshold",{fr:"utilisez battery.power_threshold",en:"use battery.power_threshold"}],["battery.lock_entities",{fr:"utilisez battery.soc_reached_entities",en:"use battery.soc_reached_entities"}],["cell_tap",{fr:"chaque case prend son propre tap_action",en:"each cell takes its own tap_action"}]],Ye={solar:et.sun,grid:et.grid,battery:et.batt,consumption:et.use},ho=[[["battery.invert","grid.invert","expandable","animate"],t=>t===void 0||typeof t=="boolean","doit valoir true ou false","must be true or false"],[["daily_production_entities","battery.soc_reached_entities","grid.outage_states"],uo,"doit \xEAtre une liste","must be a list"],[["production_max","battery.power_threshold","consumer_threshold","stale_after"],t=>t===void 0||typeof t=="number"&&Number.isFinite(t)&&t>=0,"doit \xEAtre un nombre positif","must be a positive number"]];function go(t){if(!t||typeof t!="object")throw _("Configuration invalide","Invalid configuration");let e=t;for(let[o,s]of fo)if(Zt(e,o)!==void 0)throw _(`${o} n'existe plus : ${s.fr}`,`${o} is gone: ${s.en}`);let n=e.production_entity;if(!(typeof n=="string"?n.length>0:Array.isArray(n)&&n.length>0&&n.every(o=>typeof o=="string"&&o.length>0)))throw _("production_entity est obligatoire (une entit\xE9 ou une liste)","production_entity is required (one entity or a list)");for(let[o,s]of po){let i=Zt(e,o);if(i!==void 0&&!s.includes(i))throw _(`${o} : ${Be(s,"ou")}`,`${o}: ${Be(s,"or")}`)}for(let[o,s,i,a]of ho)for(let l of o)if(!s(Zt(e,l)))throw _(`${l} ${i}`,`${l} ${a}`);if(e.cells!==void 0){if(!Array.isArray(e.cells)||e.cells.length>st)throw _(`cells : une liste de ${st} cases au plus`,`cells: a list of at most ${st} cells`);for(let o of e.cells){let s=o&&typeof o=="object"?o:{};if(!(typeof o=="string"?at.includes(o):typeof s.entity=="string"&&!!s.entity||at.includes(s.type))){let a=String(typeof o=="object"?JSON.stringify(o):o);throw _(`cells : \xAB ${a} \xBB n'est ni ${at.join(", ")}, ni { type: \u2026 }, ni { entity: \u2026 }`,`cells: "${a}" is neither ${at.join(", ")}, { type: \u2026 } nor { entity: \u2026 }`)}if(s.tap_action!==void 0&&!rt(s.tap_action))throw _("cells : tap_action doit avoir une action (more-info, navigate, url\u2026)","cells: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.consumers!==void 0){if(!Array.isArray(e.consumers)||e.consumers.length>H)throw _(`consumers : une liste de ${H} appareils au plus`,`consumers: a list of at most ${H} appliances`);for(let o of e.consumers){let s=o&&typeof o=="object"?o:{};if(typeof s.entity!="string"||!s.entity)throw _("consumers : chaque appareil a une entity","consumers: each appliance needs an entity");if(s.tap_action!==void 0&&!rt(s.tap_action))throw _("consumers : tap_action doit avoir une action (more-info, navigate, url\u2026)","consumers: tap_action needs an action (more-info, navigate, url\u2026)")}}if(e.background_color!==void 0&&!Et(e.background_color))throw _("background_color : une couleur hexad\xE9cimale (#rrggbb)","background_color: a hex colour (#rrggbb)");if(e.flow_colors!==void 0){let o=e.flow_colors;if(!o||typeof o!="object"||Array.isArray(o))throw _("flow_colors : solar, grid, battery et consumption, chacun une couleur","flow_colors: solar, grid, battery and consumption, each a colour");for(let[s,i]of Object.entries(o))if(!(s in Ye)||typeof i!="string"||!i)throw _(`flow_colors.${s} : solar, grid, battery ou consumption, une couleur CSS`,`flow_colors.${s}: solar, grid, battery or consumption, a CSS colour`)}if(e.tariff_palettes!==void 0){let o=e.tariff_palettes;if(!o||typeof o!="object"||Array.isArray(o))throw _("tariff_palettes doit associer chaque couleur tarifaire \xE0 3 couleurs","tariff_palettes must map each tariff to 3 colours");for(let[s,i]of Object.entries(o))if(!Array.isArray(i)||i.length!==3||!i.every(Et))throw _(`tariff_palettes.${s} : 3 couleurs hexad\xE9cimales attendues (#rrggbb)`,`tariff_palettes.${s}: expected 3 hex colours (#rrggbb)`)}return e.expandable===!0&&e.flow===void 0?{...e,flow:"tap"}:e}var ee=class extends HTMLElement{constructor(){super();this.renderedKey="";this.motion=new At(this);this.actions={};this.cellTargets=new Map;this.open=!1;this.flowWidth=0;this.weatherDrawn="";this.shownConsumers=[];this.fitted="";this.form=0;this.shortContext=!1;this.root=this.attachShadow({mode:"open"})}setConfig(n){this.config=go(n),this.build(),this.open=!1,this.removeAttribute("data-expanded"),this.config.flow==="always"&&(this.expanded=!0),this.renderedKey="",this.removeAttribute("data-ready"),this.motion.setAnimate(this.config.animate!==!1),this._hass&&this.update()}connectedCallback(){this.motion.start(),this.staleTimer??(this.staleTimer=setInterval(()=>this.markStale(),6e4)),this.refs&&this.resizeObserver&&this.resizeObserver.observe(this.refs.card),this.fit(),document.fonts?.ready?.then(()=>this.fit())}disconnectedCallback(){this.motion.stop(),clearInterval(this.staleTimer),this.staleTimer=void 0,this.resizeObserver?.disconnect(),this.readyFrame!==void 0&&cancelAnimationFrame(this.readyFrame),this.readyFrame=void 0}get expanded(){return this.open}set expanded(n){let r=this.config?.flow,o=r==="always"||n&&r==="tap";o===this.open&&this.hasAttribute("data-expanded")===o||(this.open=o,this.toggleAttribute("data-expanded",o),this.refs?.flow&&(this.refs.flow.panel.hidden=!o),r==="tap"&&this.refs?.heroValue.parentElement?.setAttribute("aria-expanded",String(o)),this.fit())}get side(){return this.config?.layout==="side"}get motionState(){return this.motion.state}set hass(n){this._hass=n,this.update()}get hass(){return this._hass}build(){let n=this.config,r=Pt(n);this.side?this.setAttribute("data-layout","side"):this.removeAttribute("data-layout"),b(this,"data-flow",n.flow??null);for(let[i,a]of Object.entries(Ye)){let l=n.flow_colors?.[i];l?this.style.setProperty(a,l):this.style.removeProperty(a)}this.flowWidth=0,this.weatherDrawn="",this.shownConsumers=[],this.fitted="",this.root.innerHTML=`
            <style>${He}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${mo()}</div>
                    <div class="layer night">${Ne()}</div>
                    ${n.background==="weather"?'<div class="wx"></div>':""}
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
                ${n.flow?yo(n.consumers?.length??0):""}
            </ha-card>`;let o=(i,a=this.root)=>pt(a,i);this.refs={card:o("ha-card"),flow:n.flow?this.flowRefs():void 0,heroValue:o(".hero-value"),heroUnit:o(".hero-unit"),context:o(".context"),contextText:o(".context-text"),metrics:new Map(r.map(i=>{let a=o(`[data-metric="${i.key}"]`),l=o("ha-icon",a);return l.setAttribute("icon",i.kind==="custom"?i.custom.icon||Ht:z[i.kind]),[i.key,{el:a,icon:l,label:o(".label-text",a),value:o(".value-main",a),extra:o(".extra",a),entity:Nt(n,i)}]}))},this.actions=Ke(n,U(n)[0]);let s=n.tap_action===void 0;if(this.cellTargets=new Map(r.flatMap(i=>{let a=Nt(n,i),l=rt(i.tapAction)?i.tapAction:void 0;return l?[[i.key,{entity:a,tap:l}]]:s&&a?[[i.key,{entity:a}]]:[]})),n.flow==="tap"){let i=this.refs.heroValue.parentElement;for(let a of[i,this.refs.context,this.refs.flow.panel])a.dataset.cellTarget="",a.dataset.targetKey="toggle";i.setAttribute("role","button"),i.tabIndex=0,i.setAttribute("aria-controls","esc-flow"),i.setAttribute("aria-expanded","false")}if(n.flow){for(let[i]of te){let a=kt(n,i);if(!a)continue;this.cellTargets.set(`node:${i}`,{entity:a});let l=this.refs.flow.nodes.get(i).el;l.dataset.cellTarget="",l.setAttribute("role","button"),l.tabIndex=0}(n.consumers??[]).forEach((i,a)=>{let l=rt(i.tap_action)?i.tap_action:void 0;this.cellTargets.set(`consumer:${a}`,{entity:i.entity,tap:l});let c=this.refs.flow.consumers[a].el;c.dataset.cellTarget="",l?.action!=="none"&&(c.setAttribute("role","button"),c.tabIndex=0)})}for(let[i,a]of this.cellTargets){if(i.includes(":"))continue;let l=o(`[data-metric="${i}"]`);l.dataset.cellTarget="",a.tap?.action!=="none"&&(l.setAttribute("role","button"),l.tabIndex=0,l.style.cursor="pointer")}ze(this.refs.card,this,i=>this.actionsFor(i)),Ue(this.refs.card,this.actions),this.resizeObserver?.disconnect(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>this.fit()),this.resizeObserver.observe(this.refs.card))}actionsFor(n){let r=n.find(l=>l instanceof HTMLElement&&l.dataset.cellTarget!==void 0);if(r?.dataset.targetKey==="toggle")return{...this.actions,toggle:()=>{this.expanded=!this.open}};let o=r?.dataset.node?`node:${r.dataset.node}`:r?.dataset.consumer?`consumer:${r.dataset.consumer}`:r?.dataset.metric??"",s=r?this.cellTargets.get(o):void 0;if(!s)return this.actions;let{tap_action:i,...a}=this.actions;return{...a,entity:s.entity??this.actions.entity,...s.tap?{tap_action:s.tap}:{}}}fit(){this.fitLayout(),this.layoutFlow(),this.clearText()}layoutFlow(){let n=this.refs?.flow;if(!n||n.panel.hidden)return;let r=Math.round(n.box.clientWidth);if(!r||r===this.flowWidth)return;this.flowWidth=r;let o=this.shownConsumers,s=Me(r,o.length);n.svg.setAttribute("viewBox",`0 0 ${r} ${s.height}`),n.box.style.setProperty("--esc-flow-h",`${s.height}px`),n.box.style.setProperty("--esc-node-w",`${s.nodeWidth}px`),n.box.style.setProperty("--esc-centre-w",`${s.centreWidth}px`),n.box.toggleAttribute("data-narrow",s.nodeWidth<112);for(let[i,a]of n.wires)for(let l of a.paths)l.setAttribute("d",s.paths[i]);n.box.toggleAttribute("data-compact",s.consumers.some(i=>i.compact)),n.consumers.forEach(({el:i,wire:a,paths:l},c)=>{let d=o.indexOf(c),u=s.consumers[d];if(i.hidden=!u?.visible,b(a,"data-off",u?.visible?null:""),!!u?.visible){i.dataset.side=u.below?"below":"above",Object.assign(i.style,{left:`${u.left}px`,top:`${u.top}px`,width:`${u.width}px`}),a.style.setProperty("--esc-flow",`esc-flow-c${d}`);for(let f of l)f.setAttribute("d",u.path)}}),n.keyframes.textContent=s.keyframes}flowRefs(){let n=(r,o=this.root)=>pt(o,r);return{panel:n(".panel"),box:n(".flow"),svg:n(".wires"),keyframes:n("style.flow-keyframes"),wires:new Map(N.map(r=>{let o=n(`[data-wire="${r}"]`);return[r,{g:o,paths:[...o.querySelectorAll("path")]}]})),nodes:new Map(te.map(([r])=>[r,Xe(n(`[data-node="${r}"]`))])),consumers:[...this.root.querySelectorAll("[data-consumer]")].map((r,o)=>{let s=n(`[data-wire="c${o}"]`);return{...Xe(r),icon:n("ha-icon",r),wire:s,paths:[...s.querySelectorAll("path")]}})}}updateFlow(){let n=this.refs?.flow;if(!n)return;let r=Le(this.config,this._hass);for(let[s,i]of n.nodes){let a=r.nodes[s];i.el.hidden===a.present&&(i.el.hidden=!a.present),S(i.label,a.label),S(i.value,a.value),S(i.centre,a.centre??""),i.el.toggleAttribute("data-centre",a.centre!==void 0),i.el.toggleAttribute("data-alert",!!a.alert),qe(i.segs,a.ring)}r.consumers.forEach((s,i)=>{let a=n.consumers[i];a&&(S(a.label,s.label),b(a.el,"title",s.label),b(a.el,"aria-label",`${s.label} ${s.value}`),S(a.value,s.value),b(a.icon,"icon",s.icon),a.el.toggleAttribute("data-idle",s.level===0),qe(a.segs,[[s.share,"use"]]),b(a.wire,"data-level",String(s.level)),s.shown||(a.el.hidden=!0,b(a.wire,"data-off","")))});let o=r.consumers.flatMap((s,i)=>s.shown?[i]:[]);o.join()!==this.shownConsumers.join()&&(this.shownConsumers=o,this.flowWidth=0,this.layoutFlow());for(let[s,i]of n.wires)b(i.g,"data-level",String(r.levels[s])),b(i.g,"data-off",r.off.includes(s)?"":null)}textBoxes(){let n=this.root,r=[...n.querySelectorAll(".hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra")].map(s=>s.getBoundingClientRect()),o=n.querySelector(".grid")?.getBoundingClientRect();return o&&this.side?r.push({left:o.left-1,right:o.left+1,top:o.top,bottom:o.bottom}):o&&r.push({left:o.left,right:o.right,top:o.top-1,bottom:o.top+1}),r.filter(s=>s.right>s.left&&s.bottom>s.top)}clearText(){let n=this.refs?.card;if(!n)return;let r=n.getBoundingClientRect();if(!r.width||!r.height)return;let o=this.textBoxes();for(let s of n.querySelectorAll(".star")){let i=r.left+parseFloat(s.style.left)/100*r.width,a=r.top+parseFloat(s.style.top)/100*r.height,l=Fe(i,a,Number(s.dataset.reach),o);s.hidden!==l&&(s.hidden=l)}}writeForms(n){this.form=n,b(this,"data-form",n?String(n):null);for(let r of this.view?.metrics??[]){let o=this.refs?.metrics.get(r.key);if(!o)continue;let{value:s,extra:i}=pe(r,n);S(o.value,s),S(o.extra,i)}}writeContext(n){this.shortContext=n,this.toggleAttribute("data-short-context",n),this.refs&&S(this.refs.contextText,(n?this.view?.contextShort:void 0)??this.view?.context??"")}fitLayout(){let n=this.refs;if(!n)return;let r=this.side,o=n.card.querySelector(".content"),s=n.heroValue.parentElement,i=n.context,a=[...n.metrics.values()].map(m=>m.value.parentElement),l=m=>m.scrollWidth>m.clientWidth+1,c=()=>parseFloat(getComputedStyle(i).lineHeight)||20,d=()=>!i.hidden&&(l(i)||i.scrollHeight>c()+1),u=m=>!l(s)&&!l(o)&&o.scrollHeight<=o.clientHeight+1&&(!m||(r?!d():!a.some(l))),f=r?co:lo,p=(m,g)=>{for(let T of[!1,!0]){this.toggleAttribute("data-compact",T);for(let h of g){this.writeForms(h);for(let v of f)if(b(this,"data-hero",v===f[0]?null:String(v)),u(m))return!0}}return!1};if(this.writeContext(!1),!r){p(!0,Ge)||p(!1,Ge.slice(-1)),this.writeContext(!i.hidden&&l(i));return}p(!0,Jt)||(this.writeContext(!0),!p(!0,Jt)&&(this.writeContext(!1),p(!1,Jt),this.writeContext(!i.hidden&&i.scrollHeight>i.clientHeight+1)))}stateKey(n){let r=me(this.config);return[gt(n),n.locale?.number_format??"",...r.map(o=>n.states[o]?.last_updated??"-")].join("|")}update(){if(!this.config||!this.refs||!this._hass)return;let n=this.stateKey(this._hass);if(n===this.renderedKey)return;this.renderedKey=n;let r=this.view=ye(this.config,this._hass),o=this.refs;this.paintSky(),S(o.heroValue,r.hero.value),S(o.heroUnit,r.hero.unit),o.context.hidden=r.context===void 0;for(let i of r.metrics){let a=o.metrics.get(i.key);a&&(S(a.label,i.label),this.side&&a.el.title!==i.label&&(a.el.title=i.label),i.icon&&a.icon.getAttribute("icon")!==i.icon&&a.icon.setAttribute("icon",i.icon))}this.writeForms(this.form),this.writeContext(this.shortContext),this.updateFlow(),this.markStale();let s=JSON.stringify([r.hero,r.context,r.metrics.map(i=>[i.value,i.extra,i.tight,i.bare])]);s!==this.fitted&&(this.fitted=s,this.fit())}markStale(){if(!this.config||!this.refs||!this._hass)return;let n=ge(this.config,this._hass),r=gt(this._hass),o=a=>a<120?`${a} min`:`${Math.floor(a/60)} h`,s=a=>{let l=a===void 0?void 0:n.get(a);return l===void 0?void 0:y(r,"stale",{age:o(l)})};for(let a of this.view?.metrics??[]){let l=this.refs.metrics.get(a.key);if(!l)continue;let c=s(l.entity);l.el.toggleAttribute("data-stale",!!c);let d=c?"mdi:clock-alert-outline":a.icon??l.icon.dataset.icon;l.icon.dataset.icon||(l.icon.dataset.icon=l.icon.getAttribute("icon")??""),d&&l.icon.getAttribute("icon")!==d&&l.icon.setAttribute("icon",d);let u=[this.side?a.label:"",c??""].filter(Boolean).join(" \xB7 ");b(l.el,"title",u||null)}let i=this.refs.flow;if(i){for(let[a,l]of i.nodes){let c=s(kt(this.config,a));l.el.toggleAttribute("data-stale",!!c),b(l.el,"title",c??null)}(this.config.consumers??[]).forEach((a,l)=>{let c=i.consumers[l];if(!c)return;let d=s(a.entity);c.el.toggleAttribute("data-stale",!!d);let u=c.label.textContent??"";b(c.el,"title",d?`${u} \xB7 ${d}`:u)})}}paintSky(){let n=Ae(this.config,this._hass),r=this.refs.card;this.dataset.mode=n.mode,this.toggleAttribute("data-producing",n.producing),n.palette.forEach((i,a)=>r.style.setProperty(`--esc-c${a}`,i)),n.nightPalette.forEach((i,a)=>r.style.setProperty(`--esc-n${a}`,i)),r.style.setProperty("--esc-halo-alpha",String(n.haloAlpha)),this.dataset.sky=n.sky;let o=n.weather?Z[n.weather]:void 0;b(this,"data-stars",o?o.stars:null),r.style.setProperty("--esc-cloud-a",String(o?n.mode==="night"?o.nightCloudAlpha:o.cloudAlpha:0));let s=this.root.querySelector(".wx");s&&n.weather&&n.weather!==this.weatherDrawn&&(this.weatherDrawn=n.weather,s.innerHTML=Pe(n.weather)),!this.hasAttribute("data-ready")&&this.readyFrame===void 0&&(this.readyFrame=requestAnimationFrame(()=>{this.readyFrame=void 0,this.setAttribute("data-ready","")}))}getGridOptions(){return this.config?.flow?{columns:12,rows:"auto",min_columns:6}:this.side?{columns:12,rows:2,min_columns:6,min_rows:2}:{columns:12,rows:4,min_columns:6,min_rows:3}}getCardSize(){return this.side?2:4}static async getStubConfig(n){return Ie(n,await De(n))}static async getConfigElement(){return customElements.get(j)||await ie(),document.createElement(j)}};function mo(){return ve.map(t=>`<div class="drift" style="animation-duration:${t.period}s;animation-delay:-${t.delay}s"><i class="cloud" style="width:${t.width}%;height:${t.height}%;top:${t.top}%;left:${(100-t.width)/2}%"></i></div>`).join("")}function yo(t){let e=[1,2,3].map(a=>`<g class="comet c${a}"><circle r="2.5"></circle></g>`).join(""),r=["gb","bg",...N.filter(a=>a!=="gb"&&a!=="bg")].map(a=>`<g class="wire ${Ut[a]}" data-wire="${a}" data-level="0">${a==="sh"?'<path class="gap"></path>':""}<path class="glow"></path><path class="line"></path>${e}</g>`).join(""),o=Array.from({length:t},(a,l)=>`<g class="wire use" data-wire="c${l}" data-level="0"><path class="glow"></path><path class="line"></path>${e}</g>`).join(""),s=(a,l)=>`
        <div class="node" ${a}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${l?` icon="${l}"`:""}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`,i=te.map(([a,l])=>s(`data-node="${a}"`,l)).join("")+Array.from({length:t},(a,l)=>s(`data-consumer="${l}"`,"")).join("");return`<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${dt}">${o}${r}</svg>${i}</div></div>`}function Xe(t){return{el:t,label:pt(t,".nlab"),value:pt(t,".nval"),centre:pt(t,".centre"),segs:[...t.querySelectorAll(".seg")]}}function qe(t,e){let n=0;t.forEach((r,o)=>{let s=e[o],i=s?Math.max(Qt*s[0]-(e.length>1?3:0),0):0;b(r,"stroke-dasharray",`${i.toFixed(1)} ${Qt.toFixed(1)}`),b(r,"stroke-dashoffset",(-n).toFixed(1)),b(r,"data-source",s&&i>=1.5?s[1]:""),s&&(n+=Qt*s[0])})}function pt(t,e){return t.querySelector(e)}function b(t,e,n){n===null?t.hasAttribute(e)&&t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function S(t,e){t.textContent!==e&&(t.textContent=e)}customElements.get(K)||(customElements.define(K,ee),window.customCards=window.customCards||[],window.customCards.push({type:K,name:Lt,description:ne,preview:!0,documentationURL:oe}));window.energySkyCardBannerShown||(window.energySkyCardBannerShown=!0,console.info(`%c ${Lt} %c ${re} `,"color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px","color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0"));})();
