<template>
  <div>
    <!-- Navigation -->
    <nav>
      <span class="logo">AlpaStudio</span>
      <ul>
        <li><a href="#accueil">Accueil</a></li>
        <li><a href="#competences">Compétences</a></li>
        <li><a href="#experiences">Expériences</a></li>
        <li><a href="#apropos">À propos</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>

    <!-- Runner (bonhomme qui court) -->
    <div class="runner-wrapper" aria-hidden="true">
      <!-- Path SVG en fond -->
      <svg class="runner-path" viewBox="0 0 80 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0.25">
        <path
          :d="pathD"
          fill="none"
          stroke="#4a7c3f"
          stroke-width="2"
          stroke-dasharray="6 4"
        />
      </svg>
      <!-- Bonhomme -->
      <div class="runner-figure" :style="{ top: runnerTop + 'px', left: runnerLeft + 'px' }">
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" :class="['runner-svg', { running: isRunning }]">
          <!-- Tête -->
          <circle cx="24" cy="8" r="5" fill="#1e3a5f"/>
          <!-- Corps -->
          <line x1="24" y1="13" x2="24" y2="28" stroke="#1e3a5f" stroke-width="3" stroke-linecap="round"/>
          <!-- Bras gauche animé -->
          <line class="arm-left" x1="24" y1="18" x2="15" y2="24" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Bras droit animé -->
          <line class="arm-right" x1="24" y1="18" x2="33" y2="22" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Jambe gauche -->
          <line class="leg-left" x1="24" y1="28" x2="16" y2="38" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Jambe droite -->
          <line class="leg-right" x1="24" y1="28" x2="30" y2="40" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Section Accueil -->
    <section id="accueil">
      <div class="hero-content">
        <p class="subtitle">Développeur & Passionné de Nature</p>
        <h1>Alexis Paillot</h1>
        <p class="tagline">Je construis des applications web robustes, entre les lignes de code et les sentiers de montagne.</p>
        <a href="#competences" class="cta-btn">Découvrir mon parcours</a>
      </div>
      <svg class="mountain-deco" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,120 L0,80 L180,20 L320,70 L480,10 L620,60 L780,0 L940,50 L1100,15 L1260,55 L1440,30 L1440,120 Z" fill="rgba(13,13,13,0.9)"/>
      </svg>
    </section>

    <!-- Section Compétences -->
    <section id="competences">
      <div class="section-inner">
        <p class="section-label">Ce que je sais faire</p>
        <h2 class="section-title">Compétences</h2>
        <div class="skills-grid">
          <div class="skill-card fade-up" v-for="skill in skills" :key="skill.name" ref="skillCards">
            <div class="skill-icon">{{ skill.icon }}</div>
            <h3>{{ skill.name }}</h3>
            <p>{{ skill.desc }}</p>
            <div class="skill-bar">
              <div class="skill-bar-fill" :style="{ width: skill.visible ? skill.level + '%' : '0%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Expériences -->
    <section id="experiences">
      <div class="section-inner">
        <p class="section-label">Mon parcours</p>
        <h2 class="section-title">Expériences</h2>
        <div class="timeline">
          <div class="timeline-item fade-up" v-for="xp in experiences" :key="xp.role">
            <p class="timeline-date">{{ xp.date }}</p>
            <h3 class="timeline-role">{{ xp.role }}</h3>
            <p class="timeline-company">{{ xp.company }}</p>
            <p class="timeline-desc">{{ xp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section À propos -->
    <section id="apropos">
      <div class="section-inner">
        <p class="section-label">Qui suis-je ?</p>
        <h2 class="section-title">À propos</h2>
        <div class="about-grid">
          <div class="about-text fade-up">
            <p>Développeur web passionné, je vis à la croisée du code et de la montagne. Quand je ne suis pas à construire des applications, je cours des sentiers pour vider la tête et revenir avec de meilleures idées.</p>
            <p>J'aime créer des outils qui ont du sens, avec des technos modernes et un souci constant de la qualité. Mon environnement idéal : un projet ambitieux, une bonne équipe, et une cascade pas trop loin.</p>
            <div class="hobbies">
              <span class="hobby-tag" v-for="h in hobbies" :key="h">{{ h }}</span>
            </div>
          </div>
          <div class="about-visual fade-up">
            <div class="stat-card" v-for="stat in stats" :key="stat.label">
              <span class="stat-num">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Contact -->
    <section id="contact">
      <div class="section-inner">
        <p class="section-label">Travaillons ensemble</p>
        <h2 class="section-title">Contact</h2>
        <div class="contact-wrapper">
          <div class="contact-info fade-up">
            <p>Une idée de projet, une question, ou juste l'envie d'échanger ? N'hésitez pas à me contacter !</p>
            <div class="contact-links">
              <a href="mailto:paillot.alexis.ap@gmail.com" class="contact-link">
                <span class="link-icon">✉</span>
                paillot.alexis.ap@gmail.com
              </a>
              <a href="https://github.com/DevAlex39" target="_blank" class="contact-link">
                <span class="link-icon">⌥</span>
                GitHub — DevAlex39
              </a>
              <a href="https://alpastudio.fr" class="contact-link">
                <span class="link-icon">🏔</span>
                alpastudio.fr
              </a>
            </div>
          </div>
          <form class="contact-form fade-up" @submit.prevent="sendMessage">
            <div class="form-group">
              <label>Nom</label>
              <input v-model="form.name" type="text" placeholder="Jean Dupont" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="jean@exemple.fr" required />
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea v-model="form.message" placeholder="Votre message..." required></textarea>
            </div>
            <button type="submit" class="submit-btn">Envoyer le message</button>
          </form>
        </div>
      </div>
    </section>

    <footer>
      <p>© 2025 Alexis Paillot — AlpaStudio · Code & Montagne</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// --- Données ---
const skills = ref([
  { icon: '⚡', name: 'Vue.js / Nuxt', desc: 'Développement frontend moderne avec Vue 3, Composition API, InertiaJS.', level: 80, visible: false },
  { icon: '🖥', name: 'AdonisJS / Node', desc: 'APIs robustes et applications full-stack avec AdonisJS 6.', level: 75, visible: false },
  { icon: '🗄', name: 'SQL / SQLite / MySQL', desc: 'Modélisation de bases de données, migrations, ORM Lucid.', level: 70, visible: false },
  { icon: '🔧', name: 'WinDev / CIFC', desc: 'Développement d\'applications de gestion (pro).', level: 65, visible: false },
  { icon: '🌲', name: 'Git / CI-CD', desc: 'Gestion de versions, déploiement VPS, Nginx, PM2, Certbot.', level: 70, visible: false },
  { icon: '🎨', name: 'CSS / UI Design', desc: 'Interfaces soignées, animations, responsive design.', level: 72, visible: false },
])

const experiences = [
  {
    date: '2024 — Présent',
    role: 'Développeur Web — Projets personnels',
    company: 'AlpaStudio · alpastudio.fr',
    desc: 'Conception et développement de plusieurs projets web : plateforme de jeux (Arcade Zone), site client (Ferme de l\'Ormois), portfolio. Stack : Vue.js, AdonisJS, Nuxt, SQLite.',
  },
  {
    date: '2023 — 2024',
    role: 'Développeur — Application de gestion',
    company: 'Projet CIFC / WinDev',
    desc: 'Développement d\'une application de devis et gestion sur WinDev. Architecture classes, correction de bugs, intégration de fonctionnalités métier.',
  },
  {
    date: '2022 — 2023',
    role: 'Formation & Développement',
    company: 'Formation Inovyn / Vue.js',
    desc: 'Montée en compétences sur Vue.js et les technologies web modernes. Participation à des projets de formation industrielle.',
  },
]

const hobbies = ['Course en montagne', 'Trail running', 'Randonnée', 'Informatique', 'DIY & Bricolage', 'Jeux de société']

const stats = [
  { value: '5+', label: 'Projets web livrés' },
  { value: '100km+', label: 'Trails courus' },
  { value: '∞', label: 'Passion pour le code' },
]

const form = ref({ name: '', email: '', message: '' })

function sendMessage() {
  alert('Message envoyé ! (à connecter à votre backend AdonisJS)')
  form.value = { name: '', email: '', message: '' }
}

// --- Runner logic ---
const runnerTop = ref(80)
const runnerLeft = ref(30)
const isRunning = ref(false)
let scrollRAF: number | null = null

// Chemin sinueux normalisé (points en 0-1 pour x, 0-1 pour y sur la hauteur de page)
const waypoints = [
  { x: 0.5, y: 0.0 },
  { x: 0.7, y: 0.12 },
  { x: 0.3, y: 0.25 },
  { x: 0.6, y: 0.38 },
  { x: 0.2, y: 0.5 },
  { x: 0.65, y: 0.62 },
  { x: 0.35, y: 0.75 },
  { x: 0.55, y: 0.88 },
  { x: 0.4, y: 1.0 },
]

// Construction du path SVG pour l'affichage décoratif
const pathD = waypoints
  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 80} ${p.y * 800}`)
  .join(' ')

function getPositionAlongPath(progress: number): { x: number; y: number } {
  if (progress <= 0) return waypoints[0]
  if (progress >= 1) return waypoints[waypoints.length - 1]

  const totalSegments = waypoints.length - 1
  const segment = progress * totalSegments
  const idx = Math.floor(segment)
  const t = segment - idx

  const a = waypoints[Math.min(idx, waypoints.length - 1)]
  const b = waypoints[Math.min(idx + 1, waypoints.length - 1)]

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }
}

let lastScrollY = 0
function onScroll() {
  const scrollY = window.scrollY
  isRunning.value = Math.abs(scrollY - lastScrollY) > 1
  lastScrollY = scrollY

  if (scrollRAF) cancelAnimationFrame(scrollRAF)
  scrollRAF = requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0
    const pos = getPositionAlongPath(progress)

    // pos.x en [0,1] → pixel dans le wrapper 80px de large
    runnerLeft.value = pos.x * 40
    // pos.y en [0,1] → pixel dans la viewport 100vh
    runnerTop.value = pos.y * (window.innerHeight - 60)
  })

  // Stopper l'animation après 200ms sans scroll
  clearTimeout((window as any).__runnerTimer)
  ;(window as any).__runnerTimer = setTimeout(() => {
    isRunning.value = false
  }, 200)
}

// IntersectionObserver pour les animations fade-up + skill bars
let observer: IntersectionObserver

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // Activer les barres de compétences
          const idx = Array.from(entry.target.closest('.skills-grid')?.children ?? []).indexOf(entry.target)
          if (idx >= 0 && skills.value[idx]) {
            skills.value[idx].visible = true
          }
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
})
</script>

<style scoped>
.runner-svg {
  width: 48px;
  height: 48px;
}

/* Animation du bonhomme qui court */
@keyframes arm-swing {
  0%, 100% {
    transform-origin: 24px 18px;
    transform: rotate(0deg);
  }
  50% {
    transform-origin: 24px 18px;
    transform: rotate(25deg);
  }
}

@keyframes leg-swing {
  0%, 100% {
    transform-origin: 24px 28px;
    transform: rotate(0deg);
  }
  50% {
    transform-origin: 24px 28px;
    transform: rotate(20deg);
  }
}

.running .arm-left {
  animation: arm-swing 0.4s ease-in-out infinite alternate;
}
.running .arm-right {
  animation: arm-swing 0.4s ease-in-out infinite alternate-reverse;
}
.running .leg-left {
  animation: leg-swing 0.4s ease-in-out infinite alternate;
}
.running .leg-right {
  animation: leg-swing 0.4s ease-in-out infinite alternate-reverse;
}
</style>
