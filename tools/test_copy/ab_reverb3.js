// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// Test copy only (tools/make_test_copy.js --module ab_reverb3): the owner's listening test of three reverbs (version 1.0.16, "ça fait donc trois choix à tester"): ACTUELLE = the Classic
// of 1.0.15 (every new setting at its default: the same sound bit for bit), CLASSIC AMÉLIORÉE = the same Freeverb with the sliders' settings, HALL = the feedback delay network (REVERB TYPE
// Hall) with the same settings and the same level. The settings are global hidden performance settings: every preset with reverb, the demo too, plays them. The Hall is in core.js only:
// the page runs the JavaScript engine for the three (the same engine for a fair comparison). The released app has no such panel.
(function () {
  'use strict';
  const T = window.WS_TEST;
  if (!T) return;
  T.setEngine('js');   // before the audio starts: the worklet is made with the JavaScript engine
  const DEF = { fx_rstereo: 0, fx_rpre: 0, fx_rdamp: 0.25, fx_rhp: 20, fx_rwidth: 1 };            // the reverb of 1.0.15
  const want = { fx_rstereo: 0.6, fx_rpre: 0.02, fx_rdamp: 0.4, fx_rhp: 150, fx_rwidth: 1 };      // the base setting proposed (tools/reverb_demo.js: the same reverb level as 1.0.15)
  const CHOICES = [['ACTUELLE (1.0.15)', 0], ['CLASSIC AMÉLIORÉE', 1], ['HALL', 2]];
  let choice = 1;
  const apply = () => {
    for (const k of Object.keys(DEF)) T.setParam(k, choice ? want[k] : DEF[k]);
    T.setParam('fx_rtype', choice === 2 ? 1 : 0);
  };
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#14161c;color:#e8e2d0;border:1px solid #c9a24a;border-radius:8px;' +
    'padding:10px 12px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.5);width:290px';
  const title = document.createElement('div');
  title.textContent = 'TEST 1.0.16 · trois réverbes';
  title.style.cssText = 'font-weight:700;letter-spacing:.03em;margin-bottom:6px;color:#c9a24a';
  box.appendChild(title);
  const line = () => { const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0'; box.appendChild(r); return r; };
  // the three choices
  const r0 = document.createElement('div'); r0.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin:4px 0 8px'; box.appendChild(r0);
  const btns = CHOICES.map(([label, k]) => {
    const b = document.createElement('button');
    b.textContent = `${k + 1} · ${label}`;
    b.style.cssText = 'cursor:pointer;border-radius:5px;border:1px solid #c9a24a;padding:4px 9px;font:600 12px system-ui,sans-serif;text-align:left';
    b.onclick = () => { choice = k; apply(); show(); };
    r0.appendChild(b);
    return b;
  });
  const sliders = [];
  const show = () => {
    btns.forEach((b, k) => { b.style.background = k === choice ? '#c9a24a' : '#2a2d36'; b.style.color = k === choice ? '#14161c' : '#e8e2d0'; });
    sliders.forEach(s => { s.style.opacity = choice ? '1' : '0.45'; });
  };
  // the settings of choices 2 and 3 (moving one on ACTUELLE goes to CLASSIC AMÉLIORÉE)
  const slider = (label, key, min, max, step, fmt) => {
    const r = line(), l = document.createElement('span'), s = document.createElement('input'), v = document.createElement('span');
    l.textContent = label; l.style.minWidth = '92px';
    s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = want[key]; s.style.flex = '1';
    v.style.cssText = 'min-width:52px;text-align:right;font-variant-numeric:tabular-nums';
    const val = () => { v.textContent = fmt(+s.value); };
    s.oninput = () => { want[key] = +s.value; if (!choice) choice = 1; apply(); show(); val(); };
    val();
    r.appendChild(l); r.appendChild(s); r.appendChild(v);
    sliders.push(r);
  };
  slider('Entrée stéréo', 'fx_rstereo', 0, 1, 0.01, x => Math.round(x * 100) + ' %');
  slider('Pré-délai', 'fx_rpre', 0, 0.1, 0.001, x => Math.round(x * 1000) + ' ms');
  slider('Amortissement', 'fx_rdamp', 0, 0.6, 0.01, x => x.toFixed(2));
  slider('Coupe-bas', 'fx_rhp', 20, 300, 1, x => (x <= 20 ? 'off' : Math.round(x) + ' Hz'));
  slider('Largeur', 'fx_rwidth', 0, 1, 0.01, x => Math.round(x * 100) + ' %');
  const note = document.createElement('div');
  note.textContent = 'Même niveau de réverbe pour les trois. Les curseurs règlent les choix 2 et 3. Tous les presets avec réverbe, et la démo, jouent le choix fait. Moteur JavaScript pour les trois.';
  note.style.cssText = 'margin-top:6px;color:#9a9484;font-size:11px';
  box.appendChild(note);
  apply(); show();
  const add = () => document.body.appendChild(box);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
