import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import { mkdir, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Minimal, cookie-free pageview logging : one JSON line per visit,
 * written to a local file (no third-party script, no client-side
 * tracker, nothing to declare in a cookie banner).
 *
 * ANALYTICS_DIR should point OUTSIDE the `build/` directory in
 * production (which gets wiped on every deploy) — see .env.example.
 */
function analyticsDir() {
  return env.get('ANALYTICS_DIR') || join(process.cwd(), 'tmp', 'analytics')
}

function deviceFromUA(ua: string) {
  if (/mobile/i.test(ua)) return 'mobile'
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  return 'desktop'
}

/**
 * Heuristic to weed out scripts/scanners that spoof a normal browser
 * User-Agent (vulnerability scanners routinely do). Real browsers
 * reliably send both of these on a top-level navigation ; curl,
 * headless scripts and most scanners send neither.
 */
function looksLikeRealBrowser(request: HttpContext['request']) {
  const ua = request.header('user-agent') || ''
  if (/bot|crawl|spider|slurp|facebookexternalhit|preview|curl|wget|python|scan/i.test(ua)) {
    return false
  }
  if (!request.header('accept-language')) return false
  if (!request.header('sec-fetch-mode')) return false
  return true
}

export default class TrackVisitMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const ua = request.header('user-agent') || ''

    if (looksLikeRealBrowser(request)) {
      const line =
        JSON.stringify({
          t: new Date().toISOString(),
          path: request.url(),
          ref: request.header('referer') || null,
          device: deviceFromUA(ua),
          lang: (request.header('accept-language') || '').slice(0, 5),
        }) + '\n'

      const dir = analyticsDir()
      appendFile(join(dir, 'visits.jsonl'), line).catch(async () => {
        await mkdir(dir, { recursive: true }).catch(() => {})
        await appendFile(join(dir, 'visits.jsonl'), line).catch(() => {})
      })
    }

    await next()
  }
}
