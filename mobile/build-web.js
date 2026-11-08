// Copia os arquivos web do app (raiz do repositório) para mobile/www, que o Capacitor empacota.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(__dirname, 'www');
const files = ['index.html', 'lang.js', 'platform.js', 'config.js', 'dsge.js', 'dsge-models.js', 'research.js', 'chaos.js', 'chaos-ui.js', 'frbus.js', 'frbus-model.js', 'frbus-data.js', 'frbus-ui.js', 'levels.js', 'manifest.webmanifest', 'icon-256.png'];
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
files.forEach(f => fs.copyFileSync(path.join(root, f), path.join(out, f)));
console.log('mobile/www: ' + files.length + ' arquivos');
