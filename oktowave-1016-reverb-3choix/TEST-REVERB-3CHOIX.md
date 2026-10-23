# OktoWave 1.0.16 — copie de test : trois réverbes (pas une release)

- **Démo enregistrée, trois versions** : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1016-reverb-demo/
- **Synthé en direct, trois choix** : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1016-reverb-3choix/

Base : la version officielle actuelle (1.0.15 + page web WASM).

## Les trois choix

1. **ACTUELLE (1.0.15)** : la réverbe Classic telle qu'elle est aujourd'hui, au bit près (démo vérifiée identique à la version officielle, écart 0).
2. **CLASSIC AMÉLIORÉE** : le même algorithme (Freeverb), avec le réglage de base proposé.
3. **HALL** : l'autre algorithme (réseau de 8 lignes modulées), celui que tu avais trouvé trop métallique, avec les mêmes réglages et corrigé (voir plus bas).

## Le réglage de base proposé (choix 2 et 3)

| Réglage | Valeur | Pourquoi |
|---|---|---|
| Entrée stéréo | 60 % | la réverbe garde une partie de l'image stéréo des sons larges, sans pencher d'un côté |
| Pré-délai | 20 ms | le son direct reste net, la réverbe se place juste derrière |
| Amortissement | 0,40 (0,25 avant) | la queue perd ses aigus plus vite : moins métallique |
| Coupe-bas | 150 Hz | les graves n'entrent plus dans la réverbe : moins de boue sur les basses |
| Largeur | 100 % | comme avant |

**Même niveau de réverbe** : mesuré sur toute la démo, la réverbe seule fait −22,2 LUFS aujourd'hui, −22,35 avec la Classic améliorée et −22,35 avec la Hall (0,1 dB d'écart : inaudible). Le morceau entier change de 0,1 dB.

## Ce qui a été corrigé dans la Hall

- **Trop d'aigus** : ses aigus duraient plus longtemps que ceux de la Classic (à 8 kHz : 0,83 s contre 0,70 s). Maintenant son amortissement suit celui de la Classic, bande par bande : au même réglage, les deux s'éteignent pareil (écart de quelques %, la Hall un peu plus sombre en haut).
- **Niveau** : remonté de 3,3 dB pour être au niveau de la Classic sur la démo.
- **Ce qu'elle garde** : une queue qui ne « sonne » pas. Mesure des résonances fixes dans la queue (1 = ça sonne comme un tube, 0 = ça bouge sans cesse) : Classic 0,77, Hall 0,35.

## Comment écouter

**Démo enregistrée** (le plus fiable : pas de calcul en direct, pas de craquement) : la page charge les trois enregistrements (65 Mo), puis :
- boutons 1, 2, 3 (ou touches 1, 2, 3) : on change de version, le morceau continue au même endroit ;
- « Boucler le preset en cours » : pour comparer longtemps sur un même son ;
- « Écoute à l'aveugle » : les versions deviennent X, Y, Z dans un ordre au hasard ; « Révéler » dit qui est qui.

**Synthé en direct** : le panneau en bas à droite ; les curseurs règlent les choix 2 et 3 ; tous les presets avec réverbe et la démo jouent le choix fait. La page tourne avec le moteur JavaScript (la Hall n'existe pas encore dans le moteur C++/WASM) : sur un PC lent, quelques presets lourds de la démo peuvent craquer, ce n'est pas la réverbe.

## Ensuite

Dis-moi le choix que tu préfères (et si un réglage te gêne). Pour une release : le choix retenu devient le son de tous les presets avec réverbe (la démo change donc un peu) ; si c'est la Hall, elle est d'abord portée dans le moteur C++ (plug-in et WASM).
