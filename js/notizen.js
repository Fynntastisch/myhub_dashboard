/* notizen.js – Stundenplan und freie Notizen */
const days=["Mo","Di","Mi","Do","Fr"];
function build(){$("tt").innerHTML="<tr><th></th>"+days.map(d=>`<th>${d}</th>`).join("")+"</tr>"+Array.from({length:8},(_,r)=>`<tr><th>${r+1}.</th>`+days.map((_,c)=>`<td><input data-k="${r}-${c}" value="${esc(S.tt[r+"-"+c]||"")}"></td>`).join("")+"</tr>").join("");$("nt").value=S.notes}
$("tt").oninput=e=>{S.tt[e.target.dataset.k]=e.target.value;save()};
$("nt").oninput=()=>{S.notes=$("nt").value;save()};

onRender(build);
