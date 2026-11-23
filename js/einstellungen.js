/* einstellungen.js – Name, Google Kalender, Konto */
function fill(){$("sn").value=S.name;$("sc").value=S.cal;$("sk").value=S.key}
onRender(fill);
$("ssave").onclick=()=>{S.name=$("sn").value.trim();S.cal=$("sc").value.trim();S.key=$("sk").value.trim();save();prof();$("ssave").textContent="Gespeichert ✓";setTimeout(()=>$("ssave").textContent="Speichern",1500)};


