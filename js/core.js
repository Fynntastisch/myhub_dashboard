/* core.js – gemeinsame Grundfunktionen: Daten, Speichern, Sidebar, Login, Cloud-Sync */
/* Diagnose: zeigt JavaScript-Fehler als rote Leiste am unteren Rand an */
window.addEventListener("error",e=>{const b=document.createElement("div");b.style.cssText="position:fixed;bottom:0;left:0;right:0;z-index:999;background:#7f1d1d;color:#fff;padding:8px 14px;font:12px monospace";b.textContent="Fehler: "+e.message+" ("+String(e.filename).split("/").pop()+":"+e.lineno+")";(document.body||document.documentElement).appendChild(b)});
const $=id=>document.getElementById(id);
let S={name:"",cal:"",key:"",tasks:[],projects:[],events:[],notes:"",tt:{},layout:[],habits:[],focus:{d:"",n:0},hw:[],exams:[],grades:[],cards:[],ttTimes:[],blocks:[],reviews:{},marks:[],watch:[],log:[]};
try{S={...S,...JSON.parse(localStorage.getItem("hub")||"{}")}}catch(e){}
let sb=null,uid=null,cloudOn=false,pt;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DEFT=["08:00-08:45","08:45-09:30","09:50-10:35","10:35-11:20","11:40-12:25","12:25-13:10","13:30-14:15","14:15-15:00"];
const daysTo=d=>{const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(d+"T00:00:00")-t)/864e5)};
const dl=n=>n===0?"heute":n===1?"morgen":n<0?"überfällig":"in "+n+" Tg.";
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const addD=(s,n)=>{const d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return ymd(d)};
const addM=(s,n)=>{const d=new Date(s+"T00:00:00");d.setMonth(d.getMonth()+n);return ymd(d)};
const nextDue=t=>{const n=ymd(new Date()),b=t.d&&t.d>n?t.d:n;return t.rep==="d"?addD(b,1):t.rep==="w"?addD(b,7):addM(b,1)};
const logDone=t=>{(S.log=S.log||[]).push({t,d:ymd(new Date())});if(S.log.length>300)S.log.splice(0,S.log.length-300)};
const unlog=t=>{const l=S.log||[];for(let i=l.length-1;i>=0;i--)if(l[i].t===t){l.splice(i,1);break}};
const mob=()=>matchMedia("(max-width:900px)").matches;

/* Seiten registrieren ihre Zeichenfunktion mit onRender(); renderAll() läuft beim Start und nach dem Cloud-Laden */
const renderers=[];
const onRender=f=>renderers.push(f);
function renderAll(){renderers.forEach(f=>{try{f()}catch(e){console.error(e)}})}

/* Speichern: lokal sofort, Cloud nach kurzer Pause */
const setSync=t=>{const e=$("sync");if(e)e.textContent=t};
const save=()=>{try{localStorage.setItem("hub",JSON.stringify(S))}catch(e){}push()};
function push(){if(!cloudOn)return;clearTimeout(pt);pt=setTimeout(async()=>{setSync("Speichere …");
 const{error}=await sb.from("user_data").upsert({user_id:uid,data:S,updated_at:new Date().toISOString()});
 setSync(error?"⚠ Synchronisierung fehlgeschlagen":"☁ Synchronisiert")},1200)}

/* Sidebar */
function prof(){$("pname").textContent=S.name||"Dein Name";$("av").textContent=(S.name||"?").charAt(0).toUpperCase()}
onRender(prof);
$("prof").onclick=()=>{location.href="einstellungen.html"};
try{if(localStorage.getItem("mini")==="1"){document.body.classList.add("mini");$("tgl").textContent="⇥"}}catch(e){}
$("tgl").onclick=()=>{if(mob())return document.body.classList.remove("open");const m=document.body.classList.toggle("mini");$("tgl").textContent=m?"⇥":"⇤";try{localStorage.setItem("mini",m?"1":"0")}catch(e){}};
$("burger").onclick=()=>document.body.classList.add("open");
$("scrim").onclick=()=>document.body.classList.remove("open");

