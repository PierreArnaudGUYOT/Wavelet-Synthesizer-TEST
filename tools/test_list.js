// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// TEST BUILD: writes "PRESETS TO TEST.txt" (numbered list of the presets of the test plugin, with what each new one is)
// at the root of the test folder and next to the plugin in build\.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const spec = require('./spec.js');
const L = [];
L.push('WAVELET SYNTHESIZER TEST - presets to listen to');
L.push('=============================================');
L.push('');
L.push('Plugin: "Wavelet Synthesizer TEST" (installs next to the official Wavelet Synthesizer).');
L.push('Every preset name starts with its number: note the numbers you like, they will be copied into the official version.');
L.push('A = engine A (subtractive), B = engine B (additive), AB = both engines mixed.');
L.push('"Wave" in a name = a preset that exploits the wavelets (morph, sparsity, position window, Haar...).');
L.push('');
L.push('NEW: WAVELET MORPH (engine A panel: WAVELET 2, MORPH, ENV>WAV; LFO section: WAVELET).');
L.push('The sound is also built with WAVELET 2 and the two are crossfaded: MORPH + LFO x "LFO > WAVELET" + mod envelope x ENV>WAV.');
L.push('In engine A the wavelet is heard where the sound is shaped in the wavelet domain: scale filter (cutoff, resonance),');
L.push('sparsity, position window. Presets 101-150 use the morph; many move the morph and the cutoff at the same time.');
L.push('');
let cat = '';
for (const p of spec.TEST_PRESETS) {
  if (p.cat !== cat) { cat = p.cat; L.push(''); L.push('--- ' + cat.replace('NEW · ', 'NEW: ') + ' ---'); }
  L.push(`${p.name.padEnd(36)} ${p.d}`);
}
L.push('');
L.push('');
L.push('--- For comparison: the official presets (version 0.2) ---');
cat = '';
for (const p of spec.OFFICIAL_PRESETS) {
  if (p.cat !== cat) { cat = p.cat; L.push(''); L.push('  ' + cat); }
  L.push('  ' + p.name);
}
const text = L.join('\r\n') + '\r\n';
fs.writeFileSync(path.join(ROOT, 'PRESETS TO TEST.txt'), text);
const b = path.join(ROOT, 'build');
if (fs.existsSync(b)) fs.writeFileSync(path.join(b, 'PRESETS TO TEST.txt'), text);
console.log(`PRESETS TO TEST.txt: ${spec.TEST_PRESETS.length} new presets + ${spec.OFFICIAL_PRESETS.length} official`);
