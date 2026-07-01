# Prompt — Portfolio AlpaStudio (alpastudio.fr)

**Repo GitHub :** https://github.com/DevAlex39/Portfolio  
**Dossier local :** `D:\Perso\Site web\Presentation\`  
**Stack :** AdonisJS 6 + InertiaJS v2 + Vue 3 (Composition API) + Vite  

---

## Concept général

Site portfolio one-page de **Alexis Paillot** (compte GitHub : DevAlex39), développeur web passionné de trail running. Le fil conducteur est un **bonhomme coureur SVG** qui descend un chemin sinueux sur la droite de l'écran au fil du scroll, symbolisant un parcours de course à pied traversant les différentes sections du portfolio. Le thème mêle **nature** (vert forêt `#52b788`, cyan `#48cae4`) et **tech/informatique** (rouge `#ef4444`, noir `#08080a`). Contact : paillot.alexis.ap@gmail.com

---

## Architecture technique

```
Presentation/
├── inertia/
│   ├── app/app.ts          # Entry point Vue/Inertia (import.meta.glob)
│   ├── css/app.css         # Resets, keyframes, classes utilitaires
│   └── pages/Home.vue      # Page unique — tout le portfolio
├── resources/views/
│   └── inertia_layout.edge # Layout HTML (Edge.js)
├── start/
│   ├── routes.ts           # Route GET / → inertia.render('Home')
│   └── kernel.ts           # Middleware incl. inertia_middleware
├── config/
│   ├── inertia.ts          # rootView: 'inertia_layout', ssr: false
│   └── vite.ts             # entrypoints: ['inertia/app/app.ts']
├── vite.config.ts          # plugin Vue uniquement (pas @adonisjs/vite/client)
└── package.json            # @inertiajs/vue3 ~2.3.27 (PAS v3.x — incompatible)
```

> ⚠️ **Point critique :** `@adonisjs/inertia` v3.1.1 génère `<div id="app" data-page="...">`.
> `@inertiajs/vue3` v3.x cherche `<script type="application/json" data-page="app">` — **incompatible**.
> La version est épinglée à `~2.3.27` dans `package.json`. Ne pas upgrader.

---

## Sections (dans l'ordre vertical)

### 1. Accueil (`#accueil`)
Hero full-viewport. Fond radial-gradient vert sombre. Silhouette montagnes SVG en bas, orbes lumineux animés, brume horizontale en drift. Kicker monospace, H1 dégradé blanc→vert→cyan, tagline, bouton CTA, scroll-dot indicator.

### 2. Compétences (`#competences`)
Deux colonnes : **"Création & Interface"** (vert, cards `skill-card-g`) et **"Architecture & Systèmes"** (rouge, cards `skill-card-r`). Chaque card a icon + nom + niveau % + barre de progression animée au scroll via `data-level`. Reveals `data-rv="left/right"` avec stagger.

### 3. Expériences (`#experiences`)
Timeline verticale avec dégradé vert→orange→rouge. Chaque item a un dot coloré, date en monospace, titre, entreprise cyan, description. 3 expériences :
- AlpaStudio (2024–présent)
- CIFC/WinDev (2023–2024)
- Formation Inovyn (2022–2023)

### 4. Projets (`#projets`)
Section à **scroll horizontal épinglé** (sticky + translateX). La section prend `vh + trackWidth` de hauteur. Pendant la progression, le bonhomme quitte le chemin vertical pour courir sur la **ligne de crête des montagnes** SVG en bas de l'écran. Contient 6 cards de projets professionnels (numérotées 01→06) : habilitations/formations, entretiens RH numérisés, centrale à béton, ERP charpente, facturation, planning nettoyage. Barre de progression et compteur `01 / 06`.

### 5. À propos (`#apropos`)
Grille 2 colonnes : texte + tags hobbies à gauche, stats (5+ projets, 100km+ trails, ∞ passion) à droite avec cards rouge dégradé.

### 6. Contact (`#contact`)
Grille 2 colonnes : liens (email, GitHub, alpastudio.fr) à gauche, formulaire (Nom, Email, Message, bouton Envoyer) à droite. Au bas : **arche d'arrivée SVG** (damier noir/blanc, tube dégradé cyan→bleu→rouge, bannière "ARRIVÉE", bonhomme rouge sur l'arche). Confettis au passage, animation `victoryJump`, compteur de visiteurs (localStorage + API Abacus fallback).

### 7. Footer
1 ligne, monospace, `© 2025 Alexis Paillot — AlpaStudio · Code & Montagne`.

---

## Le bonhomme coureur — moteur complet

**Chemin SVG** (viewBox 120×1000, `preserveAspectRatio="none"`) :
```
M70,0 C92,90 28,150 40,250 C50,340 104,380 92,480 C82,565 24,600 36,705 C46,795 100,830 86,930 C80,975 64,985 60,1000
```

