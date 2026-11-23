/* planer.js – Tagesplan mit Zeitblöcken und Wochenrückblick */
S.blocks=S.blocks||[];S.reviews=S.reviews||{};
let day=ymd(new Date()),wk=0;
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);

function plan(){const t=ymd(new Date()),n=new Date(),now=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0");
 $("pdt").textContent=day===t?"Heute":new Date(day+"T00:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
 const L=S.blocks.map((b,i)=>({...b,i})).filter(b=>b.d===day).sort((a,b)=>a.s.localeCompare(b.s));
 const due=S.tasks.filter(x=>!x.done&&x.d===day);
 $("pbl").innerHTML=(L.map(b=>`<div class="ev" style="${day===t&&b.s<=now&&now<b.e?"background:rgba(164,92,255,.15);border-radius:10px;padding-left:8px;":""}${b.done?"opacity:.5":""}"><b style="min-width:105px">${b.s}–${b.e}</b><span style="flex:1;${b.done?"text-decoration:line-through":""}">${esc(b.t)}</span><input type="checkbox" ${b.done?"checked":""} onchange="bk(${b.i})"><button class="x" onclick="bx(${b.i})">×</button></div>`).join("")||'<p class="muted">Noch keine Zeitblöcke für diesen Tag.</p>')+
  (due.length?'<h3 style="margin-top:18px">Fällige Aufgaben</h3>'+due.map(x=>`<div class="ev"><b>●</b><span>${esc(x.t)}</span></div>`).join(""):"")}
window.bk=i=>{S.blocks[i].done=!S.blocks[i].done;save();plan();review()};
window.bx=i=>{S.blocks.splice(i,1);save();plan();review()};
$("ba").onclick=()=>{const s=$("bs").value,e=$("be").value,t=$("bt").value.trim();if(!s||!e||!t||e<=s)return;S.blocks.push({id:nid(),d:day,s,e,t,done:false});$("bt").value="";$("bs").value=e;$("be").value="";save();plan();review()};
$("bt").onkeydown=e=>{if(e.key==="Enter")$("ba").click()};
$("pprev").onclick=()=>{day=addD(day,-1);plan()};$("pnext").onclick=()=>{day=addD(day,1);plan()};$("ptoday").onclick=()=>{day=ymd(new Date());plan()};

/* Wochenrückblick */
const wkStart=o=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+o*7);return ymd(d)};
function review(){const a=wkStart(wk),e=addD(a,6),r=S.reviews[a]||{};
 const done=(S.log||[]).filter(x=>x.d>=a&&x.d<=e).length;
 const hab=S.habits.reduce((s,h)=>s+Object.keys(h.log).filter(d=>d>=a&&d<=e).length,0);
 const bl=S.blocks.filter(b=>b.d>=a&&b.d<=e),bd=bl.filter(b=>b.done).length;
 const f=d=>new Date(d+"T00:00:00").toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
 $("wlbl").textContent=(wk===0?"Diese Woche: ":wk===-1?"Letzte Woche: ":"")+f(a)+" – "+f(e);
 $("wst").textContent=`✅ ${done} Aufgaben erledigt · 🔥 ${hab} Gewohnheits-Check-ins · ⏱ ${bd}/${bl.length} Zeitblöcke erledigt`;
 [["wg","g"],["wb","b"],["wz","z"]].forEach(([id,k])=>{$(id).value=r[k]||"";$(id).oninput=()=>{S.reviews[a]={...S.reviews[a],[k]:$(id).value};save()}})}
$("wprev").onclick=()=>{wk--;review()};$("wnext").onclick=()=>{wk++;review()};

onRender(()=>{S.blocks=S.blocks||[];S.reviews=S.reviews||{};plan();review()});
setInterval(plan,60000);
