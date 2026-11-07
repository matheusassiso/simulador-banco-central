const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;
let data = { mode: 'BR', scen: '', scens: [], lang: 'pt', view: 'painel', level: 3 };

const T = {
  pt: {
    game: 'Jogo', newg: 'Nova economia', restart: 'Reiniciar partida', step: 'Avançar um mês', auto: 'Rodar automático / pausar',
    exp: 'Exportar registro de decisões', quit: 'Sair', scen: 'Cenário', mode: 'Modo', br: 'Brasil · BCB', cl: 'Clássico',
    level: 'Nível', levels: ['Casual', 'Curioso', 'Economista', 'Pesquisador'],
    view: 'Exibir', lang: 'Idioma', help: 'Ajuda', how: 'Como jogar', about: 'Sobre',
    zin: 'Aumentar zoom', zout: 'Diminuir zoom', z0: 'Zoom padrão', full: 'Tela cheia',
    views: { painel: 'Painel', previsao: 'Previsão', monitores: 'Monitores', mercados: 'Mercados e famílias', governo: 'Governo',
      compartilhar: 'Compartilhar', caos: 'Laboratório do Caos', pesquisa: 'Pesquisa (DSGE)', historico: 'Conquistas e histórico', ranking: 'Ranking', diario: 'Diário' },
    aboutText: 'Jogo de política monetária (Brasil e clássico), com modelos, cenários, conquistas e ranking. Funciona sem internet.'
  },
  en: {
    game: 'Game', newg: 'New economy', restart: 'Restart game', step: 'Advance one month', auto: 'Auto-run / pause',
    exp: 'Export decision log', quit: 'Quit', scen: 'Scenario', mode: 'Mode', br: 'Brazil · BCB', cl: 'Classic',
    level: 'Level', levels: ['Casual', 'Curious', 'Economist', 'Researcher'],
    view: 'View', lang: 'Language', help: 'Help', how: 'How to play', about: 'About',
    zin: 'Zoom in', zout: 'Zoom out', z0: 'Actual size', full: 'Full screen',
    views: { painel: 'Dashboard', previsao: 'Forecast', monitores: 'Monitors', mercados: 'Markets and households', governo: 'Government',
      compartilhar: 'Share', caos: 'Chaos Lab', pesquisa: 'Research (DSGE)', historico: 'Achievements and history', ranking: 'Ranking', diario: 'Log' },
    aboutText: 'Monetary policy game (Brazil and classic), with models, scenarios, achievements and a ranking. Works offline.'
  }
};

const send = c => { if (win && !win.isDestroyed()) win.webContents.send('cmd', c); };

function buildMenu() {
  const t = T[data.lang] || T.pt;
  const tpl = [
    { label: t.game, submenu: [
      { label: t.newg, accelerator: 'CmdOrCtrl+N', click: () => send({ a: 'new' }) },
      { label: t.restart, accelerator: 'CmdOrCtrl+R', click: () => send({ a: 'restart' }) },
      { type: 'separator' },
      { label: t.step, accelerator: 'CmdOrCtrl+Return', click: () => send({ a: 'step' }) },
      { label: t.auto, accelerator: 'CmdOrCtrl+Shift+Return', click: () => send({ a: 'auto' }) },
      { type: 'separator' },
      { label: t.exp, click: () => send({ a: 'export' }) },
      { type: 'separator' },
      { label: t.quit, role: 'quit' }
    ] },
    { label: t.mode, submenu: [
      { label: t.br, type: 'radio', checked: data.mode === 'BR', click: () => send({ a: 'mode', v: 'BR' }) },
      { label: t.cl, type: 'radio', checked: data.mode === 'CL', click: () => send({ a: 'mode', v: 'CL' }) }
    ] },
    { label: t.scen, submenu: data.scens.length
      ? data.scens.map(s => ({ label: s.name, type: 'radio', checked: s.k === data.scen, click: () => send({ a: 'scen', v: s.k }) }))
      : [{ label: '…', enabled: false }] },
    { label: t.view, submenu: [
      ...Object.keys(t.views).map((k, i) => ({ label: t.views[k], type: 'radio', checked: data.view === k,
        accelerator: i < 9 ? 'CmdOrCtrl+' + (i + 1) : undefined, click: () => send({ a: 'view', v: k }) })),
      { type: 'separator' },
      { label: t.zin, role: 'zoomIn' }, { label: t.zout, role: 'zoomOut' }, { label: t.z0, role: 'resetZoom' },
      { label: t.full, role: 'togglefullscreen' }
    ] },
    { label: t.level, submenu: [1, 2, 3, 4].map(k => ({ label: t.levels[k - 1], type: 'radio', checked: data.level === k, accelerator: 'CmdOrCtrl+Alt+' + k, click: () => send({ a: 'level', v: k }) })) },
    { label: t.lang, submenu: [
      { label: 'Português (Brasil)', type: 'radio', checked: data.lang === 'pt', click: () => send({ a: 'lang', v: 'pt' }) },
      { label: 'English', type: 'radio', checked: data.lang === 'en', click: () => send({ a: 'lang', v: 'en' }) }
    ] },
    { label: t.help, submenu: [
      { label: t.how, accelerator: 'F1', click: () => send({ a: 'how' }) },
      { label: t.about, click: () => dialog.showMessageBox(win, { type: 'info', title: t.about,
        message: 'Simulador do Banco Central ' + app.getVersion(), detail: t.aboutText, buttons: ['OK'] }) }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1360, height: 900, minWidth: 980, minHeight: 640,
    backgroundColor: '#f2f5f1', title: 'Simulador do Banco Central', show: false, icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  // o app só abre o próprio jogo; links externos vão para o navegador
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); } });
  win.on('page-title-updated', e => e.preventDefault());
}

ipcMain.on('menu-data', (_e, d) => {
  if (!d || typeof d !== 'object') return;
  data = Object.assign(data, {
    mode: d.mode === 'CL' ? 'CL' : 'BR',
    scen: String(d.scen || ''),
    scens: Array.isArray(d.scens) ? d.scens.slice(0, 40).map(s => ({ k: String(s.k), name: String(s.name) })) : data.scens,
    lang: d.lang === 'en' ? 'en' : 'pt',
    view: typeof d.view === 'string' ? d.view : data.view,
    level: [1, 2, 3, 4].indexOf(d.level) >= 0 ? d.level : data.level
  });
  buildMenu();
});

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => { buildMenu(); createWindow(); });
app.on('window-all-closed', () => app.quit());
