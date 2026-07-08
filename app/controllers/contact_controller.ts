import type { HttpContext } from '@adonisjs/core/http'
import { contactValidator } from '#validators/contact'
import env from '#start/env'
import nodemailer from 'nodemailer'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default class ContactController {
  /**
   * Handle a contact-form submission.
   *
   * Validation errors are flashed to the session and picked up by the
   * Inertia adapter (see `config/inertia.ts` -> sharedData.errors), so
   * they surface on the Vue side as `page.props.errors` / `form.errors`.
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(contactValidator)

    const host = env.get('SMTP_HOST')
    const user = env.get('SMTP_USER')
    const pass = env.get('SMTP_PASS')
    const to = env.get('CONTACT_TO_EMAIL')

    if (!host || !user || !pass || !to) {
      session.flash('errors', {
        send: "L'envoi d'email n'est pas configuré sur le serveur pour le moment.",
      })
      return response.redirect().back()
    }

    const port = env.get('SMTP_PORT', 587)
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    try {
      await transporter.sendMail({
        from: `"AlpaStudio — Formulaire de contact" <${user}>`,
        to,
        replyTo: `"${data.name}" <${data.email}>`,
        subject: `Nouveau message de ${data.name} — alpastudio.fr`,
        text: `De : ${data.name} <${data.email}>\n\n${data.message}`,
        html: `<p><strong>De :</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</p><p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>`,
      })
      session.flash('success', true)
    } catch (error) {
      session.flash('errors', {
        send: "L'envoi a échoué, réessayez plus tard ou écrivez-moi directement par email.",
      })
    }

    return response.redirect().back()
  }
}
