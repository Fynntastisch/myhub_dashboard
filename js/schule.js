/* schule.js – Stundenplan, Hausaufgaben, Klausuren, Noten, Karteikarten */
const DAYS=["Mo","Di","Mi","Do","Fr"];
const fmt1=x=>x.toFixed(2).replace(".",",");
const add=(id,fn)=>{$(id).onclick=fn};

/* Stundenplan */
function tt(){if(!S.ttTimes||S.ttTimes.length!==8)S.ttTimes=DEFT.slice();
 $("tt").innerHTML="<tr><th></th>"+DAYS.map(d=>`<th>${d}</th>`).join("")+"</tr>"+S.ttTimes.map((t,r)=>`<tr><td><input data-t="${r}" value="${esc(t)}" style="width:125px"></td>`+DAYS.map((_,c)=>`<td><input data-k="${r}-${c}" value="${esc(S.tt[r+"-"+c]||"")}"></td>`).join("")+"</tr>").join("")}
$("tt").oninput=e=>{const d=e.target.dataset;if(d.k!==undefined)S.tt[d.k]=e.target.value;else if(d.t!==undefined)S.ttTimes[d.t]=e.target.value;save()};

/* Hausaufgaben */
function hw(){const L=S.hw.map((h,i)=>({...h,i})).sort((a,b)=>(a.done-b.done)||(a.d||"9").localeCompare(b.d||"9"));
 $("hwl").innerHTML=L.map(h=>`<li class="row ${h.done?"done":""}"><input type="checkbox" ${h.done?"checked":""} onchange="hwt(${h.i})"><span><b>${esc(h.s)}</b> ${esc(h.t)}</span><small class="muted">${h.d?dl(daysTo(h.d)):""}</small><button class="x" onclick="hwx(${h.i})">×</button></li>`).join("")||'<p class="muted">Keine Hausaufgaben 🎉</p>'}
window.hwt=i=>{S.hw[i].done=!S.hw[i].done;save();hw()};window.hwx=i=>{S.hw.splice(i,1);save();hw()};
add("hwa",()=>{const t=$("hwt").value.trim();if(!t)return;S.hw.push({s:$("hws").value.trim(),t,d:$("hwd").value,done:false});$("hwt").value="";save();hw()});

/* Klausuren */
function ex(){const L=S.exams.map((e,i)=>({...e,i})).sort((a,b)=>a.d.localeCompare(b.d));
 $("exl").innerHTML=L.map(e=>{const n=daysTo(e.d);return `<div class="ev" style="${n<0?"opacity:.45":""}"><b>${new Date(e.d).toLocaleDateString("de-DE",{day:"2-digit",month:"short"})}</b><span style="flex:1">${esc(e.s)}${e.t?" – "+esc(e.t):""}</span><small class="muted">${n<0?"vorbei":dl(n)}</small><button class="x" onclick="exx(${e.i})">×</button></div>`}).join("")||'<p class="muted">Keine Klausuren eingetragen.</p>'}
window.exx=i=>{S.exams.splice(i,1);save();ex()};
add("exa",()=>{if(!$("exs").value.trim()||!$("exd").value)return;S.exams.push({s:$("exs").value.trim(),d:$("exd").value,t:$("ext").value.trim()});$("ext").value="";save();ex()});

/* Noten: Durchschnitt pro Fach (gewichtet) und gesamt */
function gr(){const g={};S.grades.forEach((x,i)=>(g[x.s]=g[x.s]||[]).push({...x,i}));
 const avgs=[];
 $("grl").innerHTML=Object.keys(g).sort().map(f=>{const a=g[f].reduce((s,x)=>s+x.n*x.w,0)/g[f].reduce((s,x)=>s+x.w,0);avgs.push(a);
  return `<div class="ev"><b>${esc(f)}</b><span>Ø ${fmt1(a)} · ${g[f].map(x=>`<span class="gr">${String(x.n).replace(".",",")}${x.w>1?"²":""}<button class="x" onclick="grx(${x.i})">×</button></span>`).join("")}</span></div>`}).join("")||'<p class="muted">Noch keine Noten.</p>';
 $("gro").textContent=avgs.length?"Gesamtdurchschnitt: "+fmt1(avgs.reduce((s,x)=>s+x,0)/avgs.length)+" (Mittel der Fächer, ² = doppelt gewertet)":""}
window.grx=i=>{S.grades.splice(i,1);save();gr()};
add("gra",()=>{const n=parseFloat($("grn").value.replace(",","."));const f=$("grs").value.trim();if(!f||!(n>=1&&n<=6))return;S.grades.push({s:f,n,w:+$("grw").value});$("grn").value="";save();gr()});

/* Karteikarten */
let kcur=-1,kshow=false;
function kc(){const c=S.cards;if(!c.length){$("kc").innerHTML='<p class="muted">Noch keine Karten – lege unten die erste an.</p>';return}
 if(kcur<0||kcur>=c.length)kcur=Math.floor(Math.random()*c.length);const k=c[kcur];
 $("kc").innerHTML=`<div class="kbox"><div class="big" style="font-size:1.15rem">${esc(k.q)}</div>${kshow?`<p style="color:var(--p);margin-top:10px">${esc(k.a)}</p>`:""}</div><div class="add" style="margin-bottom:14px"><button class="btn" id="ksh">${kshow?"Verbergen":"Antwort zeigen"}</button><button class="btn" id="knx">Nächste</button><button class="x" id="kdl" title="Karte löschen">🗑</button><small class="muted" style="align-self:center">${c.length} Karten</small></div>`;
 $("ksh").onclick=()=>{kshow=!kshow;kc()};
 $("knx").onclick=()=>{kshow=false;kcur=Math.floor(Math.random()*c.length);kc()};
 $("kdl").onclick=()=>{S.cards.splice(kcur,1);kcur=-1;kshow=false;save();kc()}}
add("kadd",()=>{const q=$("kq").value.trim(),a=$("ka").value.trim();if(!q||!a)return;S.cards.push({q,a});$("kq").value=$("ka").value="";save();kc()});

onRender(()=>{tt();hw();ex();gr();kc()});
