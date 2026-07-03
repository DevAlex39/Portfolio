import vine from '@vinejs/vine'

/**
 * Validates the contact-form payload.
 */
export const contactValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(120),
    email: vine.string().trim().email(),
    message: vine.string().trim().minLength(1).maxLength(5000),
  })
)
