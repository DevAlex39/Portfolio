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

/* --------------------------------------------------------------------------
 * Localised content
 * ------------------------------------------------------------------------ */
const DICT = {
  fr: {
    nav: ['Accueil', 'Compétences', 'Expériences', 'Projets', 'À propos', 'Contact'],
    heroKicker: 'Développeur Web & Coureur de Trail',
    heroTagline:
      'Je construis des applications web robustes, entre les lignes de code et les sentiers de montagne.',
    heroCta: 'Découvrir mon parcours',
    scroll: 'Défiler',
    skillsLabel: 'Ce que je sais faire',
    skillsTitle: 'Compétences',
    skillsIntro:
      "Deux mondes, une même rigueur : la créativité d\u2019un front soigné, la solidité d\u2019une architecture bien pensée.",
    skillsGreenTitle: 'Création & Interface',
    skillsRedTitle: 'Architecture & Systèmes',
    aboutLabel: 'Qui suis-je ?',
    aboutTitle: 'À propos',
    aboutP1:
      "Développeur web passionné, je vis à la croisée du code et de la montagne. Quand je ne construis pas d\u2019applications, je cours les sentiers pour vider la tête et revenir avec de meilleures idées.",
    aboutP2:
      "J\u2019aime créer des outils qui ont du sens, avec des technos modernes et un souci constant de la qualité. Mon terrain idéal : un projet ambitieux, une bonne équipe, et une cascade pas trop loin.",
    xpLabel: 'Mon parcours',
    xpTitle: 'Expériences',
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
    finishDone: 'Parcours terminé 🎉',
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
    nav: ['Home', 'Skills', 'Experience', 'Projects', 'About', 'Contact'],
    heroKicker: 'Web Developer & Trail Runner',
    heroTagline:
      'I build robust web applications, between lines of code and mountain trails.',
    heroCta: 'Explore my journey',
    scroll: 'Scroll',
    skillsLabel: 'What I do',
    skillsTitle: 'Skills',
    skillsIntro:
      'Two worlds, one discipline: the craft of a polished front end, the strength of a well-thought architecture.',
    skillsGreenTitle: 'Craft & Interface',
    skillsRedTitle: 'Architecture & Systems',
    aboutLabel: 'Who am I?',
    aboutTitle: 'About',
    aboutP1:
      "A passionate web developer, I live where code meets the mountains. When I\u2019m not building applications, I run the trails to clear my head and come back with better ideas.",
    aboutP2:
      "I love crafting tools that matter, with modern tech and a constant eye for quality. My ideal ground: an ambitious project, a great team, and a waterfall not too far away.",
    xpLabel: 'My path',
    xpTitle: 'Experience',
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
    finishDone: 'Journey complete 🎉',
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
  { icon: '⚡', name: 'Vue.js / Nuxt', lvl: '80%', level: 80, desc: F.value ? 'Frontend moderne avec Vue 3, Composition API et InertiaJS.' : 'Modern frontend with Vue 3, Composition API and InertiaJS.' },
  { icon: '🎨', name: 'CSS / UI Design', lvl: '74%', level: 74, desc: F.value ? 'Interfaces soignées, design responsive, attention au détail.' : 'Polished interfaces, responsive design, eye for detail.' },
  { icon: '✨', name: F.value ? 'UX & Animations' : 'UX & Motion', lvl: '70%', level: 70, desc: F.value ? 'Micro-interactions et animations qui donnent vie à l\u2019interface.' : 'Micro-interactions and motion that bring the UI to life.' },
])

const skillsRed = computed(() => [
  { icon: '🖥', name: 'AdonisJS / Node', lvl: '76%', level: 76, desc: F.value ? 'APIs robustes et applications full-stack avec AdonisJS 6.' : 'Robust APIs and full-stack apps with AdonisJS 6.' },
  { icon: '🗄', name: F.value ? 'SQL / Bases de données' : 'SQL / Databases', lvl: '72%', level: 72, desc: F.value ? 'Modélisation, migrations et ORM Lucid (SQLite, MySQL).' : 'Modelling, migrations and Lucid ORM (SQLite, MySQL).' },
  { icon: '🔧', name: 'Git / CI-CD / DevOps', lvl: '70%', level: 70, desc: F.value ? 'Versioning, déploiement VPS — Nginx, PM2, Certbot.' : 'Versioning, VPS deployment — Nginx, PM2, Certbot.' },
])

