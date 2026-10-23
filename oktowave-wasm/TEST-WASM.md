# OktoWave — copie de test : moteur WebAssembly (prototype, pas une release)

Ouvrir : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-wasm/

Base : la 1.0.15 publiée (limiteur de sortie, tes 9 sons ajustés, 208 presets).

## Ce qui change

- **Le moteur de son du plug-in (C++) tourne dans le navigateur**, compilé en WebAssembly (WASM), à la place du moteur JavaScript.
  C'est exactement le même calcul : sur 299 cas (les 208 presets, accords, filtre, unisson, morph, effets, limiteur poussé),
  l'écart entre les deux moteurs est au plus de 0,0000004 (inaudible : plus de 120 dB sous le niveau maximal).
- **Le but : moins de charge processeur**, donc moins de craquements, surtout sur un PC en mode économie d'énergie.
- Rien d'autre ne change (panneau, presets, démo, son).

## Panneau de test (en bas à droite, copie de test uniquement)

- *Moteur* : **JS** (le moteur actuel) / **WASM** (le moteur C++). La page s'ouvre sur JS ; ton dernier choix est retenu par le navigateur.
- Changer de moteur relance le son ; si la démo jouait, elle repart du début.
- *En marche* : le moteur qui joue vraiment (« WASM (SIMD) » sur un navigateur récent).
- *Décrochages* : le nombre de trous dans le son depuis le dernier changement de moteur (compté par Chrome et Edge seulement) ;
  chaque trou s'entend comme un craquement.

## Mesures faites avant de publier (sur ce PC)

- Processeur, accord dense de 16 voix :
  - les 30 presets de la démo : WASM **2,4 fois plus rapide** que JS en moyenne (de 1,9 à 2,9 fois) ;
  - les 20 presets les plus lourds : WASM **1,8 fois plus rapide** (de 1,5 à 2,6 fois) ;
  - les pointes de calcul (les blocs les plus lents) baissent de 2 à 4 fois.
- Démo complète en temps réel (Chrome sans fenêtre, deux essais par cas) :
  - mode normal : **0 décrochage** avec les deux moteurs ;
  - mode économie d'énergie de Windows (le cas de ton portable) : **JS 2362 et 926 décrochages** (23,6 s et 9,3 s de son manquant
    sur les 113 s de la démo), **WASM 12 puis 0** (0,12 s, puis rien).
- Trois presets très lourds joués en accord de 16 voix (Clang Tide Signal, Breath & Drift, Swirl Chimes) restent un peu au-dessus
  de la limite même en WASM : WASM les aide beaucoup, sans suffire à lui seul pour eux.

## Quoi essayer

1. Lance la démo en JS et regarde le compteur *Décrochages*, puis passe en WASM et relance-la.
2. Refais-le avec ton portable sur batterie ou en mode économie d'énergie (le cas difficile).
3. Joue des accords tenus sur les presets lourds (HIGH_CPU, Breath & Drift, Swirl Chimes…) dans les deux moteurs.
4. Écoute si tu entends une différence de son entre JS et WASM (il ne devrait y en avoir aucune).
5. Si tu as un iPad ou un Mac sous la main, essaie WASM dessus et dis-moi si le son démarre (*En marche* doit afficher WASM).
6. Dis-moi : on passe la version web sur le moteur WASM ?
