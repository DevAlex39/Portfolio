import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * A tiny persisted "arrivals" counter — every time a new visitor reaches
 * the finish line, the front-end claims the next number. The count is
 * stored in `tmp/arrivals.json` (swap for a DB table in production).
 *
 * This route is exempt from CSRF (see `config/shield.ts`) because it is
 * called with a plain `fetch`, not through an Inertia form.
 */
export default class ArrivalsController {
  async store({ response }: HttpContext) {
    const file = app.tmpPath('arrivals.json')

    let count = 0
    try {
      const raw = await readFile(file, 'utf-8')
      count = JSON.parse(raw).count ?? 0
    } catch {
      // First run: file doesn't exist yet.
    }

    count += 1

    await mkdir(app.tmpPath(), { recursive: true })
    await writeFile(file, JSON.stringify({ count }))

    return response.json({ value: count })
  }
}