const experiences = computed(() => [
  {
    dotStyle: 'background:#52b788; box-shadow:0 0 0 3px rgba(82,183,136,0.18);',
    date: F.value ? '2024 — Présent' : '2024 — Present',
    role: F.value ? 'Développeur Web — Projets personnels' : 'Web Developer — Personal projects',
    company: 'AlpaStudio · alpastudio.fr',
    desc: F.value
      ? "Conception et développement de plusieurs projets web : plateforme de jeux (Arcade Zone), site client (Ferme de l\u2019Ormois), portfolio. Stack : Vue.js, AdonisJS, Nuxt, SQLite."
      : 'Designed and built several web projects: a games platform (Arcade Zone), a client site (Ferme de l\u2019Ormois), this portfolio. Stack: Vue.js, AdonisJS, Nuxt, SQLite.',
  },
  {
    dotStyle: 'background:#e08a3c; box-shadow:0 0 0 3px rgba(224,138,60,0.18);',
    date: '2023 — 2024',
    role: F.value ? 'Développeur — Application de gestion' : 'Developer — Business application',
    company: 'Projet CIFC / WinDev',
    desc: F.value
      ? "Développement d\u2019une application de devis et gestion sur WinDev. Architecture en classes, correction de bugs, intégration de fonctionnalités métier."
      : 'Built a quoting and management application in WinDev. Class architecture, bug fixing, business-feature integration.',
  },
  {
    dotStyle: 'background:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.18);',
    date: '2022 — 2023',
    role: F.value ? 'Formation & Développement' : 'Training & Development',
    company: F.value ? 'Formation Inovyn / Vue.js' : 'Inovyn training / Vue.js',
    desc: F.value
      ? 'Montée en compétences sur Vue.js et les technologies web modernes. Participation à des projets de formation industrielle.'
      : 'Skilling up on Vue.js and modern web technologies. Took part in industrial training projects.',
  },
])

