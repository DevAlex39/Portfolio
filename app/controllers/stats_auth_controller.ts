import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { timingSafeEqual } from 'node:crypto'

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
    const username = request.input('username', '')
    const password = request.input('password', '')

    const expectedUser = env.get('STATS_USERNAME')
    const expectedPass = env.get('STATS_PASSWORD')

    const ok =
      !!expectedUser &&
      !!expectedPass &&
      safeEqual(username, expectedUser) &&
      safeEqual(password, expectedPass)

    if (!ok) {
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
