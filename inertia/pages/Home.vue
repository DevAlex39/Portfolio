<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Head, useForm } from '@inertiajs/vue3'

/* --------------------------------------------------------------------------
 * Props (passed from HomeController)
 * ------------------------------------------------------------------------ */
const props = withDefaults(
  defineProps<{
    language?: string
    showRunner?: boolean
    showParticles?: boolean
  }>(),
  { language: 'fr', showRunner: true, showParticles: true }
)

const lang = ref<'fr' | 'en'>(props.language === 'en' ? 'en' : 'fr')
const showRunner = computed(() => props.showRunner)
const showParticles = computed(() => props.showParticles)
const rank = ref<number | null>(null)
const sent = ref(false)

/* --------------------------------------------------------------------------
 * Ambient particles (generated once)
 * ------------------------------------------------------------------------ */
const particles = (() => {
  const N = 26
  return Array.from({ length: N }, () => {
    const top = Math.random() * 100
    const green = top < 52
    const col = green ? 'rgba(82,183,136,' : 'rgba(239,68,68,'
    const op = (0.1 + Math.random() * 0.22).toFixed(2)
    const size = (2 + Math.random() * 4).toFixed(1)
    const dur = (7 + Math.random() * 9).toFixed(1)
    const delay = (Math.random() * 8).toFixed(1)
    return {
      style: `position:absolute; left:${(Math.random() * 100).toFixed(1)}%; top:${top.toFixed(1)}%; width:${size}px; height:${size}px; border-radius:50%; background:${col}${op}); box-shadow:0 0 8px ${col}${op}); animation:floatP ${dur}s ease-in-out ${delay}s infinite;`,
    }
  })
})()

/* Etoiles du ciel nocturne (section projets) */
const projStars = (() =>
  Array.from({ length: 26 }, () => {
    const sz = (1 + Math.random() * 2).toFixed(1)
    return {
      style: `position:absolute; left:${(Math.random() * 100).toFixed(1)}%; top:${(Math.random() * 100).toFixed(1)}%; width:${sz}px; height:${sz}px; border-radius:50%; background:#dfe9f0; box-shadow:0 0 ${(2 + Math.random() * 4).toFixed(0)}px rgba(223,233,240,0.8); animation: pulseGlow ${(2 + Math.random() * 3).toFixed(1)}s ease-in-out ${(Math.random() * 3).toFixed(1)}s infinite;`,
    }
  }))()

/* --------------------------------------------------------------------------
 * Localised content
 * ------------------------------------------------------------------------ */
const DICT = {
  fr: {
    nav: ['Accueil', 'Compétences', 'Expériences', 'Projets', 'À propos', 'Créations', 'Contact'],
    heroKicker: 'Développeur Web & Coureur de Trail',
    heroTagline:
      'Je construis des applications web robustes, entre les lignes de code et les sentiers de montagne.',
    heroCta: 'Découvrir mon parcours',
    scroll: 'Défiler',
    skillsLabel: 'Ce que je sais faire',
    skillsTitle: 'Compétences',
    skillsIntro:
      "Deux mondes, une même rigueur : la créativité d\u2019un front soigné, la solidité d\u2019une architecture bien pensée.",
    skillsGreenTitle: 'Web & Technos modernes',
    skillsRedTitle: 'Développement métier',
    trainingBadge: 'En formation',
    softSkillsTitle: 'Et aussi…',
    creationsLabel: 'En dehors des missions',
    creationsTitle: 'Créations',
    creationsIntro: 'Des projets perso menés de A à Z, pour le plaisir de coder autre chose et d’explorer de nouvelles technos.',
    creationsCta: 'Visiter le site',
    aboutLabel: 'Qui suis-je ?',
    aboutTitle: 'À propos',
    aboutP1:
      "Développeur plein d\u2019idées, quand je ne suis pas devant le PC j\u2019arpente les sentiers pour me vider la tête et revenir avec des idées encore meilleures.",
    aboutP2:
      "J\u2019aime créer des outils qui ont du sens, et je me forme en continu sur des technos modernes avec un souci constant de la qualité. Mon terrain idéal : un projet ambitieux, une bonne équipe, et une cascade pas trop loin.",
    xpLabel: 'Mon parcours',
    xpTitle: 'Expériences',
    xpEduTitle: 'Parcours scolaire',
    xpProTitle: 'Expériences professionnelles',
    contactLabel: 'Travaillons ensemble',
    contactTitle: 'Contact',
    contactIntro:
      "Une idée de projet, une question, ou juste l\u2019envie d\u2019échanger ? N\u2019hésitez pas à me contacter.",
    fName: 'Nom',
    phName: 'Jean Dupont',
    phEmail: 'jean@exemple.fr',
    phMsg: 'Votre message…',
    send: 'Envoyer le message',
    sentMsg: '✓ Message envoyé !',
    finishLabel: 'Arrivée',
    finishSub: "Merci d’avoir suivi le parcours jusqu’au bout.",
    projLabel: 'Projets professionnels',
    projTitle: 'Projets clients',
    projIntro:
      "Des applications métier conçues pour de vraies entreprises — de la formation à l’ERP, en passant par la facturation et la planification. Faites défiler pour gravir la crête.",
    projHint: 'Faites défiler',
    projOutroTitle: 'Sommet atteint',
    projOutro: 'Le coureur reprend sa descente vers la suite du parcours.',
    footer: '© 2025 Alexis Paillot — AlpaStudio · Code & Montagne',
  },
  en: {
    nav: ['Home', 'Skills', 'Experience', 'Projects', 'About', 'Creations', 'Contact'],
    heroKicker: 'Web Developer & Trail Runner',
    heroTagline:
      'I build robust web applications, between lines of code and mountain trails.',
    heroCta: 'Explore my journey',
    scroll: 'Scroll',
    skillsLabel: 'What I do',
    skillsTitle: 'Skills',
    skillsIntro:
      'Two worlds, one discipline: the craft of a polished front end, the strength of a well-thought architecture.',
    skillsGreenTitle: 'Web & Modern stack',
    skillsRedTitle: 'Business development',
    trainingBadge: 'In training',
    softSkillsTitle: 'And also…',
    creationsLabel: 'Outside the day job',
    creationsTitle: 'Creations',
    creationsIntro: 'Personal projects built from scratch, for the fun of coding something different and exploring new tech.',
    creationsCta: 'Visit the site',
    aboutLabel: 'Who am I?',
    aboutTitle: 'About',
    aboutP1:
      "A developer full of ideas — when I\u2019m not in front of the PC, I roam the trails to clear my head and come back with even better ones.",
    aboutP2:
      "I love crafting tools that matter, and I keep training on modern tech with a constant eye for quality. My ideal ground: an ambitious project, a great team, and a waterfall not too far away.",
    xpLabel: 'My path',
    xpTitle: 'Experience',
    xpEduTitle: 'Education',
    xpProTitle: 'Work experience',
    contactLabel: "Let\u2019s work together",
    contactTitle: 'Contact',
    contactIntro:
      "A project idea, a question, or just want to chat? Don\u2019t hesitate to reach out.",
    fName: 'Name',
    phName: 'John Doe',
    phEmail: 'john@example.com',
    phMsg: 'Your message…',
    send: 'Send message',
    sentMsg: '✓ Message sent!',
    finishLabel: 'Finish',
    finishSub: 'Thanks for following the journey all the way down.',
    projLabel: 'Professional projects',
    projTitle: 'Client work',
    projIntro:
      'Business applications built for real companies — from training to ERP, invoicing and scheduling. Scroll to climb the ridge.',
    projHint: 'Scroll',
    projOutroTitle: 'Summit reached',
    projOutro: 'The runner heads back down to the rest of the journey.',
    footer: '© 2025 Alexis Paillot — AlpaStudio · Code & Mountains',
  },
} as const

const t = computed(() => DICT[lang.value])
const F = computed(() => lang.value === 'fr')

const skillsGreen = computed(() => [
  { icon: '⚡', name: 'Vue.js / Nuxt', lvl: '65%', level: 65, training: true, goal: 90, desc: F.value ? 'Frontend moderne avec Vue 3, Composition API et InertiaJS.' : 'Modern frontend with Vue 3, Composition API and InertiaJS.' },
  { icon: '🖥', name: 'AdonisJS / Node', lvl: '60%', level: 60, training: true, goal: 85, desc: F.value ? 'APIs robustes et applications full-stack avec AdonisJS 6.' : 'Robust APIs and full-stack apps with AdonisJS 6.' },
  { icon: '🗄', name: F.value ? 'SQL / Bases de données' : 'SQL / Databases', lvl: '85%', level: 85, desc: F.value ? 'Conception, modélisation et optimisation de bases de données.' : 'Database design, modelling and optimisation.' },
  { icon: '🔧', name: 'Git', lvl: '72%', level: 72, desc: F.value ? 'Versioning, branches et travail collaboratif au quotidien.' : 'Versioning, branching and day-to-day collaborative work.' },
])

const skillsRed = computed(() => [
  { icon: '🪟', name: 'WinDev', lvl: '92%', level: 92, desc: F.value ? 'Applications métier complètes : ERP, facturation, planification.' : 'Complete business apps: ERP, invoicing, scheduling.' },
  { icon: '🌐', name: 'WebDev', lvl: '82%', level: 82, desc: F.value ? 'Sites et applications web métier avec l’écosystème PC SOFT.' : 'Business websites and web apps with the PC SOFT ecosystem.' },
  { icon: '📱', name: 'WinDev Mobile', lvl: '75%', level: 75, desc: F.value ? 'Applications mobiles connectées aux systèmes métier.' : 'Mobile apps connected to business systems.' },
  { icon: '📊', name: 'VisualBasic', lvl: '70%', level: 70, desc: F.value ? 'Automatisations et outils bureautiques sur mesure.' : 'Automation and custom office tooling.' },
])

const softSkills = computed(() =>
  F.value
    ? [
        { icon: '📋', name: 'Gestion de projet', desc: 'Du cahier des charges à la livraison : cadrage, suivi et relation client.' },
        { icon: '🤝', name: "Travail d'équipe", desc: 'Collaboration, partage de connaissances et communication au quotidien.' },
      ]
    : [
        { icon: '📋', name: 'Project management', desc: 'From specs to delivery: scoping, tracking and client relations.' },
        { icon: '🤝', name: 'Teamwork', desc: 'Collaboration, knowledge sharing and day-to-day communication.' },
      ]
)

const education = computed(() => [
  {
    dotStyle: 'background:#48cae4; box-shadow:0 0 0 3px rgba(72,202,228,0.18);',
    date: '2013 — 2014',
    role: F.value ? 'Licence professionnelle METINET (alternance)' : 'Professional bachelor METINET (apprenticeship)',
    company: F.value ? 'Conception et gestion de sites internet — Bourg-en-Bresse' : 'Website design and management — Bourg-en-Bresse',
    desc: F.value
      ? 'Formation en alternance dédiée à la conception, au développement et à la gestion de sites internet.'
      : 'Work-study programme dedicated to designing, developing and managing websites.',
  },
  {
    dotStyle: 'background:#52b788; box-shadow:0 0 0 3px rgba(82,183,136,0.18);',
    date: '2011 — 2013',
    role: F.value ? 'DUT Informatique' : 'Two-year technical degree in Computer Science',
    company: F.value ? 'Université Lyon 1 (IUT)' : 'Lyon 1 University (IUT)',
    desc: F.value
      ? 'Option développement internet/web/mobile : algorithmique, bases de données, programmation web et mobile.'
      : 'Internet/web/mobile development track: algorithms, databases, web and mobile programming.',
  },
  {
    dotStyle: 'background:#74c69d; box-shadow:0 0 0 3px rgba(116,198,157,0.18);',
    date: '2011',
    role: F.value ? 'Baccalauréat SES' : 'High-school diploma (Economics & Social Sciences)',
    company: F.value ? 'Filière économique et sociale' : 'Economics and social sciences track',
    desc: '',
  },
])

