import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type Visit = { t: string; path: string; ref: string | null; device: string; lang: string }

function analyticsDir() {
  return env.get('ANALYTICS_DIR') || join(process.cwd(), 'tmp', 'analytics')
}

function refDomain(ref: string | null) {
  if (!ref) return 'Direct / inconnu'
  try {
    return new URL(ref).hostname.replace(/^www\./, '')
  } catch {
    return 'Direct / inconnu'
  }
}

/**
 * Tiny read-only stats view over the pageview log written by
 * `track_visit_middleware`. Gated by a token (STATS_TOKEN) passed as
 * `?token=...` — not linked from the site, kept simple on purpose.
 */
export default class StatsController {
  async show({ request, response, view }: HttpContext) {
    const token = env.get('STATS_TOKEN')
    if (!token || request.qs().token !== token) {
      return response.status(404).send('Not found')
    }

    let lines: string[] = []
    try {
      const raw = await readFile(join(analyticsDir(), 'visits.jsonl'), 'utf-8')
      lines = raw.split('\n').filter(Boolean)
    } catch {
      lines = []
    }

    const visits: Visit[] = lines
      .map((l) => {
        try {
          return JSON.parse(l) as Visit
        } catch {
          return null
        }
      })
      .filter((v): v is Visit => v !== null)

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const today = visits.filter((v) => now - new Date(v.t).getTime() < day).length
    const last7 = visits.filter((v) => now - new Date(v.t).getTime() < 7 * day).length
    const last30 = visits.filter((v) => now - new Date(v.t).getTime() < 30 * day).length

    const byDay = new Map<string, number>()
    for (const v of visits) {
      const d = v.t.slice(0, 10)
      byDay.set(d, (byDay.get(d) || 0) + 1)
    }
    const toRows = (m: Map<string, number>) => [...m.entries()].map(([key, value]) => ({ key, value }))

    const dailyTrend = toRows(byDay)
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 14)

    const byDevice = new Map<string, number>()
    for (const v of visits) byDevice.set(v.device, (byDevice.get(v.device) || 0) + 1)

    const byRef = new Map<string, number>()
    for (const v of visits) {
      const d = refDomain(v.ref)
      byRef.set(d, (byRef.get(d) || 0) + 1)
    }
    const topReferrers = toRows(byRef)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    return view.render('stats', {
      total: visits.length,
      today,
      last7,
      last30,
      dailyTrend,
      byDevice: toRows(byDevice),
      topReferrers,
    })
  }
}
