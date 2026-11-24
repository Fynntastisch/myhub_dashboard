/* einstellungen.js – Name, Kalender, Wetter-Ort, Farbthema, Erinnerungen, Backup, Konto */
function themes(){$("thd").innerHTML=Object.keys(THEMES).map(k=>`<button style="background:${THEMES[k][0]};color:${THEMES[k][0]}" class="${(S.theme||"purple")===k?"on":""}" onclick="sth('${k}')" title="${k}"></button>`).join("")}
window.sth=k=>{S.theme=k;save();applyTheme();themes()};
function fill(){$("sn").value=S.name;$("sc").value=S.cal;$("sk").value=S.key;$("sw").value=S.city||"Hennef";$("snt").checked=!!S.notify;themes()}
onRender(fill);
$("ssave").onclick=()=>{S.name=$("sn").value.trim();S.cal=$("sc").value.trim();S.key=$("sk").value.trim();S.city=$("sw").value.trim()||"Hennef";save();prof();$("ssave").textContent="Gespeichert ✓";setTimeout(()=>$("ssave").textContent="Speichern",1500)};
$("snt").onchange=()=>{if(!$("snt").checked){S.notify=false;save();return}
 if(!("Notification" in window)){alert("Dieser Browser unterstützt keine Benachrichtigungen.");$("snt").checked=false;return}
 Notification.requestPermission().then(p=>{S.notify=p==="granted";$("snt").checked=S.notify;save()})};
$("exp").onclick=()=>{const b=new Blob([JSON.stringify(S,null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="myhub-backup-"+ymd(new Date())+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("imp").onchange=async e=>{const f=e.target.files[0];if(!f)return;
 try{const d=JSON.parse(await f.text());if(!d||typeof d!=="object"||Array.isArray(d))throw 0;
  if(!confirm("Aktuelle Daten durch dieses Backup ersetzen?"))return;S={...S,...d};save();renderAll();alert("Backup eingespielt.")}
 catch(x){alert("Die Datei ist kein gültiges Backup.")}e.target.value=""};
