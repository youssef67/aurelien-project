import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadOfferPhoto, deleteOfferPhoto } from './storage'

// Mock Supabase client
const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      }),
    },
  }),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
})

describe('uploadOfferPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads file and returns public URL', async () => {
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.supabase.co/offer-photos/supplier-123/test-uuid-1234.jpg' },
    })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await uploadOfferPhoto(file, 'supplier-123')

    expect(mockUpload).toHaveBeenCalledWith(
      'supplier-123/test-uuid-1234.jpg',
      file,
      { cacheControl: '3600', upsert: false }
    )
    expect(result).toBe('https://storage.supabase.co/offer-photos/supplier-123/test-uuid-1234.jpg')
  })

  it('throws on upload error', async () => {
    mockUpload.mockResolvedValue({ error: new Error('Upload failed') })

    const file = new File(['content'], 'photo.png', { type: 'image/png' })

    await expect(uploadOfferPhoto(file, 'supplier-123')).rejects.toThrow('Upload failed')
  })

  it('uses correct file extension from filename', async () => {
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.supabase.co/offer-photos/supplier-123/test-uuid-1234.webp' },
    })

    const file = new File(['content'], 'image.webp', { type: 'image/webp' })
    await uploadOfferPhoto(file, 'supplier-123')

    expect(mockUpload).toHaveBeenCalledWith(
      'supplier-123/test-uuid-1234.webp',
      file,
      expect.any(Object)
    )
  })
})

describe('deleteOfferPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes file from storage', async () => {
    mockRemove.mockResolvedValue({ error: null })

    await deleteOfferPhoto(
      'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/test-uuid-1234.jpg'
    )

    expect(mockRemove).toHaveBeenCalledWith(['supplier-123/test-uuid-1234.jpg'])
  })

  it('throws on delete error', async () => {
    mockRemove.mockResolvedValue({ error: new Error('Delete failed') })

    await expect(
      deleteOfferPhoto('https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/file.jpg')
    ).rejects.toThrow('Delete failed')
  })

  it('throws on invalid URL (no file path)', async () => {
    await expect(
      deleteOfferPhoto('https://example.com/invalid-url')
    ).rejects.toThrow('Invalid photo URL')
  })
})
