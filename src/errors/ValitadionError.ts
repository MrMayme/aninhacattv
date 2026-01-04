import { AppError } from './AppError.js'

export interface ValidationIssue {
  field: string
  message: string
}

export class ValidationError extends AppError {
  public readonly errors: ValidationIssue[]

  constructor(
    issues: readonly { path: readonly (string | number | symbol)[]; message: string }[]
  ) {
    super('Validation error', 400)

    this.errors = issues.map(issue => ({
      field: issue.path.map(p => (typeof p === 'symbol' ? '' : p)).join('.'),
      message: issue.message,
    }))
  }
}