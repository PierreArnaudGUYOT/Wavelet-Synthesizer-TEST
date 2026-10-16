// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// TEST BUILD (branch preset-test): listening session with votes, started by ▶ DEMO.
// Each of the 150 new presets (001-150) plays the same 5 s of Beethoven's Appassionata (III) — the busy passage from
// 0:13 of the demo — then a window asks for a vote from 1 to 10 stars. The votes are kept in this browser (stop and
// resume later) and written to a .txt file after every vote (Edge / Chrome: the file chosen at the start; otherwise the
// file is downloaded with the "Download the votes" button). The .txt is read later to keep and rank the good presets.
function WSVote(api) {
  'use strict';
  const P = api.P;
  const START = 12.9, LEN = 5;                 // the passage (seconds of the default demo) and its length
  const LEAD = 0.12;                           // seconds between loading a preset and its first note
  const STORE = 'ws.votes.test';
  const PRESETS = WS_SPEC.PRESETS.filter(p => p.cat.startsWith('NEW · '));   // 001-150
  // the same playing rules as the demo's preset tour: polyphonic, normal octave, no glide, short attacks, short echoes
  const SAFE = { v_voices: 16, v_oct: 0, v_glide: 0 };
  const MAX_ATTACK = 0.08, MAX_DMIX = 0.1, MAX_DFB = 0.3;

  // the 5 s passage: notes starting in [START, START + LEN), cut at the end of the passage
  const song = WS_DEMO_SONGS[0], notes = [];
  for (let i = 0; i < song.notes.length; i += 4) {
    const t = song.notes[i];
    if (t < START || t >= START + LEN) continue;
    notes.push(t - START, Math.min(song.notes[i + 1], START + LEN - t), song.notes[i + 2], song.notes[i + 3]);
  }
  const t0 = notes[0];
  for (let i = 0; i < notes.length; i += 4) notes[i] -= t0;   // starts on its first note

  const store = {
    get() { try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); return v && typeof v.votes === 'object' ? v : { votes: {} }; } catch (_) { return { votes: {} }; } },
    set(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (_) { /* storage unavailable */ } },
  };
  let data = store.get();            // { votes: { '001': 7, ... } }
  let s = null;                      // session: { k, saved, timer, phase: 'start'|'play'|'vote'|'end', handle }
  let win = null, fileHandle = null, writing = Promise.resolve();
  const num = (k) => PRESETS[k].name.slice(0, 3);
  const nextFree = () => { const k = PRESETS.findIndex(p => !data.votes[p.name.slice(0, 3)]); return k < 0 ? PRESETS.length : k; };
  const nVotes = () => Object.keys(data.votes).length;

  // ---------------------------------------------------------------- votes file
  function fileText() {
    const L = [];
    const d = new Date(), pad = (x) => String(x).padStart(2, '0');
    L.push('Wavelet Synthesizer TEST - preset votes (1 star = not good ... 10 stars = excellent)');
    L.push('Listening: Beethoven, Appassionata (III), 5 s from 0:13 of the demo; each preset played polyphonic at its normal octave.');
    L.push(`Saved: ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}   Votes: ${nVotes()} / ${PRESETS.length}`);
    L.push('');
    L.push('NUMBER | STARS | PRESET');
    for (const p of PRESETS) { const v = data.votes[p.name.slice(0, 3)]; L.push(`${p.name.slice(0, 3)} | ${v ? String(v).padStart(2) : ' -'} | ${p.name.slice(6)}`); }
    L.push('');
    L.push('RANKING (best first)');
    const ranked = PRESETS.filter(p => data.votes[p.name.slice(0, 3)]).sort((a, b) => data.votes[b.name.slice(0, 3)] - data.votes[a.name.slice(0, 3)] || (a.name < b.name ? -1 : 1));
    for (const p of ranked) L.push(`${String(data.votes[p.name.slice(0, 3)]).padStart(2)} | ${p.name}`);
    return L.join('\r\n') + '\r\n';
  }
  function saveFile() {
    store.set(data);
    if (!fileHandle) return;
    const h = fileHandle, text = fileText();
    writing = writing.then(async () => { const w = await h.createWritable(); await w.write(text); await w.close(); })
      .catch((e) => { status('Could not write the votes file (' + e.message + '); the votes stay saved in this browser.'); });
  }
  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([fileText()], { type: 'text/plain' }));
    a.download = 'wavelet-votes.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function chooseFile() {
    if (!window.showSaveFilePicker) { status('This browser cannot write a file directly: use "Download the votes" (Edge or Chrome can).'); return false; }
    try {
      fileHandle = await window.showSaveFilePicker({ suggestedName: 'wavelet-votes.txt', types: [{ description: 'Text file', accept: { 'text/plain': ['.txt'] } }] });
      saveFile();
      return true;
    } catch (_) { return false; }   // cancelled
  }

  // ---------------------------------------------------------------- window
  function build() {
    const st = document.createElement('style');
    st.textContent = `
.vote-win { position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%); width: min(640px, 94vw); z-index: 200;
  background: rgba(13,16,20,0.97); border: 1px solid #2fd4c6; border-radius: 12px; box-shadow: 0 16px 50px rgba(0,0,0,0.7);
  color: #e9edf2; font: 13px Segoe UI, system-ui, sans-serif; padding: 14px 18px 12px; display: none; }
.vote-win h3 { margin: 0 0 4px; font-size: 12px; letter-spacing: .12em; color: #2fd4c6; }
.vote-win .vname { font-size: 19px; font-weight: 700; margin: 2px 0 2px; }
.vote-win .vdesc { color: #9aa3b0; min-height: 18px; }
.vote-win .vstars { display: flex; gap: 6px; margin: 12px 0 8px; }
.vote-win .vstars button { flex: 1; height: 46px; border-radius: 8px; border: 1px solid #343b47; background: #1d2129; color: #ffcf4a;
  font-size: 17px; cursor: pointer; line-height: 1.05; }
.vote-win .vstars button small { display: block; font-size: 10px; color: #9aa3b0; }
.vote-win .vstars button:hover, .vote-win .vstars button.on { background: #ffcf4a; color: #0d1014; }
.vote-win .vstars button:hover small, .vote-win .vstars button.on small { color: #0d1014; }
.vote-win .vstars.off button { opacity: .35; pointer-events: none; }
.vote-win .vbar { height: 4px; background: #262c35; border-radius: 2px; overflow: hidden; margin: 6px 0 8px; }
.vote-win .vbar i { display: block; height: 100%; width: 0; background: #2fd4c6; }
.vote-win .vrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.vote-win .vrow button { padding: 6px 12px; border-radius: 6px; border: 1px solid #343b47; background: #1d2129; color: #e9edf2; cursor: pointer; font-size: 12px; }
.vote-win .vrow button.main { border-color: #2fd4c6; color: #2fd4c6; font-weight: 700; }
.vote-win .vrow button:hover { border-color: #2fd4c6; }
.vote-win .vstat { color: #9aa3b0; font-size: 11.5px; margin-top: 8px; min-height: 15px; }
.vote-win .vhelp { color: #6f7885; font-size: 11px; margin-top: 4px; }`;
    document.head.appendChild(st);
    const w = document.createElement('div');
    w.className = 'vote-win';
    w.innerHTML = '<h3 class="vtitle">LISTEN AND VOTE · 150 NEW PRESETS</h3><div class="vname"></div><div class="vdesc"></div>' +
      '<div class="vbar"><i></i></div><div class="vstars"></div><div class="vrow"></div><div class="vstat"></div>' +
      '<div class="vhelp">Keys: 1–9 and 0 (= 10) vote · R replays · ← previous · S skips · Esc stops. Your votes are kept in this browser.</div>';
    document.body.appendChild(w);
    win = { el: w, title: w.querySelector('.vtitle'), name: w.querySelector('.vname'), desc: w.querySelector('.vdesc'),
      bar: w.querySelector('.vbar i'), stars: w.querySelector('.vstars'), row: w.querySelector('.vrow'), stat: w.querySelector('.vstat') };
    for (let n = 1; n <= 10; n++) {
      const b = document.createElement('button');
      b.innerHTML = `${n}<small>${n === 1 ? 'not good' : n === 10 ? 'excellent' : '★'}</small>`;
      b.title = n + (n > 1 ? ' stars' : ' star');
      b.onclick = () => vote(n);
      win.stars.appendChild(b);
    }
  }
  function status(t) { if (win) win.stat.textContent = t; }
  function buttons(list) {
    win.row.innerHTML = '';
    for (const [label, fn, main] of list) {
      const b = document.createElement('button');
      b.textContent = label; if (main) b.className = 'main';
      b.onclick = fn;
      win.row.appendChild(b);
    }
  }
  function showStars(on, current) {
    win.stars.classList.toggle('off', !on);
    [...win.stars.children].forEach((b, i) => b.classList.toggle('on', current === i + 1));
  }
  const fileLabel = () => (fileHandle ? `Votes file: ${fileHandle.name} (rewritten after every vote).` : 'No votes file chosen yet: the votes are kept in this browser; you can also download them.');

  // ---------------------------------------------------------------- session
  async function start() {
    if (s) return;
    await api.startAudio();
    if (!win) build();
    data = store.get();
    s = { k: nextFree(), saved: api.snapshot(), timer: 0, phase: 'start' };
    api.ui.setDemoRunning(true);
    win.el.style.display = 'block';
    showStart();
  }
  function showStart() {
    s.phase = 'start';
    clearTimeout(s.timer);
    win.title.textContent = 'LISTEN AND VOTE · 150 NEW PRESETS';
    const done = nVotes();
    win.name.textContent = done ? `${done} of ${PRESETS.length} presets voted` : `${PRESETS.length} new presets to vote on`;
    win.desc.textContent = 'Each preset plays 5 s of Beethoven (Appassionata, the busy passage at 0:13), then vote from 1 (not good) to 10 stars (excellent).';
    win.bar.style.width = (100 * done / PRESETS.length) + '%';
    showStars(false);
    const next = nextFree();
    const list = [];
    if (window.showSaveFilePicker) list.push([fileHandle ? 'Change the votes file…' : 'Choose the votes file (.txt)…', async () => { await chooseFile(); status(fileLabel()); showStart(); }, !fileHandle]);
    if (next < PRESETS.length) list.push([done ? `Continue at ${num(next)}` : 'Start at 001', () => play(next), !!fileHandle || !window.showSaveFilePicker]);
    if (done) list.push(['Start again at 001', () => play(0)]);
    if (done) list.push(['Download the votes', download]);
    if (done) list.push(['Clear all votes', () => { if (confirm('Clear all your votes?')) { data = { votes: {} }; saveFile(); showStart(); } }]);
    list.push(['Close', stop]);
    buttons(list);
    status(fileLabel());
  }
  function applyPreset(k) {
    api.post({ t: 'seqstop' });
    api.post({ t: 'soundoff' });   // no tail of the previous preset
    api.applyPreset(PRESETS[k].name);
    const v = api.values();
    for (const key in SAFE) api.setParam(P[key], SAFE[key]);
    if (v[P.amp_a] > MAX_ATTACK) api.setParam(P.amp_a, MAX_ATTACK);
    if (v[P.fx_dmix] > MAX_DMIX) api.setParam(P.fx_dmix, MAX_DMIX);
    if (v[P.fx_dfb] > MAX_DFB) api.setParam(P.fx_dfb, MAX_DFB);
    api.setPresetLabel(PRESETS[k].name, false);
  }
  function play(k) {
    if (!s) return;
    if (k >= PRESETS.length) { finish(); return; }
    s.k = Math.max(0, k);
    s.phase = 'play';
    clearTimeout(s.timer);
    applyPreset(s.k);
    win.title.textContent = `PRESET ${s.k + 1} OF ${PRESETS.length} · ${PRESETS[s.k].cat.replace('NEW · ', '')}`;
    win.name.textContent = PRESETS[s.k].name;
    win.desc.textContent = 'Playing… ' + (WS_SPEC.TEST_DESC && WS_SPEC.TEST_DESC[PRESETS[s.k].name] || '');
    showStars(false, data.votes[num(s.k)]);
    buttons([['Stop', stop]]);
    status(data.votes[num(s.k)] ? `Already voted: ${data.votes[num(s.k)]} stars (a new vote replaces it).` : fileLabel());
    // the passage, then the vote
    setTimeout(() => api.post({ t: 'seq', notes, delay: 0 }), LEAD * 1000);
    const t1 = performance.now();
    const tick = () => {
      if (!s || s.phase !== 'play') return;
      const x = Math.min(1, (performance.now() - t1) / ((LEAD + LEN) * 1000));
      win.bar.style.width = (100 * x) + '%';
      if (x < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    s.timer = setTimeout(askVote, (LEAD + LEN) * 1000);
  }
  function askVote() {
    if (!s) return;
    api.post({ t: 'seqstop' });   // the notes end, their release and the effects fade out
    s.phase = 'vote';
    win.desc.textContent = (WS_SPEC.TEST_DESC && WS_SPEC.TEST_DESC[PRESETS[s.k].name]) || 'How do you like this preset?';
    showStars(true, data.votes[num(s.k)]);
    buttons([['▶ Replay', () => play(s.k), true], ['◀ Previous', () => play(s.k - 1)], ['Skip', () => play(s.k + 1)], ['Stop', stop]]);
    status((data.votes[num(s.k)] ? `Already voted: ${data.votes[num(s.k)]} stars. ` : '') + 'Vote 1–10 (you can also play the keyboard to try the preset).');
  }
  function vote(n) {
    if (!s || s.phase !== 'vote') return;
    data.votes[num(s.k)] = n;
    showStars(true, n);
    saveFile();
    play(s.k + 1);
  }
  function finish() {
    s.phase = 'end';
    clearTimeout(s.timer);
    api.post({ t: 'seqstop' });
    win.title.textContent = 'LISTEN AND VOTE · FINISHED';
    win.name.textContent = `${nVotes()} of ${PRESETS.length} presets voted — thank you!`;
    const top = PRESETS.filter(p => data.votes[p.name.slice(0, 3)]).sort((a, b) => data.votes[b.name.slice(0, 3)] - data.votes[a.name.slice(0, 3)]).slice(0, 5);
    win.desc.textContent = top.length ? 'Your top 5: ' + top.map(p => `${p.name.slice(0, 3)} (${data.votes[p.name.slice(0, 3)]})`).join(', ') : '';
    win.bar.style.width = '100%';
    showStars(false);
    buttons([['Download the votes', download, true], ['Back to the start', showStart], ['Close', stop]]);
    status(fileLabel());
  }
  function stop() {
    if (!s) return;
    clearTimeout(s.timer);
    api.post({ t: 'seqstop' });
    api.post({ t: 'soundoff' });
    const saved = s.saved;
    s = null;
    if (win) win.el.style.display = 'none';
    api.ui.setDemoRunning(false);
    api.restore(saved);
  }
  // keys while the window is open (before the app's computer-keyboard notes)
  document.addEventListener('keydown', (e) => {
    if (!s || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    let used = true;
    if (e.key === 'Escape') stop();
    else if (s.phase === 'vote' && /^(Digit|Numpad)[0-9]$/.test(e.code)) { const d = +e.code.slice(-1); vote(d === 0 ? 10 : d); }
    else if (s.phase === 'vote' && e.code === 'KeyR') play(s.k);
    else if ((s.phase === 'vote' || s.phase === 'play') && (e.code === 'ArrowLeft' || e.code === 'Backspace')) play(s.k - 1);
    else if ((s.phase === 'vote' || s.phase === 'play') && e.code === 'KeyS') play(s.k + 1);
    else used = false;
    if (used) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  return { start, stop, running: () => !!s, votes: () => Object.assign({}, data.votes), fileText };
}
