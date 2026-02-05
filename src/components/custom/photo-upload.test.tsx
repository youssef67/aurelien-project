import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhotoUpload } from './photo-upload'

// Mock storage utilities
const mockUploadOfferPhoto = vi.fn()
const mockDeleteOfferPhoto = vi.fn()

vi.mock('@/lib/supabase/storage', () => ({
  uploadOfferPhoto: (...args: unknown[]) => mockUploadOfferPhoto(...args),
  deleteOfferPhoto: (...args: unknown[]) => mockDeleteOfferPhoto(...args),
}))

// Mock sonner
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

describe('PhotoUpload', () => {
  const defaultProps = {
    onChange: vi.fn(),
    supplierId: 'supplier-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('upload zone (no photo)', () => {
    it('renders upload zone when no value', () => {
      render(<PhotoUpload {...defaultProps} />)
      expect(screen.getByLabelText(/ajouter une photo/i)).toBeInTheDocument()
    })

    it('shows accepted formats info', () => {
      render(<PhotoUpload {...defaultProps} />)
      expect(screen.getByText(/jpeg, png ou webp/i)).toBeInTheDocument()
    })

    it('has file input with correct accept attribute', () => {
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      expect(fileInput.accept).toBe('image/jpeg,image/png,image/webp')
    })
  })

  describe('preview (existing photo)', () => {
    it('renders image preview when value is provided', () => {
      render(<PhotoUpload {...defaultProps} value="https://example.com/photo.jpg" />)
      const img = screen.getByAltText(/photo du produit/i)
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })

    it('renders delete button when photo exists', () => {
      render(<PhotoUpload {...defaultProps} value="https://example.com/photo.jpg" />)
      expect(screen.getByLabelText(/supprimer la photo/i)).toBeInTheDocument()
    })
  })

  describe('file validation', () => {
    it('shows error toast for file too large (> 5MB)', async () => {
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 })

      await user.upload(fileInput, largeFile)

      expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('volumineux'))
      expect(mockUploadOfferPhoto).not.toHaveBeenCalled()
    })

    it('shows error toast for unsupported format', async () => {
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const gifFile = new File(['content'], 'image.gif', { type: 'image/gif' })

      // Simulate bypassing the accept attribute (e.g., drag-and-drop or programmatic)
      Object.defineProperty(fileInput, 'files', { value: [gifFile], writable: false })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('Format'))
      })
      expect(mockUploadOfferPhoto).not.toHaveBeenCalled()
    })
  })

  describe('upload flow', () => {
    it('calls uploadOfferPhoto and onChange on successful upload', async () => {
      mockUploadOfferPhoto.mockResolvedValue('https://storage.example.com/photo.jpg')
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

      await user.upload(fileInput, validFile)

      await waitFor(() => {
        expect(mockUploadOfferPhoto).toHaveBeenCalledWith(validFile, 'supplier-123')
      })

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith('https://storage.example.com/photo.jpg')
      })
    })

    it('shows error toast on upload failure', async () => {
      mockUploadOfferPhoto.mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

      await user.upload(fileInput, validFile)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('upload'))
      })
    })

    it('shows loading state during upload', async () => {
      let resolveUpload: (value: string) => void
      mockUploadOfferPhoto.mockImplementation(
        () => new Promise<string>((resolve) => { resolveUpload = resolve })
      )
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

      await user.upload(fileInput, validFile)

      // During upload, the upload zone should be disabled
      await waitFor(() => {
        const uploadButton = screen.getByLabelText(/ajouter une photo/i)
        expect(uploadButton).toBeDisabled()
      })

      // Resolve the upload
      resolveUpload!('https://storage.example.com/photo.jpg')

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalled()
      })
    })
  })

  describe('delete flow', () => {
    it('calls deleteOfferPhoto and onChange(null) on delete', async () => {
      mockDeleteOfferPhoto.mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} value="https://example.com/photo.jpg" />)

      await user.click(screen.getByLabelText(/supprimer la photo/i))

      await waitFor(() => {
        expect(mockDeleteOfferPhoto).toHaveBeenCalledWith('https://example.com/photo.jpg')
      })

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith(null)
      })
    })

    it('shows error toast on delete failure', async () => {
      mockDeleteOfferPhoto.mockRejectedValue(new Error('Delete failed'))
      const user = userEvent.setup()
      render(<PhotoUpload {...defaultProps} value="https://example.com/photo.jpg" />)

      await user.click(screen.getByLabelText(/supprimer la photo/i))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('suppression'))
      })
    })
  })
})
