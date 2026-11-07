/* Níveis de uso: um mesmo app para quem só quer brincar e para quem estuda DSGE. Revelação progressiva por nível:
   1 Casual · 2 Curioso · 3 Economista · 4 Pesquisador. Os elementos de cada nível são marcados por seletor (data-min) e o CSS esconde o excesso. */
(function () {
'use strict';
const KEY = 'bcsim-level';
const $ = id => document.getElementById(id);
const NAMES = { 1: 'Casual', 2: 'Curioso', 3: 'Economista', 4: 'Pesquisador' };
const DESC = {
  1: 'Só quero brincar. Poucos botões, um assessor que explica em português claro e o Laboratório do Caos para fazer bagunça.',
  2: 'Gosto de economia. Acrescenta previsões, monitores de preços e PIB, choques do governo, pilotos automáticos e o ranking.',
  3: 'Quero os números. Acrescenta mercados e famílias, modelos e opções da economia, comunicação e estabilidade financeira, o modo Pesquisa com FRB/US, desafio e dados do BCB.',
  4: 'Entendo DSGE. Tudo: editor de modelos em texto, parâmetros, momentos teóricos, calibrações e o quadro do SAMBA.'
};
// [seletor, ancestral opcional (seletor ou função)] por nível mínimo
const MIN = {
  2: [['#previsao'], ['#monitores'], ['#governo'], ['#ranking'], ['.tabs a[href="#previsao"]'], ['.tabs a[href="#monitores"]'], ['.tabs a[href="#governo"]'], ['.tabs a[href="#ranking"]'],
      ['#apTaylor', 'fieldset'], ['.mini'], ['label[for="diffSel"]'], ['#diffSel']],
  3: [['#mercados'], ['#compartilhar'], ['#pesquisa'], ['.tabs a[href="#mercados"]'], ['.tabs a[href="#compartilhar"]'], ['.tabs a[href="#pesquisa"]'],
      ['#fgSel', 'fieldset'], ['#fElf', 'fieldset'], ['#qe', 'div'], ['#fragMk', e => e.closest('.meter').parentElement], ['label[for="modelSel"]'], ['#modelSel'], ['label[for="optSel"]'], ['#optSel'], ['#optHint'], ['#oFast', 'label']],
  4: [['#dsgeText', '.share'], ['#sambaMap'], ['#dsgeRun'], ['#fbCustom', 'label'], ['#cfg .check']]
};
function mark() {
  Object.keys(MIN).forEach(lvl => MIN[lvl].forEach(([sel, cl]) => document.querySelectorAll(sel).forEach(el => {
    const t = !cl ? el : typeof cl === 'function' ? cl(el) : el.closest(cl); if (t) t.dataset.min = lvl;
  })));
  const adv = document.createElement('div'); adv.className = 'card'; adv.id = 'advisor'; adv.dataset.max = '1'; adv.style.padding = '12px';
  adv.innerHTML = '<div class="label">Conselho do assessor</div><p id="advisorText" style="margin:6px 0 0">—</p>';
  const desk = document.querySelector('.desk'), copom = $('copomBox'); if (desk && copom) desk.insertBefore(adv, copom);
  const nav = document.querySelector('.tabs .wrap');
  if (nav) { const l = document.createElement('label'); l.className = 'lvl-sel'; l.innerHTML = '<span>Nível</span><select id="lvlSel" aria-label="Nível de uso">' + Object.keys(NAMES).map(k => '<option value="' + k + '">' + NAMES[k] + '</option>').join('') + '</select>'; nav.appendChild(l); $('lvlSel').addEventListener('change', () => set(+$('lvlSel').value)); }
}
function get() { const v = parseInt(document.documentElement.dataset.level, 10); return v >= 1 && v <= 4 ? v : 3; }
function set(v, silent) {
  v = Math.max(1, Math.min(4, Math.round(v))); document.documentElement.dataset.level = String(v);
  try { localStorage.setItem(KEY, String(v)); } catch (e) { /* sem armazenamento */ }
  if ($('lvlSel')) $('lvlSel').value = String(v);
  if (!silent) { window.dispatchEvent(new Event('resize')); if (window.BCSIM && BCSIM.rerender) BCSIM.rerender(); }
  window.dispatchEvent(new CustomEvent('levelchange', { detail: v }));
}
/* assessor em português claro (só no nível Casual) */
function advise(s) {
  const el = $('advisorText'); if (!el || !s) return;
  const M = s.M, T = M.target, B = M.band, f = x => x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 1 });
  const dpi = s.piYoY - T, du = s.u - s.ustar; let t;
  if (s.over) t = 'O mandato acabou. Veja a pontuação e comece uma nova economia quando quiser.';
  else if (dpi > B) t = 'A inflação está em ' + f(s.piYoY) + '%, acima da meta de ' + f(T) + '%. Juros mais altos esfriam os preços, mas só fazem efeito depois de meses e podem aumentar o desemprego. ' + (s.i > s.rstar + s.piE ? 'Os juros já estão altos: talvez falte só paciência.' : 'Tente subir um pouco os juros.');
  else if (dpi < -B) t = 'A inflação está baixa demais (' + f(s.piYoY) + '%). Cortar os juros anima a economia e puxa os preços para cima.';
  else if (du > 1.5) t = 'A inflação está sob controle, mas o desemprego está alto (' + f(s.u) + '%). Há espaço para baixar os juros com cuidado.';
  else if (du < -1) t = 'O mercado de trabalho está superaquecido. Cuidado: isso pode empurrar a inflação para cima nos próximos meses.';
  else t = 'Tudo dentro do esperado. Mantenha os juros e avance o mês. Lembre que cada decisão só aparece nos números daqui a meses.';
  el.textContent = t;
}
function chooser() {
  const d = $('lvlDlg'); if (!d) return;
  d.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { set(+b.dataset.pick); if (d.close) d.close(); else d.removeAttribute('open');
    try { if (+b.dataset.pick === 1 && localStorage.getItem('bcsim-tut') !== '1' && window.BCSIM && BCSIM.tutorial) BCSIM.tutorial(); } catch (e) { /* ok */ } }));
}
function init() {
  mark(); chooser();
  let v = null; try { v = parseInt(localStorage.getItem(KEY), 10); } catch (e) { /* ok */ }
  if (v >= 1 && v <= 4) set(v, true);
  else { set(3, true); const d = $('lvlDlg'); if (d) setTimeout(() => { try { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); } catch (e) { /* ok */ } }, 400); }
}
window.LEVELS = { get, set, advise, NAMES, DESC };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