**Comportement scroll :**
- Position calculée via `getPointAtLength(p * totalLength)` où `p = scrollY / maxScroll`
- Couleur interpolée vert→rouge selon `p` via `runnerColor(p)`
- Orientation : face calculée par différentiel de point (`scaleX` + `rotate`)
- Animation `runBob` (bob + lean) pendant le scroll, arrêt après 220ms d'inactivité
- Empreintes (`footprint`) déposées toutes les 22 unités de chemin parcouru (alternance gauche/droite)
- Glow sous les pieds (`rgba(color, 0.5)` flou)

**Transitions section Projets :**
- Quand `projSection` entre en vue : le runner du chemin s'efface (`opacity` → 0) et un runner de montagne (`projRunner`) prend le relais sur la crête SVG
- Retour fluide à la sortie (`eExit` cubic bezier, `handover` threshold à 85%)

**Checkpoints :** Un checkpoint DOM (`.cp-ring` + `.cp-label`) est injecté au niveau de chaque section. Il s'allume en couleur au passage du runner, avec animation `cpPop`. La section Contact a une ligne d'arrivée damier (`.cp-finish`).

**Animation intro (page load) :** Le runner tombe du haut (`.runWrap.intro .bob { animation: introDrop }`), le chemin se dessine en 1.4s (`stroke-dashoffset 1→0`), puis la ligne se fait plus discrète (`.trail-dotted` fade in à 0.45 d'opacité).

**Reduced motion :** `window.matchMedia('(prefers-reduced-motion: reduce)')` désactive runner, confettis, parallax.

---

## i18n FR/EN

Bouton toggle `FR | EN` dans la nav. Dictionnaire `DICT` complet (français/anglais) pour tous les textes : nav, hero, sections, formulaire, arche finale, footer. Les données (skills, expériences, projets, hobbies, stats) sont des `computed()` qui réagissent à `lang.value`. Les checkpoints mettent à jour leur label sans rebuild complet (watcher sur `lang`).

---

## Design system

### Couleurs

| Rôle | Couleur |
|---|---|
| Vert nature primaire | `#52b788` |
| Vert clair | `#74c69d` |
| Vert foncé | `#2d6a4f` |
| Cyan | `#48cae4` |
| Orange trail | `#e08a3c` |
| Rouge tech primaire | `#ef4444` |
| Rouge foncé | `#7f1d1d` |
| Fond principal | `#08080a` |
| Fond nav | `rgba(8,8,10,0.72)` |
| Texte principal | `#eef2ef` |
| Texte secondaire | `#a9b6af` |

### Polices (Google Fonts)
- **Space Grotesk** — titres, logo, nav
- **JetBrains Mono** — labels, kickers, compteurs, monospace
- **Public Sans** — corps de texte

---

## Animations CSS (`app.css`)

| Keyframe | Rôle |
|---|---|
| `trailDraw` | Dessin du chemin SVG au load |
| `trailDotIn` | Apparition de la piste pointillée |
| `trailDrawFade` | Disparition du trait de dessin |
| `introDrop` | Chute intro du bonhomme depuis le haut |
| `runBob` | Bob du bonhomme pendant le scroll |
| `footFade` | Empreintes qui apparaissent et s'effacent |
| `floatP` | Particules ambiantes flottantes |
| `drift` | Brume hero en dérive horizontale |
| `scrollDot` | Indicateur scroll en bas du hero |
| `cpPop` | Checkpoint qui s'illumine au passage |
| `confettiFall` | Confettis d'arrivée |
| `victoryJump` | Saut du runner sur l'arche |
| `archPulse` | Pulsation de l'arche SVG |
| `bannerFlash` | Flash de la bannière "ARRIVÉE" |
| `archBob` | Bob du runner figé sur l'arche |

### Reveal on scroll
Classe `.rv-on` ajoutée au root → `[data-rv]` masqués par défaut. L'observer ajoute `.rv-in` quand l'élément entre à 90% du viewport. Directions supportées : `up`, `left`, `right`, `scale`, `clip`, `rule`. Délai configurable via `data-rv-d="ms"`. Stagger automatique via `data-rv-stagger`.

---

## Ce qui reste à faire

1. **Formulaire de contact** → brancher la route AdonisJS `POST /contact` (AdonisJS Mail / nodemailer)
2. **Compteur d'arrivée** → remplacer l'API Abacus par une route AdonisJS + colonne SQLite
3. **Déploiement** `alpastudio.fr` → Phase 2 VPS OVH :
   ```bash
   git clone https://github.com/DevAlex39/Portfolio.git
   npm install
   npm run build
   # PM2 + Nginx reverse proxy + Certbot HTTPS
   ```
4. **Redirect HTTP → HTTPS** → config Nginx `return 301 https://$host$request_uri;`
5. **Photo personnelle** → ajouter dans section "À propos"
6. **Menu hamburger mobile** → nav trop large sur petit écran

---

## Commandes utiles

```bash
# Dev
npm run dev          # Lance AdonisJS + Vite HMR sur localhost:3333

# Build production
npm run build        # Compile TypeScript + bundle Vite → public/assets/

# Démarrage production
node bin/server.js   # ou via PM2 : pm2 start bin/server.js --name portfolio
```
