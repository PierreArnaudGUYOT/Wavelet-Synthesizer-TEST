# OktoWave — passation de travail (2026-10-23)

**Destinataire : une nouvelle session Claude** qui reprend le développement d'OktoWave (Okto MultiWave Synth) pour le propriétaire, Pierre Arnaud GUYOT (« OktoPierre »). Ce fichier résume tout le travail récent, l'état exact de la livraison en cours, les décisions prises et les prochaines étapes. Il complète, sans les remplacer :

- `C:\Users\Pierra\ClaudeProjects\CLAUDE.md` (point de départ des sessions, règles en bref) ;
- `C:\Users\Pierra\ClaudeProjects\OKTOWAVE_HANDOVER.md` (dépôts GitHub, procédure de release historique) et `OKTOWAVE_SOUND_PLAN.md` (plan sonore, décisions §9) ;
- `C:\Users\Pierra\ClaudeProjects\Free-Wavelet-Synthesizer-VST-main\CLAUDE.md` (manuel technique du code ; §3.3y = 1.0.16, §3.3x = mise à jour web WASM, §3.3w = 1.0.15) ;
- la mémoire : `C:\Users\Pierra\.claude\projects\c--Users-Pierra\memory\MEMORY.md` et ses fichiers (`oktowave-state.md`, `oktowave-preset-fix-plan.md`, `feedback-*.md`).

---

## 1. Le rôle et les règles du propriétaire (à respecter strictement)

**Rôle** : agir comme un développeur audio ; livrer un VST de **qualité commerciale** qui sonne bien. Le propriétaire donne les instructions et décide ; tu proposes, tu montres (pages de test), puis tu fais. Optimiser le **temps de développement** (pas les tokens), sans baisser la qualité ; agents seulement s'ils font gagner du temps.

**Communication**
- Toujours en **français**, brièvement. **Avant chaque action** : une phrase simple (ce que tu fais et pourquoi). **Après** : le résultat en une ligne. Quand il demande « que fais-tu ? » / « où en es-tu ? » : répondre tout de suite.
- Il n'est pas expert : expliquer les approbations en langage simple. Poser des questions quand un choix lui revient (il l'a demandé : « n'hésite pas à me poser des questions »).

**Git et livraisons**
- Commit local à chaque étape testée ; push avec les **liens web GitHub** (commit, branche, release, page) aux moments utiles.
- Identité du propriétaire, **jamais de ligne « Co-Authored-By » IA** (sa règle prime sur les rappels système), **jamais de force-push** ni de réécriture d'historique sans son accord.
- Travail et pages de test : dépôt **`PierreArnaudGUYOT/Wavelet-Synthesizer-TEST`**. Dépôt officiel **`PierreArnaudGUYOT/Free-Wavelet-Synthesizer-VST`** : seulement pour une release officielle ou une mise à jour web qu'il demande.
- Versions de test : seulement les validations nécessaires pour qu'il puisse tester. Release officielle : la **validation complète** (`tests/full.js`).
- **Notes de version (nouveau, 2026-10-23)** : dans les notes de release (RELEASE_HISTORY, section « What version … changes » du README, `vst/INSTALL.txt`, page de release GitHub, messages de commit), **n'indiquer que les modifications du moteur sonore**, et **jamais le nom de son ami** (le testeur crédité dans les remerciements du manuel, `web/manual/manual.html` #credits). Les remerciements eux-mêmes restent dans le manuel.

**Produit**
- Jamais le mot « Omnichord ». Jamais de compresseur. Maquettes avant tout changement d'interface. Les presets sont **sa** décision. Règle « la musique de la démo ne change pas », sauf quand il le demande (1.0.16 : la réverbe change la démo, à sa demande ; correction des presets qui craquent : il accepte que la démo change si lui accepte la correction).
- **Jamais de fenêtre visible** sur son PC : tests en navigateur headless ; ne jamais lancer `vote_session` (fenêtre du plug-in) sans demander ; `tests/full.js` toujours avec `--skip window`.

