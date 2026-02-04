import { describe, it, expect } from 'vitest'
import type { ActionResult, ErrorCode } from './api'

describe('ActionResult type', () => {
  it('should allow success result with data', () => {
    const result: ActionResult<{ id: string }> = {
      success: true,
      data: { id: '123' },
    }
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('123')
    }
  })

  it('should allow error result with code', () => {
    const result: ActionResult<string> = {
      success: false,
      error: 'Something went wrong',
      code: 'SERVER_ERROR',
    }
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Something went wrong')
      expect(result.code).toBe('SERVER_ERROR')
    }
  })

  it('should support all error codes', () => {
    const errorCodes: ErrorCode[] = [
      'VALIDATION_ERROR',
      'NOT_FOUND',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'SERVER_ERROR',
    ]

    errorCodes.forEach((code) => {
      const result: ActionResult<null> = {
        success: false,
        error: `Error: ${code}`,
        code,
      }
      expect(result.code).toBe(code)
    })
  })

  it('should narrow type correctly with success check', () => {
    const successResult: ActionResult<number> = { success: true, data: 42 }
    const errorResult: ActionResult<number> = {
      success: false,
      error: 'Failed',
      code: 'NOT_FOUND',
    }

    if (successResult.success) {
      // TypeScript should infer data exists
      expect(successResult.data).toBe(42)
    }

    if (!errorResult.success) {
      // TypeScript should infer error and code exist
      expect(errorResult.error).toBe('Failed')
      expect(errorResult.code).toBe('NOT_FOUND')
    }
  })
})
