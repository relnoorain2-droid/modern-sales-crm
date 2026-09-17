const fs = require('node:fs');
fs.mkdirSync('vendor', { recursive: true });
for (const [source, target] of [
  ['node_modules/jspdf/dist/jspdf.umd.min.js', 'jspdf.js'],
  ['node_modules/lucide/dist/umd/lucide.js', 'lucide.js'],
  ['node_modules/papaparse/papaparse.min.js', 'papaparse.js']
]) fs.copyFileSync(source, `vendor/${target}`);
for (const name of ['jspdf', 'lucide', 'papaparse']) {
  const file = fs.readdirSync(`node_modules/${name}`).find(file => /^licen[sc]e(?:\.txt|\.md)?$/i.test(file));
  if (file) fs.copyFileSync(`node_modules/${name}/${file}`, `vendor/${name}-LICENSE.txt`);
}
