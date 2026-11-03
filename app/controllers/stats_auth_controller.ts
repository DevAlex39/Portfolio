import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { timingSafeEqual } from 'node:crypto'
import { createLimiter } from '../services/rate_limit.js'

/** 20 failed logins within 15 minutes (all visitors) lock the form for 15 minutes. */
const failures = createLimiter({ windowMs: 15 * 60 * 1000, max: 20 })

/**
 * Constant-time string comparison (avoids leaking password length/
 * content via response-time differences).
 */
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export default class StatsAuthController {
  async showLogin({ session, response, view }: HttpContext) {
    if (session.get('stats_authed')) {
      return response.redirect('/stats')
    }
    const error = session.flashMessages.get('error')
    return view.render('stats_login', { error })
  }

  async login({ request, session, response }: HttpContext) {
    if (failures.blocked('all')) {
      session.flash('error', 'Trop de tentatives. Réessayez dans 15 minutes.')
      return response.redirect().back()
    }

    const username = String(request.input('username', ''))
    const password = String(request.input('password', ''))

    const expectedUser = env.get('STATS_USERNAME')
    const expectedPass = env.get('STATS_PASSWORD')

    const ok =
      !!expectedUser &&
      !!expectedPass &&
      safeEqual(username, expectedUser) &&
      safeEqual(password, expectedPass)

    if (!ok) {
      failures.hit('all')
      session.flash('error', 'Identifiant ou mot de passe incorrect.')
      return response.redirect().back()
    }

    session.put('stats_authed', true)
    return response.redirect('/stats')
  }

  async logout({ session, response }: HttpContext) {
    session.forget('stats_authed')
    return response.redirect('/stats/login')
  }
}