const workXp = computed(() => [
  {
    dotStyle: 'background:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.18);',
    date: F.value ? 'Depuis 2016' : 'Since 2016',
    role: F.value ? 'Développeur d’applications sur mesure' : 'Custom software developer',
    company: 'INFOFIL',
    desc: F.value
      ? 'Gestion de projet de A à Z : établissement du cahier des charges avec les clients, conception des bases de données, développement et maintien des applications et sites.'
      : 'End-to-end project management: drafting specifications with clients, database design, development and maintenance of applications and websites.',
  },
  {
    dotStyle: 'background:#e08a3c; box-shadow:0 0 0 3px rgba(224,138,60,0.18);',
    date: '2016',
    role: F.value ? 'Missions d’intérim' : 'Temporary work assignments',
    company: 'MANPOWER',
    desc: F.value
      ? 'Missions en intérim de juillet à septembre : agent de production, BTP, opérateur de production.'
      : 'Temporary assignments from July to September: production worker, construction, production operator.',
  },
  {
    dotStyle: 'background:#e0a05c; box-shadow:0 0 0 3px rgba(224,160,92,0.18);',
    date: '2015 — 2016',
    role: F.value ? 'Service civique + CDD' : 'Civic service + fixed-term contract',
    company: 'MFR Doucier',
    desc: F.value
      ? 'Service civique de 6 mois : cours d’initiation à l’informatique et aux nouvelles technologies aux élèves de 4e/3e, maintenance informatique et communication (affiches, flyers). Puis CDD de deux semaines sur un logiciel de gestion de clefs (Winkhaus).'
      : 'Six-month civic service: introductory IT and new-technology classes for middle-school pupils, IT maintenance and communication (posters, flyers). Then a two-week contract on a key-management software (Winkhaus).',
  },
  {
    dotStyle: 'background:#f87171; box-shadow:0 0 0 3px rgba(248,113,113,0.18);',
    date: '2013 — 2014',
    role: F.value ? 'Développeur PHP (alternance)' : 'PHP developer (apprenticeship)',
    company: 'DOOR Informatique',
    desc: F.value
      ? 'Développement PHP autour d’un écosystème et d’un automate : ajout et amélioration de fonctionnalités de l’écosystème.'
      : 'PHP development around an ecosystem and an automation system: added and improved ecosystem features.',
  },
])

const hobbies = computed(() =>
  F.value
    ? ['Course en montagne', 'Trail running', 'Randonnée', 'Informatique', 'Jeux de société']
    : ['Mountain running', 'Trail running', 'Hiking', 'Tech & coding', 'Board games']
)

const projects = computed(() => {
  const f = F.value
  return [
    { num: '01', icon: '🎓', domain: f ? 'RH & Formation' : 'HR & Training', title: f ? 'Plateforme habilitations & formations' : 'Certifications & training platform', client: f ? 'Grand groupe industriel' : 'Large industrial group', desc: f ? 'Gestion complète des habilitations et formations : impression des passeports, modules e-learning sur la plateforme, planning de réservation des salles et suivi des sessions.' : 'End-to-end management of certifications and training: printable passports, on-platform e-learning modules, room-booking scheduler and session tracking.', tags: f ? ['E-learning', 'Planning', 'Impression PDF'] : ['E-learning', 'Scheduling', 'PDF export'] },
    { num: '02', icon: '📝', domain: f ? 'RH' : 'HR', title: f ? 'Numérisation des entretiens RH' : 'Digitised HR reviews', client: f ? 'Grand groupe industriel' : 'Large industrial group', desc: f ? 'Dématérialisation des entretiens annuels du personnel non-cadre : saisie guidée, historisation et restitution des campagnes.' : 'Paperless annual reviews for non-management staff: guided forms, history and campaign reporting.', tags: f ? ['Dématérialisation', 'Workflow', 'Reporting'] : ['Paperless', 'Workflow', 'Reporting'] },
    { num: '03', icon: '🏗', domain: f ? 'Industrie' : 'Industry', title: f ? 'Prototype centrale à béton self-service' : 'Self-service concrete plant prototype', client: f ? 'Industrie / BTP' : 'Industry / Construction', desc: f ? 'Contribution au développement d\u2019un prototype de centrale à béton en libre-service : logique de pilotage, commandes et interface opérateur.' : 'Contributed to a self-service concrete-plant prototype: control logic, ordering and operator interface.', tags: f ? ['Prototype', 'Pilotage', 'UX opérateur'] : ['Prototype', 'Control', 'Operator UX'] },
    { num: '04', icon: '📐', domain: f ? 'Gestion / ERP' : 'ERP', title: f ? 'Reprise & maintien d\u2019un ERP charpente' : 'Carpentry ERP takeover & upkeep', client: f ? 'Entreprise de charpente' : 'Carpentry company', desc: f ? 'Reprise et maintenance d\u2019un ERP complet : gestion d\u2019affaires, devis, commandes, fiches de fabrication et facturation.' : 'Took over and maintained a full ERP: project management, quotes, orders, manufacturing sheets and invoicing.', tags: f ? ['ERP', 'Devis & Factu', 'Fabrication'] : ['ERP', 'Quoting', 'Manufacturing'] },
    { num: '05', icon: '🧾', domain: f ? 'Gestion' : 'Business', title: f ? 'Applications de gestion de facturation' : 'Invoicing management apps', client: f ? 'Divers clients' : 'Various clients', desc: f ? 'Mise en place de diverses applications de gestion de la facturation, adaptées aux processus de chaque client.' : 'Built various invoicing-management applications tailored to each client\u2019s processes.', tags: f ? ['Facturation', 'Sur-mesure'] : ['Invoicing', 'Custom'] },
    { num: '06', icon: '🗓', domain: f ? 'Planification' : 'Operations', title: f ? 'Application de planification (nettoyage)' : 'Scheduling app (cleaning services)', client: f ? 'Entreprise de nettoyage' : 'Cleaning company', desc: f ? 'Application complète : gestion des clients et périodicités, planning client et salarié, jusqu\u2019à la facturation.' : 'Full app: client and recurrence management, client + staff scheduling, through to invoicing.', tags: f ? ['Planning', 'Clients', 'Facturation'] : ['Scheduling', 'Clients', 'Invoicing'] },
  ]
})

const creations = computed(() => {
  const f = F.value
  return [
    {
      icon: '🌾',
      name: 'La Ferme de l’Ormois',
      url: 'https://lafermedelormois.alpastudio.fr',
      domain: f ? 'Site vitrine & vente directe' : 'Showcase & direct sale',
      desc: f
        ? 'Site complet pour une ferme locale : présentation des produits, prise de contact et back-office d’administration sur mesure.'
        : 'Full site for a local farm: product showcase, contact form and a custom admin back-office.',
      tags: f ? ['Nuxt 4', 'SQLite', 'Admin sur-mesure'] : ['Nuxt 4', 'SQLite', 'Custom admin'],
      accent: '#52b788',
    },
    {
      icon: '🕹️',
      name: 'Arcade Zone',
      url: 'https://arcade.alpastudio.fr',
      domain: f ? 'Plateforme de jeux multijoueur' : 'Multiplayer games platform',
      desc: f
        ? 'Une salle d’arcade en ligne : Yahtzee, Skyjo, Petits Chevaux, Motus et plus, jouables en temps réel entre amis.'
        : 'An online arcade room: Yahtzee, Skyjo, Petits Chevaux, Motus and more, playable in real time with friends.',
      tags: f ? ['Vue.js', 'Socket.io', 'Temps réel'] : ['Vue.js', 'Socket.io', 'Real-time'],
      accent: '#48cae4',
    },
  ]
})

const stats = computed(() => [
  { value: '10+', count: 10, suffix: '+', label: F.value ? 'Projets menés à bien' : 'Projects seen through' },
  { value: '10 000km+', count: 10000, display: F.value ? '10 000' : '10,000', suffix: 'km+', label: F.value ? 'Trails parcourus' : 'Trails run' },
  { value: '∞', count: NaN, suffix: '', label: F.value ? 'Passion pour le code' : 'Passion for code' },
])

const navLinks = computed(() =>
  ['#accueil', '#competences', '#experiences', '#projets', '#apropos', '#creations', '#contact'].map((href, i) => ({
    href,
    label: t.value.nav[i],
  }))
)

/* --- language toggle styling --- */
const activeBtn = 'padding:0.34rem 0.7rem; border:none; cursor:pointer; background:linear-gradient(135deg,#2d6a4f,#7f1d1d); color:#fff; font-family:inherit; font-size:inherit;'
const idleBtn = 'padding:0.34rem 0.7rem; border:none; cursor:pointer; background:transparent; color:#8aa297; font-family:inherit; font-size:inherit;'
const frBtnStyle = computed(() => (lang.value === 'fr' ? activeBtn : idleBtn))
const enBtnStyle = computed(() => (lang.value === 'en' ? activeBtn : idleBtn))

/* --------------------------------------------------------------------------
 * Contact form (Inertia)
 * ------------------------------------------------------------------------ */
const form = useForm({ name: '', email: '', message: '' })
const errors = reactive<{ name?: string; email?: string; message?: string }>({})

const submitBase =
  "padding:0.95rem; border:none; border-radius:10px; font-size:0.88rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:opacity .2s, transform .2s; color:#fff; font-family:'Space Grotesk',sans-serif;"
const submitStyle = computed(
  () =>
    submitBase +
    (sent.value
      ? ' background:linear-gradient(135deg,#2d6a4f,#52b788);'
      : ' background:linear-gradient(135deg,#7f1d1d,#ef4444);')
)
const submitLabel = computed(() => (sent.value ? t.value.sentMsg : t.value.send))

const inpBase =
  "background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0.85rem 1rem; color:#eef2ef; font-family:'Public Sans',sans-serif; font-size:0.92rem; outline:none; transition:border-color .2s;"
const errBorder = 'border:1px solid #ef4444;'
const nameInputStyle = computed(() => inpBase + (errors.name ? errBorder : ''))
const emailInputStyle = computed(() => inpBase + (errors.email ? errBorder : ''))
const msgInputStyle = computed(() => inpBase + ' resize:vertical; min-height:130px;' + (errors.message ? errBorder : ''))

function validate() {
  const fr = lang.value === 'fr'
  ;(['name', 'email', 'message'] as const).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = fr ? 'Merci d’indiquer votre nom.' : 'Please enter your name.'
  if (!form.email.trim()) errors.email = fr ? 'Merci d’indiquer votre email.' : 'Please enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = fr ? 'Cet email semble invalide.' : 'That email looks invalid.'
  if (!form.message.trim()) errors.message = fr ? 'Écrivez-moi quelques mots.' : 'Write me a few words.'
  return Object.keys(errors).length
}

let sentT: ReturnType<typeof setTimeout>
function submit() {
  if (validate()) return
  form.post('/contact', {
    preserveScroll: true,
    onSuccess: () => {
      sent.value = true
      form.reset()
      ;(['name', 'email', 'message'] as const).forEach((k) => delete errors[k])
      clearTimeout(sentT)
      sentT = setTimeout(() => (sent.value = false), 3500)
    },
  })
}

/* --------------------------------------------------------------------------
 * Rank text (finish line)
 * ------------------------------------------------------------------------ */
const rankText = computed(() => {
  const r = rank.value
  if (r == null) return ''
  if (lang.value === 'fr') {
    return `Vous êtes le ${r === 1 ? '1er' : r + 'e'} à arriver en bas !`
  }
  const s = ['th', 'st', 'nd', 'rd']
  const v = r % 100
  const ord = r + (s[(v - 20) % 10] || s[v] || s[0])
  return `You’re the ${ord} to reach the bottom!`
})

/* ==========================================================================
 * SCROLL / ANIMATION ENGINE
 * ======================================================================== */

/* template refs */
const rootEl = ref<HTMLElement | null>(null)
const trailEl = ref<HTMLElement | null>(null)
const pathEl = ref<SVGPathElement | null>(null)
const runnerEl = ref<HTMLElement | null>(null)
const runImgEl = ref<SVGElement | null>(null)
const runGlowEl = ref<HTMLElement | null>(null)
const finishEl = ref<HTMLElement | null>(null)
const projSectionEl = ref<HTMLElement | null>(null)
const projStickyEl = ref<HTMLElement | null>(null)
const projTrackEl = ref<HTMLElement | null>(null)
const projBackEl = ref<HTMLElement | null>(null)
const projMountPathEl = ref<SVGPathElement | null>(null)
const projRunnerEl = ref<HTMLElement | null>(null)
const projRunImgEl = ref<SVGElement | null>(null)
const projGlowEl = ref<HTMLElement | null>(null)
const projCounterEl = ref<HTMLElement | null>(null)
const projBarEl = ref<HTMLElement | null>(null)
const cursorDotEl = ref<HTMLElement | null>(null)
const cursorRingEl = ref<HTMLElement | null>(null)
const projDayEl = ref<HTMLElement | null>(null)
const projSunsetEl = ref<HTMLElement | null>(null)
const projNightEl = ref<HTMLElement | null>(null)
const projSunEl = ref<HTMLElement | null>(null)
const projMoonEl = ref<HTMLElement | null>(null)
const projStarsEl = ref<HTMLElement | null>(null)
const kmEl = ref<HTMLElement | null>(null)
const eduFillEl = ref<HTMLElement | null>(null)
const proFillEl = ref<HTMLElement | null>(null)
const introOn = ref(false)
const langFade = ref(false)

