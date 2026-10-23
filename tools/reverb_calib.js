// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// Version 1.0.16: the level of REVERB TYPE Hall against Classic (the Freeverb), so that a preset moved to Hall keeps the level of its reverb. Each factory preset with reverb plays a chord
// (C3 E3 G3 held 1.5 s, then 2.5 s of tail) with the master 12 dB down (the output stage stays out of the way); the wet signal is the render minus the same render with REVERB MIX 0
// (the reverb only adds to the sound). Prints, per preset, the RMS of the wet signal of Hall over Classic's (dB) and the decay time of the tail, and the median ratio: RV_OUT in
// web/js/core.js is to be multiplied by it (written as a factor).
//   node tools/reverb_calib.js [--max 40]
'use strict';
const SPEC = require('../web/js/spec.js'), C = require('../web/js/core.js')(SPEC), P = C.P, sr = 48000;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const MAX = +arg('max', 40), HOLD = 1.5, TAIL = 2.5, blk = 128, n = Math.round((HOLD + TAIL) * sr);
const render = (values, rtype, rmix) => {
  const v = Float64Array.from(values); v[P.master] = Math.max(-36, v[P.master] - 12); v[P.fx_rtype] = rtype; v[P.fx_rmix] = rmix; v[P.vel_amt] = 0;
  const eng = new C.Engine(sr); v.forEach((x, i) => eng.setParam(i, x)); eng.vol = Math.exp(v[P.master] * Math.LN10 / 20);
  eng.setTables(C.buildTables(v, true));
  const L = new Float32Array(n), R = new Float32Array(n), off = Math.round(HOLD * sr / blk) * blk;
  for (let s = 0; s < n; s += blk) {
    if (s === 0) for (const k of [48, 52, 55]) eng.noteOn(k, 0.8);
    if (s === off) for (const k of [48, 52, 55]) eng.noteOff(k);
    eng.process(L.subarray(s, s + blk), R.subarray(s, s + blk), blk);
  }
  return [L, R];
};
const wet = (values, rtype) => { const a = render(values, rtype, values[P.fx_rmix]), d = render(values, rtype, 0); return [a[0].map((x, i) => x - d[0][i]), a[1].map((x, i) => x - d[1][i])]; };
const rms = (w, i0, i1) => { let e = 0; for (let i = i0; i < i1; i++) e += w[0][i] * w[0][i] + w[1][i] * w[1][i]; return Math.sqrt(e / (2 * (i1 - i0))); };
// the time the tail of the wet signal takes to fall by 20 dB after the release (x 3: an estimate of RT60)
const t20 = (w) => { const i0 = Math.round(HOLD * sr), win = Math.round(0.05 * sr), e0 = rms(w, i0, i0 + win); for (let i = i0; i + win < n; i += win) if (rms(w, i, i + win) < e0 * 0.1) return (i - i0) / sr; return NaN; };
const list = SPEC.PRESETS.filter(p => p.values[P.fx_rmix] > 0).slice(0, MAX);
const ratios = [];
console.log('preset                                    size  mix  | Hall / Classic wet (dB) | tail -20 dB Classic / Hall (s)');
for (const p of list) {
  const c = wet(p.values, 0), h = wet(p.values, 1), rc = rms(c, 0, n), rh = rms(h, 0, n), db = 20 * Math.log10(rh / rc);
  ratios.push(rc / rh);
  console.log(`${p.name.slice(0, 40).padEnd(40)} ${p.values[P.fx_rsize].toFixed(2)} ${p.values[P.fx_rmix].toFixed(2)} | ${db.toFixed(1).padStart(6)} | ${t20(c).toFixed(2)} / ${t20(h).toFixed(2)}`);
}
ratios.sort((a, b) => a - b);
const med = ratios[ratios.length >> 1];
console.log(`${list.length} presets: median Classic / Hall wet RMS = ${med.toFixed(4)} (${(20 * Math.log10(med)).toFixed(2)} dB): multiply RV_OUT by it`);
