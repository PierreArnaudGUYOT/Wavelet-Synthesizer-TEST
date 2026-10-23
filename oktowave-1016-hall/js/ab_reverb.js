// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// Test copy only (tools/make_test_copy.js --module ab_reverb): the owner's listening test of REVERB TYPE Hall (version 1.0.16). It switches the global hidden settings fx_rtype (Classic /
// Hall: every preset with reverb, the demo too, plays the type chosen), fx_rpre (pre-delay) and fx_rdamp (damping). The page opens on Hall. The released app has no such panel.
(function () {
  'use strict';
  const T = window.WS_TEST;
  if (!T) return;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#14161c;color:#e8e2d0;border:1px solid #c9a24a;border-radius:8px;' +
    'padding:10px 12px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.5);width:250px';
  const title = document.createElement('div');
  title.textContent = 'TEST 1.0.16 · réverbe Hall';
  title.style.cssText = 'font-weight:700;letter-spacing:.04em;margin-bottom:6px;color:#c9a24a';
  box.appendChild(title);
  const line = () => { const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0'; box.appendChild(r); return r; };
  // the type: a button
  {
    const r = line(), l = document.createElement('span'), b = document.createElement('button');
    l.textContent = 'Réverbe';
    b.style.cssText = 'cursor:pointer;border-radius:5px;border:1px solid #c9a24a;padding:3px 9px;font:600 12px system-ui,sans-serif;min-width:130px';
    const show = () => { const hall = T.getParam('fx_rtype') >= 0.5; b.textContent = hall ? 'HALL (nouvelle)' : 'CLASSIC (1.0.15)'; b.style.background = hall ? '#c9a24a' : '#2a2d36'; b.style.color = hall ? '#14161c' : '#e8e2d0'; };
    b.onclick = () => { T.setParam('fx_rtype', T.getParam('fx_rtype') >= 0.5 ? 0 : 1); show(); };
    T.setParam('fx_rtype', 1); show();
    r.appendChild(l); r.appendChild(b);
  }
  // pre-delay and damping: sliders (they act on the Hall only)
  const slider = (label, key, min, max, step, fmt) => {
    const r = line(), l = document.createElement('span'), s = document.createElement('input'), v = document.createElement('span');
    l.textContent = label; l.style.minWidth = '88px';
    s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = T.getParam(key); s.style.flex = '1';
    v.style.cssText = 'min-width:44px;text-align:right;font-variant-numeric:tabular-nums';
    const show = () => { v.textContent = fmt(+s.value); };
    s.oninput = () => { T.setParam(key, +s.value); show(); };
    show();
    r.appendChild(l); r.appendChild(s); r.appendChild(v);
  };
  slider('Pré-délai', 'fx_rpre', 0.001, 0.12, 0.001, x => Math.round(x * 1000) + ' ms');
  slider('Amortiss.', 'fx_rdamp', 0, 1, 0.01, x => Math.round(x * 100) + ' %');
  const note = document.createElement('div');
  note.textContent = 'Tous les presets avec réverbe (et la démo) jouent le type choisi. Pré-délai et amortissement agissent sur la Hall.';
  note.style.cssText = 'margin-top:6px;color:#9a9484;font-size:11px';
  box.appendChild(note);
  const add = () => document.body.appendChild(box);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
