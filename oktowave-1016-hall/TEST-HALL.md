# OktoWave 1.0.16 — copie de test : Reverb Hall (pas une release)

Ouvrir : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1016-hall/

Base : la 1.0.15 en préparation (limiteur de sortie, tes 9 sons ajustés, 208 presets).

## Ce qui change

- **Une nouvelle réverbe « Hall »** à côté de la réverbe actuelle (« Classic », inchangée) :
  entrée stéréo avec pré-délai, quatre diffuseurs par canal (des échos denses tout de suite),
  puis 8 lignes de retard mélangées et légèrement modulées (une queue lisse, sans le timbre métallique de la Classic).
  Les aigus s'éteignent régulièrement (un amortissement calculé pour chaque ligne).
- **Même durée de queue** que la Classic pour un même réglage SIZE, et **même volume moyen** (mesuré sur 24 presets).
  Preset par preset, le volume de la réverbe peut différer de −10 à +5 dB : la Classic colore certaines notes.

## Panneau de test (en bas à droite, copie de test uniquement)

- *Réverbe* : **HALL (nouvelle)** / CLASSIC (1.0.15). La page s'ouvre sur HALL : **tous les presets qui ont de la réverbe, et la démo**, jouent le type choisi.
- *Pré-délai* (1 à 120 ms, défaut 20 ms) et *Amortissement* (0 à 100 %, défaut 50 %) : ils agissent sur la Hall.

## Mesures faites avant de publier

- Les 208 presets passent dans la Hall (taille maximale, accord de 8 notes) : aucune instabilité, la queue revient au silence.
- CPU (navigateur) : la Hall coûte environ 15 % de plus que la Classic sur un preset léger (environ +5 % sur un preset lourd) ; elle sera optimisée si tu la gardes.

## Quoi essayer

1. Joue tes nappes, cordes et claviers avec de la réverbe ; bascule HALL / CLASSIC pendant une note tenue ou entre deux accords.
2. Lance la démo en HALL, puis en CLASSIC.
3. Essaie le pré-délai (plus d'espace avant la réverbe) et l'amortissement (plus sombre à 100 %).
4. Dis-moi : Hall par défaut pour tous les presets avec réverbe, ou preset par preset ? Et tes réglages préférés de pré-délai et d'amortissement.
