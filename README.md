# AlpaStudio — Portfolio (AdonisJS 6 + Inertia v2 + Vue 3)

Portfolio d'Alexis Paillot porté en stack **AdonisJS 6 + InertiaJS v2 + Vue 3** (TypeScript, Vite).
Single-page animée : runner qui suit un trail au scroll, scroll horizontal épinglé pour les projets,
checkpoints, confettis à l'arrivée, compteurs animés, micro-interactions (boutons magnétiques, tilt 3D),
bilingue FR/EN.

## Prérequis

- Node.js **>= 20.6**
- npm (ou pnpm / yarn)

## Installation

```bash
npm install

# 1. Créer le fichier d'environnement
cp .env.example .env

# 2. Générer une APP_KEY et la coller dans .env (variable APP_KEY=)
node ace generate:key
```

> `node ace generate:key` affiche une clé. Copiez-la dans `.env` sous `APP_KEY=...`
> (ou lancez `node ace generate:key` puis suivez l'invite).

## Développement

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3333 (HMR Vite activé).

## Production

```bash
npm run build      # compile le back-end + build Vite dans ./build
cd build
npm ci --omit=dev
node bin/server.js
```

## Structure

```
adonis-portfolio/
├── adonisrc.ts               # providers, preloads, metafiles
├── vite.config.ts            # Vite + plugin Inertia + Vue
├── bin/                      # points d'entrée HTTP / ace
├── config/                   # app, inertia, session, shield, vite, ...
├── start/
│   ├── env.ts                # schéma des variables d'env
│   ├── kernel.ts             # middlewares
│   └── routes.ts             # routes HTTP
├── app/
│   ├── controllers/
│   │   ├── home_controller.ts     # rend la page Inertia "home"
│   │   ├── contact_controller.ts  # POST /contact (validation Vine)
│   │   └── arrivals_controller.ts # POST /api/arrival (compteur persistant)
│   ├── validators/contact.ts
│   ├── middleware/
│   └── exceptions/handler.ts
├── resources/views/inertia_layout.edge   # HTML racine (fonts, @vite, @inertia)
└── inertia/
    ├── app/app.ts            # bootstrap client Inertia + Vue
    ├── css/app.css           # styles globaux + keyframes + classes runtime
    ├── pages/home.vue        # ⭐ le portfolio entier (composant Vue 3 <script setup>)
    └── tsconfig.json
```

## Notes d'implémentation

- **SSR désactivé** (`config/inertia.ts`). Le portfolio dépend fortement de `window`,
  `matchMedia`, `getBoundingClientRect`, `requestAnimationFrame` — logique 100 % navigateur.
  Le composant s'appuie sur `onMounted` pour tout ce qui touche au DOM.
- **Formulaire de contact** : `useForm` d'Inertia poste sur `/contact`.
  Validation instantanée côté client (messages FR/EN) **et** validation serveur via VineJS
  (`app/validators/contact.ts`). À vous de brancher l'envoi d'email / la persistance dans
  `ContactController.store`.
- **Compteur d'arrivées** : `POST /api/arrival` incrémente un compteur stocké dans
  `tmp/arrivals.json` (remplacez par une table en base pour la prod). La route est exemptée
  de CSRF dans `config/shield.ts` car appelée en `fetch` direct.
- **Accessibilité** : `prefers-reduced-motion` est respecté (compteurs figés, magnétique/tilt
  désactivés, section projets en pile verticale).
- **i18n** : dictionnaire FR/EN inline dans `home.vue`. Pour industrialiser, extrayez-le vers
  un package i18n (ex. `@intlify/vue-i18n`) et/ou partagez la locale via `sharedData` Inertia.

## À personnaliser

- Vos vraies **captures d'écran de projets** dans les cartes (`inertia/pages/home.vue`,
  boucle `v-for="pj in projects"`).
- Le contenu du dictionnaire `DICT` (textes, projets, expériences, compétences).
- Le branchement mail dans `ContactController`.