/* engine state */
let reduce = false
let parallax: { el: HTMLElement; speed: number }[] = []
let reveals: HTMLElement[] = []
let checkpoints: any[] = []
let projScroll = 0
let raf = 0
let idle: ReturnType<typeof setTimeout>
let resizeT: ReturnType<typeof setTimeout>
let celebT: ReturnType<typeof setTimeout>
let lastFootLen = -999
let footSide = 0
let celebrated = false
let cpLang = 'fr'
let lastDustX = -999
let lightFx = false
/* Longueur du fil conducteur + rect du calque fixe (position:fixed, ne
   bouge pas au scroll) : mis en cache pour eviter de recalculer une
   geometrie SVG couteuse (getTotalLength) a chaque frame de scroll */
let trailLen = 0
let trailRectCache = { left: 0, top: 0, width: 0, height: 0 }
let mountLen = 0
let mountainHCache = 0
let mx = 0
let my = 0
let ringX = 0
let ringY = 0
let cursorRaf = 0
let cursorCol = '#52b788'
let langT: ReturnType<typeof setTimeout>
let introT: ReturnType<typeof setTimeout>

const sectionDefs = [
  { sel: '#accueil', fr: 'Départ', en: 'Start' },
  { sel: '#competences', fr: 'Compétences', en: 'Skills' },
  { sel: '#experiences', fr: 'Expériences', en: 'Experience' },
  { sel: '#projets', fr: 'Projets', en: 'Projects' },
  { sel: '#apropos', fr: 'À propos', en: 'About' },
  { sel: '#creations', fr: 'Créations', en: 'Creations' },
  { sel: '#contact', fr: '🏁 Arrivée', en: '🏁 Finish', finish: true },
] as any[]

function lerp(a: number, b: number, tt: number) {
  return Math.round(a + (b - a) * tt)
}
function runnerColor(p: number) {
  const g = [82, 183, 136],
    r = [239, 68, 68]
  return `rgb(${lerp(g[0], r[0], p)},${lerp(g[1], r[1], p)},${lerp(g[2], r[2], p)})`
}

function layoutProjects() {
  const sec = projSectionEl.value,
    track = projTrackEl.value,
    sticky = projStickyEl.value
  if (!sec || !track || !sticky) return
  if (reduce) {
    sec.style.height = ''
    return
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const trackWidth = track.scrollWidth
  projScroll = Math.max(0, trackWidth - vw)
  sec.style.height = vh + projScroll + 'px'

  /* Cache : la longueur du chemin de crete et la hauteur du massif ne
     changent qu'au resize, pas a chaque frame de scroll */
  const mountPath = projMountPathEl.value
  if (mountPath) {
    mountLen = mountPath.getTotalLength()
    const mt = mountPath.closest('.proj-mountains') as HTMLElement | null
    mountainHCache = mt ? mt.clientHeight : vh * 0.42
  }
}

function onResize() {
  clearTimeout(resizeT)
  resizeT = setTimeout(() => {
    buildCheckpoints()
    layoutProjects()
    update(true)
  }, 150)
}

function buildCheckpoints() {
  const trail = trailEl.value,
    path = pathEl.value,
    root = rootEl.value
  if (!trail || !path || !root) return
  ;(checkpoints || []).forEach((c) => {
    c.el.remove()
    c.label.remove()
    c.bar && c.bar.remove()
  })
  const l = lang.value
  const max = root.offsetHeight - window.innerHeight
  const len = path.getTotalLength()
  const w = trail.clientWidth,
    h = trail.clientHeight
  /* Cache : trail est position:fixed, sa geometrie ne change qu'au resize */
  trailLen = len
  const tRect = trail.getBoundingClientRect()
  trailRectCache = { left: tRect.left, top: tRect.top, width: w, height: h }
  const sx = w / 120,
    sy = h / 1000
  checkpoints = sectionDefs.map((def) => {
    const sec = root.querySelector(def.sel) as HTMLElement | null
    const top = sec ? sec.offsetTop : 0
    const p = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0
    const pt = path.getPointAtLength(p * len)
    const x = pt.x * sx,
      y = pt.y * sy
    const el = document.createElement('div')
    el.className = 'cp-ring'
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    const label = document.createElement('div')
    label.className = 'cp-label'
    label.textContent = def[l] || def.fr
    label.style.left = x + 'px'
    label.style.top = y + 'px'
    trail.appendChild(el)
    trail.appendChild(label)
    let bar: HTMLElement | null = null
    if (def.finish) {
      bar = document.createElement('div')
      bar.className = 'cp-finish'
      bar.style.top = y + 'px'
      trail.appendChild(bar)
    }
    return { el, label, bar, p, on: false, finish: !!def.finish, def }
  })
  cpLang = l
}

function onScroll() {
  if (!reduce) {
    runnerEl.value && runnerEl.value.classList.add('running')
    projRunnerEl.value && projRunnerEl.value.classList.add('running')
    clearTimeout(idle)
    idle = setTimeout(() => {
      runnerEl.value && runnerEl.value.classList.remove('running')
      projRunnerEl.value && projRunnerEl.value.classList.remove('running')
    }, 220)
  }
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => update(false))
}

function update(initial: boolean) {
  const root = rootEl.value
  if (!root) return
  const vh = window.innerHeight
  const total = root.offsetHeight - vh
  const scrolled = -root.getBoundingClientRect().top
  const y = Math.max(0, scrolled)
  const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0

  parallax.forEach((q) => (q.el.style.transform = `translateY(${y * q.speed}px)`))

  if (!reduce) updateProjects(vh, p)

  if (reveals.length) {
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i]
      const r = el.getBoundingClientRect()
      if (r.top < vh * 0.9 && r.bottom > 0) {
        revealEl(el)
        reveals.splice(i, 1)
      }
    }
  }

  let finishTop: number | null = null
  if (finishEl.value) {
    const fr = finishEl.value.getBoundingClientRect()
    finishTop = fr.top
    const inView = fr.top < vh * 0.78 && fr.bottom > vh * 0.2
    if (inView && !celebrated) {
      celebrated = true
      celebrate()
      registerArrival()
    } else if (!inView && fr.top > vh) {
      celebrated = false
    }
  }

  const trail = trailEl.value,
    path = pathEl.value,
    runner = runnerEl.value
  if (path && runner && trail) {
    const len = trailLen || path.getTotalLength()
    const pt = path.getPointAtLength(p * len)
    const w = trailRectCache.width || trail.clientWidth,
      h = trailRectCache.height || trail.clientHeight
    const sx = w / 120,
      sy = h / 1000
    const x = pt.x * sx,
      py = pt.y * sy
    const col = runnerColor(p)
    cursorCol = col
    runner.style.transform = `translate(${x - 26}px, ${py - 40}px)`

    /* Kilometrage : un marathon (42,2 km) du depart jusqu'au moment
       ou l'arche declenche les confettis (fr.top < 78% de la hauteur) */
    if (kmEl.value) {
      let kmP = p
      if (finishTop !== null) {
        const finishScroll = finishTop + y - vh * 0.78
        kmP = finishScroll > 0 ? Math.min(1, y / finishScroll) : 1
      }
      const d = (kmP * 42.2).toFixed(1)
      const total = '42.2'
      const fr = lang.value === 'fr'
      kmEl.value.textContent = (fr ? d.replace('.', ',') : d) + ' / ' + (fr ? total.replace('.', ',') : total) + ' km'
      kmEl.value.style.color = col
      kmEl.value.style.borderColor = col
    }

    const pt2 = path.getPointAtLength(Math.min(len, p * len + 8))
    const dxp = (pt2.x - pt.x) * sx,
      dyp = (pt2.y - pt.y) * sy
    if (runImgEl.value && (Math.abs(dxp) > 0.001 || Math.abs(dyp) > 0.001)) {
      const face = dxp >= 0 ? 1 : -1
      let lean = (Math.atan2(dxp, Math.max(0.01, dyp)) * 180) / Math.PI
      lean = Math.max(-26, Math.min(26, lean))
      const r = face === -1 ? -lean : lean
      runImgEl.value.style.transform = `scaleX(${face}) rotate(${r}deg)`
      runImgEl.value.style.color = col
    }
    if (runGlowEl.value) runGlowEl.value.style.background = col

    const traveled = p * len
    if (!initial && !reduce && !lightFx && Math.abs(traveled - lastFootLen) > 22) {
      lastFootLen = traveled
      dropFoot(x, py, col)
    }
  }

  /* Timeline experiences : le trait se dessine au fil du scroll */
  ;[eduFillEl.value, proFillEl.value].forEach((f) => {
    if (!f || !f.parentElement) return
    const tr = f.parentElement.getBoundingClientRect()
    const prog = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - tr.top) / tr.height))
    f.style.transform = `scaleY(${prog.toFixed(4)})`
  })

  checkpoints.forEach((cp) => {
    const reached = p >= cp.p - 0.002
    if (reached && !cp.on) {
      cp.on = true
      const c = runnerColor(cp.p)
      cp.el.classList.add('reached')
      cp.el.style.background = c
      cp.el.style.borderColor = c
      cp.el.style.boxShadow = `0 0 12px ${c}`
      cp.label.style.color = c
      if (!initial) {
        cp.el.style.animation = 'cpPop .6s ease-out'
        dropRipple(cp, c)
      }
      updateFavicon(c)
      if (cp.bar) {
        cp.bar.style.boxShadow = '0 0 20px rgba(239,68,68,0.7)'
        cp.bar.style.transform = 'translateY(-50%) scaleY(1.3)'
        cp.bar.style.opacity = '1'
      }
    } else if (!reached && cp.on) {
      cp.on = false
      cp.el.classList.remove('reached')
      cp.el.style.background = ''
      cp.el.style.borderColor = ''
      cp.el.style.boxShadow = ''
      cp.el.style.animation = ''
      cp.label.style.color = ''
      if (cp.bar) {
        cp.bar.style.boxShadow = ''
        cp.bar.style.transform = 'translateY(-50%)'
        cp.bar.style.opacity = '0.9'
      }
    }
  })
}

