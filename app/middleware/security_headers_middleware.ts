import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Security headers Shield does not set:
 * - Referrer-Policy: other sites only see "alpastudio.fr", never the full URL;
 * - Permissions-Policy: the portfolio uses no device feature, so all are off.
 */
export default class SecurityHeadersMiddleware {
  handle({ response }: HttpContext, next: NextFn) {
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=(), usb=()')
    return next()
  }
}
