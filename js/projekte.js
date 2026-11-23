/* projekte.js – Projektübersicht mit Aufgaben (Board und Liste) */
let cur=-1,view="board",tc=-1;
const ST=["Zu erledigen","In Arbeit","Erledigt"],PR=["Niedrig","Mittel","Hoch"],PC=["#9ca3af","#facc15","#f87171"];
const P=()=>S.projects[cur];
const pct=p=>{const t=p.tasks||[];return t.length?Math.round(t.filter(x=>x.st===2).length/t.length*100):(p.p||0)};

function projects(){
 if(cur>=0&&S.projects[cur]){detail();return}
 cur=-1;$("pwrap").style.display="";$("pv").style.display="none";
 $("pl").innerHTML=S.projects.map((p,i)=>{const t=p.tasks||[],d=t.filter(x=>x.st===2).length;
  return `<div class="card pj" style="cursor:pointer" onclick="po(${i})"><h2>${esc(p.n)}</h2><p>${esc(p.d||"")}</p><div class="bar"><i style="width:${pct(p)}%"></i></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="muted">${t.length?d+"/"+t.length+" Aufgaben":"Noch keine Aufgaben"} · ${pct(p)}%</span><button class="x" onclick="event.stopPropagation();pdl(${i})">×</button></div></div>`}).join("")||'<p class="muted">Noch keine Projekte.</p>'}
window.po=i=>{cur=i;projects()};
window.pdl=i=>{if(!confirm("Projekt samt Aufgaben löschen?"))return;S.projects.splice(i,1);save();projects()};
$("padd").onclick=()=>{const n=$("pn").value.trim();if(!n)return;S.projects.push({n,d:$("pd").value,p:0,tasks:[]});$("pn").value=$("pd").value="";save();projects()};

/* Aufgaben-Darstellung */
const badges=x=>`<span class="bg" style="--c:${PC[x.pr]}">${PR[x.pr]}</span>`+(x.d?`<span class="bg" style="${daysTo(x.d)<0&&x.st!==2?"--c:#f87171":""}">📅 ${new Date(x.d).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</span>`:"")+(x.l?`<span class="bg" style="--c:#a45cff">${esc(x.l)}</span>`:"")+(x.cl.length?`<span class="bg">☑ ${x.cl.filter(c=>c.done).length}/${x.cl.length}</span>`:"");
const card=(x,i)=>`<div class="tk" draggable="true" data-i="${i}"><b>${esc(x.t)}</b>${badges(x)}</div>`;
const row=(x,i)=>`<li class="row tr ${x.st===2?"done":""}" data-i="${i}"><input type="checkbox" ${x.st===2?"checked":""} onchange="tdn(${i})"><span>${esc(x.t)}</span><div>${badges(x)}</div></li>`;
window.tdn=i=>{const x=P().tasks[i];x.st=x.st===2?0:2;save();detail()};

function detail(){
 const p=P(),t=(p.tasks=p.tasks||[]);t.forEach(x=>{x.cl=x.cl||[];x.pr=x.pr??1;x.st=x.st??0});
 $("pwrap").style.display="none";$("pv").style.display="block";
 $("pv").innerHTML=`<div class="top"><div style="display:flex;gap:12px;align-items:center"><button class="btn" id="pb" style="background:none;border:1px solid var(--line);box-shadow:none">←</button><h1>${esc(p.n)}</h1></div><div class="ntabs vt" style="margin:0"><button id="vb" class="${view==="board"?"on":""}">Board</button><button id="vl" class="${view==="list"?"on":""}">Liste</button></div></div>
 <div class="card" style="margin-bottom:18px"><div class="add" style="margin:0"><input id="tn" placeholder="Neue Aufgabe …"><button class="btn" id="ta">Hinzufügen</button></div></div>
 <div id="board" class="kb" style="${view==="board"?"":"display:none"}">${[0,1,2].map(s=>`<div class="kcol" data-s="${s}"><h3>${ST[s]} <span>${t.filter(x=>x.st===s).length}</span></h3>${t.map((x,i)=>x.st===s?card(x,i):"").join("")}</div>`).join("")}</div>
 <div id="plist" class="card" style="${view==="list"?"":"display:none"}"><ul>${t.map(row).join("")||'<p class="muted">Noch keine Aufgaben.</p>'}</ul></div>`;
 const v=$("pv");
 $("pb").onclick=()=>{cur=-1;projects()};
 $("vb").onclick=()=>{view="board";detail()};$("vl").onclick=()=>{view="list";detail()};
 const addT=()=>{const s=$("tn").value.trim();if(!s)return;t.push({t:s,st:0,pr:1,d:"",l:"",n:"",cl:[]});save();detail()};
 $("ta").onclick=addT;$("tn").onkeydown=e=>{if(e.key==="Enter")addT()};
 v.querySelectorAll(".tk,.tr").forEach(el=>el.onclick=e=>{if(e.target.closest("input"))return;openT(+el.dataset.i)});
 v.querySelectorAll(".tk").forEach(el=>el.ondragstart=e=>e.dataTransfer.setData("text/plain",el.dataset.i));
 v.querySelectorAll(".kcol").forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add("over")};c.ondragleave=()=>c.classList.remove("over");
  c.ondrop=e=>{e.preventDefault();const i=+e.dataTransfer.getData("text/plain");if(t[i]){t[i].st=+c.dataset.s;save();detail()}}})}

/* Aufgaben-Fenster */
function openT(i){tc=i;const x=P().tasks[i];$("mt").value=x.t;$("ms").value=x.st;$("mp").value=x.pr;$("md").value=x.d||"";$("ml").value=x.l||"";$("mn").value=x.n||"";cl();$("tm").style.display="flex"}
function cl(){const x=P().tasks[tc];$("mcl").innerHTML=x.cl.map((c,j)=>`<li class="row ${c.done?"done":""}"><input type="checkbox" ${c.done?"checked":""} onchange="cck(${j})"><span>${esc(c.t)}</span><button class="x" onclick="ccx(${j})">×</button></li>`).join("")}
window.cck=j=>{const c=P().tasks[tc].cl[j];c.done=!c.done;save();cl()};
window.ccx=j=>{P().tasks[tc].cl.splice(j,1);save();cl()};
$("mca").onclick=()=>{const v=$("mci").value.trim();if(!v)return;P().tasks[tc].cl.push({t:v,done:false});$("mci").value="";save();cl()};
$("mci").onkeydown=e=>{if(e.key==="Enter")$("mca").click()};
[["mt","t"],["ms","st",1],["mp","pr",1],["md","d"],["ml","l"],["mn","n"]].forEach(([id,k,num])=>$(id).addEventListener("input",()=>{if(tc<0)return;P().tasks[tc][k]=num?+$(id).value:$(id).value;save()}));
const closeT=()=>{$("tm").style.display="none";tc=-1;detail()};
$("mok").onclick=closeT;
$("tm").onclick=e=>{if(e.target===$("tm"))closeT()};
$("mdel").onclick=()=>{P().tasks.splice(tc,1);save();closeT()};
onRender(projects);
