# OktoWave 1.0.15 — copie de test 2 : nouvel étage de sortie (pas une release)

Ouvrir : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1015-limiter/
VST Windows : https://github.com/PierreArnaudGUYOT/Wavelet-Synthesizer-TEST/releases/tag/oktowave-1.0.15-test2

## Ce qui change

- **Limiteur à anticipation** (nouveau, actif par défaut) à la place du « peak guard » + limiteur tanh de 1.0.14.
  L'ancien étage écrasait toute crête au-dessus de −3 dBFS avec une tanh (de la distorsion sur les sons forts).
  Le nouveau regarde 1,5 ms en avance et baisse le volume juste avant la crête : plus aucune tanh, aucun échantillon au-dessus de 0,89 (−1 dBFS).
  Sous ce niveau, le son est exactement le même qu'avant.
- La latence est fixe : 1,5 ms (le plug-in la déclare au DAW, qui la compense).
- **Panneau de test en bas à droite** (copie de test uniquement) :
  - *Sortie* : LIMITEUR (1.0.15) / CLASSIC (1.0.14), pour comparer à l'oreille ;
  - *Compensation accords* : ON (comme 1.0.14 : le volume baisse quand on joue plus de 3 notes) / OFF.

## Test 2 : corrections après relecture du code

- Un défaut grave du test 1 est corrigé : sur un son très grave et très fort (onde carrée grave, master monté), la file interne du limiteur débordait ;
  le plug-in pouvait alors écrire hors de sa mémoire (risque de plantage du DAW) et la version web écrêtait quelques crêtes. Vérifié : plus de débordement, aucun échantillon au-dessus de 0,89.
- La bascule A/B pendant la démo reste bien prise en compte (elle était parfois annulée au changement de preset).
- Le retour en mode CLASSIC ne repart plus d'un gain figé (comparaison A/B plus juste).

## Mesures faites avant de publier

- Démo complète (30 scènes, rendu hors ligne) : l'étage de sortie n'agit dans aucune scène, en Classic comme en Limiteur (les crêtes de la démo restent sous 0,70). Distorsion ajoutée : 0,00 %.
  Si la démo grésille sur ton portable, la cause est la charge CPU (décrochages audio), pas l'étage de sortie.
- Accord fort de 3 notes sur les 257 presets : distorsion 0,00 % dans les deux modes.
- Accords de 8 notes : presets au-dessus de 2 % de distorsion, Classic contre Limiteur : 12 contre 3 (compensation OFF), 14 contre 5 (master +6 dB).
- Tests : 11 étapes de validation sur 11 (dont sons de la beta 0.7 identiques, entrée VST2, cross-check C++/JS avec le cas du défaut).

## Quoi essayer

1. Joue des accords **forts et denses** (deux mains, 6 à 10 notes, vélocité max), sur tes presets favoris.
2. Bascule *Sortie* entre LIMITEUR et CLASSIC : le limiteur doit sonner plus propre sur les crêtes, sans grésillement.
3. Bascule *Compensation accords* sur OFF : les accords sonnent plus fort et plus naturels ; dis-moi si tu préfères ON ou OFF.
4. Lance la démo : elle doit sonner comme avant.
