<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

const RUNNER_PATH =
  'M13,2 C14.6569,2 16,3.34315 16,5 C16,6.4374272 14.989097,7.63873126 13.6394248,7.93171632 L13.469,7.96356 L14.9049,10.261 L16.6286,9.57154 C17.1414,9.36643 17.7234,9.61584 17.9285,10.1286 C18.11895,10.6047714 17.9175097,11.1406102 17.4771844,11.3789437 L17.3714,11.4285 L15.6477,12.118 C14.8018647,12.4563529 13.842291,12.1788886 13.3046353,11.4607687 L13.2089,11.321 L13.0463,11.0609 L12.4403,13.4851 C12.38606,13.7019 12.298348,13.901548 12.184076,14.0798456 L12.0935,14.2095 L13.7468,15.4377 C14.1430667,15.7320111 14.4146519,16.1610383 14.5132351,16.6403612 L14.542,16.8223 L14.895,20 L15,20 C15.5523,20 16,20.4477 16,21 C16,21.51285 15.613973,21.9355092 15.1166239,21.9932725 L15,22 L14.0895,22 C13.5690357,22 13.1258286,21.63665 13.0156081,21.1386974 L12.9962,21.0215 L12.5542,17.0431 L9.40368,14.7028 C9.34671,14.6605 9.29553,14.6132 9.2503,14.5621 C8.69851333,14.1201667 8.40463653,13.4019169 8.52705735,12.6715064 L8.55972,12.5149 L9.35399,9.33785 L7.78454,9.80869 L6.94868,12.3162 C6.77404,12.8402 6.20772,13.1234 5.68377,12.9487 C5.19725429,12.7865714 4.9183499,12.2866153 5.0208232,11.7965565 L5.05132,11.6838 L5.88717,9.17623 C6.07583833,8.61021583 6.50617896,8.16080701 7.05678434,7.94578318 L7.20984,7.89304 L10.6474,6.86176 C10.2421,6.35022 10,5.70338 10,5 C10,3.34315 11.3431,2 13,2 Z M9.6,15.2 C10.0418,15.5314 10.1314,16.1582 9.8,16.6 L8.5838,18.2216 C8.10614,18.8585 7.21414,19.0113 6.55175,18.5697 L4.62197,17.2832 C4.22939,17.5957 3.65616,17.5704 3.29289,17.2071 C2.90237,16.8166 2.90237,16.1834 3.29289,15.7929 L3.7871,15.2987 C4.12753,14.9583 4.66094,14.9055 5.06152,15.1725 L7.26759,16.6432 L8.2,15.4 C8.53137,14.9582 9.15817,14.8686 9.6,15.2 Z'
</script>

<template>
  <Head title="Page introuvable" />

  <div
    style="
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      background: radial-gradient(120% 80% at 50% 0%, #0e3b2e 0%, #081f1a 45%, #07171f 100%);
      font-family: 'Public Sans', system-ui, sans-serif;
      color: #eef2ef;
    "
  >
    <!-- Montagnes en fond -->
    <div style="position: absolute; bottom: -2px; left: 0; right: 0; height: 42vh; opacity: 0.9">
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style="position: absolute; bottom: 0; width: 100%; height: 100%">
        <path d="M0,400 L0,250 L240,90 L430,210 L640,60 L860,200 L1080,70 L1280,190 L1440,120 L1440,400 Z" fill="#06140f" />
        <path d="M0,400 L0,300 L200,200 L420,300 L600,170 L820,290 L1040,180 L1260,300 L1440,230 L1440,400 Z" fill="#0a241b" opacity="0.92" />
      </svg>
    </div>

    <!-- Sentier en pointilles qui s'arrete net (perdu) -->
    <svg viewBox="0 0 400 300" style="position: absolute; left: 50%; bottom: 6vh; width: min(90vw, 500px); height: auto; transform: translateX(-50%); opacity: 0.55">
      <path
        d="M20,280 C90,250 120,220 150,190 C180,160 170,120 210,95"
        fill="none"
        stroke="url(#lostGrad)"
        stroke-width="3"
        stroke-dasharray="2 11"
        stroke-linecap="round"
      />
      <defs>
        <linearGradient id="lostGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#52b788" />
          <stop offset="1" stop-color="#ef4444" />
        </linearGradient>
      </defs>
      <g transform="translate(196,72) rotate(18)">
        <path fill="#ef4444" :d="RUNNER_PATH" style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))" />
      </g>
      <!-- point d'interrogation la ou le sentier s'arrete -->
      <text x="235" y="70" font-size="34" font-weight="700" fill="#f87171" font-family="'Space Grotesk', sans-serif">?</text>
    </svg>

    <div style="position: relative; z-index: 2; padding: 0 1.5rem; max-width: 620px">
      <p
        style="
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #74c69d;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        "
      >
        Hors piste
      </p>
      <h1
        style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(4rem, 12vw, 7rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          margin-bottom: 1.2rem;
          background: linear-gradient(135deg, #eef2ef 20%, #74c69d 60%, #ef4444);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        "
      >
        404
      </h1>
      <p style="font-size: clamp(1.05rem, 1.8vw, 1.25rem); color: #c4d6cd; margin-bottom: 2.4rem; line-height: 1.7">
        Ce sentier ne mène nulle part. La page que vous cherchez n'existe pas (ou plus).
      </p>
      <a
        href="/"
        style="
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.95rem 2.4rem;
          background: linear-gradient(135deg, #2d6a4f, #1e6091);
          color: #eef2ef;
          text-decoration: none;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.03em;
          box-shadow: 0 8px 30px rgba(45, 106, 79, 0.4);
        "
      >
        Retour au départ <span style="font-size: 1.1em">↩</span>
      </a>
    </div>
  </div>
</template>
