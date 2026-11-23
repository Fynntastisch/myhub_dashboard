/* projekte.js – Projektübersicht */
function projects(){
 $("pl").innerHTML=S.projects.map((p,i)=>`<div class="card pj"><h2>${esc(p.n)}</h2><p>${esc(p.d||"")}</p><div class="bar"><i style="width:${p.p}%"></i></div><div style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="range" min="0" max="100" value="${p.p}" oninput="pp(${i},this.value)" style="accent-color:#a45cff;padding:0"><span class="muted">${p.p}%</span><button class="x" onclick="pdl(${i})">×</button></div></div>`).join("")||'<p class="muted">Noch keine Projekte.</p>'}
window.pp=(i,v)=>{S.projects[i].p=+v;save()};
window.pdl=i=>{S.projects.splice(i,1);save();projects()};
$("padd").onclick=()=>{const n=$("pn").value.trim();if(!n)return;S.projects.push({n,d:$("pd").value,p:0});$("pn").value=$("pd").value="";save();projects()};
document.addEventListener("change",e=>{if(e.target.type==="range")projects()});

onRender(projects);