async function registerArrival() {
  const KEY = 'alpastudio_portfolio_rank'
  const stored = localStorage.getItem(KEY)
  if (stored) {
    rank.value = parseInt(stored, 10)
    return
  }
  try {
    const res = await fetch('/api/arrival', {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    localStorage.setItem(KEY, String(data.value))
    rank.value = data.value
  } catch {
    const local = parseInt(localStorage.getItem('alpastudio_local_count') || '0', 10) + 1
    localStorage.setItem('alpastudio_local_count', String(local))
    localStorage.setItem(KEY, String(local))
    rank.value = local
  }
}

function celebrate() {
  const el = finishEl.value
  if (!el || reduce) return
  el.classList.remove('celebrate')
  void el.offsetWidth
  el.classList.add('celebrate')
  const colors = ['#52b788', '#48cae4', '#ef4444', '#e08a3c', '#74c69d', '#f4f4f4']
  const cx = el.clientWidth / 2
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('span')
    c.className = 'confetti'
    const dx = (Math.random() * 2 - 1) * 190
    const dy = 130 + Math.random() * 230
    const rot = (Math.random() * 2 - 1) * 760
    const sz = 5 + Math.random() * 7
    c.style.left = cx + 'px'
    c.style.top = '11%'
    c.style.width = sz + 'px'
    c.style.height = sz * 0.6 + 'px'
    c.style.background = colors[i % colors.length]
    c.style.setProperty('--dx', dx + 'px')
    c.style.setProperty('--dy', dy + 'px')
    c.style.setProperty('--rot', rot + 'deg')
    c.style.animationDuration = 1 + Math.random() * 0.9 + 's'
    el.appendChild(c)
    setTimeout(() => c.remove(), 2100)
  }
  clearTimeout(celebT)
  celebT = setTimeout(() => el && el.classList.remove('celebrate'), 1500)
}
function updateProjects(vh: number, p: number) {
  const sec = projSectionEl.value,
    track = projTrackEl.value,
    sticky = projStickyEl.value
  if (!sec || !track || !sticky) return
  const vw = window.innerWidth
  const rect = sec.getBoundingClientRect()
  const scrollRange = projScroll || 0
  const local = -rect.top
  const pinned = local >= 0 && local <= scrollRange
  const near = rect.top < vh * 0.9 && rect.bottom > vh * 0.1

  const st = sticky.style
  if (pinned) {
    st.position = 'fixed'
    st.top = '0'
    st.bottom = 'auto'
  } else if (local < 0) {
    st.position = 'absolute'
    st.top = '0'
    st.bottom = 'auto'
  } else {
    st.position = 'absolute'
    st.top = 'auto'
    st.bottom = '0'
  }

  const pp = scrollRange > 0 ? Math.min(1, Math.max(0, local / scrollRange)) : 0
  track.style.transform = `translateX(${-pp * scrollRange}px)`
  if (projBackEl.value) projBackEl.value.style.transform = `translateX(${-pp * scrollRange * 0.25}px)`

  let entry = 0,
    exit = 0
  if (local >= 0 && local <= scrollRange) {
    if (pp < 0.12) entry = 1 - pp / 0.12
    else if (pp > 0.8) exit = (pp - 0.8) / 0.2
  }
  const inSection = local >= 0 && local <= scrollRange
  const eExit = exit * exit * (3 - 2 * exit)
  const eEntry = entry * entry * (3 - 2 * entry)

  const mountPath = projMountPathEl.value
  const mh = mountainHCache || vh * 0.42
  const mTop = vh - mh
  const len = mountLen || 1
  const ridgePt = mountPath ? mountPath.getPointAtLength(pp * len) : { x: 0, y: 0 }
  const Rm = { x: (ridgePt.x / 1000) * vw, y: mTop + (ridgePt.y / 300) * mh }

  let Cv = Rm
  const trail = trailEl.value,
    path = pathEl.value
  if (trailLen && path) {
    const ptv = path.getPointAtLength((p || 0) * trailLen)
    Cv = {
      x: trailRectCache.left + ptv.x * (trailRectCache.width / 120),
      y: trailRectCache.top + ptv.y * (trailRectCache.height / 1000),
    }
  }
  /* Position du coureur des cretes : interpolee vers le fil conducteur
     a l'entree ET a la sortie pour une passation sans a-coup */
  const blend = Math.max(eExit, eEntry)
  const C = { x: Rm.x + (Cv.x - Rm.x) * blend, y: Rm.y + (Cv.y - Rm.y) * blend }
  let handover = eExit < 0.7 ? 0 : (eExit - 0.7) / 0.3
  handover = handover * handover * (3 - 2 * handover)

  let trailVis: number
  if (!inSection) trailVis = 1
  else if (pp < 0.12) trailVis = eEntry
  else if (pp > 0.8) trailVis = eExit
  else trailVis = 0
  if (trail) {
    trail.style.opacity = trailVis.toFixed(3)
    trail.style.clipPath = 'none'
    ;(trail.style as any).webkitClipPath = 'none'
  }
  if (runnerEl.value) {
    let vv: number
    if (!inSection) vv = 1
    else if (pp < 0.12) vv = eEntry
    else if (pp > 0.8) vv = handover
    else vv = 0
    runnerEl.value.style.opacity = vv.toFixed(3)
  }

  let mvis: number
  if (!inSection) mvis = 0
  else if (pp < 0.12) mvis = 1 - eEntry
  else if (pp > 0.8) mvis = 1 - handover
  else mvis = 1
  if (projRunnerEl.value && mountPath) {
    projRunnerEl.value.style.opacity = mvis.toFixed(3)
    projRunnerEl.value.style.transform = `translate(${C.x - 26}px, ${C.y - 40}px)`
    const pt2 = mountPath.getPointAtLength(Math.min(len, pp * len + 8))
    const dx = pt2.x - ridgePt.x,
      dy = pt2.y - ridgePt.y
    if (projRunImgEl.value && (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001)) {
      const face = dx >= 0 ? 1 : -1
      let lean = (Math.atan2(dx, Math.max(0.01, dy)) * 180) / Math.PI
      lean = Math.max(-30, Math.min(30, lean))
      projRunImgEl.value.style.transform = `scaleX(${face}) rotate(${face === -1 ? -lean : lean}deg)`
    }
    const col = runnerColor(0.15 + pp * 0.2)
    if (projRunImgEl.value) projRunImgEl.value.style.color = col
    if (projGlowEl.value) projGlowEl.value.style.background = col

    /* Poussiere soulevee par la foulee sur la crete */
    if (!reduce && !lightFx && pinned && mvis > 0.5 && Math.abs(C.x - lastDustX) > 26) {
      lastDustX = C.x
      dropDust(C.x, C.y + 18, col)
    }
  }

  const N = projects.value.length || 6
  if (projCounterEl.value) {
    const active = Math.min(N, Math.floor(pp * N + 0.0001) + 1)
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
    projCounterEl.value.textContent = pad(active) + ' / ' + pad(N)
  }
  if (projBarEl.value) projBarEl.value.style.width = (pp * 100).toFixed(1) + '%'

  /* Cycle jour / nuit sur la traversee des cretes :
     le soleil monte, redescend derriere les sommets, puis lune + etoiles */
  const dayF = inSection ? Math.max(0, 1 - Math.abs(pp - 0.22) / 0.3) : 0
  const sunsetF = inSection ? Math.max(0, 1 - Math.abs(pp - 0.62) / 0.22) : 0
  const nightF = inSection ? Math.min(1, Math.max(0, (pp - 0.68) / 0.24)) : 0
  if (projDayEl.value) projDayEl.value.style.opacity = (dayF * 0.55).toFixed(3)
  if (projSunsetEl.value) projSunsetEl.value.style.opacity = (sunsetF * 0.75).toFixed(3)
  if (projNightEl.value) projNightEl.value.style.opacity = (nightF * 0.8).toFixed(3)
  if (projSunEl.value) {
    const sunX = vw * (0.16 + 0.6 * pp)
    const sunY = vh * (0.14 + 0.78 * pp * pp)
    projSunEl.value.style.transform = `translate(${sunX}px, ${sunY}px)`
    const sunOp = pp < 0.7 ? 1 : Math.max(0, 1 - (pp - 0.7) / 0.08)
    projSunEl.value.style.opacity = (inSection ? sunOp * 0.95 : 0).toFixed(3)
  }
  if (projMoonEl.value) {
    const moonY = vh * (0.5 - 0.34 * nightF)
    projMoonEl.value.style.transform = `translate(${vw * 0.76}px, ${moonY}px)`
    projMoonEl.value.style.opacity = nightF.toFixed(3)
  }
  if (projStarsEl.value) projStarsEl.value.style.opacity = nightF.toFixed(3)

  if (near) {
    const cards = track.querySelectorAll('[data-proj-card]')
    const cx = vw / 2
    cards.forEach((c) => {
      const el = c as HTMLElement
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.left + r.width / 2 - cx)
      const tt = Math.min(1, d / (vw * 0.55))
      el.style.opacity = (1 - tt * 0.55).toFixed(3)
      el.style.transform = `scale(${(1 - tt * 0.08).toFixed(3)})`
      el.style.borderColor = tt < 0.3 ? 'rgba(116,198,157,0.45)' : 'rgba(255,255,255,0.1)'
    })
  }
}

function revealEl(el: HTMLElement) {
  let delay = parseInt(el.getAttribute('data-rv-d') || '0', 10)
  if (el.hasAttribute('data-rv-stagger') && el.parentElement) {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-rv'))
    const idx = sibs.indexOf(el)
    if (idx > 0) delay += idx * 105
  }
  if (delay) el.style.transitionDelay = delay + 'ms'
  el.classList.add('rv-in')
  el.querySelectorAll('[data-level]').forEach((b) => {
    ;(b as HTMLElement).style.width = (b as HTMLElement).getAttribute('data-level') + '%'
  })
  el.querySelectorAll('[data-count-to]').forEach((c) =>
    (c as HTMLElement).hasAttribute('data-odometer')
      ? odometer(c as HTMLElement)
      : countUp(c as HTMLElement)
  )
}

function countUp(el: HTMLElement) {
  const to = parseFloat(el.getAttribute('data-count-to') || '')
  const suffix = el.getAttribute('data-count-suffix') || ''
  if (!isFinite(to)) return
  if (el.dataset.counted) return
  el.dataset.counted = '1'
  if (reduce) {
    el.textContent = to + suffix
    return
  }
  const dur = 1150,
    start = performance.now()
  const step = (now: number) => {
    const tt = Math.min(1, (now - start) / dur)
    const e = 1 - Math.pow(1 - tt, 3)
    el.textContent = Math.round(to * e) + suffix
    if (tt < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function bindInteractions() {
  const root = rootEl.value
  if (reduce || !root) return
  root.querySelectorAll('[data-magnetic]').forEach((node) => {
    const el = node as HTMLElement
    if (el.dataset.magBound) return
    el.dataset.magBound = '1'
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect()
      const mx = (e as MouseEvent).clientX - (r.left + r.width / 2)
      const my = (e as MouseEvent).clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${mx * 0.28}px, ${my * 0.4}px)`
    })
    el.addEventListener('mouseleave', () => (el.style.transform = ''))
  })
  root.querySelectorAll('[data-proj-card]').forEach((node) => {
    const card = node as HTMLElement
    if (card.dataset.tiltBound) return
    const inner = card.querySelector('[data-proj-inner]') as HTMLElement | null
    if (!inner) return
    card.dataset.tiltBound = '1'
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const px = ((e as MouseEvent).clientX - r.left) / r.width - 0.5
      const py = ((e as MouseEvent).clientY - r.top) / r.height - 0.5
      inner.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg)`
    })
    card.addEventListener('mouseleave', () => (inner.style.transform = ''))
  })
}

/* --- 1. Curseur personnalise --- */
function moveCursor(e: MouseEvent) {
  mx = e.clientX
  my = e.clientY
  if (cursorDotEl.value) cursorDotEl.value.style.transform = `translate(${mx}px, ${my}px)`
}
function cursorLoop() {
  ringX += (mx - ringX) * 0.16
  ringY += (my - ringY) * 0.16
  if (cursorRingEl.value) {
    cursorRingEl.value.style.transform = `translate(${ringX}px, ${ringY}px)`
    cursorRingEl.value.style.borderColor = cursorCol
  }
  if (cursorDotEl.value) cursorDotEl.value.style.background = cursorCol
  cursorRaf = requestAnimationFrame(cursorLoop)
}
function onHoverCheck(e: MouseEvent) {
  const t = (e.target as HTMLElement).closest?.(
    'a, button, input, textarea, .skill-card, [data-proj-card]'
  )
  document.documentElement.classList.toggle('cur-hover', !!t)
}

/* --- Poussiere du coureur des cretes --- */
function dropDust(x: number, y: number, col: string) {
  const host = projStickyEl.value
  if (!host) return
  const d = document.createElement('span')
  d.className = 'dust'
  d.style.left = x + 'px'
  d.style.top = y + 'px'
  d.style.background = col
  host.appendChild(d)
  setTimeout(() => d.remove(), 950)
}

/* --- 3. Ripple checkpoint --- */
function dropRipple(cp: any, col: string) {
  const trail = trailEl.value
  if (!trail || reduce) return
  const rp = document.createElement('span')
  rp.className = 'cp-ripple'
  rp.style.left = cp.el.style.left
  rp.style.top = cp.el.style.top
  rp.style.borderColor = col
  trail.appendChild(rp)
  setTimeout(() => rp.remove(), 750)
}

/* --- 11. Empreintes au clic --- */
function clickSteps(e: MouseEvent) {
  if (reduce || lightFx) return
  for (let k = 0; k < 2; k++) {
    const f = document.createElement('span')
    f.className = 'footprint fp-click'
    f.style.left = e.clientX + (k ? 6 : -6) + 'px'
    f.style.top = e.clientY + (k ? 10 : 2) + 'px'
    f.style.background = cursorCol
    f.style.boxShadow = '0 0 6px ' + cursorCol
    f.style.animationDelay = k * 120 + 'ms'
    document.body.appendChild(f)
    setTimeout(() => f.remove(), 1800)
  }
}

/* --- 12. Favicon dynamique (coureur colore selon la progression) --- */
function updateFavicon(col: string) {
  try {
    const c = document.createElement('canvas')
    c.width = 32
    c.height = 32
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(32 / 24, 0, 0, 32 / 24, 0, 0)
    ctx.fillStyle = col
    ctx.fill(new Path2D(RUNNER_PATH))
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = c.toDataURL('image/png')
  } catch {}
}

