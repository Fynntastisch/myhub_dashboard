/* suche.js – Schnellsuche (Strg+K) über Seiten, Notizen, Aufgaben, Projekte und mehr */
(()=>{
const NAV=[["Übersicht","index.html"],["Projekte","projekte.html"],["Kalender","kalender.html"],["Notizen","notizen.html"],["Schule","schule.html"],["Planer","planer.html"],["Sammlung","sammlung.html"],["Gesundheit","gesundheit.html"],["Finanzen","finanzen.html"],["Einstellungen","einstellungen.html"]];
const box=document.createElement("div");box.className="sm";
box.innerHTML='<div class="card sb"><input id="sq" placeholder="Suchen … (Seiten, Notizen, Aufgaben, Projekte, Lesezeichen)" autocomplete="off"><div id="sres" style="margin-top:10px"></div></div>';
document.body.appendChild(box);
const q$=document.getElementById("sq"),res=document.getElementById("sres");let list=[],hi=0;
const all=()=>{const a=[],A=(i,t,x,h,s,ext)=>a.push({i,t:String(t||""),x,h,s,ext});
 NAV.forEach(n=>A("➜",n[0],"Seite",n[1]));
 (S.pages||[]).forEach(p=>A("📄",p.t||"Ohne Titel","Notiz","notizen.html",["openNote",p.id]));
 (S.inbox||[]).forEach(x=>A("💡",x.t,"Idee","notizen.html"));
 (S.tasks||[]).forEach(t=>A("✅",t.t,"Aufgabe","index.html"));
 (S.projects||[]).forEach((p,i)=>{A("▣",p.n,"Projekt","projekte.html",["openProj",i]);(p.tasks||[]).forEach(t=>A("🔹",p.n+" › "+t.t,"Projektaufgabe","projekte.html",["openProj",i]))});
 (S.marks||[]).forEach(m=>A("🔗",m.t+" "+(m.g||""),"Lesezeichen",m.u,null,true));
 (S.watch||[]).forEach(w=>A("🎬",w.t,w.k,"sammlung.html"));
 (S.hw||[]).forEach(h=>A("📚",(h.s?h.s+": ":"")+h.t,"Hausaufgabe","schule.html"));
 (S.exams||[]).forEach(e=>A("📝",e.s+" "+(e.t||""),"Klausur","schule.html"));
 (S.cards||[]).forEach(c=>A("🃏",c.q,"Karteikarte","schule.html"));
 (S.events||[]).forEach(e=>A("📅",e.title,"Termin","kalender.html"));
 return a};
const esc2=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function draw(){const q=q$.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
 list=all().filter(x=>q.every(w=>x.t.toLowerCase().includes(w)||x.x.toLowerCase().includes(w))).slice(0,q.length?12:10);if(hi>=list.length)hi=0;
 res.innerHTML=list.map((x,i)=>`<div class="sr ${i===hi?"on":""}" data-i="${i}"><span>${x.i}</span><span>${esc2(x.t)}</span><small>${esc2(x.x)}</small></div>`).join("")||'<p class="muted" style="padding:8px">Nichts gefunden.</p>';
 res.querySelectorAll(".sr").forEach(el=>el.onclick=()=>pick(+el.dataset.i))}
function pick(i){const x=list[i];if(!x)return;if(x.s)try{sessionStorage.setItem(x.s[0],x.s[1])}catch(e){}
 if(x.ext)window.open(x.h,"_blank","noopener");else location.href=x.h;close()}
const open=()=>{box.style.display="flex";q$.value="";hi=0;draw();q$.focus()},close=()=>{box.style.display="none"};
q$.oninput=()=>{hi=0;draw()};
q$.onkeydown=e=>{if(e.key==="ArrowDown"){hi=Math.min(list.length-1,hi+1);draw();e.preventDefault()}else if(e.key==="ArrowUp"){hi=Math.max(0,hi-1);draw();e.preventDefault()}else if(e.key==="Enter")pick(hi)};
box.onclick=e=>{if(e.target===box)close()};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open()}else if(e.key==="Escape")close()});
["sbtn","sbtn2"].forEach(id=>{const b=document.getElementById(id);if(b)b.onclick=()=>{document.body.classList.remove("open");open()}});
})();