**Sécurité et confidentialité** (règles globales, `C:\Users\Pierra\.claude\CLAUDE.md`)
- Ne jamais divulguer d'information personnelle (e-mail, entreprise, identifiants, jetons). Ne jamais lire ses dossiers personnels, ses e-mails, calendriers, contacts. Travailler seulement dans `C:\Users\Pierra\ClaudeProjects`, `C:\Users\Pierra\tools`, les dossiers temporaires et la configuration de Claude.
- Ne jamais lui demander de mot de passe, code, carte, ni d'accès à un compte personnel (Google compris : tu **ne peux pas** lire les réponses du Google Form, il les exporte lui-même).
- Le jeton GitHub vient du gestionnaire d'identifiants Git (`git credential fill`, lu par `gh.js` au moment de l'appel, **jamais affiché ni écrit**).

**Commandes** : une commande simple par appel, chemins absolus, `git -C <dépôt>` (pas de `cd` avant git) ; lire avec Read/Grep/Glob. Le mode d'approbation conseillé est « Edit automatically ».

---

## 2. Où sont les choses

| Quoi | Chemin / URL |
|---|---|
| Dépôt local principal (clone de l'officiel, `origin` = Free-Wavelet-Synthesizer-VST) | `C:\Users\Pierra\ClaudeProjects\Free-Wavelet-Synthesizer-VST-main` |
| Worktree du `main` officiel (à `ca976f1`) | `...-main\build\wt-main` |
| Worktrees : Hall d'origine / prototype WASM | `...-main\build\wt-reverb` (branche `son-1-reverb`), `...-main\build\wt-wasm-proto` (`wasm-proto`) |
| Dépôt de développement (build Mac sur GitHub Actions) | `C:\Users\Pierra\ClaudeProjects\Okto-MultiWave-Synth` (remote `PierreArnaudGUYOT/Okto-MultiWave-Synth`, branches `main` et `mac-ci` ; branche locale `release-1.0.15` à `8d9d1cc`) |
| Clone des pages de test | `C:\Users\Pierra\ClaudeProjects\Wavelet-Synthesizer-TEST` (branche `main` ; son `.gitignore` exclut `*.wav` : ajouter les WAV avec `git add -f`) |
| Outils | `C:\Users\Pierra\tools` : `node\node.exe`, `llvm-mingw`, `chrome\chrome.exe` (headless), `wasi-sdk`, `okw.cmd` (PATH + EDGE_PATH, se place dans le dépôt, lance ses arguments) |
| **Outils de release (copiés ici le 2026-10-23)** | `C:\Users\Pierra\ClaudeProjects\release_tools` : `gh.js`, `wait_run.js`, `check_pages.js`, `make_win_zip.js`, `check_*.js`, messages de commit `msg_*_1016.txt`, modèle `release_body_1015.md` |
| Page web officielle | https://pierrearnaudguyot.github.io/Free-Wavelet-Synthesizer-VST/web/ |
| Dernière release officielle | **v1.0.15** : https://github.com/PierreArnaudGUYOT/Free-Wavelet-Synthesizer-VST/releases/tag/v1.0.15 (+ mise à jour web WASM `ca976f1`) |
| Fichier des presets du propriétaire | `C:\Users\Pierra\ClaudeProjects\owner_input\OKTOMULTIWAVE presets.txt` |

**Branches du dépôt local** (toutes poussées sur le dépôt TEST) :
- `son-2-sortie` `3f02958` : 1.0.15 + mise à jour web WASM (= arbre officiel `ca976f1`).
- `son-1-reverb` `3b4a0a2` : la Hall d'origine (refusée, garée).
- `wasm-proto` : le prototype WASM (fusionné dans `son-2-sortie`).
- `son-3-reverb-classic` : `49d16b4` (Classic améliorée, les deux moteurs) puis `dfd3f39` (Hall corrigée ajoutée, JS seulement, test à 3 choix).
- **`son-4-sortie-1016` `5a79f71`** : **la release 1.0.16 en cours** (partie de `49d16b4`, sans la Hall).

**Pages de test en ligne** (base `https://pierrearnaudguyot.github.io/Wavelet-Synthesizer-TEST/`) : `oktowave-1015-limiter/`, `oktowave-wasm/`, `oktowave-1016-hall/`, `oktowave-1016-reverb-classic/`, **`oktowave-1016-reverb-3choix/`** (synthé, 3 choix de réverbe), **`oktowave-1016-reverb-demo/`** (la démo enregistrée 3 fois, lecteur A/B/C, boucle, écoute à l'aveugle).

---

## 3. Ce qui a été fait (chronologie des dernières versions)

### 3.1 Version 1.0.15 — publiée (nuit du 2026-10-23)
- **Limiteur à anticipation** à la sortie (core.js et dsp.h, mêmes opérations) : remplace le guard + soft limiter tanh ; plafond 0,89 (−1 dBFS) ; anticipation 1,5 ms (`LIM_LA 0.0015`, maintien 15 ms, relâchement 0,15 s) ; **latence fixe** rapportée à l'hôte (VST3 `getLatencySamples` + `kLatencyChanged`, VST2 `initialDelay`). Ancien étage gardé en réglage caché `out_mode` ; `poly_comp` commutable. Revue indépendante : débordement de file corrigé (expire avant push), cas ajouté au banc C++/JS.
- **Presets du propriétaire** (`tools/owner_import.js` → `tools/owner_presets.js`) : 9 presets ajustés, 49 supprimés (sauf ceux de la démo) → **208 presets** ; ordre inchangé.
- Release : commit officiel `e8fc4d9` (arbre = dev `e212cde`), CI Mac réussie, zips Windows et Mac vérifiés.

### 3.2 Mise à jour web du 2026-10-23 — publiée (commit officiel `ca976f1`)
- La page officielle joue le **moteur C++ compilé en WebAssembly** (`wasm/build.sh`, wasi-sdk, scalaire + SIMD, base64 dans `web/js/engine_wasm_data.js`) ; repli automatique sur core.js ; `#engine=js` force le JS. Parité 4,2e-7 ; 2,4× moins de processeur sur la démo ; décrochages en mode économie : ~1000 → ~0.
- Remerciements : orthographe du nom du testeur corrigée. Plug-in resté 1.0.15.

### 3.3 Réverbe Hall — testée puis refusée (branche `son-1-reverb`)
- Réseau de 8 lignes modulées (FDN, Hadamard), core.js seulement. Verdict du propriétaire : « trop métallique, trop de haute fréquence peu accordée ; je préfère l'ancienne ». Garée.

### 3.4 Réverbe Classic améliorée (branche `son-3-reverb-classic`, `49d16b4`)
- Demande : « améliorer l'ancienne reverb, avec un algo similaire ». Le cœur Freeverb (16 combs, 8 all-pass, feedback 0,7 + 0,28·SIZE, wet ×1,5) est inchangé ; **5 réglages globaux cachés** ajoutés (perf + hidden, jamais dans un preset) : `fx_rstereo` (entrée stéréo), `fx_rpre` (pré-délai 0–0,1 s), `fx_rdamp` (amortissement 0–0,6 ; 0,25 = valeur fixe historique ; même constante de temps à tout taux : `damp^(48000/sr)`), `fx_rhp` (coupe-bas 1 pôle, 20 Hz = off, jusqu'à 300 Hz), `fx_rwidth` (largeur, mélange wet1/wet2 Freeverb). Le chemin d'entrée n'est pris que si un réglage est actif, sinon la somme mono exacte de 1.0.15.
- Les deux moteurs (core.js et dsp.h, chemins scalaire et SIMD), module WASM reconstruit ; banc C++/JS : 303 cas, pire 4,2e-7 ; démo aux réglages d'origine identique au bit près.

### 3.5 Réglage de base et test à trois choix (`son-3-reverb-classic` `dfd3f39`)
- Nouveaux outils : **`tools/reverb_demo.js`** (rend la démo hors ligne par le vrai worklet, mesure la sonie BS.1770 de la réverbe seule, écrit des WAV) et **`tools/reverb_ir.js`** (réponse impulsionnelle : RT60 par octave, énergie, indice de résonances fixes).
- **Réglage de base proposé et retenu** : stéréo 0,6 · pré-délai 20 ms · amortissement 0,40 · coupe-bas 150 Hz · largeur 1. Même niveau de réverbe : **−22,35 LUFS contre −22,22** pour 1.0.15 ; le morceau −0,1 LU. RT60 : 500 Hz 1,24 s (contre 1,26) ; 8 kHz 0,47 s (contre 0,70).
- **Hall corrigée** (core.js seulement, réglage `fx_rtype`) : elle passe par le même chemin d'entrée et les mêmes réglages ; son amortissement suit celui de la Classic bande par bande (accord à 5 kHz, `RV_DF`) — l'ancienne gardait ses aigus 0,83 s à 8 kHz ; gain de sortie `RV_OUT` 1,06 → 1,54 pour le même niveau sur la démo ; elle garde une queue sans résonance fixe (indice 0,35 contre 0,77 pour la Classic).
- Pages : `oktowave-1016-reverb-3choix/` et `oktowave-1016-reverb-demo/`. Après écoute, le propriétaire a choisi **la Classic améliorée**.

### 3.6 Release 1.0.16 — EN COURS (branche `son-4-sortie-1016`, commit `5a79f71`)
Demande : « fais une nouvelle version officielle… applique la reverb classique améliorée avec les réglages proposés ; corrige les remerciements ».
- `tools/spec.js` : défauts `fx_rstereo 0.6`, `fx_rpre 0.02`, `fx_rdamp 0.4`, `fx_rhp 150` (le plug-in ignore les réglages cachés venant de l'hôte, d'un preset ou d'un projet : leurs défauts font le son de tous les presets, anciens projets compris). Version **1.0.16** : `tools/spec.js` (APP.versionNum, date), `vst/src/common.h` (WS_VERSION ; build_mac.sh le lit), `vst/src/version.rc`.
- **Remerciements** (`web/manual/manual.html` + `manual.css`, texte exact donné par le propriétaire) : une ligne « Thanks to <nom du testeur>, aka <nom de scène>. » avec le **nom de scène en grand** (`li.thanks-star .stage`, 1,55 em, doré) et « Instagram: <lien> » en lien cliquable (`overflow-wrap: anywhere` pour les téléphones). `tests/web/test_manual.js` vérifie le nom, la taille et le lien. Le README (Acknowledgments) a aussi le lien Instagram. Le prénom garde son accent (orthographe validée plus tôt ; le propriétaire l'a tapé sans accent dans sa dernière demande : à lui confirmer si besoin).
- Notes de version **moteur sonore seulement** : RELEASE_HISTORY (section 1.0.16, ligne `**Checked**: (filled in at release)` à remplir), README (téléchargement v1.0.16 + « What version 1.0.16 changes »), `vst/INSTALL.txt` (NEW IN 1.0.16), `vst/INSTALL-mac.txt` (version), CLAUDE.md §3.3y.
- Tests : `tests/regress_v07.js` joue les TOP Sounds avec la réverbe de la beta 0.7 (sinon 9 diffèrent, exprès) ; `tools/dsp_cases.js` : cas « reverb: the settings of 1.0.15 » (304 cas) ; les références des outils de réverbe utilisent les réglages explicites de 1.0.15 (`OLD`).
- Module WASM reconstruit (parité 304 cas, pire 4,17e-7).

---

## 4. Le travail en cours : finir la release officielle 1.0.16

### 4.1 Validation déjà faite (sur `son-4-sortie-1016`)
- `tests/quick.js --dsp` : **PASS** (VST3 118 contrôles, 208 presets, banc C++/JS 304 cas, pire 4,17e-7).
- `wasm/parity.js` : 304 cas identiques.
- `tests/full.js --skip web:,window` : 14/15 ; le seul échec (TOP Sounds contre beta 0.7) est **corrigé** depuis (`regress_v07.js` : 10 TOP Sounds identiques, pire 2,9e-9). Craquements « loud chord » sur tous les presets : 0 au-dessus de 1 %.
- `tests/full.js --only web:` (lancé en même temps que la file lourde) : smoke OK ; **test_demo** = l'échec connu de l'environnement (Chrome for Testing au lieu d'Edge : 1.0.14 et 1.0.15 échouent pareil, « t=0.0 next '' ») ; test_manual et test_web avaient des échecs, **tous levés depuis** :
  - **test_manual** : l'adresse Instagram débordait sur téléphone (426 px > 390) → corrigé (`overflow-wrap`, dans `5a79f71`) ; relancé seul : **PASS, 0 échec** (le nom, la taille et le lien vérifiés).
  - **test_web** : 112/114, deux échecs (« 'Play the synth' … window true », « polyphonic portamento … C5 starts at 220.1 Hz ») ; relancés seuls sur le PC au repos (`--steps welcome,polyporta`) : **36 PASS, 0 échec** → c'était la charge des deux files en parallèle (ce test est minuté en temps réel ; la réverbe n'y est pour rien, `fx_rmix` vaut 0 par défaut).
- **La validation de la release est donc complète.** Non fait : le contrôle des décrochages de la démo en temps réel (`tools/dropouts.js`) — le propriétaire l'a arrêté ; ne pas le relancer sans son accord.

### 4.2 Étapes restantes (dans l'ordre)
1. ~~Relancer test_manual et test_web~~ : **fait, PASS** (voir 4.1).
2. *(Optionnel, seulement si le propriétaire le demande)* contrôle de la démo en temps réel : `node tools/dropouts.js --engine wasm` (et `--eco`), `node tools/outstage_check.js` sur les scènes de la démo. La crête de la démo baisse avec la nouvelle réverbe (0,72 contre 0,77 en rendu hors ligne).
3. **Demander au propriétaire le feu vert pour publier**, puis remplir la ligne `**Checked**` de la section 1.0.16 de `RELEASE_HISTORY.md` avec les vrais résultats ; commit sur `son-4-sortie-1016`, push vers TEST.
4. **Dépôt de dev** : `git -C <local> diff 3f02958 son-4-sortie-1016 > patch` ; dans `Okto-MultiWave-Synth` : nouvelle branche `release-1.0.16` depuis `origin/main`, `git apply`, commit avec le message `release_tools\msg_dev_1016.txt` (identité du propriétaire, repo-local), push `main` **et** `mac-ci`.
5. **Build Mac** : `node release_tools\gh.js dispatch PierreArnaudGUYOT/Okto-MultiWave-Synth mac.yml mac-ci`, puis `gh.js runs …`, `wait_run.js <repo> <runId>`, `gh.js artifacts …`, `gh.js artifact … mac.zip` ; vérifier l'Info.plist (1.0.16) ; zip `OktoMultiWaveSynth-1.0.16-mac.zip`.
6. **Zip Windows** : rebuild `cmd /c C:\Users\Pierra\tools\okw.cmd vst\build.bat`, puis `node release_tools\make_win_zip.js 1.0.16 C:\Users\Pierra\ClaudeProjects` (utilise `tar.exe` de Windows, imprime le SHA-256).
7. **Dépôt officiel** (worktree `build\wt-main`) : remplacer l'arbre par celui du commit de dev (git archive + tar), restaurer les bits exécutables `git update-index --chmod=+x vst/build_mac.sh tests/machost/build.sh`, **vérifier que le hash d'arbre == celui du commit de dev**, commit avec `release_tools\msg_official_1016.txt`, push `origin main` (seulement **après** la CI Mac réussie).
8. **Release GitHub** : corps sur le modèle `release_tools\release_body_1015.md` (version 1.0.16, nouveautés = **réverbe seulement**, SHA-256 des deux zips) ; `node release_tools\gh.js release PierreArnaudGUYOT/Free-Wavelet-Synthesizer-VST v1.0.16 "OktoWave 1.0 (1.0.16)" body.md 0 1 <win zip> <mac zip>` ; retélécharger les zips et comparer les SHA.
9. **Page officielle** : `node release_tools\check_pages.js https://pierrearnaudguyot.github.io/Free-Wavelet-Synthesizer-VST/web <dossier web local> index.html js/core.js js/spec.js js/engine_wasm_data.js manual/manual.html` (attend que Pages serve les nouveaux fichiers ; enlève les `\r`).
10. Donner au propriétaire les liens (release, commit officiel, page web) ; mettre à jour la mémoire (`oktowave-state.md`).

### 4.3 Pièges connus
- `tests/full.js --parallel` ne transmet pas `--skip window` : lancer deux processus soi-même (`--only web: --log full-web` et `--skip web:,window --log full-main`).
- Après toute modification de `vst/src/dsp.h` : `sh wasm/build.sh` puis `node wasm/parity.js` (sinon la page joue l'ancien moteur).
- `tools/demo_compare.js --old build/wt-main` signale maintenant une différence **voulue** (la réverbe de chaque scène).
- Le `tar` de Git Bash ne lit pas les zip : `C:\Windows\System32\tar.exe`. Fins de ligne CRLF : `check_pages.js` enlève les `\r`.
- Le dépôt TEST exclut `*.wav` : `git add -f`.

---

## 5. Propositions pour la suite

### 5.1 Priorité suivante, décidée : corriger les presets qui craquent
Décisions du propriétaire (2026-10-23, voir la mémoire `oktowave-preset-fix-plan.md`) :
- **Type** : clics et grésillement **dans le son lui-même** (aussi sur PC rapide et dans le plug-in), pas la surcharge du processeur.
- **Portée** : tous les presets ; seuls ceux détectés vont sur la page.
- **Démo** : ses presets sont corrigés aussi s'il accepte.
- **Formulaire** : le Google Form de la version vote (`tools/vote/vote.js`, `FORM.url` = …/formResponse, champs `entry.79964320` (report) et `entry.15088103` (setup)), réponses marquées « PRESET FIX ».

**Consigne du propriétaire (2026-10-23) : pour l'instant, ANALYSE SEULEMENT, rien à implémenter** (aucun preset modifié, aucune page, aucun commit de code) sans son accord.

#### Cahier des charges pour un agent Claude : analyser les presets qui craquent
- **But** : un rapport (Markdown, en français) qui liste les presets dont le son lui-même craque (clics, grésillement), avec pour chacun : où (note, moment), à quel point (un score mesuré), le **paramètre responsable** (hypothèse vérifiée par la mesure : le craquement disparaît quand on ne change que lui), et la **plus petite correction** proposée avec la mesure avant / après et l'écart de sonie. Ne rien modifier dans `tools/spec.js`, les presets ou le code des moteurs.
- **Où travailler** : une copie (worktree) du dépôt local, par exemple `git -C <local> worktree add build/wt-crackle son-4-sortie-1016` ; résultats sous `tools/out/` ou dans le scratchpad ; Node : `C:\Users\Pierra\tools\node\node.exe`. Tout hors ligne (rendus en Node), aucun navigateur visible, aucune fenêtre de plug-in.
- **Comment rendre un preset** (modèle : `tools/demo_compare.js` et `tests/regress_v07.js`) : `const SPEC = require('web/js/spec.js'), C = require('web/js/core.js')(SPEC)` ; valeurs = `SPEC.PRESETS[i].values` (copie en Float64Array) ; `eng = new C.Engine(48000)` ; `values.forEach((v, i) => eng.setParam(i, v))` ; `eng.setTables(C.buildTables(values, true))` ; `eng.noteOn(note, vel)` / `eng.noteOff(note)` ; `eng.process(L, R, 128)` par blocs. La sortie est retardée de `eng.limD` échantillons (limiteur). Le moteur C++ donne le même son (4e-7) : core.js suffit pour l'analyse.
- **Quoi jouer** : une phrase qui sollicite le preset (accord tenu 3 notes + accord de 6 notes + une mélodie rapide sur 3 octaves + notes très aiguës), vélocités 0,5 et 1, pendant ~6 s, plus la phrase la plus dense de la démo (`tools/demo_level.js --all` sait la trouver et appliquer les règles de la démo).
- **Comment détecter** : (1) `tools/crackle.js` mesure déjà la distorsion de l'étage de sortie sur accords forts — tous les presets sont à 0 au-dessus de 1 % en 1.0.16, ce n'est donc pas la cause ; (2) écrire un détecteur de clics : énergie au-dessus de ~6 kHz par fenêtres de 2–5 ms comparée à sa médiane glissante (pics isolés), et pics de la dérivée seconde comparés au niveau RMS local ; valider le détecteur sur un clic synthétique et sur un preset propre (un TOP Sound) avant de l'appliquer aux 208 ; (3) pour chaque preset suspect, isoler la cause en neutralisant un paramètre à la fois (LFO 1/2/3 à 0, résonance, drive `fx_drive`, unisson, glide, morph/position des ondelettes, enveloppes très courtes) et en remesurant.
- **Pistes connues** : la modulation des tables d'ondelettes par LFO (clés de `CALM_KEYS` dans `web/js/demo.js` : `lfo_pitch, lfo_cut, lfo_pos, lfo_wav, lfo_sp, lfo_res, lfo_ew, lfo2_amt, lfo3_amt`) — en 1.0.14, des craquements de la démo (phrases avant *AAB · Rust Aurora* et *AB · Open Mallets*) ont disparu en réduisant la modulation (`TOUR_CALM`) ; les attaques/relâchements très courts (`amp_a`, `amp_r`) ; la résonance du filtre (LADDER/OTA) ; les notes aiguës (repliement) ; les presets *HIGH_CPU* et leurs versions *LGT*.
- **Livrable** : le rapport + les scripts d'analyse (dans le worktree, non commités sur l'officiel) ; ensuite seulement, avec l'accord du propriétaire, la page d'écoute décrite ci-dessous.

Plan complet (après l'analyse, sur accord) :
1. **Détection** (1–2 h) : voir le cahier des charges ci-dessus.
2. **Correction minimale** (1–2 h) : changer seulement le paramètre fautif (ex. profondeur de LFO −30 %, UNISON 7 → 5), même sonie, vérifiée par la mesure.
3. **Page d'écoute** (≈ 2 h, dépôt TEST) : en direct dans le navigateur, **8 s preset d'origine puis 8 s corrigé**, ce qui a changé affiché ; boutons **ACCEPTER / TESTER AU CLAVIER** (charge le preset, bascule avant/après, clavier MIDI) **/ REFUSER** ; progression et reprise ; envoi de chaque choix au Google Form + fichier de secours à télécharger.
4. **Application** : il exporte les réponses (ou le fichier de secours) dans `ClaudeProjects\owner_input\` ; appliquer les corrections acceptées (comme `tools/owner_presets.js`), puis release.

### 5.2 Autres améliorations proposées (il choisit l'ordre)
1. **Presets de son ami (VST v0.2)** : l'import d'un export 0.2 marche tel quel. En attente du fichier dans `C:\Users\Pierra\ClaudeProjects\presets_ami\` ; plan : fusionner ses sons dans la banque utilisateur du propriétaire **sans la remplacer**, signaler l'usage de B2, déplacer B2 vers B1 quand B1 est libre.
2. **Un seul moteur C++ dans le navigateur** (1–2 jours) : construire les tables et les affichages en C++ (aujourd'hui core.js les construit dans des Workers) ; changements de preset plus rapides, moins de code en double ; tests Safari/iPad/Firefox ; mémoire WASM 128 Mo.
3. **Son** : égaliser la sonie (LUFS) des presets ; lisser les réglages d'effets (bruit de « fermeture éclair » quand on tourne un bouton) ; stéréo des voix ; coût processeur des 3 presets les plus lourds (≈ 3 ms par quantum > budget 2,67 ms dans le navigateur).
4. **Commercial** (décisions et achats à lui) : signature du code Windows/macOS (certificats payants), installateur, format AU (Logic), abandon éventuel de VST2, choix de licence.
5. **Hall** : garée dans `son-3-reverb-classic` (`dfd3f39`, core.js seulement, corrigée). À porter dans dsp.h avec des cas de banc si un jour il la choisit.
6. Petite optimisation possible : `quietNeed` ajoute le pré-délai même quand la réverbe est coupée (`fx_rmix` 0) : sans effet sur le son, quelques blocs silencieux de plus avant la mise en veille (core.js et dsp.h ensemble).

---

## 6. Repères techniques essentiels
- **Source unique** : `tools/spec.js` → `node tools/gen_spec.js` → `web/js/spec.js` et `vst/src/generated/spec.h`. Paramètres en **ajout seulement** (IDs VST3) ; `perf` = réglage de jeu (un preset ne le change pas), `hidden` = invisible pour l'hôte.
- **Deux moteurs 1:1** : `web/js/core.js` (référence JS, AudioWorklet) et `vst/src/dsp.h` (C++, plug-in et WASM) ; banc `tools/dsp_cases.js` / `dsp_compare` / `dsp_render`, tolérance 2e-6 ; règle : aux valeurs par défaut, rien ne change sans le vouloir.
- **Build** : `cmd /c C:\Users\Pierra\tools\okw.cmd vst\build.bat` ; tests rapides `cmd /c C:\Users\Pierra\tools\okw.cmd node tests\quick.js --dsp` ; complets `node tests\full.js --skip window` (≈ 40 min, ou deux files).
- **Copies de test web** : `node tools/make_test_copy.js --out ..\Wavelet-Synthesizer-TEST\<dossier> --module <nom>` (modules dans `tools/test_copy/` : `ab_output`, `ab_engine`, `ab_reverb`, `ab_reverb_classic`, `ab_reverb3`) ; refuse les dossiers dangereux (marqueur `.okto-test-copy`).
- **Démo** : `tools/demo_compare.js`, `tools/demo_level.js`, `tools/demo_sim.js`, `tools/dropouts.js`, `tools/outstage_check.js`, `tools/reverb_demo.js`.
