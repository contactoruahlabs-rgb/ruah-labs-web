// RUAH LABS — Compilador JSX → JS
// Uso: npm run build
// Resultado: carpeta public/ lista para arrastrar a Netlify

const fs   = require('fs');
const path = require('path');

let babel;
try { babel = require('@babel/core'); } catch(e) {
  console.error('Falta @babel/core. Ejecuta: npm install --save-dev @babel/core @babel/preset-react');
  process.exit(1);
}

const SRC = path.join(__dirname, '..', 'src');
const OUT = path.join(__dirname, '..', 'public');

// Limpiar output
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let compiled = 0;
let copied   = 0;

// Versión de build para cache-busting (?v=...). Cambia en cada deploy,
// así el navegador re-descarga JS/CSS aunque tenga una versión vieja en caché.
const BUILD_VERSION = Date.now().toString(36);

function processDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);

    if (entry.isDirectory()) {
      processDir(srcPath, outPath);

    } else if (entry.name.endsWith('.jsx')) {
      // Compilar JSX → JS (sin módulos, React clásico como global)
      const code   = fs.readFileSync(srcPath, 'utf8');
      const result = babel.transformSync(code, {
        presets: [['@babel/preset-react', { runtime: 'classic' }]],
        sourceType: 'script',
        filename: entry.name,
      });
      const outJs = outPath.replace(/\.jsx$/, '.js');
      fs.writeFileSync(outJs, result.code);
      compiled++;

    } else if (entry.name === 'index.html') {
      // Actualizar index.html: quitar Babel CDN + cambiar .jsx → .js
      let html = fs.readFileSync(srcPath, 'utf8');

      // Quitar script de Babel standalone
      html = html.replace(/\s*<script[^>]*babel\.min\.js[^>]*><\/script>/g, '');

      // Cambiar type="text/babel" src="xxx.jsx" → src="xxx.js"
      html = html.replace(/type="text\/babel"\s+src="([^"]+)\.jsx"/g, 'src="$1.js"');
      html = html.replace(/type="text\/babel"\s*/g, '');

      // Cache-busting: añadir ?v=BUILD a los .js/.css LOCALES (no a CDNs con //).
      html = html.replace(/(src|href)="(?!https?:|\/\/)([^"]+\.(?:js|css))"/g,
        '$1="$2?v=' + BUILD_VERSION + '"');

      fs.writeFileSync(outPath, html);
      copied++;

    } else {
      // Omitir archivos > 25 MB (límite de Cloudflare Workers)
      const fileSizeMB = fs.statSync(srcPath).size / (1024 * 1024);
      if (fileSizeMB > 25) {
        console.warn(`  ⚠️  Omitido (${fileSizeMB.toFixed(1)} MB > 25 MB): ${entry.name}`);
      } else {
        fs.copyFileSync(srcPath, outPath);
        copied++;
      }
    }
  }
}

console.log('🔨 Compilando JSX...');
processDir(SRC, OUT);
console.log('');
console.log('✅ Build completado');
console.log('   JSX compilados:', compiled);
console.log('   Archivos copiados:', copied);
console.log('');
console.log('📁 Arrastra la carpeta public/ a Netlify');
