// RUAH LABS — Compilador JSX → JS + bundler
// Uso: npm run build
// Resultado: carpeta public/ lista para deploy en Cloudflare

const fs   = require('fs');
const path = require('path');

let babel;
try { babel = require('@babel/core'); } catch(e) {
  console.error('Falta @babel/core. Ejecuta: npm install --save-dev @babel/core @babel/preset-react');
  process.exit(1);
}

const SRC = path.join(__dirname, '..', 'src');
const OUT = path.join(__dirname, '..', 'public');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let compiled = 0;
let copied   = 0;

const BUILD_VERSION = Date.now().toString(36);

// Archivos que van al bundle principal (orden de carga importa)
const BUNDLE_ORDER = ['supabase-rest', 'data', 'sections', 'extras', 'eventos', 'club', 'checkout', 'secret', 'app'];
const BUNDLE_SET   = new Set(BUNDLE_ORDER);
const bundleChunks = {};

function processDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);
    const baseName = entry.name.replace(/\.(jsx?)$/, '');

    if (entry.isDirectory()) {
      processDir(srcPath, outPath);

    } else if (entry.name.endsWith('.jsx')) {
      const code   = fs.readFileSync(srcPath, 'utf8');
      const result = babel.transformSync(code, {
        presets: [['@babel/preset-react', { runtime: 'classic' }]],
        sourceType: 'script',
        filename:   entry.name,
      });
      compiled++;
      if (BUNDLE_SET.has(baseName)) {
        bundleChunks[baseName] = result.code;  // va al bundle
      } else {
        // admin.jsx → admin.js separado (protegido en el Worker)
        fs.writeFileSync(outPath.replace(/\.jsx$/, '.js'), result.code);
      }

    } else if (entry.name === 'index.html') {
      let html = fs.readFileSync(srcPath, 'utf8');

      // Quitar Babel CDN y su comentario
      html = html.replace(/[ \t]*<!--[^>]*[Bb]abel[^>]*-->\n?/g, '');
      html = html.replace(/[ \t]*<script[^>]*babel\.min\.js[^>]*><\/script>[ \t]*\n?/g, '');

      // Quitar scripts que van al bundle (supabase-rest + todos los .jsx del bundle)
      html = html.replace(/[ \t]*<script[^>]*\bsrc="supabase-rest\.js"[^>]*><\/script>[ \t]*\n?/g, '');
      html = html.replace(
        /[ \t]*<script[^>]*\bsrc="(?:data|sections|extras|eventos|club|checkout|secret|app)\.jsx?"[^>]*><\/script>[ \t]*\n?/g,
        ''
      );

      // admin.jsx → admin.js (script separado, se queda en el HTML)
      html = html.replace(/type="text\/babel"\s+src="admin\.jsx"/g, 'src="admin.js"');
      html = html.replace(/type="text\/babel"\s*/g, '');

      // Cache-busting en assets locales
      html = html.replace(
        /(src|href)="(?!https?:|\/\/)([^"]+\.(?:js|css))"/g,
        '$1="$2?v=' + BUILD_VERSION + '"'
      );

      // Inyectar bundle.js justo después de admin.js (admin debe cargarse primero)
      html = html.replace(
        /(<script src="admin\.js\?v=[^"]*"><\/script>)/,
        '$1\n  <script src="bundle.js?v=' + BUILD_VERSION + '"></script>'
      );

      fs.writeFileSync(outPath, html);
      copied++;

    } else if (entry.name.endsWith('.js') && BUNDLE_SET.has(baseName)) {
      // supabase-rest.js → va al bundle, no se copia solo
      bundleChunks[baseName] = fs.readFileSync(srcPath, 'utf8');
      copied++;

    } else {
      const fileSizeMB = fs.statSync(srcPath).size / (1024 * 1024);
      if (fileSizeMB > 25) {
        console.warn('  ⚠️  Omitido (' + fileSizeMB.toFixed(1) + ' MB > 25 MB): ' + entry.name);
      } else {
        fs.copyFileSync(srcPath, outPath);
        copied++;
      }
    }
  }
}

console.log('🔨 Compilando JSX...');
processDir(SRC, OUT);

// Escribir bundle.js en orden correcto
const bundleParts = BUNDLE_ORDER
  .filter(name => bundleChunks[name])
  .map(name => '/* ' + name + ' */\n' + bundleChunks[name]);
fs.writeFileSync(path.join(OUT, 'bundle.js'), bundleParts.join('\n\n'));

console.log('');
console.log('✅ Build completado');
console.log('   JSX compilados:', compiled);
console.log('   Archivos copiados/acumulados:', copied);
console.log('   Bundle: bundle.js (' + BUNDLE_ORDER.filter(n => bundleChunks[n]).join(', ') + ')');
console.log('   Separado (protegido): admin.js');
console.log('');
console.log('📦 Deploy: npx wrangler@4.100.0 deploy');