/* --- 8. Odometre : les chiffres roulent comme un compteur mecanique --- */
function odometer(el: HTMLElement) {
  const to = parseFloat(el.getAttribute('data-count-to') || '')
  const suffix = el.getAttribute('data-count-suffix') || ''
  /* Affichage groupe optionnel (ex: "10 000") — les non-chiffres
     deviennent des separateurs statiques entre les rouleaux */
  const display = el.getAttribute('data-count-display') || String(to)
  if (!isFinite(to)) return
  if (el.dataset.counted) return
  el.dataset.counted = '1'
  if (reduce) {
    el.textContent = display + suffix
    return
  }
  el.textContent = ''
  el.classList.add('odo')
  let digitIdx = 0
  display
    .split('')
    .forEach((d) => {
      if (!/\d/.test(d)) {
        const sep = document.createElement('span')
        sep.className = 'odo-sfx'
        sep.textContent = d === ' ' ? ' ' : d
        el.appendChild(sep)
        return
      }
      const idx = digitIdx++
      const col = document.createElement('span')
      col.className = 'odo-col'
      const strip = document.createElement('span')
      strip.className = 'odo-strip'
      for (let k = 0; k <= 9; k++) {
        const s = document.createElement('span')
        s.textContent = String(k)
        strip.appendChild(s)
      }
      col.appendChild(strip)
      el.appendChild(col)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          strip.style.transitionDelay = idx * 130 + 'ms'
          strip.style.transform = `translateY(${-parseInt(d, 10)}em)`
        })
      )
    })
  if (suffix) {
    const sfx = document.createElement('span')
    sfx.className = 'odo-sfx'
    sfx.textContent = suffix
    el.appendChild(sfx)
  }
}

/* --- 13. Changement de langue avec fondu --- */
function setLang(l: 'fr' | 'en') {
  if (lang.value === l) return
  if (reduce) {
    lang.value = l
    return
  }
  langFade.value = true
  clearTimeout(langT)
  langT = setTimeout(() => {
    lang.value = l
    nextTick(() => requestAnimationFrame(() => (langFade.value = false)))
  }, 190)
}

function dropFoot(x: number, y: number, col: string) {
  const trail = trailEl.value
  if (!trail) return
  const f = document.createElement('span')
  f.className = 'footprint'
  const off = footSide ? 5 : -5
  footSide ^= 1
  f.style.left = x - 3 + off + 'px'
  f.style.top = y + 8 + 'px'
  f.style.background = col
  f.style.boxShadow = '0 0 6px ' + col
  trail.appendChild(f)
  setTimeout(() => f.remove(), 1450)
}

/* --------------------------------------------------------------------------
 * Lifecycle
 * ------------------------------------------------------------------------ */
onMounted(() => {
  reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  /* Mode leger : mobile / pointeur grossier — evite le surcout des
     particules (empreintes, poussiere) generees en continu au scroll */
  lightFx = !!(
    window.matchMedia &&
    (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 760px)').matches)
  )
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onResize, { passive: true })

  /* 14. Intro AlpaStudio — une fois par session */
  if (!reduce && !sessionStorage.getItem('alpa_intro')) {
    sessionStorage.setItem('alpa_intro', '1')
    introOn.value = true
    introT = setTimeout(() => (introOn.value = false), 1400)
  }

  /* 1. Curseur personnalise — pointeur fin uniquement */
  const finePointer = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches)
  if (finePointer && !reduce) {
    document.documentElement.classList.add('has-cursor')
    window.addEventListener('mousemove', moveCursor, { passive: true })
    window.addEventListener('mouseover', onHoverCheck, { passive: true })
    cursorLoop()
  }

  /* 11. Empreintes au clic */
  window.addEventListener('click', clickSteps, { passive: true })

  /* 12. Favicon initial */
  updateFavicon('#52b788')

  const root = rootEl.value!
  parallax = Array.from(root.querySelectorAll('[data-parallax]')).map((el) => ({
    el: el as HTMLElement,
    speed: parseFloat((el as HTMLElement).getAttribute('data-speed') || '0') || 0,
  }))

  if (!reduce) root.classList.add('rv-on')
  reveals = Array.from(root.querySelectorAll('[data-rv]')) as HTMLElement[]

  if (reduce && runnerEl.value) runnerEl.value.classList.remove('intro')
  if (!reduce && runnerEl.value)
    setTimeout(() => runnerEl.value && runnerEl.value.classList.remove('intro'), 1300)

  if (reduce && projSectionEl.value) projSectionEl.value.classList.add('reduce-stack')
  layoutProjects()

  requestAnimationFrame(() => {
    buildCheckpoints()
    layoutProjects()
    update(true)
    bindInteractions()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, { capture: true } as any)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', moveCursor)
  window.removeEventListener('mouseover', onHoverCheck)
  window.removeEventListener('click', clickSteps)
  document.documentElement.classList.remove('has-cursor', 'cur-hover')
  if (cursorRaf) cancelAnimationFrame(cursorRaf)
  clearTimeout(idle)
  clearTimeout(resizeT)
  clearTimeout(celebT)
  clearTimeout(sentT)
  clearTimeout(langT)
  clearTimeout(introT)
})

watch(lang, () => {
  checkpoints.forEach((cp) => (cp.label.textContent = cp.def[lang.value] || cp.def.fr))
  nextTick(() =>
    requestAnimationFrame(() => {
      layoutProjects()
      buildCheckpoints()
      update(true)
      bindInteractions()
    })
  )
})

/* runner SVG path — shared by the three runner instances */
const RUNNER_PATH =
  'M13,2 C14.6569,2 16,3.34315 16,5 C16,6.4374272 14.989097,7.63873126 13.6394248,7.93171632 L13.469,7.96356 L14.9049,10.261 L16.6286,9.57154 C17.1414,9.36643 17.7234,9.61584 17.9285,10.1286 C18.11895,10.6047714 17.9175097,11.1406102 17.4771844,11.3789437 L17.3714,11.4285 L15.6477,12.118 C14.8018647,12.4563529 13.842291,12.1788886 13.3046353,11.4607687 L13.2089,11.321 L13.0463,11.0609 L12.4403,13.4851 C12.38606,13.7019 12.298348,13.901548 12.184076,14.0798456 L12.0935,14.2095 L13.7468,15.4377 C14.1430667,15.7320111 14.4146519,16.1610383 14.5132351,16.6403612 L14.542,16.8223 L14.895,20 L15,20 C15.5523,20 16,20.4477 16,21 C16,21.51285 15.613973,21.9355092 15.1166239,21.9932725 L15,22 L14.0895,22 C13.5690357,22 13.1258286,21.63665 13.0156081,21.1386974 L12.9962,21.0215 L12.5542,17.0431 L9.40368,14.7028 C9.34671,14.6605 9.29553,14.6132 9.2503,14.5621 C8.69851333,14.1201667 8.40463653,13.4019169 8.52705735,12.6715064 L8.55972,12.5149 L9.35399,9.33785 L7.78454,9.80869 L6.94868,12.3162 C6.77404,12.8402 6.20772,13.1234 5.68377,12.9487 C5.19725429,12.7865714 4.9183499,12.2866153 5.0208232,11.7965565 L5.05132,11.6838 L5.88717,9.17623 C6.07583833,8.61021583 6.50617896,8.16080701 7.05678434,7.94578318 L7.20984,7.89304 L10.6474,6.86176 C10.2421,6.35022 10,5.70338 10,5 C10,3.34315 11.3431,2 13,2 Z M9.6,15.2 C10.0418,15.5314 10.1314,16.1582 9.8,16.6 L8.5838,18.2216 C8.10614,18.8585 7.21414,19.0113 6.55175,18.5697 L4.62197,17.2832 C4.22939,17.5957 3.65616,17.5704 3.29289,17.2071 C2.90237,16.8166 2.90237,16.1834 3.29289,15.7929 L3.7871,15.2987 C4.12753,14.9583 4.66094,14.9055 5.06152,15.1725 L7.26759,16.6432 L8.2,15.4 C8.53137,14.9582 9.15817,14.8686 9.6,15.2 Z'

const trailPath =
  'M70,0 C92,90 28,150 40,250 C50,340 104,380 92,480 C82,565 24,600 36,705 C46,795 100,830 86,930 C80,975 64,985 60,1000'
</script>

