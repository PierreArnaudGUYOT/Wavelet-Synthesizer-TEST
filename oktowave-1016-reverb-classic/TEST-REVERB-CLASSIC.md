# OktoWave 1.0.16 — copie de test : réverbe Classic améliorée (pas une release)

Ouvrir : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1016-reverb-classic/

Base : la version officielle actuelle (1.0.15 + moteur WASM).

## Ce qui change

La réverbe actuelle (Classic, l'algorithme Freeverb) garde **exactement son algorithme et son caractère**. Cinq réglages sont ajoutés autour d'elle :

- **Entrée stéréo** : la réverbe reçoit la gauche et la droite séparément au lieu d'un mélange mono. L'image des sons larges (unisson, chorus) se retrouve dans la réverbe.
- **Pré-délai** (0 à 100 ms) : un petit temps avant la réverbe, le son reste net et la réverbe se place derrière.
- **Amortissement** : 0,25 était la valeur fixe de toutes les versions. Plus haut, la queue est plus sombre et moins métallique.
- **Coupe-bas** (off à 300 Hz) : les graves n'entrent plus dans la réverbe, elle n'est plus boueuse.
- **Largeur** : de mono (0 %) à normal (100 %, comme avant).

Aux valeurs par défaut, le son est celui de la 1.0.15 **au bit près** (vérifié sur les 30 scènes de la démo : écart 0).

## Panneau de test (en bas à droite, copie de test uniquement)

- *Réverbe* : **AMÉLIORÉE** (les curseurs) / ACTUELLE (1.0.15). La page s'ouvre sur AMÉLIORÉE avec une première proposition :
  entrée stéréo 100 %, pré-délai 20 ms, amortissement 0,35, coupe-bas 120 Hz, largeur 100 %.
- Les curseurs règlent chaque amélioration ; bouger un curseur repasse en AMÉLIORÉE.
- Tous les presets qui ont de la réverbe, **et la démo**, jouent ces réglages.

## Vérifié avant de publier

- Le moteur C++ (plug-in et WASM) et le moteur JS donnent le même son, y compris avec les nouveaux réglages (303 cas, écart au plus 4e-7).
- La démo, réglages par défaut : identique à la version officielle (écart 0 sur les 30 scènes).
- Coût processeur : négligeable (quelques opérations par échantillon).

## Quoi essayer

1. Une nappe ou des cordes avec de la réverbe : bascule AMÉLIORÉE / ACTUELLE pendant un accord tenu.
2. Lance la démo dans les deux positions.
3. Monte l'amortissement si la queue te semble métallique ; essaie le pré-délai entre 10 et 40 ms ; le coupe-bas sur les basses.
4. Dis-moi les réglages que tu préfères, et lesquels garder. Ensuite : leur place dans la carte EFFECTS (maquettes), et pour quels presets.
