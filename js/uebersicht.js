/* uebersicht.js – Übersichtsseite: Begrüßung, Aufgaben, Termine, Statistik, News, Gewohnheiten, Fokus-Timer, modulares Layout */
function tick(){const n=new Date(),h=n.getHours();
 $("clock").textContent=n.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
 $("date").textContent=n.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 $("greet").textContent=(h<11?"Guten Morgen":h<18?"Guten Tag":"Guten Abend")+(S.name?", "+S.name:"")+" ✦"}
setInterval(tick,1000);tick();

function progress(){const n=new Date(),y=n.getFullYear(),a=new Date(y,0,1),e=new Date(y+1,0,1);
 const p=(n-a)/(e-a),left=Math.ceil((e-n)/864e5);
 $("yr").style.strokeDashoffset=314*(1-p);$("yrt").textContent=Math.round(p*100)+"%";$("yrs").textContent="Noch "+left+" Tage in "+y;
 const d=(n.getDay()+6)%7,w=(d+(n.getHours()*60+n.getMinutes())/1440)/7;
 $("s4").textContent=Math.round(w*100)+"%";$("b4").style.width=w*100+"%"}
progress();setInterval(progress,60000);

function tasks(){
 $("tl").innerHTML=S.tasks.map((t,i)=>`<li class="row ${t.done?"done":""}"><input type="checkbox" ${t.done?"checked":""} onchange="tg(${i})"><span>${esc(t.t)}</span><button class="x" onclick="td(${i})">×</button></li>`).join("")||'<p class="muted">Keine Aufgaben – genieß den Tag.</p>';
 const d=S.tasks.filter(t=>t.done).length,n=S.tasks.length;
 $("s1").textContent=d+"/"+n;$("b1").style.width=(n?d/n*100:0)+"%";$("s2").textContent=n-d;
 $("s3").textContent=S.projects.length;$("s3s").textContent=S.projects.filter(p=>p.p<100).length+" aktiv"}
window.tg=i=>{S.tasks[i].done=!S.tasks[i].done;save();tasks()};
window.td=i=>{S.tasks.splice(i,1);save();tasks()};
$("tadd").onclick=()=>{const v=$("tin").value.trim();if(!v)return;S.tasks.push({t:v,done:false});$("tin").value="";save();tasks()};
$("tin").onkeydown=e=>{if(e.key==="Enter")$("tadd").click()};


function events(){
 const t=new Date().toISOString().slice(0,10);
 S.events.sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
 const row=e=>`<div class="ev"><b>${new Date(e.d).toLocaleDateString("de-DE",{day:"2-digit",month:"short"})} ${esc(e.t||"")}</b><span>${esc(e.title)}</span></div>`;
 window._loc=S.events.filter(e=>e.d>=t).slice(0,5).map(row).join("");renderEv()}
