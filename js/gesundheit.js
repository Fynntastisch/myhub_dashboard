/* gesundheit.js – Stimmung, Energie, Schlaf, Sport, Wasser, Tagebuch */
S.health=S.health||{};
let day=ymd(new Date());
const Q=["Wofür bist du heute dankbar?","Was war heute dein schönster Moment?","Was hat dich heute gestresst – und was hilft dagegen?","Was hast du heute Neues gelernt?","Worauf freust du dich morgen?","Was würdest du heute anders machen?","Wer hat dich heute zum Lachen gebracht oder dir geholfen?"];
const MO=["😞","🙁","😐","🙂","😄"];
const hv=d=>(S.health&&S.health[d])||{};
const hset=(k,v)=>{S.health=S.health||{};const h=(S.health[day]=S.health[day]||{});if(v===undefined||Number.isNaN(v))delete h[k];else h[k]=v;if(!Object.keys(h).length)delete S.health[day];save()};
window.hs=(k,v)=>{hset(k,hv(day)[k]===v?undefined:v);render()};

function render(){const h=hv(day),t=ymd(new Date());
 $("hdt").textContent=day===t?"Heute":new Date(day+"T00:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
 $("hmo").innerHTML=MO.map((e,i)=>`<button class="${h.mood===i+1?"on":""}" onclick="hs('mood',${i+1})">${e}</button>`).join("");
 $("hen").innerHTML=[1,2,3,4,5].map(n=>`<button class="${h.energy===n?"on":""}" onclick="hs('energy',${n})">⚡${n}</button>`).join("");
 $("hsl").value=h.sleep??"";$("hsp").value=h.sport??"";
 $("hwa").textContent=h.water||0;$("hwb").style.width=Math.min(100,(h.water||0)/8*100)+"%";
 $("hqq").textContent=Q[Math.floor(new Date(day+"T00:00:00")/864e5)%Q.length];
 $("hdi").value=h.diary||"";
 chart()}

function chart(){const days=[...Array(14)].map((_,i)=>addD(day,i-13));
 const line=(k,c)=>{const p=days.map((d,i)=>hv(d)[k]?[(14+i*22.46).toFixed(1),116-(hv(d)[k]-1)*25]:null).filter(Boolean);
  return `<polyline fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" points="${p.map(q=>q.join(",")).join(" ")}"/>`+p.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${c}"/>`).join("")};
 $("hch").innerHTML=`<svg viewBox="0 0 320 130" style="width:100%">${[1,2,3,4,5].map(v=>`<line x1="14" x2="306" y1="${116-(v-1)*25}" y2="${116-(v-1)*25}" stroke="rgba(255,255,255,.07)"/>`).join("")}${line("mood","#a45cff")}${line("energy","#4ade80")}</svg><p class="muted"><span style="color:#a45cff">●</span> Stimmung &nbsp; <span style="color:#4ade80">●</span> Energie</p>`;
 const v=k=>days.map(d=>hv(d)[k]).filter(x=>x!=null),sum=a=>a.reduce((s,x)=>s+x,0),avg=a=>a.length?(sum(a)/a.length).toFixed(1).replace(".",","):"–";
 $("hst").textContent=`Ø Schlaf ${avg(v("sleep"))} Std. · Sport gesamt ${sum(v("sport"))} Min. · Ø Wasser ${avg(v("water"))} Gläser`}

$("hsl").oninput=()=>{hset("sleep",$("hsl").value===""?undefined:+$("hsl").value);chart()};
$("hsp").oninput=()=>{hset("sport",$("hsp").value===""?undefined:+$("hsp").value);chart()};
$("hwm").onclick=()=>{hset("water",Math.max(0,(hv(day).water||0)-1)||undefined);render()};
$("hwp").onclick=()=>{hset("water",(hv(day).water||0)+1);render()};
$("hdi").oninput=()=>hset("diary",$("hdi").value||undefined);
$("hprev").onclick=()=>{day=addD(day,-1);render()};$("hnext").onclick=()=>{day=addD(day,1);render()};$("htoday").onclick=()=>{day=ymd(new Date());render()};
onRender(()=>{S.health=S.health||{};render()});
