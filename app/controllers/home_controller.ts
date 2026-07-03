import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  /**
   * Render the single-page portfolio. All content is localised
   * client-side, so we simply hand the browser the initial language.
   */
  async index({ inertia, request }: HttpContext) {
    const language = request.input('lang') === 'en' ? 'en' : 'fr'

    return inertia.render('home', {
      language,
      showRunner: true,
      showParticles: true,
    })
  }
}