<template>
  <Head :title="lang === 'fr' ? 'Accueil' : 'Home'" />

  <div ref="rootEl" :class="{ 'lang-fade': langFade }" style="position: relative; width: 100%; overflow-x: hidden">
    <!-- Intro AlpaStudio (une fois par session) -->
    <div v-if="introOn" class="intro-veil">
      <div class="intro-inner">
        <svg viewBox="0 0 24 24" class="intro-run"><path fill="currentColor" :d="RUNNER_PATH"></path></svg>
        <span class="intro-name">AlpaStudio</span>
      </div>
    </div>

    <!-- Curseur personnalise -->
    <div ref="cursorDotEl" class="cursor-dot"></div>
    <div ref="cursorRingEl" class="cursor-ring"></div>

    <!-- Kilometrage du parcours -->
    <div v-if="showRunner" ref="kmEl" class="km-hud">0,0 / 42,2 km</div>

    <!-- Ambient particles -->
    <div v-if="showParticles" style="position: fixed; inset: 0; pointer-events: none; z-index: 40">
      <span v-for="(p, i) in particles" :key="i" :style="p.style"></span>
    </div>

    <!-- Film grain (desactive sur mobile : mix-blend-mode plein ecran
         force une recomposition couteuse a chaque frame de scroll) -->
    <div
      class="film-grain"
      style="position: fixed; inset: 0; pointer-events: none; z-index: 36; opacity: 0.06; mix-blend-mode: overlay; background-repeat: repeat; background-image: url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27180%27%20height=%27180%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.8%27%20numOctaves=%272%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27180%27%20height=%27180%27%20filter=%27url%28%23n%29%27/%3E%3C/svg%3E)"
    ></div>

    <!-- Runner trail layer -->
    <div
      v-if="showRunner"
      ref="trailEl"
      class="runner-trail"
      style="position: fixed; right: clamp(8px, 3vw, 60px); top: 0; width: clamp(64px, 9vw, 118px); height: 100vh; pointer-events: none; z-index: 120"
    >
      <svg viewBox="0 0 120 1000" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%">
        <path class="trail-draw" pathLength="1" :d="trailPath" fill="none" stroke="url(#trailGrad)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"></path>
        <path ref="pathEl" class="trail-dotted" :d="trailPath" fill="none" stroke="url(#trailGrad)" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"></path>
        <defs>
          <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#52b788"></stop>
            <stop offset="0.5" stop-color="#e08a3c"></stop>
            <stop offset="1" stop-color="#ef4444"></stop>
          </linearGradient>
        </defs>
      </svg>
      <div ref="runnerEl" class="runWrap intro" style="position: absolute; left: 0; top: 0; width: 52px; height: 52px; will-change: transform">
        <span ref="runGlowEl" style="position: absolute; left: 50%; bottom: 2px; width: 34px; height: 10px; transform: translateX(-50%); border-radius: 50%; background: rgba(82, 183, 136, 0.5); filter: blur(5px)"></span>
        <div class="bob" style="width: 100%; height: 100%">
          <svg ref="runImgEl" viewBox="0 0 24 24" style="width: 100%; height: 100%; display: block; color: #52b788; transform-origin: 50% 62%; transition: transform 0.16s ease-out, color 0.25s linear; filter: drop-shadow(0 4px 5px rgba(0, 0, 0, 0.5))">
            <path fill="currentColor" :d="RUNNER_PATH"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="site-nav" style="position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 1rem clamp(1.2rem, 4vw, 3rem); display: flex; align-items: center; justify-content: space-between; background: rgba(8, 8, 10, 0.72); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(82, 183, 136, 0.16)">
      <span style="font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 700; letter-spacing: 0.02em; display: flex; align-items: center; gap: 0.55rem">
        <span style="width: 11px; height: 11px; border-radius: 50%; background: linear-gradient(135deg, #52b788, #ef4444); box-shadow: 0 0 12px rgba(82, 183, 136, 0.6)"></span>
        <span style="background: linear-gradient(100deg, #74c69d, #eef2ef 60%, #f87171); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">AlpaStudio</span>
      </span>
      <div style="display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2rem)">
        <ul style="list-style: none; display: flex; gap: clamp(0.7rem, 1.5vw, 1.5rem); align-items: center">
          <li v-for="(n, i) in navLinks" :key="i">
            <a :href="n.href" style="color: #cbd6cf; text-decoration: none; font-size: 0.74rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; white-space: nowrap; transition: color 0.2s">{{ n.label }}</a>
          </li>
        </ul>
        <div style="display: flex; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 999px; overflow: hidden; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem">
          <button :style="frBtnStyle" @click="setLang('fr')">FR</button>
          <button :style="enBtnStyle" @click="setLang('en')">EN</button>
        </div>
      </div>
    </nav>

    <!-- Hero / Accueil -->
    <section id="accueil" data-screen-label="Accueil" style="position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; background: radial-gradient(120% 80% at 50% 0%, #0e3b2e 0%, #081f1a 45%, #07171f 100%)">
      <div data-parallax data-speed="0.28" style="position: absolute; inset: 0; opacity: 0.55">
        <div style="position: absolute; top: 14%; left: 18%; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(82, 183, 136, 0.22), transparent 70%); filter: blur(8px)"></div>
        <div style="position: absolute; top: 8%; right: 14%; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(72, 202, 228, 0.18), transparent 70%); filter: blur(6px)"></div>
      </div>
      <div data-parallax data-speed="-0.12" style="position: absolute; bottom: -2px; left: 0; right: 0; height: 60vh; opacity: 0.95">
        <svg viewBox="0 0 1440 560" preserveAspectRatio="none" style="position: absolute; left: 0; bottom: 0; width: 100%; height: 100%">
          <defs>
            <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#123a4c"></stop>
              <stop offset="1" stop-color="#081720"></stop>
            </linearGradient>
            <linearGradient id="wfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="rgba(212,237,244,0.35)"></stop>
              <stop offset="1" stop-color="rgba(72,202,228,0.12)"></stop>
            </linearGradient>
          </defs>
          <!-- Chaine lointaine -->
          <path d="M0,560 L0,240 L160,160 L360,280 L560,140 L760,270 L980,150 L1200,270 L1440,190 L1440,560 Z" fill="#1a5c42" opacity="0.34"></path>
          <!-- Chaine intermediaire -->
          <path d="M0,560 L0,330 L190,235 L430,370 L640,220 L860,360 L1080,230 L1280,350 L1440,280 L1440,560 Z" fill="#0c3123" opacity="0.85"></path>
          <!-- Chaine proche avec falaise -->
          <path d="M0,560 L0,400 L170,320 L420,460 L600,330 L820,470 L920,400 L1008,400 L1075,340 L1260,460 L1440,390 L1440,560 Z" fill="#123528"></path>
          <!-- Cascade depuis la falaise -->
          <rect x="956" y="400" width="16" height="108" rx="5" fill="url(#wfGrad)" opacity="0.85"></rect>
          <line class="wfall" x1="961" y1="402" x2="961" y2="506" stroke="rgba(238,242,239,0.5)" stroke-width="2.5" stroke-linecap="round"></line>
          <line class="wfall" x1="968" y1="406" x2="968" y2="506" stroke="rgba(163,216,244,0.4)" stroke-width="2" stroke-linecap="round" style="animation-delay: -0.5s"></line>
          <!-- Lac -->
          <rect x="0" y="500" width="1440" height="60" fill="url(#lakeGrad)"></rect>
          <ellipse class="wfoam" cx="964" cy="504" rx="30" ry="6" fill="rgba(212,237,244,0.22)"></ellipse>
          <line class="lake-glint" x1="200" y1="522" x2="420" y2="522" stroke="rgba(72,202,228,0.16)" stroke-width="2" stroke-linecap="round"></line>
          <line class="lake-glint" x1="620" y1="532" x2="800" y2="532" stroke="rgba(72,202,228,0.13)" stroke-width="2" stroke-linecap="round" style="animation-delay: -2s"></line>
          <line class="lake-glint" x1="1000" y1="524" x2="1230" y2="524" stroke="rgba(72,202,228,0.15)" stroke-width="2" stroke-linecap="round" style="animation-delay: -4s"></line>
        </svg>
      </div>
      <div style="position: absolute; top: 20%; left: 0; right: 0; height: 120px; background: linear-gradient(90deg, transparent, rgba(212, 230, 241, 0.07), transparent); filter: blur(14px); animation: drift 9s ease-in-out infinite alternate"></div>
      <!-- Aurore boreale -->
      <div class="aurora"></div>
      <!-- Etoiles filantes -->
      <span class="shoot" style="top: 11%; right: 7%"></span>
      <span class="shoot" style="top: 24%; right: 30%; animation-duration: 15s; animation-delay: -6s"></span>
      <!-- Brouillard de vallee -->
      <div class="fog fog-1"></div>
      <div class="fog fog-2"></div>
      <div style="position: relative; z-index: 2; padding: 0 1.5rem; max-width: 780px">
        <p data-rv="up" data-rv-d="80" style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #74c69d; letter-spacing: 0.32em; text-transform: uppercase; margin-bottom: 1.4rem">{{ t.heroKicker }}</p>
        <h1 aria-label="Alexis Paillot" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; margin-bottom: 1.6rem; background: linear-gradient(135deg, #eef2ef 30%, #74c69d 70%, #48cae4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">
          <span style="display: inline-block; white-space: nowrap"><span class="hero-letter" style="animation-delay: 0.18s">A</span><span class="hero-letter" style="animation-delay: 0.225s">l</span><span class="hero-letter" style="animation-delay: 0.27s">e</span><span class="hero-letter" style="animation-delay: 0.315s">x</span><span class="hero-letter" style="animation-delay: 0.36s">i</span><span class="hero-letter" style="animation-delay: 0.405s">s</span></span> <span style="display: inline-block; white-space: nowrap"><span class="hero-letter" style="animation-delay: 0.495s">P</span><span class="hero-letter" style="animation-delay: 0.54s">a</span><span class="hero-letter" style="animation-delay: 0.585s">i</span><span class="hero-letter" style="animation-delay: 0.63s">l</span><span class="hero-letter" style="animation-delay: 0.675s">l</span><span class="hero-letter" style="animation-delay: 0.72s">o</span><span class="hero-letter" style="animation-delay: 0.765s">t</span></span>
        </h1>
        <p data-rv="up" data-rv-d="300" style="font-size: clamp(1.05rem, 1.8vw, 1.3rem); color: #c4d6cd; max-width: 540px; margin: 0 auto 2.6rem; line-height: 1.7">{{ t.heroTagline }}</p>
        <a data-rv="up" data-rv-d="420" data-magnetic href="#competences" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.95rem 2.4rem; background: linear-gradient(135deg, #2d6a4f, #1e6091); color: #eef2ef; text-decoration: none; border-radius: 999px; font-weight: 600; letter-spacing: 0.03em; box-shadow: 0 8px 30px rgba(45, 106, 79, 0.4); transition: transform 0.25s, box-shadow 0.25s">{{ t.heroCta }} <span style="font-size: 1.1em">↓</span></a>
      </div>
      <div style="position: absolute; bottom: 2.2rem; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.64rem; letter-spacing: 0.25em; color: #6f8a7e; text-transform: uppercase">{{ t.scroll }}</span>
        <div style="width: 22px; height: 34px; border: 1.5px solid rgba(116, 198, 157, 0.5); border-radius: 12px; display: flex; justify-content: center; padding-top: 6px">
          <span style="width: 3px; height: 7px; border-radius: 2px; background: #74c69d; animation: scrollDot 1.8s ease-in-out infinite"></span>
        </div>
      </div>
    </section>

    <!-- Compétences -->
    <section id="competences" data-screen-label="Compétences" style="position: relative; background: linear-gradient(180deg, #07171f 0%, #0a1622 55%, #0e131e 100%); padding: 6rem clamp(1.2rem, 5vw, 3rem)">
      <div style="max-width: 1080px; margin: 0 auto">
        <p data-rv="up" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #48cae4; margin-bottom: 0.6rem">{{ t.skillsLabel }}</p>
        <h2 data-rv="clip" data-rv-d="80" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.7rem">{{ t.skillsTitle }}</h2>
        <div data-rv="rule" data-rv-d="180" style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 1.3rem; background: linear-gradient(90deg, #48cae4, transparent)"></div>
        <p data-rv="up" data-rv-d="120" style="color: #9fb3aa; max-width: 560px; line-height: 1.7; margin-bottom: 3.2rem">{{ t.skillsIntro }}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 2rem">
          <!-- Green column -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.4rem">
              <span style="width: 9px; height: 9px; border-radius: 50%; background: #52b788; box-shadow: 0 0 10px rgba(82, 183, 136, 0.7)"></span>
              <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #74c69d">{{ t.skillsGreenTitle }}</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem">
              <div v-for="(s, i) in skillsGreen" :key="i" class="skill-card" data-rv="left" data-rv-stagger style="background: linear-gradient(160deg, rgba(82, 183, 136, 0.07), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(82, 183, 136, 0.18); border-radius: 14px; padding: 1.3rem 1.4rem; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.7rem">
                  <span style="font-size: 1.5rem">{{ s.icon }}</span>
                  <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 600; color: #eef2ef">{{ s.name }}</h4>
                  <span v-if="s.training" style="padding: 0.22rem 0.65rem; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: #ffd166; background: rgba(255, 209, 102, 0.1); border: 1px solid rgba(255, 209, 102, 0.4); white-space: nowrap; animation: pulseGlow 2.4s ease-in-out infinite">{{ t.trainingBadge }}</span>
                  <span :data-count-to="s.level" data-count-suffix="%" style="margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #74c69d">{{ s.lvl }}</span>
                </div>
                <p style="font-size: 0.88rem; color: #9fb3aa; line-height: 1.6; margin-bottom: 0.9rem">{{ s.desc }}</p>
                <div class="skill-bar">
                  <div :data-level="s.level" style="height: 100%; width: 0; background: linear-gradient(90deg, #2d6a4f, #52b788); border-radius: 3px; transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1)"></div>
                  <span v-if="s.goal" class="skill-goal" :style="'left:' + s.goal + '%'" :title="(F ? 'Objectif : ' : 'Goal: ') + s.goal + '%'"></span>
                </div>
              </div>
            </div>
          </div>
          <!-- Red column -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.4rem">
              <span style="width: 9px; height: 9px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.7)"></span>
              <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #f87171">{{ t.skillsRedTitle }}</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem">
              <div v-for="(s, i) in skillsRed" :key="i" class="skill-card" data-rv="right" data-rv-stagger style="background: linear-gradient(160deg, rgba(239, 68, 68, 0.07), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(239, 68, 68, 0.18); border-radius: 14px; padding: 1.3rem 1.4rem; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.7rem">
                  <span style="font-size: 1.5rem">{{ s.icon }}</span>
                  <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 600; color: #eef2ef">{{ s.name }}</h4>
                  <span v-if="s.training" style="padding: 0.22rem 0.65rem; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: #ffd166; background: rgba(255, 209, 102, 0.1); border: 1px solid rgba(255, 209, 102, 0.4); white-space: nowrap; animation: pulseGlow 2.4s ease-in-out infinite">{{ t.trainingBadge }}</span>
                  <span :data-count-to="s.level" data-count-suffix="%" style="margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #f87171">{{ s.lvl }}</span>
                </div>
                <p style="font-size: 0.88rem; color: #b6a3a3; line-height: 1.6; margin-bottom: 0.9rem">{{ s.desc }}</p>
                <div class="skill-bar">
                  <div :data-level="s.level" style="height: 100%; width: 0; background: linear-gradient(90deg, #7f1d1d, #ef4444); border-radius: 3px; transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Soft skills -->
        <div style="margin-top: 2.6rem">
          <div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.4rem">
            <span style="width: 9px; height: 9px; border-radius: 50%; background: #48cae4; box-shadow: 0 0 10px rgba(72, 202, 228, 0.7)"></span>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9fdbe8">{{ t.softSkillsTitle }}</h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 1rem">
            <div v-for="(s, i) in softSkills" :key="i" class="skill-card" data-rv="scale" data-rv-stagger style="display: flex; align-items: center; gap: 1rem; background: linear-gradient(160deg, rgba(72, 202, 228, 0.07), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(72, 202, 228, 0.2); border-radius: 14px; padding: 1.2rem 1.4rem; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s">
              <span style="font-size: 1.7rem">{{ s.icon }}</span>
              <div>
                <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.02rem; font-weight: 600; color: #eef2ef; margin-bottom: 0.25rem">{{ s.name }}</h4>
                <p style="font-size: 0.85rem; color: #9fb3aa; line-height: 1.5">{{ s.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Expériences -->
    <section id="experiences" data-screen-label="Expériences" style="position: relative; background: linear-gradient(180deg, #0e131e 0%, #15121d 55%, #1a0f15 100%); padding: 6rem clamp(1.2rem, 5vw, 3rem)">
      <div style="max-width: 880px; margin: 0 auto">
        <p data-rv="up" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #e08a3c; margin-bottom: 0.6rem">{{ t.xpLabel }}</p>
        <h2 data-rv="clip" data-rv-d="80" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.7rem">{{ t.xpTitle }}</h2>
        <div data-rv="rule" data-rv-d="180" style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 3rem; background: linear-gradient(90deg, #e08a3c, transparent)"></div>
        <!-- Parcours scolaire -->
        <div data-rv="up" style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.6rem">
          <span style="width: 9px; height: 9px; border-radius: 50%; background: #48cae4; box-shadow: 0 0 10px rgba(72, 202, 228, 0.7)"></span>
          <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9fdbe8">{{ t.xpEduTitle }}</h3>
        </div>
        <div style="position: relative; padding-left: 2.4rem; margin-bottom: 1.5rem">
          <div style="position: absolute; left: 7px; top: 6px; bottom: 6px; width: 2px; background: rgba(255, 255, 255, 0.08)">
            <div ref="eduFillEl" class="tl-fill" style="background: linear-gradient(180deg, #48cae4, #52b788)"></div>
          </div>
          <div v-for="(xp, i) in education" :key="'edu' + i" data-rv="left" data-rv-stagger style="position: relative; padding-bottom: 2.4rem">
            <span :style="'position:absolute; left:-2.4rem; top:4px; width:16px; height:16px; border-radius:50%; border:3px solid #12101a; ' + xp.dotStyle"></span>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #7bd0e8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.4rem">{{ xp.date }}</p>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; color: #eef2ef; margin-bottom: 0.2rem">{{ xp.role }}</h3>
            <p style="font-size: 0.92rem; color: #48cae4; margin-bottom: 0.7rem">{{ xp.company }}</p>
            <p v-if="xp.desc" style="font-size: 0.92rem; line-height: 1.7; color: #a3b3ab">{{ xp.desc }}</p>
          </div>
        </div>

        <!-- Passage scolaire -> pro : le coureur traverse -->
        <div data-rv="rule" style="position: relative; height: 3px; border-radius: 2px; margin: 0 0 3rem; background: linear-gradient(90deg, #48cae4, #e08a3c 55%, #ef4444); opacity: 0.55"></div>

        <!-- Expériences professionnelles -->
        <div data-rv="up" style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.6rem">
          <span style="width: 9px; height: 9px; border-radius: 50%; background: #e08a3c; box-shadow: 0 0 10px rgba(224, 138, 60, 0.7)"></span>
          <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #e0a05c">{{ t.xpProTitle }}</h3>
        </div>
        <div style="position: relative; padding-left: 2.4rem">
          <div style="position: absolute; left: 7px; top: 6px; bottom: 6px; width: 2px; background: rgba(255, 255, 255, 0.08)">
            <div ref="proFillEl" class="tl-fill" style="background: linear-gradient(180deg, #e08a3c, #ef4444)"></div>
          </div>
          <div v-for="(xp, i) in workXp" :key="'pro' + i" data-rv="right" data-rv-stagger style="position: relative; padding-bottom: 2.4rem">
            <span :style="'position:absolute; left:-2.4rem; top:4px; width:16px; height:16px; border-radius:50%; border:3px solid #12101a; ' + xp.dotStyle"></span>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #e0a05c; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.4rem">{{ xp.date }}</p>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; color: #eef2ef; margin-bottom: 0.2rem">{{ xp.role }}</h3>
            <p style="font-size: 0.92rem; color: #48cae4; margin-bottom: 0.7rem">{{ xp.company }}</p>
            <p v-if="xp.desc" style="font-size: 0.92rem; line-height: 1.7; color: #a3b3ab">{{ xp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Projets (scroll horizontal épinglé) -->
    <section id="projets" data-screen-label="Projets" ref="projSectionEl" class="proj-section" style="position: relative; background: linear-gradient(180deg, #1a0f15 0%, #0c1a23 34%, #0a1c18 70%, #1a0f15 100%)">
      <div ref="projStickyEl" class="proj-sticky" style="position: absolute; top: 0; left: 0; right: 0; height: 100vh; overflow: hidden">
        <!-- Ciel : cycle jour / nuit -->
        <div ref="projDayEl" style="position: absolute; inset: 0; pointer-events: none; opacity: 0; background: linear-gradient(180deg, rgba(140, 200, 255, 0.2), rgba(255, 241, 181, 0.12) 55%, transparent 80%)"></div>
        <div ref="projSunsetEl" style="position: absolute; inset: 0; pointer-events: none; opacity: 0; background: linear-gradient(180deg, rgba(30, 20, 60, 0.15) 20%, rgba(255, 122, 61, 0.2) 62%, rgba(255, 170, 80, 0.3) 100%)"></div>
        <div ref="projSunEl" style="position: absolute; left: -45px; top: -45px; width: 90px; height: 90px; border-radius: 50%; pointer-events: none; opacity: 0; will-change: transform; background: radial-gradient(circle, rgba(255, 228, 140, 0.95) 30%, rgba(255, 180, 84, 0.5) 55%, transparent 72%)"></div>
        <div ref="projMoonEl" style="position: absolute; left: -28px; top: -28px; width: 56px; height: 56px; border-radius: 50%; pointer-events: none; opacity: 0; will-change: transform; background: radial-gradient(circle at 66% 58%, rgba(150, 170, 185, 0.5) 0 8%, transparent 9%), radial-gradient(circle at 40% 68%, rgba(150, 170, 185, 0.4) 0 6%, transparent 7%), radial-gradient(circle at 36% 32%, #f2f7fa, #d5e2ea 55%, #b9cdd9); filter: drop-shadow(0 0 16px rgba(223, 233, 240, 0.55))"></div>
        <div ref="projStarsEl" style="position: absolute; left: 0; top: 0; right: 0; height: 55%; pointer-events: none; opacity: 0">
          <span v-for="(s, i) in projStars" :key="i" :style="s.style"></span>
        </div>
        <div ref="projNightEl" style="position: absolute; inset: 0; pointer-events: none; opacity: 0; z-index: 3; background: linear-gradient(180deg, rgba(4, 8, 26, 0.7), rgba(8, 14, 36, 0.45) 55%, rgba(12, 18, 44, 0.2))"></div>

        <!-- Back mountain layer -->
        <div ref="projBackEl" class="proj-back" style="position: absolute; left: 0; bottom: 0; width: 130%; height: 56%; pointer-events: none; opacity: 0.45; z-index: 0; will-change: transform">
          <svg viewBox="0 0 1400 400" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%">
            <path d="M0,400 L0,250 L160,140 L320,250 L470,120 L640,250 L800,150 L980,250 L1150,130 L1320,240 L1400,180 L1400,400 Z" fill="#0a1722"></path>
          </svg>
        </div>

        <!-- Front mountains + ridge -->
        <div class="proj-mountains" style="position: absolute; left: 0; bottom: 0; width: 100%; height: 42%; pointer-events: none; z-index: 1">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%">
            <path d="M0,300 L0,210 L120,120 L210,180 L330,60 L450,170 L560,80 L690,175 L820,70 L1000,150 L1000,300 Z" fill="#07130e"></path>
            <path ref="projMountPathEl" d="M0,210 L120,120 L210,180 L330,60 L450,170 L560,80 L690,175 L820,70 L1000,150" fill="none" stroke="url(#trailGrad)" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.5"></path>
          </svg>
        </div>

        <!-- Brouillard de vallee -->
        <div class="fog fog-1" style="z-index: 1"></div>

        <!-- Mountain runner -->
        <div ref="projRunnerEl" class="runWrap proj-runner" style="position: absolute; left: 0; top: 0; width: 52px; height: 52px; z-index: 2; opacity: 0; will-change: transform">
          <span ref="projGlowEl" style="position: absolute; left: 50%; bottom: 2px; width: 36px; height: 10px; transform: translateX(-50%); border-radius: 50%; background: rgba(82, 183, 136, 0.5); filter: blur(5px)"></span>
          <div class="bob" style="width: 100%; height: 100%">
            <svg ref="projRunImgEl" viewBox="0 0 24 24" style="width: 100%; height: 100%; display: block; color: #52b788; transform-origin: 50% 62%; transition: color 0.25s linear; filter: drop-shadow(0 4px 5px rgba(0, 0, 0, 0.5))">
              <path fill="currentColor" :d="RUNNER_PATH"></path>
            </svg>
          </div>
        </div>

        <!-- Top bar -->
        <div class="proj-topbar" style="position: absolute; top: clamp(72px, 10vh, 104px); left: 0; right: 0; z-index: 6; display: flex; flex-direction: column; align-items: center; gap: 0.7rem; pointer-events: none">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: 0.3em; text-transform: uppercase; color: #74c69d">{{ t.projLabel }}</span>
          <div style="display: flex; align-items: center; gap: 0.9rem">
            <span ref="projCounterEl" style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1rem; color: #eef2ef">01 / 06</span>
            <div style="width: clamp(120px, 22vw, 260px); height: 3px; border-radius: 2px; background: rgba(255, 255, 255, 0.12); overflow: hidden">
              <div ref="projBarEl" style="height: 100%; width: 0%; background: linear-gradient(90deg, #52b788, #48cae4); border-radius: 2px"></div>
            </div>
          </div>
        </div>

        <!-- Horizontal track -->
        <div ref="projTrackEl" class="proj-track" style="position: absolute; top: 0; left: 0; height: 100%; z-index: 4; display: flex; align-items: center; gap: clamp(1.4rem, 3vw, 2.8rem); padding: 0 clamp(1.4rem, 9vw, 13vw); will-change: transform">
          <div class="proj-panel-intro" style="flex: 0 0 auto; width: clamp(280px, 38vw, 500px); align-self: center">
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2rem, 4.2vw, 3.2rem); font-weight: 700; letter-spacing: -0.01em; line-height: 1.05; margin-bottom: 0.8rem">{{ t.projTitle }}</h2>
            <div style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 1.3rem; background: linear-gradient(90deg, #52b788, #48cae4)"></div>
            <p style="color: #9fb3aa; line-height: 1.7; margin-bottom: 1.8rem; font-size: clamp(0.95rem, 1.4vw, 1.05rem)">{{ t.projIntro }}</p>
            <div style="display: inline-flex; align-items: center; gap: 0.7rem; padding: 0.6rem 1.2rem; border-radius: 999px; border: 1px solid rgba(116, 198, 157, 0.35); color: #9fe0bf; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.05em">
              <span style="font-size: 1.1rem">🖱</span> {{ t.projHint }} <span style="font-size: 1.15rem">→</span>
            </div>
          </div>

          <article v-for="(pj, i) in projects" :key="i" data-proj-card style="flex: 0 0 auto; width: clamp(310px, 42vw, 540px); align-self: center; background: linear-gradient(160deg, rgba(82, 183, 136, 0.08), rgba(72, 202, 228, 0.04) 55%, rgba(255, 255, 255, 0.02)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: clamp(1.5rem, 3vw, 2.6rem); box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45); transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s">
            <div data-proj-inner style="transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)">
              <span class="proj-watermark" aria-hidden="true">{{ pj.icon }}</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.3rem">
                <span style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.4rem, 5vw, 3.6rem); font-weight: 700; line-height: 1; color: #4c6f61">{{ pj.num }}</span>
                <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.9rem; border-radius: 999px; background: rgba(72, 202, 228, 0.1); border: 1px solid rgba(72, 202, 228, 0.28); font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #9fdbe8; white-space: nowrap"><span style="font-size: 1rem">{{ pj.icon }}</span>{{ pj.domain }}</span>
              </div>
              <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.3rem, 2.3vw, 1.85rem); font-weight: 600; color: #eef2ef; line-height: 1.16; margin-bottom: 0.5rem">{{ pj.title }}</h3>
              <p style="font-size: 0.82rem; color: #74c69d; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; margin-bottom: 1.2rem">{{ pj.client }}</p>
              <p style="font-size: clamp(0.92rem, 1.35vw, 1.02rem); color: #b9c7c0; line-height: 1.7; margin-bottom: 1.6rem">{{ pj.desc }}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
                <span v-for="(tg, j) in pj.tags" :key="j" style="padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.74rem; background: rgba(82, 183, 136, 0.1); border: 1px solid rgba(82, 183, 136, 0.25); color: #9fe0bf">{{ tg }}</span>
              </div>
            </div>
          </article>

          <div class="proj-panel-outro" style="flex: 0 0 auto; width: clamp(230px, 26vw, 360px); align-self: center; text-align: center">
            <div style="font-size: 2.4rem; margin-bottom: 1rem">🏔</div>
            <p style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: #eef2ef; margin-bottom: 0.5rem">{{ t.projOutroTitle }}</p>
            <p style="color: #9fb3aa; font-size: 0.92rem; line-height: 1.6">{{ t.projOutro }}</p>
            <div style="margin-top: 1.2rem; font-size: 1.4rem; color: #74c69d">↓</div>
          </div>
        </div>
      </div>
    </section>

    <!-- À propos -->
    <section id="apropos" data-screen-label="À propos" style="position: relative; background: linear-gradient(180deg, #1a0f15 0%, #1d0d12 55%, #170a0d 100%); padding: 6rem clamp(1.2rem, 5vw, 3rem)">
      <div style="max-width: 1080px; margin: 0 auto">
        <p data-rv="up" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #f87171; margin-bottom: 0.6rem">{{ t.aboutLabel }}</p>
        <h2 data-rv="clip" data-rv-d="80" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.7rem">{{ t.aboutTitle }}</h2>
        <div data-rv="rule" data-rv-d="180" style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 2.8rem; background: linear-gradient(90deg, #f87171, transparent)"></div>
        <div class="grid-2" style="display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(2rem, 5vw, 4rem); align-items: start">
          <div data-rv="left">
            <p style="color: #cbd6cf; line-height: 1.9; margin-bottom: 1.2rem; font-size: 1rem">{{ t.aboutP1 }}</p>
            <p style="color: #a9b6af; line-height: 1.9; margin-bottom: 1.6rem; font-size: 0.96rem">{{ t.aboutP2 }}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem">
              <span v-for="(h, i) in hobbies" :key="i" style="padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.8rem; background: rgba(82, 183, 136, 0.1); border: 1px solid rgba(82, 183, 136, 0.28); color: #9fe0bf">{{ h }}</span>
            </div>
          </div>
          <div data-rv="right" style="display: flex; flex-direction: column; gap: 1rem">
            <div v-for="(st, i) in stats" :key="i" style="display: flex; align-items: center; gap: 1.2rem; padding: 1.4rem 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(239, 68, 68, 0.18); border-radius: 14px">
              <span :data-count-to="st.count" :data-count-suffix="st.suffix" :data-count-display="(st as any).display" data-odometer style="font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 700; min-width: 4rem; background: linear-gradient(135deg, #f87171, #e08a3c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">{{ st.value }}</span>
              <span style="font-size: 0.9rem; color: #b6a3a3; line-height: 1.4">{{ st.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Créations -->
    <section id="creations" data-screen-label="Créations" style="position: relative; background: linear-gradient(180deg, #170a0d 0%, #10141c 55%, #0d0709 100%); padding: 6rem clamp(1.2rem, 5vw, 3rem)">
      <div style="max-width: 1080px; margin: 0 auto">
        <p data-rv="up" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #48cae4; margin-bottom: 0.6rem">{{ t.creationsLabel }}</p>
        <h2 data-rv="clip" data-rv-d="80" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.7rem">{{ t.creationsTitle }}</h2>
        <div data-rv="rule" data-rv-d="180" style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 1.3rem; background: linear-gradient(90deg, #48cae4, transparent)"></div>
        <p data-rv="up" data-rv-d="120" style="color: #9fb3aa; max-width: 620px; line-height: 1.7; margin-bottom: 2.8rem">{{ t.creationsIntro }}</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.6rem">
          <a
            v-for="(cr, i) in creations"
            :key="i"
            :href="cr.url"
            target="_blank"
            rel="noopener"
            class="skill-card"
            data-rv="up"
            data-rv-stagger
            :style="'display:block; text-decoration:none; position:relative; overflow:hidden; background:linear-gradient(160deg, ' + cr.accent + '14, rgba(255,255,255,0.02)); border:1px solid ' + cr.accent + '33; border-radius:18px; padding:clamp(1.6rem, 3vw, 2.2rem); transition:border-color .3s, transform .3s, box-shadow .3s;'"
          >
            <span class="proj-watermark" aria-hidden="true">{{ cr.icon }}</span>
            <div style="display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1.1rem">
              <span :style="'width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; background:' + cr.accent + '1f; border:1px solid ' + cr.accent + '40'">{{ cr.icon }}</span>
              <div>
                <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 600; color: #eef2ef; line-height: 1.2">{{ cr.name }}</h3>
                <p :style="'font-size:0.78rem; font-family:\'JetBrains Mono\', monospace; letter-spacing:0.04em; margin-top:0.2rem; color:' + cr.accent">{{ cr.domain }}</p>
              </div>
            </div>
            <p style="font-size: 0.94rem; color: #b9c7c0; line-height: 1.7; margin-bottom: 1.4rem">{{ cr.desc }}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.4rem">
              <span v-for="(tg, j) in cr.tags" :key="j" :style="'padding:0.32rem 0.8rem; border-radius:8px; font-size:0.72rem; background:' + cr.accent + '14; border:1px solid ' + cr.accent + '30; color:#eef2ef'">{{ tg }}</span>
            </div>
            <span :style="'display:inline-flex; align-items:center; gap:0.5rem; font-family:\'Space Grotesk\', sans-serif; font-weight:600; font-size:0.9rem; color:' + cr.accent">{{ t.creationsCta }} <span>↗</span></span>
          </a>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" data-screen-label="Contact" style="position: relative; background: linear-gradient(180deg, #170a0d 0%, #0d0709 60%, #08080a 100%); padding: 6rem clamp(1.2rem, 5vw, 3rem)">
      <div style="max-width: 1000px; margin: 0 auto">
        <p data-rv="up" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #f87171; margin-bottom: 0.6rem">{{ t.contactLabel }}</p>
        <h2 data-rv="clip" data-rv-d="80" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.7rem">{{ t.contactTitle }}</h2>
        <div data-rv="rule" data-rv-d="180" style="height: 3px; width: 66px; border-radius: 2px; margin-bottom: 2.8rem; background: linear-gradient(90deg, #f87171, transparent)"></div>
        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1.2fr; gap: clamp(2rem, 5vw, 4rem); align-items: start">
          <div data-rv="left">
            <p style="color: #a9b6af; line-height: 1.8; margin-bottom: 2rem; font-size: 0.98rem">{{ t.contactIntro }}</p>
            <div style="display: flex; flex-direction: column; gap: 0.9rem">
              <a href="mailto:paillot.alexis.ap@gmail.com" style="display: flex; align-items: center; gap: 0.9rem; color: #cbd6cf; text-decoration: none; font-size: 0.92rem; transition: color 0.2s">
                <span style="width: 40px; height: 40px; border-radius: 10px; background: rgba(82, 183, 136, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.05rem">✉</span>
                paillot.alexis.ap@gmail.com
              </a>
              <a href="https://github.com/DevAlex39" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 0.9rem; color: #cbd6cf; text-decoration: none; font-size: 0.92rem; transition: color 0.2s">
                <span style="width: 40px; height: 40px; border-radius: 10px; background: rgba(239, 68, 68, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.05rem">⌥</span>
                GitHub — DevAlex39
              </a>
              <a href="https://alpastudio.fr" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 0.9rem; color: #cbd6cf; text-decoration: none; font-size: 0.92rem; transition: color 0.2s">
                <span style="width: 40px; height: 40px; border-radius: 10px; background: rgba(72, 202, 228, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.05rem">🏔</span>
                alpastudio.fr
              </a>
            </div>
          </div>
          <form data-rv="right" @submit.prevent="submit" style="display: flex; flex-direction: column; gap: 1.1rem">
            <div style="display: flex; flex-direction: column; gap: 0.45rem">
              <label style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #8aa297">{{ t.fName }}</label>
              <input v-model="form.name" @input="delete errors.name" type="text" :placeholder="t.phName" :style="nameInputStyle" />
              <span v-if="errors.name" style="color: #f87171; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em">{{ errors.name }}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem">
              <label style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #8aa297">Email</label>
              <input v-model="form.email" @input="delete errors.email" type="email" :placeholder="t.phEmail" :style="emailInputStyle" />
              <span v-if="errors.email" style="color: #f87171; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em">{{ errors.email }}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem">
              <label style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #8aa297">Message</label>
              <textarea v-model="form.message" @input="delete errors.message" :placeholder="t.phMsg" :style="msgInputStyle"></textarea>
              <span v-if="errors.message" style="color: #f87171; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em">{{ errors.message }}</span>
            </div>
            <button type="submit" data-magnetic :style="submitStyle">{{ submitLabel }}</button>
          </form>
        </div>

        <!-- Finish arch -->
        <div data-rv="up" class="finish-block" ref="finishEl" style="margin-top: 5rem; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative">
          <div style="position: relative; width: min(580px, 94%)">
            <svg viewBox="0 0 600 260" class="arch-svg" style="width: 100%; height: auto; display: block; filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.45))">
              <defs>
                <pattern id="fchecker" width="22" height="22" patternUnits="userSpaceOnUse">
                  <rect width="22" height="22" fill="#f4f4f4"></rect>
                  <rect width="11" height="11" fill="#13131a"></rect>
                  <rect x="11" y="11" width="11" height="11" fill="#13131a"></rect>
                </pattern>
                <linearGradient id="ftube" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#48cae4"></stop>
                  <stop offset="0.5" stop-color="#1e6091"></stop>
                  <stop offset="1" stop-color="#ef4444"></stop>
                </linearGradient>
              </defs>
              <ellipse cx="92" cy="250" rx="30" ry="11" fill="#0c0f14"></ellipse>
              <ellipse cx="508" cy="250" rx="30" ry="11" fill="#0c0f14"></ellipse>
              <path d="M92,250 L92,118 A208,86 0 0 1 508,118 L508,250" fill="none" stroke="url(#ftube)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M92,250 L92,118 A208,86 0 0 1 508,118 L508,250" fill="none" stroke="rgba(0,0,0,0.16)" stroke-width="34" stroke-linecap="round" stroke-dasharray="1.5 46"></path>
              <path d="M84,248 L84,118 A208,86 0 0 1 500,116" fill="none" stroke="rgba(255,255,255,0.26)" stroke-width="6" stroke-linecap="round"></path>
              <rect x="36" y="246" width="528" height="14" rx="2" fill="url(#fchecker)"></rect>
            </svg>
            <div class="finish-banner" style="position: absolute; top: 11%; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 0.55rem; padding: 0.5rem 1.35rem; background: linear-gradient(135deg, #15151f, #1c0e12); border: 2px solid #ef4444; border-radius: 11px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5)">
              <svg viewBox="0 0 24 16" style="width: 23px; height: 15px; flex-shrink: 0"><path d="M1,15 L8.5,3.5 L12,8.5 L16,1.5 L23,15 Z" fill="#52b788"></path><path d="M16,1.5 L19,6.4 L17.3,8.1 L14.4,3.9 Z" fill="#eef2ef"></path></svg>
              <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.02rem; letter-spacing: 0.2em; text-transform: uppercase; color: #fff">{{ t.finishLabel }}</span>
            </div>
            <div style="position: absolute; left: 50%; bottom: 5%; transform: translateX(-50%); width: 50px; height: 50px">
              <svg viewBox="0 0 24 24" class="archRunner" style="width: 100%; height: 100%; color: #ef4444; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.55))">
                <path fill="currentColor" :d="RUNNER_PATH"></path>
              </svg>
            </div>
          </div>
          <p style="color: #a9b6af; margin-top: 1.6rem; font-size: 0.96rem">{{ t.finishSub }}</p>
          <div v-if="rank != null" class="bib-card">
            <div class="bib-pins"><span></span><span></span></div>
            <span class="bib-top">AlpaStudio Trail</span>
            <span class="bib-num">{{ rank }}</span>
            <span class="bib-text">{{ rankText }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer style="text-align: center; padding: 2.4rem 1.5rem; color: #5f6f67; font-size: 0.82rem; border-top: 1px solid rgba(255, 255, 255, 0.05); background: #08080a; font-family: 'JetBrains Mono', monospace">
      {{ t.footer }}
    </footer>
  </div>
</template>
