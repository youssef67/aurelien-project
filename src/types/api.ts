// Types pour les réponses des Server Actions

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER_ERROR'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode }
