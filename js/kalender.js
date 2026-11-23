/* kalender.js – Google Kalender (Einbettung) und eigene Termine */
function events(){
 S.events.sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
 $("evall").innerHTML=S.events.map((e,i)=>`<li class="row"><span>${new Date(e.d).toLocaleDateString("de-DE")} ${esc(e.t||"")} – ${esc(e.title)}</span><button class="x" onclick="ed_(${i})">×</button></li>`).join("")}
window.ed_=i=>{S.events.splice(i,1);save();events()};
$("eadd").onclick=()=>{if(!$("ed").value||!$("etit").value)return;S.events.push({d:$("ed").value,t:$("et").value,title:$("etit").value});$("etit").value="";save();events()};
function calFrame(){
 $("calbox").innerHTML=S.cal?`<iframe src="https://calendar.google.com/calendar/embed?src=${encodeURIComponent(S.cal)}&ctz=Europe%2FBerlin&mode=WEEK&showTitle=0&showPrint=0&hl=de&bgcolor=%23ffffff"></iframe>`:'<p class="muted">Trag unter „Einstellungen“ deine Google Kalender-ID ein, dann erscheint er hier.</p>'}

onRender(()=>{events();calFrame()});
