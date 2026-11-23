/* notizen.js – freie Notizen */
$("nt").oninput=()=>{S.notes=$("nt").value;save()};
onRender(()=>{$("nt").value=S.notes});
