// Teste de fumaça: abre o app, aciona comandos como o menu faria, grava um relatório e uma captura, e fecha.
// Uso: SMOKE_OUT=<prefixo> npx electron app/smoke.js
const { app, Menu } = require('electron');
const fs = require('fs');
require('./main');
const out = process.env.SMOKE_OUT || 'smoke';

app.on('browser-window-created', (_e, w) => {
  w.webContents.on('did-finish-load', async () => {
    try {
      await new Promise(r => setTimeout(r, 1500));
      const info = await w.webContents.executeJavaScript(`(async()=>{
        const $=id=>document.getElementById(id), sleep=ms=>new Promise(r=>setTimeout(r,ms)), o={};
        o.bridge=!!window.appBridge; o.app=document.documentElement.classList.contains('app'); o.lang=document.documentElement.lang;
        if($('tut').open)$('tutSkip').click();
        o.visible0=[...document.querySelectorAll('main section, .band-sec')].filter(s=>!s.hidden).map(s=>s.id||'painel').join(',');
        for(let i=0;i<12;i++)$('btnStep').click();
        document.querySelector('.tabs a[href="#mercados"]').click(); await sleep(150);
        o.visible1=[...document.querySelectorAll('main section, .band-sec')].filter(s=>!s.hidden).map(s=>s.id||'painel').join(',');
        document.querySelector('.tabs a[href="#painel"]').click(); await sleep(150);
        o.month=BCSIM.game().st.m; o.mastHidden=getComputedStyle(document.querySelector('.mast')).display;
        return o;})()`);
      fs.writeFileSync(out + '.json', JSON.stringify(info, null, 1));
      const img = await w.webContents.capturePage();
      fs.writeFileSync(out + '.png', img.toPNG());
      const menu = Menu.getApplicationMenu().items.map(i => i.label + ':' + i.submenu.items.length).join(' | ');
      fs.appendFileSync(out + '.json', '\n' + menu);
    } catch (e) { fs.writeFileSync(out + '.err', String(e && e.stack || e)); }
    setTimeout(() => app.quit(), 300);
  });
});