/* Login & Cloud (Supabase) */
async function startCloud(ses){uid=ses.user.id;
 const{data,error}=await sb.from("user_data").select("data").eq("user_id",uid).maybeSingle();
 if(error){$("lerr").textContent="Daten konnten nicht geladen werden: "+error.message;return false}
 const has=data&&data.data&&Object.keys(data.data).length;
 if(has){S={...S,...data.data};try{localStorage.setItem("hub",JSON.stringify(S))}catch(e){}renderAll()}
 cloudOn=true;if(!has)push();
 $("login").style.display="none";const a=$("acc");if(a)a.style.display="block";setSync("☁ Synchronisiert");return true}
async function doLogin(){$("lerr").textContent="";$("lb").disabled=true;
 const{data,error}=await sb.auth.signInWithPassword({email:$("lm").value.trim(),password:$("lp").value});
 $("lb").disabled=false;if(error){$("lerr").textContent="Anmeldung fehlgeschlagen. E-Mail oder Passwort stimmt nicht.";return}
 $("lp").value="";await startCloud(data.session)}
$("lb").onclick=doLogin;$("lp").onkeydown=e=>{if(e.key==="Enter")doLogin()};
const lo=$("lo");if(lo)lo.onclick=async()=>{clearTimeout(pt);cloudOn=false;
 try{await Promise.race([sb.auth.signOut(),new Promise(r=>setTimeout(r,2500))])}catch(e){}
 try{Object.keys(localStorage).filter(k=>k==="hub"||(k.startsWith("sb-")&&k.includes("auth"))).forEach(k=>localStorage.removeItem(k))}catch(e){}
 location.replace("index.html")};
async function initAuth(){
 if(SUPA_URL.startsWith("DEINE"))return; /* lokaler Modus ohne Login */
 $("login").style.display="grid";
 if(!window.supabase){$("lerr").textContent="Supabase-Bibliothek konnte nicht geladen werden.";return}
 sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
 const{data}=await sb.auth.getSession();
 if(data.session)await startCloud(data.session)}

/* Farbthema */
const THEMES={purple:["#a45cff","#6d28d9","164,92,255","109,40,217"],blue:["#4d9bff","#1d4ed8","77,155,255","29,78,216"],green:["#34d399","#047857","52,211,153","4,120,87"],pink:["#f472b6","#be185d","244,114,182","190,24,93"],orange:["#fb923c","#c2410c","251,146,60","194,65,12"]};
function applyTheme(){const t=THEMES[S.theme]||THEMES.purple,r=document.documentElement.style;r.setProperty("--p",t[0]);r.setProperty("--p2",t[1]);r.setProperty("--pr",t[2]);r.setProperty("--pr2",t[3])}
applyTheme();onRender(applyTheme);

/* Erinnerungen (nur solange die Seite geöffnet ist) */
function remind(){if(!S.notify||!("Notification" in window)||Notification.permission!=="granted")return;
 const n=new Date(),t=ymd(n),hm=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0");
 let f=[];try{f=JSON.parse(sessionStorage.getItem("fired")||"[]")}catch(e){}
 const it=[...(S.blocks||[]).filter(b=>b.d===t&&!b.done).map(b=>({k:"b"+b.id,t:b.s,x:"⏱ "+b.t})),...(S.events||[]).filter(e=>e.d===t&&e.t).map(e=>({k:"e"+e.d+e.t+e.title,t:e.t,x:"📅 "+e.title}))];
 it.filter(x=>x.t===hm&&!f.includes(x.k)).forEach(x=>{try{new Notification("MyHub",{body:x.x,icon:"img/icon-192.png"})}catch(e){}f.push(x.k)});
 try{sessionStorage.setItem("fired",JSON.stringify(f))}catch(e){}}
setInterval(remind,20000);

/* App-Installation / Offline-Stand */
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
