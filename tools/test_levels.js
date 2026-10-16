// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// TEST BUILD: matches the loudness of the candidate presets (tools/test_presets.js) to OktoPierre's favourites, like the
// official presets: loudest 200 ms of a held C major chord (50 ms and 3 dB lower for drums), master rounded to 0.5 dB,
// peak kept under 0 dBFS. Writes tools/test_levels.json (master per preset), then: node tools/gen_spec.js
// Usage: node tools/test_levels.js [--write]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const S = require(path.join(ROOT, 'web', 'js', 'spec.js'));
const C = require(path.join(ROOT, 'web', 'js', 'core.js'))(S);
const sr = 48000, P = C.P;
function measure(values, win) {
  const eng = new C.Engine(sr);
  values.forEach((v, i) => eng.setParam(i, v));
  eng.setTables(C.buildTables(Float64Array.from(values), true));
  const n = Math.ceil(3 * sr / 128), L = new Float32Array(128), R = new Float32Array(128), pw = new Float32Array(n * 128);
  let pk = 0, bad = 0;
  for (let b = 0; b < n; b++) {
    if (b === 0) { eng.noteOn(60, 0.85); eng.noteOn(64, 0.85); eng.noteOn(67, 0.85); }
    if (b === Math.floor(2.5 * sr / 128)) eng.allNotesOff();
    eng.process(L, R, 128);
    for (let i = 0; i < 128; i++) {
      if (!isFinite(L[i]) || !isFinite(R[i])) bad++;
      pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
      pw[b * 128 + i] = 0.5 * (L[i] * L[i] + R[i] * R[i]);
    }
  }
  const W = Math.round(win * sr);
  let s = 0, best = 0;
  for (let i = 0; i < pw.length; i++) { s += pw[i]; if (i >= W) s -= pw[i - W]; if (i >= W - 1) best = Math.max(best, s / W); }
  return { db: 10 * Math.log10(best + 1e-20), pk, bad };
}
const fav = S.PRESETS.filter(p => p.cat === '★ Favourites').map(p => measure(p.values, 0.2).db).sort((a, b) => a - b);
const target = fav[Math.floor(fav.length / 2)];
console.log(`favourites: median ${target.toFixed(1)} dB (${fav.length} presets)`);
const mp = S.PARAMS[P.master], out = {};
let problems = 0;
for (const pr of S.PRESETS) {
  if (!pr.cat.startsWith('NEW · ')) continue;
  const drums = pr.cat === 'NEW · Drums & Perc';
  const r = measure(pr.values, drums ? 0.05 : 0.2), cur = pr.values[P.master];
  let m = Math.max(mp.min, Math.min(mp.max, Math.round((cur + target - (drums ? 3 : 0) - r.db) * 2) / 2));
  const pk = r.pk * Math.pow(10, (m - cur) / 20);
  if (pk > 0.98) m = Math.round((m - 20 * Math.log10(pk / 0.98) - 0.25) * 2) / 2;
  out[pr.name.replace(/^\d{3} · /, '')] = m;
  const flag = r.bad ? '  NOT FINITE' : r.pk < 1e-3 ? '  SILENT' : '';
  if (flag) problems++;
  console.log(`${pr.name.padEnd(32)} ${r.db.toFixed(1).padStart(6)} dB peak ${r.pk.toFixed(2)}  master ${cur} -> ${m}${flag}`);
}
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(__dirname, 'test_levels.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('written tools/test_levels.json');
}
console.log(problems ? problems + ' PROBLEMS' : 'all candidates sound and are finite');
