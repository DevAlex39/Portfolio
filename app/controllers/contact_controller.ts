import type { HttpContext } from '@adonisjs/core/http'
import { contactValidator } from '#validators/contact'

export default class ContactController {
  /**
   * Handle a contact-form submission.
   *
   * Validation errors are flashed to the session and picked up by the
   * Inertia adapter (see `config/inertia.ts` -> sharedData.errors), so
   * they surface on the Vue side as `page.props.errors`.
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(contactValidator)

    /**
     * TODO: wire this up to your mailer / CRM / database.
     * e.g. await mail.send(new ContactNotification(data))
     */
    void data

    session.flash('success', true)
    return response.redirect().back()
  }
}
