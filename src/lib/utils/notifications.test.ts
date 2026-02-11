import { describe, it, expect } from 'vitest'
import { serializeNotification, NOTIFICATION_TYPE_CONFIG } from './notifications'
import type { Notification } from '@prisma/client'

function mockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '660e8400-e29b-41d4-a716-446655440000',
    userType: 'SUPPLIER',
    type: 'NEW_REQUEST',
    title: 'Nouvelle demande',
    body: 'Mon Magasin - Promo Biscuits',
    relatedId: '770e8400-e29b-41d4-a716-446655440000',
    read: false,
    createdAt: new Date('2026-02-11T10:00:00.000Z'),
    updatedAt: new Date('2026-02-11T10:00:00.000Z'),
    ...overrides,
  }
}

describe('serializeNotification', () => {
  it('serializes all fields correctly', () => {
    const result = serializeNotification(mockNotification())

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '660e8400-e29b-41d4-a716-446655440000',
      userType: 'SUPPLIER',
      type: 'NEW_REQUEST',
      title: 'Nouvelle demande',
      body: 'Mon Magasin - Promo Biscuits',
      relatedId: '770e8400-e29b-41d4-a716-446655440000',
      read: false,
      createdAt: '2026-02-11T10:00:00.000Z',
      updatedAt: '2026-02-11T10:00:00.000Z',
    })
  })

  it('converts createdAt Date to ISO string', () => {
    const result = serializeNotification(mockNotification())

    expect(typeof result.createdAt).toBe('string')
    expect(result.createdAt).toBe('2026-02-11T10:00:00.000Z')
  })

  it('converts updatedAt Date to ISO string', () => {
    const result = serializeNotification(mockNotification({
      updatedAt: new Date('2026-02-11T12:00:00.000Z'),
    }))

    expect(typeof result.updatedAt).toBe('string')
    expect(result.updatedAt).toBe('2026-02-11T12:00:00.000Z')
  })

  it('handles null relatedId', () => {
    const result = serializeNotification(mockNotification({ relatedId: null }))

    expect(result.relatedId).toBeNull()
  })

  it('handles read=true', () => {
    const result = serializeNotification(mockNotification({ read: true }))

    expect(result.read).toBe(true)
  })

  it('handles STORE userType', () => {
    const result = serializeNotification(mockNotification({ userType: 'STORE' }))

    expect(result.userType).toBe('STORE')
  })

  it('handles REQUEST_TREATED type', () => {
    const result = serializeNotification(mockNotification({ type: 'REQUEST_TREATED' }))

    expect(result.type).toBe('REQUEST_TREATED')
  })
})

describe('NOTIFICATION_TYPE_CONFIG', () => {
  it('has config for NEW_REQUEST', () => {
    expect(NOTIFICATION_TYPE_CONFIG.NEW_REQUEST).toEqual({
      label: 'Nouvelle demande',
      icon: 'message-square',
    })
  })

  it('has config for REQUEST_TREATED', () => {
    expect(NOTIFICATION_TYPE_CONFIG.REQUEST_TREATED).toEqual({
      label: 'Demande traitée',
      icon: 'check-circle',
    })
  })
})