function renderEv(){$("evl").innerHTML=(window._g||"")+(window._loc||"")||'<p class="muted">Keine anstehenden Termine.</p>'}
async function gcal(){
 if(!S.cal||!S.key)return;
 try{const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(S.cal)}/events?key=${S.key}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime&maxResults=5`);
  const j=await r.json();window._g=(j.items||[]).map(e=>{const s=e.start.dateTime||e.start.date;const d=new Date(s);
   return `<div class="ev"><b>${d.toLocaleDateString("de-DE",{day:"2-digit",month:"short"})} ${e.start.dateTime?d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):""}</b><span>${esc(e.summary||"")}</span></div>`}).join("");renderEv()}catch(e){}}

const FEEDS={Welt:"https://www.tagesschau.de/index~rss2.xml",Technik:"https://www.heise.de/rss/heise-atom.xml",
"Autos & Motorräder":"https://news.google.com/rss/search?q="+encodeURIComponent("Auto OR Motorrad")+"&hl=de&gl=DE&ceid=DE:de",
Gaming:"https://news.google.com/rss/search?q="+encodeURIComponent("Gaming OR Videospiele")+"&hl=de&gl=DE&ceid=DE:de"};
let ntab=Object.keys(FEEDS)[0];const ncache={};
const ago=d=>{const m=Math.max(0,(Date.now()-new Date(d.replace(" ","T")+"Z"))/6e4);return m<60?"vor "+Math.round(m)+" Min.":m<1440?"vor "+Math.round(m/60)+" Std.":"vor "+Math.round(m/1440)+" Tg."};
function ntabs(){$("ntabs").innerHTML=Object.keys(FEEDS).map(k=>`<button class="${k===ntab?"on":""}" onclick="ntab=this.textContent;news()">${esc(k)}</button>`).join("")}
async function news(){ntabs();const box=$("news");
 try{if(!ncache[ntab]){box.textContent="Lade …";const r=await fetch("https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(FEEDS[ntab]));const j=await r.json();if(!j.items)throw 0;ncache[ntab]=j.items.slice(0,8)}
  box.innerHTML=ncache[ntab].map(i=>{let t=i.title,src=(i.author||"").trim();const k=t.lastIndexOf(" - ");if(k>0&&!src){src=t.slice(k+3);t=t.slice(0,k)}
   const img=i.thumbnail||(i.enclosure&&i.enclosure.link&&/\.(jpe?g|png|webp)/i.test(i.enclosure.link)?i.enclosure.link:"");
   return `<a class="nt" href="${esc(i.link)}" target="_blank" rel="noopener"><div class="im" ${img?`style="background-image:url('${esc(img)}')"`:""}></div><div class="tx"><b>${esc(t)}</b><small>${esc(src||ntab)} · ${ago(i.pubDate)}</small></div></a>`}).join("")}
 catch(e){box.textContent="Nachrichten konnten nicht geladen werden."}}

/* ---------- Modulares Layout ---------- */
const W={hero:["Begrüßung",8],year:["Jahresfortschritt",4],tasks:["Aufgaben",6],events:["Termine",6],st1:["Erledigt",3],st2:["Offen",3],st3:["Projekte",3],st4:["Woche",3],news:["Nachrichten",12],habits:["Gewohnheiten",6],focus:["Fokus-Timer",4],school:["Schule: Jetzt & Danach",6],due:["Hausaufgaben & Klausuren",6]};
const SZ=[3,4,6,8,12],dg=$("dg");
Object.keys(W).forEach(id=>{if(!S.layout.some(l=>l.id===id))S.layout.push({id,c:W[id][1],on:1})});
S.layout=S.layout.filter(l=>W[l.id]);
dg.querySelectorAll("[data-w]").forEach(el=>{el.insertAdjacentHTML("afterbegin",'<div class="wt"><button data-a="l" title="Nach vorne">‹</button><button data-a="r" title="Nach hinten">›</button><button data-a="s" title="Breite">↔</button><button data-a="x" title="Ausblenden">×</button></div>');
 el.ondragstart=e=>{e.dataTransfer.setData("text/plain",el.dataset.w);el.classList.add("drag")};
 el.ondragend=()=>{el.classList.remove("drag");dg.querySelectorAll(".over").forEach(o=>o.classList.remove("over"))};
 el.ondragover=e=>{if(document.body.classList.contains("edit")){e.preventDefault();el.classList.add("over")}};
 el.ondragleave=()=>el.classList.remove("over");
 el.ondrop=e=>{e.preventDefault();const a=e.dataTransfer.getData("text/plain"),b=el.dataset.w;if(a===b)return;
  const i=S.layout.findIndex(l=>l.id===a),it=S.layout.splice(i,1)[0],j=S.layout.findIndex(l=>l.id===b);S.layout.splice(j,0,it);save();layout()}});
function layout(){S.layout.forEach(l=>{const el=dg.querySelector(`[data-w="${l.id}"]`);el.style.setProperty("--c",l.c);el.style.display=l.on?"":"none";dg.appendChild(el)});
 $("libl").innerHTML=S.layout.filter(l=>!l.on).map(l=>`<button class="btn" onclick="wadd('${l.id}')">+ ${W[l.id][0]}</button>`).join("")||'<span class="muted">Alle Widgets sind sichtbar.</span>'}
window.wadd=id=>{S.layout.find(l=>l.id===id).on=1;save();layout()};
dg.addEventListener("click",e=>{const b=e.target.closest(".wt button");if(!b)return;
 const id=b.closest("[data-w]").dataset.w,i=S.layout.findIndex(l=>l.id===id),a=b.dataset.a,L=S.layout;
 if(a==="x")L[i].on=0;
 else if(a==="s")L[i].c=SZ[(SZ.indexOf(L[i].c)+1)%SZ.length];
 else{const d=a==="l"?-1:1;let j=i+d;while(L[j]&&!L[j].on)j+=d;if(L[j]){[L[i],L[j]]=[L[j],L[i]]}}
 save();layout()});
$("editb").onclick=()=>{const on=document.body.classList.toggle("edit");$("editb").textContent=on?"✓ Fertig":"✎ Anpassen";dg.querySelectorAll("[data-w]").forEach(el=>el.draggable=on)};
$("lrst").onclick=()=>{S.layout=Object.keys(W).map(id=>({id,c:W[id][1],on:1}));save();layout()};

/* ---------- Gewohnheiten ---------- */
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function habits(){const t=ymd(new Date()),days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return ymd(d)});
 $("hl").innerHTML=S.habits.map((h,i)=>{let st=0,d=new Date();if(!h.log[t])d.setDate(d.getDate()-1);while(h.log[ymd(d)]){st++;d.setDate(d.getDate()-1)}
  return `<li class="row"><span>${esc(h.n)}</span><div>${days.map(x=>`<i class="dot ${h.log[x]?"on":""} ${x===t?"t":""}" onclick="hg(${i},'${x}')"></i>`).join("")}</div><small class="muted" style="min-width:34px;text-align:right">🔥${st}</small><button class="x" onclick="hd(${i})">×</button></li>`}).join("")||'<p class="muted">Lege deine erste Gewohnheit an.</p>'}
window.hg=(i,d)=>{const l=S.habits[i].log;l[d]?delete l[d]:l[d]=1;save();habits()};
window.hd=i=>{S.habits.splice(i,1);save();habits()};
$("hadd").onclick=()=>{const v=$("hin").value.trim();if(!v)return;S.habits.push({n:v,log:{}});$("hin").value="";save();habits()};
$("hin").onkeydown=e=>{if(e.key==="Enter")$("hadd").click()};

/* ---------- Fokus-Timer ---------- */
let left=1500,tm=null;const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
function fc(){const t=ymd(new Date());if(S.focus.d!==t)S.focus={d:t,n:0};$("fc").textContent=S.focus.n+" Fokus-Runden heute"}
$("fs").onclick=()=>{if(tm){clearInterval(tm);tm=null;$("fs").textContent="Weiter";return}
 $("fs").textContent="Pause";tm=setInterval(()=>{left--;$("ft").textContent=fmt(left);
  if(left<=0){clearInterval(tm);tm=null;left=1500;fc();S.focus.n++;save();fc();$("ft").textContent="Fertig ✓";$("fs").textContent="Start"}},1000)};
$("fr").onclick=()=>{clearInterval(tm);tm=null;left=1500;$("ft").textContent="25:00";$("fs").textContent="Start"};

onRender(()=>{Object.keys(W).forEach(id=>{if(!S.layout.some(l=>l.id===id))S.layout.push({id,c:W[id][1],on:1})});S.layout=S.layout.filter(l=>W[l.id]);
 tick();progress();tasks();events();gcal();layout();habits();fc();school();due()});
news();

/* ---------- Schule ---------- */
function school(){const n=new Date(),d=(n.getDay()+6)%7,m=n.getHours()*60+n.getMinutes();
 if(d>4){$("sc").innerHTML='<p class="muted">Wochenende – kein Unterricht 🎉</p>';return}
 const T=(S.ttTimes&&S.ttTimes.length?S.ttTimes:DEFT).map(t=>{const p=String(t).match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/);return p?[+p[1]*60+ +p[2],+p[3]*60+ +p[4],p[3]+":"+p[4],p[1]+":"+p[2]]:null});
 const sub=r=>(S.tt[r+"-"+d]||"").trim();let cur=-1,nxt=-1;
 for(let r=0;r<T.length;r++){if(!T[r]||!sub(r))continue;if(m>=T[r][0]&&m<T[r][1])cur=r;if(T[r][0]>m&&nxt<0)nxt=r}
 let o=cur>=0?`<div class="ev"><b>Jetzt</b><span>${esc(sub(cur))} bis ${T[cur][2]}</span></div>`:'<div class="ev"><b>Jetzt</b><span class="muted">Gerade kein Unterricht</span></div>';
 o+=nxt>=0?`<div class="ev"><b>Danach</b><span>${esc(sub(nxt))} um ${T[nxt][3]}</span></div>`:'<div class="ev"><b>Danach</b><span class="muted">Heute nichts mehr ✓</span></div>';
 $("sc").innerHTML=o}
setInterval(school,60000);
function due(){const hw=(S.hw||[]).filter(h=>!h.done).sort((a,b)=>(a.d||"9").localeCompare(b.d||"9")).slice(0,4);
 const ex=(S.exams||[]).filter(e=>daysTo(e.d)>=0).sort((a,b)=>a.d.localeCompare(b.d)).slice(0,3);
 $("du").innerHTML=ex.map(e=>`<div class="ev"><b>Klausur</b><span>${esc(e.s)} – ${dl(daysTo(e.d))}</span></div>`).join("")+
  hw.map(h=>`<div class="ev"><b>Aufgabe</b><span>${esc(h.s)}: ${esc(h.t)}${h.d?" – "+dl(daysTo(h.d)):""}</span></div>`).join("")||'<p class="muted">Nichts Anstehendes 🎉</p>'}
