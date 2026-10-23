// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// Version 1.0.15: a test copy of the web app for the owner (handover §7): web/ copied into <out> (a folder of the Wavelet-Synthesizer-TEST repository), plus the test modules asked for.
//   node tools/make_test_copy.js --out ../Wavelet-Synthesizer-TEST/oktowave-1015 [--ab]
//   --ab: the A/B panel of the output stage (tools/test_copy/ab_output.js: OUTPUT Limiter / Classic, CHORD COMP on / off)
//   --module ab_reverb: the panel of the REVERB TYPE Hall test (tools/test_copy/ab_reverb.js, version 1.0.16); --module can be given several times
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const ROOT = path.join(__dirname, '..'), OUTDIR = arg('out', '');
if (!OUTDIR) { console.error('usage: node tools/make_test_copy.js --out <folder> [--ab]'); process.exit(1); }
const out = path.resolve(OUTDIR), MARK = '.okto-test-copy';
// safety: only a folder this tool made (it holds MARK) or an empty / missing one is replaced; never a repository, the sources or a folder that contains them
const inside = (a, b) => { const r = path.relative(b, a); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };
if (inside(path.resolve(ROOT), out) || inside(process.cwd(), out)) { console.error(`refused: ${out} contains the sources or the current folder`); process.exit(1); }
if (fs.existsSync(out)) {
  const items = fs.readdirSync(out);
  if (items.includes('.git')) { console.error(`refused: ${out} is a git repository`); process.exit(1); }
  if (items.length && !items.includes(MARK)) { console.error(`refused: ${out} is not empty and was not made by make_test_copy.js`); process.exit(1); }
}
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'web'), out, { recursive: true });
fs.writeFileSync(path.join(out, MARK), 'made by tools/make_test_copy.js\n');
// the test modules: --ab (the output stage panel, version 1.0.15) and any --module <name> (tools/test_copy/<name>.js, version 1.0.16: ab_reverb), loaded after app.js
const modules = (process.argv.includes('--ab') ? ['ab_output'] : []).concat(process.argv.map((a, i) => (a === '--module' ? process.argv[i + 1] : null)).filter(Boolean));
for (const m of modules) {
  if (!/^[\w-]+$/.test(m) || !fs.existsSync(path.join(__dirname, 'test_copy', m + '.js'))) { console.error(`no test module tools/test_copy/${m}.js`); process.exit(1); }
  fs.copyFileSync(path.join(__dirname, 'test_copy', m + '.js'), path.join(out, 'js', m + '.js'));
  const f = path.join(out, 'index.html'), html = fs.readFileSync(f, 'utf8');
  const tag = '<script src="js/app.js"></script>';
  if (!html.includes(tag)) throw new Error('index.html: app.js script tag not found');
  fs.writeFileSync(f, html.replace(tag, tag + (html.includes('\r\n') ? '\r\n' : '\n') + `<script src="js/${m}.js"></script>`));
}
let n = 0; (function count(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? count(path.join(d, e.name)) : n++; })(out);
console.log(`test copy: ${out} (${n} files)`);
