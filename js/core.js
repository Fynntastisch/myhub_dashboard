/* core.js – gemeinsame Grundfunktionen: Daten, Speichern, Sidebar, Login, Cloud-Sync */
const $=id=>document.getElementById(id);
let S={name:"",cal:"",key:"",tasks:[],projects:[],events:[],notes:"",tt:{},layout:[],habits:[],focus:{d:"",n:0}};
try{S={...S,...JSON.parse(localStorage.getItem("hub")||"{}")}}catch(e){}
let sb=null,uid=null,cloudOn=false,pt;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
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
const lo=$("lo");if(lo)lo.onclick=async()=>{await sb.auth.signOut();try{localStorage.removeItem("hub")}catch(e){}location.href="index.html"};
async function initAuth(){
 if(SUPA_URL.startsWith("DEINE"))return; /* lokaler Modus ohne Login */
 $("login").style.display="grid";
 if(!window.supabase){$("lerr").textContent="Supabase-Bibliothek konnte nicht geladen werden.";return}
 sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
 const{data}=await sb.auth.getSession();
 if(data.session)await startCloud(data.session)}