const hobbies = computed(() =>
  F.value
    ? ['Course en montagne', 'Trail running', 'Randonnée', 'Informatique', 'DIY & Bricolage', 'Jeux de société']
    : ['Mountain running', 'Trail running', 'Hiking', 'Tech & coding', 'DIY & Tinkering', 'Board games']
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

const stats = computed(() => [
  { value: '5+', count: 5, suffix: '+', label: F.value ? 'Projets web livrés' : 'Web projects shipped' },
  { value: '100km+', count: 100, suffix: 'km+', label: F.value ? 'Trails parcourus' : 'Trails run' },
  { value: '∞', count: NaN, suffix: '', label: F.value ? 'Passion pour le code' : 'Passion for code' },
])

const navLinks = computed(() =>
  ['#accueil', '#competences', '#experiences', '#projets', '#apropos', '#contact'].map((href, i) => ({
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

const sectionDefs = [
  { sel: '#accueil', fr: 'Départ', en: 'Start' },
  { sel: '#competences', fr: 'Compétences', en: 'Skills' },
  { sel: '#experiences', fr: 'Expériences', en: 'Experience' },
  { sel: '#projets', fr: 'Projets', en: 'Projects' },
  { sel: '#apropos', fr: 'À propos', en: 'About' },
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
  if (runnerEl.value && !reduce) {
    runnerEl.value.classList.add('running')
    clearTimeout(idle)
    idle = setTimeout(() => runnerEl.value && runnerEl.value.classList.remove('running'), 220)
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

  if (finishEl.value) {
    const fr = finishEl.value.getBoundingClientRect()
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
    const len = path.getTotalLength()
    const pt = path.getPointAtLength(p * len)
    const w = trail.clientWidth,
      h = trail.clientHeight
    const sx = w / 120,
      sy = h / 1000
    const x = pt.x * sx,
      py = pt.y * sy
    const col = runnerColor(p)
    runner.style.transform = `translate(${x - 26}px, ${py - 40}px)`

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
    if (!initial && !reduce && Math.abs(traveled - lastFootLen) > 22) {
      lastFootLen = traveled
      dropFoot(x, py, col)
    }
  }

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
      if (!initial) cp.el.style.animation = 'cpPop .6s ease-out'
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

  const mountPath = projMountPathEl.value
  const mt = mountPath ? (mountPath.closest('.proj-mountains') as HTMLElement | null) : null
  const mh = mt ? mt.clientHeight : vh * 0.42
  const mTop = vh - mh
  const len = mountPath ? mountPath.getTotalLength() : 1
  const ridgePt = mountPath ? mountPath.getPointAtLength(pp * len) : { x: 0, y: 0 }
  const Rm = { x: (ridgePt.x / 1000) * vw, y: mTop + (ridgePt.y / 300) * mh }

  let Cv = Rm
  const trail = trailEl.value,
    path = pathEl.value
  if (trail && path) {
    const tr = trail.getBoundingClientRect()
    const lenV = path.getTotalLength()
    const ptv = path.getPointAtLength((p || 0) * lenV)
    Cv = {
      x: tr.left + ptv.x * (trail.clientWidth / 120),
      y: tr.top + ptv.y * (trail.clientHeight / 1000),
    }
  }
  const C = { x: Rm.x + (Cv.x - Rm.x) * eExit, y: Rm.y + (Cv.y - Rm.y) * eExit }
  const handover = eExit < 0.85 ? 0 : (eExit - 0.85) / 0.15

  let trailVis: number
  if (!inSection) trailVis = 1
  else if (pp < 0.12) trailVis = entry
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
    else if (pp < 0.12) vv = entry
    else if (pp > 0.8) vv = handover
    else vv = 0
    runnerEl.value.style.opacity = vv.toFixed(3)
  }

  if (projRunnerEl.value && mountPath) {
    let mvis: number
    if (!inSection) mvis = 0
    else if (pp < 0.12) mvis = 1 - entry
    else if (pp > 0.8) mvis = 1 - handover
    else mvis = 1
    projRunnerEl.value.style.opacity = mvis.toFixed(3)
    projRunnerEl.value.style.transform = `translate(${C.x - 23}px, ${C.y - 23}px)`
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
  }

  const N = projects.value.length || 6
  if (projCounterEl.value) {
    const active = Math.min(N, Math.floor(pp * N + 0.0001) + 1)
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
    projCounterEl.value.textContent = pad(active) + ' / ' + pad(N)
  }
  if (projBarEl.value) projBarEl.value.style.width = (pp * 100).toFixed(1) + '%'

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
  el.querySelectorAll('[data-count-to]').forEach((c) => countUp(c as HTMLElement))
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
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onResize, { passive: true })

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
  clearTimeout(idle)
  clearTimeout(resizeT)
  clearTimeout(celebT)
  clearTimeout(sentT)
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

  <div ref="rootEl" style="position: relative; width: 100%; overflow-x: hidden">
    <!-- Ambient particles -->
    <div v-if="showParticles" style="position: fixed; inset: 0; pointer-events: none; z-index: 40">
      <span v-for="(p, i) in particles" :key="i" :style="p.style"></span>
    </div>

    <!-- Film grain -->
    <div
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
    <nav style="position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 1rem clamp(1.2rem, 4vw, 3rem); display: flex; align-items: center; justify-content: space-between; background: rgba(8, 8, 10, 0.72); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(82, 183, 136, 0.16)">
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
          <button :style="frBtnStyle" @click="lang = 'fr'">FR</button>
          <button :style="enBtnStyle" @click="lang = 'en'">EN</button>
        </div>
      </div>
    </nav>

    <!-- Hero / Accueil -->
    <section id="accueil" data-screen-label="Accueil" style="position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; background: radial-gradient(120% 80% at 50% 0%, #0e3b2e 0%, #081f1a 45%, #07171f 100%)">
      <div data-parallax data-speed="0.28" style="position: absolute; inset: 0; opacity: 0.55">
        <div style="position: absolute; top: 14%; left: 18%; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(82, 183, 136, 0.22), transparent 70%); filter: blur(8px)"></div>
        <div style="position: absolute; top: 8%; right: 14%; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(72, 202, 228, 0.18), transparent 70%); filter: blur(6px)"></div>
      </div>
      <div data-parallax data-speed="-0.12" style="position: absolute; bottom: -2px; left: 0; right: 0; height: 42vh; opacity: 0.9">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style="position: absolute; bottom: 0; width: 100%; height: 100%">
          <path d="M0,400 L0,250 L240,90 L430,210 L640,60 L860,200 L1080,70 L1280,190 L1440,120 L1440,400 Z" fill="#06140f"></path>
          <path d="M0,400 L0,300 L200,200 L420,300 L600,170 L820,290 L1040,180 L1260,300 L1440,230 L1440,400 Z" fill="#0a241b" opacity="0.92"></path>
        </svg>
      </div>
      <div style="position: absolute; top: 20%; left: 0; right: 0; height: 120px; background: linear-gradient(90deg, transparent, rgba(212, 230, 241, 0.07), transparent); filter: blur(14px); animation: drift 9s ease-in-out infinite alternate"></div>
      <div style="position: relative; z-index: 2; padding: 0 1.5rem; max-width: 780px">
        <p data-rv="up" data-rv-d="80" style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #74c69d; letter-spacing: 0.32em; text-transform: uppercase; margin-bottom: 1.4rem">{{ t.heroKicker }}</p>
        <h1 aria-label="Alexis Paillot" style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; margin-bottom: 1.6rem; background: linear-gradient(135deg, #eef2ef 30%, #74c69d 70%, #48cae4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">
          <span class="hero-letter" style="animation-delay: 0.18s">A</span><span class="hero-letter" style="animation-delay: 0.225s">l</span><span class="hero-letter" style="animation-delay: 0.27s">e</span><span class="hero-letter" style="animation-delay: 0.315s">x</span><span class="hero-letter" style="animation-delay: 0.36s">i</span><span class="hero-letter" style="animation-delay: 0.405s">s</span><span class="hero-letter" style="animation-delay: 0.45s">&nbsp;</span><span class="hero-letter" style="animation-delay: 0.495s">P</span><span class="hero-letter" style="animation-delay: 0.54s">a</span><span class="hero-letter" style="animation-delay: 0.585s">i</span><span class="hero-letter" style="animation-delay: 0.63s">l</span><span class="hero-letter" style="animation-delay: 0.675s">l</span><span class="hero-letter" style="animation-delay: 0.72s">o</span><span class="hero-letter" style="animation-delay: 0.765s">t</span>
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
              <div v-for="(s, i) in skillsGreen" :key="i" data-rv="left" data-rv-stagger style="background: linear-gradient(160deg, rgba(82, 183, 136, 0.07), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(82, 183, 136, 0.18); border-radius: 14px; padding: 1.3rem 1.4rem; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.7rem">
                  <span style="font-size: 1.5rem">{{ s.icon }}</span>
                  <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 600; color: #eef2ef">{{ s.name }}</h4>
                  <span :data-count-to="s.level" data-count-suffix="%" style="margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #74c69d">{{ s.lvl }}</span>
                </div>
                <p style="font-size: 0.88rem; color: #9fb3aa; line-height: 1.6; margin-bottom: 0.9rem">{{ s.desc }}</p>
                <div style="height: 5px; background: rgba(255, 255, 255, 0.07); border-radius: 3px; overflow: hidden">
                  <div :data-level="s.level" style="height: 100%; width: 0; background: linear-gradient(90deg, #2d6a4f, #52b788); border-radius: 3px; transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1)"></div>
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
              <div v-for="(s, i) in skillsRed" :key="i" data-rv="right" data-rv-stagger style="background: linear-gradient(160deg, rgba(239, 68, 68, 0.07), rgba(255, 255, 255, 0.02)); border: 1px solid rgba(239, 68, 68, 0.18); border-radius: 14px; padding: 1.3rem 1.4rem; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.7rem">
                  <span style="font-size: 1.5rem">{{ s.icon }}</span>
                  <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 600; color: #eef2ef">{{ s.name }}</h4>
                  <span :data-count-to="s.level" data-count-suffix="%" style="margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #f87171">{{ s.lvl }}</span>
                </div>
                <p style="font-size: 0.88rem; color: #b6a3a3; line-height: 1.6; margin-bottom: 0.9rem">{{ s.desc }}</p>
                <div style="height: 5px; background: rgba(255, 255, 255, 0.07); border-radius: 3px; overflow: hidden">
                  <div :data-level="s.level" style="height: 100%; width: 0; background: linear-gradient(90deg, #7f1d1d, #ef4444); border-radius: 3px; transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1)"></div>
                </div>
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
        <div style="position: relative; padding-left: 2.4rem">
          <div style="position: absolute; left: 7px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(180deg, #52b788, #e08a3c 55%, #ef4444)"></div>
          <div v-for="(xp, i) in experiences" :key="i" data-rv="left" data-rv-stagger style="position: relative; padding-bottom: 2.6rem">
            <span :style="'position:absolute; left:-2.4rem; top:4px; width:16px; height:16px; border-radius:50%; border:3px solid #12101a; ' + xp.dotStyle"></span>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #e0a05c; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.4rem">{{ xp.date }}</p>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; color: #eef2ef; margin-bottom: 0.2rem">{{ xp.role }}</h3>
            <p style="font-size: 0.92rem; color: #48cae4; margin-bottom: 0.7rem">{{ xp.company }}</p>
            <p style="font-size: 0.92rem; line-height: 1.7; color: #a3b3ab">{{ xp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Projets (scroll horizontal épinglé) -->
    <section id="projets" data-screen-label="Projets" ref="projSectionEl" class="proj-section" style="position: relative; background: linear-gradient(180deg, #1a0f15 0%, #0c1a23 34%, #0a1c18 70%, #1a0f15 100%)">
      <div ref="projStickyEl" class="proj-sticky" style="position: absolute; top: 0; left: 0; right: 0; height: 100vh; overflow: hidden">
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

        <!-- Mountain runner -->
        <div ref="projRunnerEl" class="runWrap proj-runner" style="position: absolute; left: 0; top: 0; width: 46px; height: 46px; z-index: 2; opacity: 0; will-change: transform; transition: opacity 0.4s">
          <span ref="projGlowEl" style="position: absolute; left: 50%; bottom: 1px; width: 30px; height: 9px; transform: translateX(-50%); border-radius: 50%; background: rgba(82, 183, 136, 0.5); filter: blur(5px)"></span>
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
              <span :data-count-to="st.count" :data-count-suffix="st.suffix" style="font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 700; min-width: 4rem; background: linear-gradient(135deg, #f87171, #e08a3c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">{{ st.value }}</span>
              <span style="font-size: 0.9rem; color: #b6a3a3; line-height: 1.4">{{ st.label }}</span>
            </div>
          </div>
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
          <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.7rem, 3.4vw, 2.6rem); font-weight: 700; margin-top: 1.4rem; letter-spacing: -0.01em; background: linear-gradient(135deg, #f87171, #e08a3c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">{{ t.finishDone }}</h3>
          <p style="color: #a9b6af; margin-top: 0.45rem; font-size: 0.96rem">{{ t.finishSub }}</p>
          <div v-if="rank != null" style="margin-top: 1.3rem; display: inline-flex; align-items: center; gap: 0.65rem; padding: 0.6rem 1.5rem; background: linear-gradient(135deg, rgba(82, 183, 136, 0.16), rgba(239, 68, 68, 0.16)); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 999px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35)">
            <span style="font-size: 1.35rem">🏅</span>
            <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 1.05rem; color: #eef2ef">{{ rankText }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer style="text-align: center; padding: 2.4rem 1.5rem; color: #5f6f67; font-size: 0.82rem; border-top: 1px solid rgba(255, 255, 255, 0.05); background: #08080a; font-family: 'JetBrains Mono', monospace">
      {{ t.footer }}
    </footer>
  </div>
</template>
