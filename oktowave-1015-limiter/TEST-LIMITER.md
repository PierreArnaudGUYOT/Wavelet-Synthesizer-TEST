# OktoWave 1.0.15 — copie de test : nouvel étage de sortie (pas une release)

Ouvrir : https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/oktowave-1015-limiter/

## Ce qui change

- **Limiteur à anticipation** (nouveau, actif par défaut) à la place du « peak guard » + limiteur tanh de 1.0.14.
  L'ancien étage écrasait toute crête au-dessus de −3 dBFS avec une tanh (de la distorsion sur les sons forts).
  Le nouveau regarde 1,5 ms en avance et baisse le volume juste avant la crête : plus aucune tanh, aucun échantillon au-dessus de 0,89 (−1 dBFS).
  Sous ce niveau, le son est exactement le même qu'avant.
- La latence est fixe : 1,5 ms (le plug-in la déclare au DAW, qui la compense).
- **Panneau de test en bas à droite** (copie de test uniquement) :
  - *Sortie* : LIMITEUR (1.0.15) / CLASSIC (1.0.14), pour comparer à l'oreille ;
  - *Compensation accords* : ON (comme 1.0.14 : le volume baisse quand on joue plus de 3 notes) / OFF.

## Mesures faites avant de publier

- Démo complète (30 scènes, rendu hors ligne) : l'étage de sortie n'agit dans aucune scène, en Classic comme en Limiteur (les crêtes de la démo restent sous 0,70). Distorsion ajoutée : 0,00 %.
  Si la démo grésille sur ton portable, la cause est la charge CPU (décrochages audio), pas l'étage de sortie : mesure des décrochages en cours.
- Accord fort de 3 notes sur les 257 presets : distorsion 0,00 % dans les deux modes.

## Quoi essayer

1. Joue des accords **forts et denses** (deux mains, 6 à 10 notes, vélocité max), sur tes presets favoris.
2. Bascule *Sortie* entre LIMITEUR et CLASSIC : le limiteur doit sonner plus propre sur les crêtes, sans grésillement.
3. Bascule *Compensation accords* sur OFF : les accords sonnent plus fort et plus naturels ; dis-moi si tu préfères ON ou OFF.
4. Lance la démo : elle doit sonner comme avant.
