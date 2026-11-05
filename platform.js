/* Ranking online + contas. Pontuação mostrada = reexecução do registro de decisões (não confia no cliente). */
(function(){
'use strict';
const S=SIM,$=id=>document.getElementById(id),cf=window.PLATFORM_CONFIG||{};
const online=!!(cf.url&&cf.anonKey&&window.supabase);
const sb=online?supabase.createClient(cf.url,cf.anonKey):null;
const LK='bcsim-rank';
let user=null;

function verify(row){ // reexecuta a partida; devolve {score,months,over} ou null se inválida
  try{const c=S.decode(row.code);if(!c||!Array.isArray(row.dec)||row.dec.length<12)return null;
    const s=S.newState(c);for(const a of row.dec){if(s.over)break;S.step(s,S.unpackDec(a));}
    return {score:S.score(s),months:s.m,over:!!s.over};}catch(e){return null;}
}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=t=>{const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200);};

async function fetchRows(code){
  if(!online){try{return JSON.parse(localStorage.getItem(LK)||'[]').filter(r=>!code||r.code===code);}catch(e){return [];}}
  let q=sb.from('scores').select('nickname,code,dec,months,created_at').order('score',{ascending:false}).limit(100);
  if(code)q=q.eq('code',code);
  const {data,error}=await q;if(error){toast('Erro ao carregar o ranking.');return [];}return data;
}
async function render(){
  const code=BCSIM.code();
  $('rkMode').textContent=online?'Online':'Local (neste navegador)';
  const rows=(await fetchRows($('rkAll').checked?null:code)).map(r=>({r,v:verify(r)})).filter(x=>x.v&&x.v.over)
    .sort((a,b)=>b.v.score-a.v.score).slice(0,25);
  $('rkBody').innerHTML=rows.length?rows.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.r.nickname)+'</td><td class="mono">'+esc(x.r.code)+'</td><td>'+S.fmt(x.v.score,1)+'</td><td>'+x.v.months+'</td></tr>').join('')
    :'<tr><td colspan="5" style="text-align:left;color:var(--muted)">Nenhuma partida concluída com este código ainda.</td></tr>';
}
async function submit(){
  const g=BCSIM.game(),nick=$('rkNick').value.trim();
  if(!g.st.over){toast('Termine o mandato para enviar.');return;}
  if(nick.length<2||nick.length>24){toast('Apelido de 2 a 24 letras.');return;}
  if(g.st.m<12){toast('Jogue pelo menos 12 meses.');return;}
  const row={nickname:nick,code:S.encode(g.cfg),dec:g.st.dec,months:g.st.m,score:S.score(g.st)};
  if(online){
    if(!user){toast('Entre com seu e-mail primeiro.');return;}
    const {error}=await sb.from('scores').upsert(row,{onConflict:'user_id,code'});if(error){toast('Não foi possível enviar.');return;}
  }else{
    let a=[];try{a=JSON.parse(localStorage.getItem(LK)||'[]');}catch(e){}
    a=a.filter(r=>!(r.nickname===nick&&r.code===row.code));a.push(row);
    try{localStorage.setItem(LK,JSON.stringify(a));}catch(e){toast('Sem espaço local.');return;}
  }
  toast('Pontuação enviada.');render();
}
function authUi(){
  $('rkAuth').hidden=!online;
  $('rkIn').hidden=!!user;$('rkOut').hidden=!user;
  if(user){$('rkWho').textContent=user.email;if(!$('rkNick').value)$('rkNick').value=(user.user_metadata&&user.user_metadata.nick)||'';}
}
$('rkSubmit').addEventListener('click',submit);
$('rkAll').addEventListener('change',render);
$('rkRefresh').addEventListener('click',render);
if(online){
  $('rkLogin').addEventListener('click',async()=>{const email=$('rkEmail').value.trim();if(!email){toast('Digite seu e-mail.');return;}
    const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split('#')[0]}});toast(error?'Falha ao enviar o link.':'Link enviado. Confira seu e-mail.');});
  $('rkLogout').addEventListener('click',()=>sb.auth.signOut());
  $('rkNick').addEventListener('change',()=>{if(user)sb.auth.updateUser({data:{nick:$('rkNick').value.trim()}});});
  sb.auth.onAuthStateChange((_e,s)=>{user=s?s.user:null;authUi();});
  sb.auth.getSession().then(({data})=>{user=data.session?data.session.user:null;authUi();});
}else authUi();
window.addEventListener('bcsim-over',render);
['btnNew','btnNew2','btnRestart','btnReplay','btnLoad','modeBR','modeCL','scenSel'].forEach(id=>$(id).addEventListener(id==='scenSel'?'change':'click',()=>setTimeout(render,0)));
render();
})();
