# OktoWave — test copy of the web app: demo with LIGHT presets (not a release)

Open: https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-light/

Why: on the owner's laptop the web demo crackled or went silent on some presets (8, 12, 13, 19, 20 = no sound, 23, 24, 30).
Measured in Edge with the browser's own count of audio dropouts (AudioContext.playbackStats): the audio thread had no time
left on the six heaviest presets of the tour, worst in Windows' Efficiency mode (the green leaf in Task Manager).

What changed:

- Six new factory presets, the **Light** versions, right after their original in the preset list:
  AA · Salt Beam Strings Light, AA · Moon & Breath Light, AA · Drum Bloom Light, AB · Rust Aurora Light,
  AA · Opal Rise Chords Light, AB · Beam Lung Keys Light. The demo plays them in place of the originals.
  The modulation that moves the wavelet tables is removed (LFO 1 TO SPARSITY, LFO 2 / 3 on SPARSITY or SOURCE WIDTH),
  one unison voice less, a shorter release where needed; Rust Aurora Light also has A2 off. The originals are unchanged.
- Measured on this laptop, whole demo, dropouts: normal 358 -> 2; Efficiency mode 1277 -> 18 (Rust Aurora: 451 -> 0).
- The demo keeps changing presets when the page is hidden (already online).

What to try: run the demo (with the page visible, then hidden), listen to scenes 8, 13, 19, 20, 24, 30, and compare
a Light preset with its original in the preset list.
