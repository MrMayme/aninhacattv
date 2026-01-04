import type { ZodType } from 'zod'
import { ValidationError } from '../../errors/ValitadionError.js'

export function validateSchema<T>(schema: ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues)
  }

  return parsed.data
}

/*import type { ZodTypeAny, infer as zInfer } from 'zod'
import { ValidationError } from '../../errors/ValitadionError.js'

export function validateSchema<S extends ZodTypeAny>(schema: S, data: {}): zInfer<S> {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues)
  }

  return parsed.data
}*/

/**
 * if (!parsed.success) { 
 *  return res.status(400).json({ 
 *      errors: parsed.error.issues.map(issue => ({ 
 *          field: issue.path.join('.'), 
 *          message: issue.message, 
 *         })),
 *  })
 */