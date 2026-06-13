// Sube todos los assets locales a Cloudinary via base64
// Uso: node scripts/upload-assets.cjs

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// Cargar .env.local
const envPath = path.join(__dirname, '..', '.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(function(line) {
  var eq = line.indexOf('=');
  if (eq > 0) {
    var k = line.slice(0, eq).trim();
    var v = line.slice(eq + 1).trim();
    if (k && !process.env[k]) process.env[k] = v;
  }
});

// Parsear CLOUDINARY_URL
var CLD_URL = process.env.CLOUDINARY_URL || '';
if (!CLD_URL) { console.error('❌ Falta CLOUDINARY_URL en .env.local'); process.exit(1); }
var _rest      = CLD_URL.replace('cloudinary://', '');
var _at        = _rest.indexOf('@');
var _colon     = _rest.indexOf(':');
var CLD_KEY    = _rest.slice(0, _colon);
var CLD_SECRET = _rest.slice(_colon + 1, _at);
var CLD_CLOUD  = _rest.slice(_at + 1);

console.log('Cloud:', CLD_CLOUD, '| Key:', CLD_KEY);

async function uploadFile(filePath, folder) {
  var filename  = path.basename(filePath);
  var ext       = path.extname(filename).toLowerCase();
  var isVideo   = ['.mp4', '.mov', '.webm'].includes(ext);
  var resource  = isVideo ? 'video' : 'image';

  var timestamp = Math.round(Date.now() / 1000);
  var toSign    = 'folder=' + folder + '&timestamp=' + timestamp + CLD_SECRET;
  var signature = crypto.createHash('sha256').update(toSign).digest('hex');

  // Leer como base64
  var b64  = fs.readFileSync(filePath).toString('base64');
  var mime = isVideo ? 'video/mp4' : ('image/' + (ext.slice(1) === 'jpg' ? 'jpeg' : ext.slice(1)));
  var dataUri = 'data:' + mime + ';base64,' + b64;

  var body = JSON.stringify({
    file:      dataUri,
    api_key:   CLD_KEY,
    timestamp: timestamp,
    signature: signature,
    folder:    folder,
  });

  var url = 'https://api.cloudinary.com/v1_1/' + CLD_CLOUD + '/' + resource + '/upload';
  var res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    body,
  });
  var data = await res.json();

  if (data.secure_url) {
    console.log('✅', filename, '->', data.secure_url);
    return { filename, url: data.secure_url };
  } else {
    console.error('❌', filename, JSON.stringify(data.error || data));
    return null;
  }
}

async function main() {
  var assetsDir = path.join(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ No existe public/assets/ — los archivos deben estar ahí');
    process.exit(1);
  }

  var files = fs.readdirSync(assetsDir).filter(function(f) {
    return /\.(png|jpg|jpeg|webp|mp4|mov|webm|gif|svg)$/i.test(f);
  });

  if (!files.length) { console.error('❌ Sin archivos en public/assets/'); process.exit(1); }

  console.log('\nSubiendo', files.length, 'archivos → carpeta ruahlabs\n');

  var results = [];
  for (var f of files) {
    var r = await uploadFile(path.join(assetsDir, f), 'ruahlabs');
    if (r) results.push(r);
  }

  console.log('\n=== URLs generadas ===');
  results.forEach(function(r) {
    console.log(r.filename + ':\n  ' + r.url + '\n');
  });
}

main().catch(console.error);
