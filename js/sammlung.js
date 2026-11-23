/* sammlung.js – Lesezeichen und Watchlist */
S.marks=S.marks||[];S.watch=S.watch||[];
const TYP=["Alle","Film","Serie","Buch","Spiel"],STW=["Geplant","Läuft","Fertig"];let wf="Alle";
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);

function marks(){const q=$("bsr").value.trim().toLowerCase();
 $("bml").innerHTML=S.marks.map((m,i)=>({...m,i})).filter(m=>!q||(m.t+m.u+(m.g||"")).toLowerCase().includes(q)).map(m=>`<li class="row"><a href="${esc(m.u)}" target="_blank" rel="noopener" style="flex:1;color:var(--txt);text-decoration:none">🔗 ${esc(m.t)}</a>${m.g?`<span class="bg" style="flex:none">${esc(m.g)}</span>`:""}<button class="x" onclick="mx(${m.i})">×</button></li>`).join("")||'<p class="muted">Keine Lesezeichen.</p>'}
window.mx=i=>{S.marks.splice(i,1);save();marks()};
$("bsr").oninput=marks;
$("ba").onclick=()=>{let u=$("bu").value.trim();if(!u)return;if(!/^https?:\/\//i.test(u))u="https://"+u;let t=$("bn").value.trim();if(!t){try{t=new URL(u).hostname.replace(/^www\./,"")}catch(e){return}}
 S.marks.unshift({t,u,g:$("bg").value.trim()});$("bu").value=$("bn").value=$("bg").value="";save();marks()};

function watch(){$("wtabs").innerHTML=TYP.map(k=>`<button class="${k===wf?"on":""}" onclick="wf='${k}';watch()">${k}</button>`).join("");
 $("wl").innerHTML=S.watch.map((w,i)=>({...w,i})).filter(w=>wf==="Alle"||w.k===wf).sort((a,b)=>a.st-b.st).map(w=>`<li class="row ${w.st===2?"done":""}"><span>${esc(w.t)}</span><span class="bg" style="flex:none">${w.k}</span><button class="btn" style="padding:3px 10px;font-size:.75rem;flex:none" onclick="wst(${w.i})">${STW[w.st]}</button>${w.st===2?`<select style="width:68px;padding:3px 6px;flex:none" onchange="wrt(${w.i},this.value)">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.r?"selected":""}>${n?"★".repeat(n):"–"}</option>`).join("")}</select>`:""}<button class="x" onclick="wx(${w.i})">×</button></li>`).join("")||'<p class="muted">Noch nichts auf der Liste.</p>'}
window.wst=i=>{S.watch[i].st=(S.watch[i].st+1)%3;save();watch()};
window.wrt=(i,v)=>{S.watch[i].r=+v;save()};
window.wx=i=>{S.watch.splice(i,1);save();watch()};
$("wa").onclick=()=>{const t=$("wt").value.trim();if(!t)return;S.watch.unshift({t,k:$("wk").value,st:0,r:0});$("wt").value="";save();watch()};
$("wt").onkeydown=e=>{if(e.key==="Enter")$("wa").click()};

onRender(()=>{S.marks=S.marks||[];S.watch=S.watch||[];marks();watch()});
