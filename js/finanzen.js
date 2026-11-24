/* finanzen.js – Buchungen, Kategorien, Monatsübersicht, Sparziele, Abos */
S.fin=S.fin||[];S.goals=S.goals||[];S.subs=S.subs||[];
let mo=ymd(new Date()).slice(0,7);
const eur=n=>n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const num=v=>parseFloat(String(v).replace(",","."));
const CO=["Essen","Freizeit","Mobilität","Shopping","Schule","Abos","Sonstiges"],CI=["Taschengeld","Gehalt","Geschenk","Sonstiges"];
const addMo=(m,n)=>{const d=new Date(m+"-01T00:00:00");d.setMonth(d.getMonth()+n);return ymd(d).slice(0,7)};
const mlab=m=>new Date(m+"-01T00:00:00").toLocaleDateString("de-DE",{month:"long",year:"numeric"});
const tot=(m,k)=>S.fin.filter(x=>x.d.startsWith(m)&&x.k===k).reduce((s,x)=>s+x.a,0);

function cats(){$("fc").innerHTML=($("ft").value==="out"?CO:CI).map(c=>`<option>${c}</option>`).join("")}
$("ft").onchange=cats;

function fin(){$("fmt").textContent="Finanzen – "+mlab(mo);
 const i=tot(mo,"in"),o=tot(mo,"out");$("fi").textContent=eur(i);$("fo").textContent=eur(o);
 $("fs").textContent=eur(i-o);$("fs").className="big "+(i-o>=0?"pos":"neg");
 const L=S.fin.map((x,n)=>({...x,n})).filter(x=>x.d.startsWith(mo)).sort((a,b)=>b.d.localeCompare(a.d));
 $("fl").innerHTML=L.map(x=>`<div class="ev"><b style="min-width:55px">${new Date(x.d+"T00:00:00").toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</b><span style="flex:1">${esc(x.c)}${x.t?" – "+esc(x.t):""}</span><span class="${x.k==="in"?"pos":"neg"}">${x.k==="in"?"+":"−"}${eur(x.a)}</span><button class="x" onclick="fx(${x.n})">×</button></div>`).join("")||'<p class="muted">Keine Buchungen in diesem Monat.</p>';
 const by={};S.fin.filter(x=>x.d.startsWith(mo)&&x.k==="out").forEach(x=>by[x.c]=(by[x.c]||0)+x.a);
 const mx=Math.max(1,...Object.values(by));
 $("fcat").innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="hb"><span>${esc(c)}</span><div class="bar"><i style="width:${v/mx*100}%"></i></div><b style="min-width:80px;text-align:right">${eur(v)}</b></div>`).join("")||'<p class="muted">Noch keine Ausgaben.</p>';
 const ms=[...Array(6)].map((_,k)=>addMo(mo,k-5)),vals=ms.map(m=>[tot(m,"in"),tot(m,"out")]),top=Math.max(1,...vals.flat()),w=292/6;
 $("fch").innerHTML=`<svg viewBox="0 0 320 140" style="width:100%">${ms.map((m,k)=>{const x=14+k*w,h1=vals[k][0]/top*95,h2=vals[k][1]/top*95;
  return `<rect x="${x+6}" y="${110-h1}" width="${w/2-7}" height="${h1}" rx="3" fill="#4ade80"/><rect x="${x+w/2}" y="${110-h2}" width="${w/2-7}" height="${h2}" rx="3" fill="#a45cff"/><text x="${x+w/2}" y="128" text-anchor="middle" font-size="10" fill="#8f86a6">${new Date(m+"-01T00:00:00").toLocaleDateString("de-DE",{month:"short"})}</text>`}).join("")}</svg><p class="muted"><span style="color:#4ade80">●</span> Einnahmen &nbsp; <span style="color:#a45cff">●</span> Ausgaben</p>`}
window.fx=n=>{S.fin.splice(n,1);save();fin()};
$("fadd").onclick=()=>{const a=num($("fa").value);if(!(a>0))return;S.fin.push({d:$("fd").value||ymd(new Date()),a,k:$("ft").value,c:$("fc").value,t:$("fn").value.trim()});$("fa").value=$("fn").value="";save();fin()};
$("fprev").onclick=()=>{mo=addMo(mo,-1);fin()};$("fnext").onclick=()=>{mo=addMo(mo,1);fin()};

function goals(){$("gl").innerHTML=S.goals.map((g,i)=>{const p=Math.min(100,g.s/g.t*100);
 return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(g.n)}</b><span class="muted">${eur(g.s)} / ${eur(g.t)}</span></div><div class="bar"><i style="width:${p}%"></i></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="muted">${Math.round(p)} %</span><span><button class="btn" style="padding:3px 10px;font-size:.75rem" onclick="gp(${i})">+ einzahlen</button> <button class="x" onclick="gx(${i})">×</button></span></div></div>`}).join("")||'<p class="muted">Noch keine Sparziele.</p>'}
window.gp=i=>{const v=num(prompt("Wie viel möchtest du einzahlen (€)?")||"");if(v>0){S.goals[i].s+=v;save();goals()}};
window.gx=i=>{S.goals.splice(i,1);save();goals()};
$("ga").onclick=()=>{const t=num($("gt").value),n=$("gn").value.trim();if(!n||!(t>0))return;S.goals.push({n,t,s:0});$("gn").value=$("gt").value="";save();goals()};

function subs(){$("sl").innerHTML=S.subs.map((s,i)=>`<div class="ev"><span style="flex:1">${esc(s.n)}</span><span class="muted">${eur(s.a)} ${s.i==="y"?"/ Jahr":"/ Monat"}</span><button class="x" onclick="sx(${i})">×</button></div>`).join("")||'<p class="muted">Keine Abos eingetragen.</p>';
 const m=S.subs.reduce((s,x)=>s+(x.i==="y"?x.a/12:x.a),0);
 $("ssum").innerHTML=S.subs.length?`Zusammen: <b>${eur(m)}</b> pro Monat · <b>${eur(m*12)}</b> pro Jahr`:""}
window.sx=i=>{S.subs.splice(i,1);save();subs()};
$("sadd").onclick=()=>{const a=num($("sa").value),n=$("sn").value.trim();if(!n||!(a>0))return;S.subs.push({n,a,i:$("si").value});$("sn").value=$("sa").value="";save();subs()};

cats();
onRender(()=>{S.fin=S.fin||[];S.goals=S.goals||[];S.subs=S.subs||[];fin();goals();subs()});
