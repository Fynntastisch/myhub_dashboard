/* notizen.js – mehrere Seiten mit Ordnern, Markdown, Suche und Ideen-Inbox */
S.pages=S.pages||[];S.folders=S.folders||[];S.inbox=S.inbox||[];
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let sel="",prev=false;
const pg=()=>S.pages.find(p=>p.id===sel);

/* kleiner Markdown-Umwandler */
function md(s){let o="",ul=false;
 const inl=t=>t.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/\*([^*]+)\*/g,"<i>$1</i>").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
 for(const l of esc(s).split("\n")){
  const ck=l.match(/^- \[( |x)\] (.*)/i),li=l.match(/^[-*] (.*)/);
  if(ck||li){if(!ul){o+="<ul>";ul=true}o+=ck?`<li class="ck">${ck[1]===" "?"☐":"☑"} ${inl(ck[2])}</li>`:`<li>${inl(li[1])}</li>`;continue}
  if(ul){o+="</ul>";ul=false}
  const h=l.match(/^(#{1,3}) (.*)/);
  if(h)o+=`<h${h[1].length+1}>${inl(h[2])}</h${h[1].length+1}>`;
  else if(l.startsWith("&gt; "))o+=`<blockquote>${inl(l.slice(5))}</blockquote>`;
  else if(l.trim()==="---")o+="<hr>";
  else if(l.trim())o+=`<p>${inl(l)}</p>`}
 return o+(ul?"</ul>":"")}

/* Seitenliste */
function tree(){const q=$("nsr").value.trim().toLowerCase();
 const item=(p,i)=>`<div class="np ${p.id===sel?"on":""} ${i?"in":""}" onclick="ns('${p.id}')">📄 ${esc(p.t||"Ohne Titel")}</div>`;
 if(q){const r=S.pages.filter(p=>(p.t+" "+p.c).toLowerCase().includes(q));$("ntree").innerHTML=r.map(p=>item(p,0)).join("")||'<p class="muted">Nichts gefunden.</p>';return}
 $("ntree").innerHTML=S.pages.filter(p=>!S.folders.some(f=>f.id===p.f)).map(p=>item(p,0)).join("")+
  S.folders.map(f=>`<div class="nf"><b>📁 ${esc(f.n)}</b><span><button class="x" onclick="nfr('${f.id}')" title="Umbenennen">✎</button><button class="x" onclick="nfx('${f.id}')" title="Ordner löschen">×</button></span></div>`+S.pages.filter(p=>p.f===f.id).map(p=>item(p,1)).join("")).join("")||'<p class="muted">Noch keine Seiten.</p>'}
window.ns=id=>{sel=id;prev=false;tree();editor()};
window.nfr=id=>{const f=S.folders.find(x=>x.id===id),n=prompt("Neuer Name:",f.n);if(n&&n.trim()){f.n=n.trim();save();tree();editor()}};
window.nfx=id=>{if(!confirm("Ordner löschen? Die Seiten bleiben erhalten."))return;S.folders=S.folders.filter(f=>f.id!==id);S.pages.forEach(p=>{if(p.f===id)p.f=""});save();tree();editor()};
$("nsr").oninput=tree;
$("npa").onclick=()=>{const p={id:nid(),t:"Neue Seite",f:"",c:"",u:Date.now()};S.pages.unshift(p);sel=p.id;prev=false;save();tree();editor();$("et").select()};
$("nfa").onclick=()=>{const n=prompt("Name des Ordners:");if(n&&n.trim()){S.folders.push({id:nid(),n:n.trim()});save();tree();editor()}};

/* Editor */
function editor(){const p=pg(),box=$("ned");
 if(!p){box.innerHTML='<p class="muted">Wähle links eine Seite oder lege eine neue an.</p>';return}
 box.innerHTML=`<input id="et" class="etitle" placeholder="Titel" value="${esc(p.t)}"><div class="mrow" style="margin:12px 0"><select id="ef"><option value="">Kein Ordner</option>${S.folders.map(f=>`<option value="${f.id}" ${f.id===p.f?"selected":""}>${esc(f.n)}</option>`).join("")}</select><button class="btn" id="etg" style="flex:none">${prev?"Bearbeiten":"Vorschau"}</button><button class="x" id="edl" style="flex:none" title="Seite löschen">🗑</button></div>`+
  (prev?`<div class="md">${md(p.c)||'<p class="muted">Leer</p>'}</div>`:`<textarea id="ec" rows="18" placeholder="Schreib los … (Markdown: # Titel, **fett**, - Liste, - [ ] Aufgabe)">${esc(p.c)}</textarea>`);
 $("et").oninput=()=>{p.t=$("et").value;p.u=Date.now();save();tree()};
 $("ef").onchange=()=>{p.f=$("ef").value;save();tree()};
 $("etg").onclick=()=>{prev=!prev;editor()};
 $("edl").onclick=()=>{if(!confirm("Seite löschen?"))return;S.pages=S.pages.filter(x=>x!==p);sel="";save();tree();editor()};
 const ec=$("ec");if(ec)ec.oninput=()=>{p.c=ec.value;p.u=Date.now();save()}}

/* Ideen-Inbox */
function inbox(){$("nil").innerHTML=S.inbox.map((x,i)=>`<li class="row"><span>${esc(x.t)}</span><button class="btn" style="padding:4px 10px;font-size:.78rem" onclick="ni2p(${i})">→ Seite</button><button class="x" onclick="nix(${i})">×</button></li>`).join("")||'<p class="muted">Leer – gut so.</p>'}
window.nix=i=>{S.inbox.splice(i,1);save();inbox()};
window.ni2p=i=>{const p={id:nid(),t:S.inbox[i].t,f:"",c:"",u:Date.now()};S.pages.unshift(p);S.inbox.splice(i,1);sel=p.id;prev=false;save();tree();editor();inbox()};
const nia=()=>{const v=$("nin").value.trim();if(!v)return;S.inbox.unshift({id:nid(),t:v});$("nin").value="";save();inbox()};
$("nia").onclick=nia;$("nin").onkeydown=e=>{if(e.key==="Enter")nia()};

onRender(()=>{S.pages=S.pages||[];S.folders=S.folders||[];S.inbox=S.inbox||[];
 if(S.notes&&S.notes.trim()&&!S.pages.length){S.pages.push({id:nid(),t:"Freie Notizen",f:"",c:S.notes,u:Date.now()});S.notes="";save()}
 if(sel&&!pg())sel="";try{const o=sessionStorage.getItem("openNote");if(o){sessionStorage.removeItem("openNote");if(S.pages.some(p=>p.id===o))sel=o}}catch(e){}tree();editor();inbox()});
