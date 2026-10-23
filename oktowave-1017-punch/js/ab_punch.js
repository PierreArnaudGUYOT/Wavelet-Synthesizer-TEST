// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// Test copy only (tools/make_test_copy.js --module ab_punch): the owner's listening test of PUNCH (version 1.0.17, "les presets manquent un peu de percutant dans les basses"): a boost of
// every note's start, larger on the low notes, that never lowers the level. ACTUELLE = PUNCH 0 (the sound of 1.0.16, bit for bit), LÉGER and FORT = the two settings of the recorded
// demo, the sliders = any setting. Global hidden performance settings: every preset, the demo too, plays them. The released app has no such panel.
(function () {
  'use strict';
  const T = window.WS_TEST;
  if (!T) return;
  const PRESETS = [{ punch: 0, punch_t: 0.05, punch_key: 1 }, { punch: 4, punch_t: 0.04, punch_key: 1 }, { punch: 8, punch_t: 0.05, punch_key: 1 }];
  const NAMES = ['ACTUELLE (1.0.16)', 'PUNCH LÉGER', 'PUNCH FORT'];
  const cur = Object.assign({}, PRESETS[1]);
  let choice = 1;
  const apply = () => { for (const k of Object.keys(cur)) T.setParam(k, cur[k]); };
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#14161c;color:#e8e2d0;border:1px solid #c9a24a;border-radius:8px;' +
    'padding:10px 12px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.5);width:290px';
  const title = document.createElement('div');
  title.textContent = 'TEST · punch des basses';
  title.style.cssText = 'font-weight:700;letter-spacing:.03em;margin-bottom:6px;color:#c9a24a';
  box.appendChild(title);
  const r0 = document.createElement('div'); r0.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin:4px 0 8px'; box.appendChild(r0);
  const sliders = [];
  const btns = NAMES.map((label, k) => {
    const b = document.createElement('button');
    b.textContent = `${k + 1} · ${label}`;
    b.style.cssText = 'cursor:pointer;border-radius:5px;border:1px solid #c9a24a;padding:4px 9px;font:600 12px system-ui,sans-serif;text-align:left';
    b.onclick = () => { choice = k; Object.assign(cur, PRESETS[k]); apply(); sliders.forEach(s => s.sync()); show(); };
    r0.appendChild(b);
    return b;
  });
  const show = () => btns.forEach((b, k) => { b.style.background = k === choice ? '#c9a24a' : '#2a2d36'; b.style.color = k === choice ? '#14161c' : '#e8e2d0'; });
  const slider = (label, key, min, max, step, fmt) => {
    const r = document.createElement('div'), l = document.createElement('span'), s = document.createElement('input'), v = document.createElement('span');
    r.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0';
    l.textContent = label; l.style.minWidth = '92px';
    s.type = 'range'; s.min = min; s.max = max; s.step = step; s.style.flex = '1';
    v.style.cssText = 'min-width:52px;text-align:right;font-variant-numeric:tabular-nums';
    const val = () => { v.textContent = fmt(+s.value); };
    s.oninput = () => { cur[key] = +s.value; choice = -1; apply(); show(); val(); };   // a setting of its own: none of the three buttons
    sliders.push({ sync: () => { s.value = cur[key]; val(); } });
    s.value = cur[key]; val();
    r.appendChild(l); r.appendChild(s); r.appendChild(v); box.appendChild(r);
  };
  slider('Renfort', 'punch', 0, 12, 0.5, x => (x ? '+' + x.toFixed(1) + ' dB' : 'off'));
  slider('Durée', 'punch_t', 0.005, 0.3, 0.005, x => Math.round(x * 1000) + ' ms');
  slider('Graves', 'punch_key', 0, 1, 0.05, x => (x ? Math.round(x * 100) + ' %' : 'partout pareil'));
  const note = document.createElement('div');
  note.textContent = 'Renfort du début de chaque note, plus fort sur les graves (« Graves » : 100 % = tout sur les notes graves, un quart dans l’aigu ; 0 = pareil partout). Il ne baisse jamais le volume. Tous les presets et la démo jouent ce réglage.';
  note.style.cssText = 'margin-top:6px;color:#9a9484;font-size:11px';
  box.appendChild(note);
  apply(); show();
  const add = () => document.body.appendChild(box);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
