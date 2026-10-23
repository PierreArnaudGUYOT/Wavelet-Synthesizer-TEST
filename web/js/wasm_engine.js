// Copyright (C) 2026 Pierre Arnaud GUYOT (OktoPierre)
// SPDX-License-Identifier: GPL-3.0-or-later
// WebAssembly prototype: the C++ engine (vst/src/dsp.h compiled by wasm/build.sh, web/js/engine_wasm_data.js) behind the interface of core.js's Engine that
// worklet.js uses (p, setParam, setTables, noteOn / noteOff, keyOn / keyOff, plateOn / plateOff, allNotesOff, allSoundOff, anyVoice, process, disp, keys, selHeld,
// the chord state, noMicro, chordTypeChanged). Like WSCoreFactory it is serialised with toString() into the worklet's data: URL; Node loads it with require().
//   const eng = WSWasmEngine(module, sampleRate)   (module: a WebAssembly.Module)
// The tables (core.js buildTables: Float32Arrays) are copied into the module's memory, one block per set; the engine frees a bundle it no longer plays.
function WSWasmEngine(module, sr) {
  'use strict';
  // the C library's few system calls (an abort message, a clock): never used by the engine; refused (ENOSYS)
  const nosys = () => 52;
  const inst = new WebAssembly.Instance(module, { wasi_snapshot_preview1: { clock_time_get: nosys, fd_close: nosys, fd_seek: nosys, fd_write: nosys } });
  const x = inst.exports;
  x._initialize();
  x.ws_create(sr);
  const NP = x.ws_num_params(), NB = 11, MAXV = 16, VK_PHASE = 0;
  const pP = x.ws_params() >> 3, pL = x.ws_out_l() >> 2, pR = x.ws_out_r() >> 2, pK = x.ws_keys(), pS = x.ws_sel_held(), MAXB = x.ws_max_block();
  const SN = x.ws_state_size();
  let buf = null, f32 = null, f64 = null, u8 = null;
  // the views follow the memory (it grows when the tables need more: the old ArrayBuffer is then detached)
  const views = () => { if (buf !== x.memory.buffer) { buf = x.memory.buffer; f32 = new Float32Array(buf); f64 = new Float64Array(buf); u8 = new Uint8Array(buf); } };
  views();
  const NS = Math.round((SN - NB - 11 - 4 - 2 * MAXV) / (NB + 3));
  const disp = { gains: new Float32Array(NB), mode: 0, view: 0, voices: 0, center: 0, width: 1, depth: 0, note: -1, slotLive: false,
    sg: new Float32Array(NS * NB), swin: new Float32Array(NS * 3), mask: 0, pkL: 0, pkR: 0 };
  // the worklet resets the peaks it has sent (d.peakL = 0)
  Object.defineProperty(disp, 'peakL', { get() { return this.pkL; }, set(v) { this.pkL = v; if (v === 0) x.ws_clear_peaks(); } });
  Object.defineProperty(disp, 'peakR', { get() { return this.pkR; }, set(v) { this.pkR = v; if (v === 0) x.ws_clear_peaks(); } });
  const chord = { root: -1, last: 60, n: 0, changed: false, note: new Int16Array(MAXV), on: new Uint8Array(MAXV) };
  function refresh() {
    const o0 = x.ws_state() >> 2;
    views();
    let o = o0;
    for (let b = 0; b < NB; b++) disp.gains[b] = f32[o++];
    disp.mode = f32[o++]; disp.view = f32[o++]; disp.voices = f32[o++]; disp.pkL = f32[o++]; disp.pkR = f32[o++];
    disp.center = f32[o++]; disp.width = f32[o++]; disp.depth = f32[o++]; disp.note = f32[o++]; disp.slotLive = f32[o++] !== 0; disp.mask = f32[o++];
    for (let k = 0; k < NS * NB; k++) disp.sg[k] = f32[o++];
    for (let k = 0; k < NS * 3; k++) disp.swin[k] = f32[o++];
    chord.root = f32[o++]; chord.last = f32[o++]; chord.n = f32[o++]; chord.changed = f32[o++] !== 0;
    for (let k = 0; k < MAXV; k++) chord.note[k] = f32[o++];
    for (let k = 0; k < MAXV; k++) chord.on[k] = f32[o++];
  }
  // one set of tables into the module's memory: [mips pointer, rms pointer]
  function put(b, set) {
    const nm = set.mips.length, p = x.ws_bundle_alloc(b, nm + set.rms.length);
    if (!p) throw new Error('WebAssembly engine: out of memory for the tables');
    views();
    f32.set(set.mips, p >> 2); f32.set(set.rms, (p >> 2) + nm);
    return [p, p + 4 * nm];
  }
  const eng = {
    wasm: true,
    get p() { views(); return f64.subarray(pP, pP + NP); },
    setParam(i, v) { x.ws_set_param(i, v); },
    setTempo(bpm) { x.ws_set_tempo(bpm); },
    noteOn(n, v) { x.ws_note_on(n, v); },
    noteOff(n) { x.ws_note_off(n); },
    keyOn(n, v) { x.ws_key_on(n, v); },
    keyOff(n) { x.ws_key_off(n); },
    plateOn(n, v) { x.ws_plate_on(n, v); },
    plateOff(n) { x.ws_plate_off(n); },
    allNotesOff() { x.ws_all_notes_off(); },
    allSoundOff() { x.ws_all_sound_off(); },
    anyVoice() { return x.ws_any_voice() !== 0; },
    latency() { return x.ws_latency(); },
    bundlesAlive() { return x.ws_bundles_alive(); },
    memoryBytes() { return x.memory.buffer.byteLength; },
    // core.js's table format: { needs, slots: [per oscillator { mode, mips, rms, vk?, ph?: [sets], w2?: { mode, mips, rms, vk?, ph? } } or null] }, as dsp.h tableRef() maps it
    setTables(tb) {
      const b = x.ws_bundle_new();
      try {
        tb.slots.forEach((t, s) => {
          if (!t) return;
          const m = put(b, t);
          x.ws_bundle_set(b, s, 0, 0, -1, t.mode, m[0], m[1]);
          let w = null;
          if (t.w2) { w = put(b, t.w2); x.ws_bundle_set(b, s, 1, 0, -1, t.mode, w[0], w[1]); }
          if (t.vk !== undefined && t.vk >= 0 && t.ph) {
            const first = t.vk === VK_PHASE ? 1 : 0;
            if (first) x.ws_bundle_set(b, s, 2, 0, t.vk, t.mode, m[0], m[1]);
            t.ph.forEach((ps, j) => { const q = put(b, ps); x.ws_bundle_set(b, s, 2, j + first, t.vk, t.mode, q[0], q[1]); });
            if (w && t.w2.ph && t.w2.ph.length === t.ph.length) {
              if (first) x.ws_bundle_set(b, s, 3, 0, t.vk, t.mode, w[0], w[1]);
              t.w2.ph.forEach((ps, j) => { const q = put(b, ps); x.ws_bundle_set(b, s, 3, j + first, t.vk, t.mode, q[0], q[1]); });
            }
          }
        });
      } catch (e) { x.ws_bundle_free(b); throw e; }
      x.ws_bundle_commit(b);
    },
    // the tables built by the C++ code from the parameters (measures)
    buildTables(params) { views(); f64.set(params, x.ws_scratch() >> 3); x.ws_build_commit(); },
    buildOnly(params) { views(); f64.set(params, x.ws_scratch() >> 3); x.ws_build_only(); },
    // n samples (any n) into L / R
    process(L, R, n) {
      let o = 0;
      while (o < n) {
        const m = Math.min(MAXB, n - o);
        x.ws_process(m);
        views();
        L.set(f32.subarray(pL, pL + m), o); R.set(f32.subarray(pR, pR + m), o);
        o += m;
      }
    },
    get disp() { refresh(); return disp; },
    get keys() { views(); return u8.subarray(pK, pK + 128); },
    get selHeld() { views(); return u8.subarray(pS, pS + 128); },
    get chordN() { refresh(); return chord.n; },
    get chordOn() { return chord.on; },
    get chordNote() { return chord.note; },
    get chordRoot() { return chord.root; },
    get chordLastRoot() { return chord.last; },
    get chordTypeChanged() { return chord.changed; },
    set chordTypeChanged(v) { chord.changed = !!v; x.ws_set_chord_type_changed(v ? 1 : 0); },
    get noMicro() { return x.ws_no_micro() !== 0; },
    set noMicro(v) { x.ws_set_no_micro(v ? 1 : 0); },
  };
  return eng;
}
if (typeof module !== 'undefined') module.exports = WSWasmEngine;
