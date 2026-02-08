'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Camera, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { uploadOfferPhoto, deleteOfferPhoto } from '@/lib/supabase/storage'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onDelete?: (url: string) => Promise<void>
  supplierId: string
}

export function PhotoUpload({ value, onChange, onDelete, supplierId }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier est trop volumineux (max 5 MB)')
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPEG, PNG ou WebP')
      return
    }

    if (!supplierId) {
      toast.error('Session non chargée, réessayez dans un instant')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadOfferPhoto(file, supplierId)
      onChange(url)
    } catch {
      toast.error("Erreur lors de l'upload de la photo")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!value) return
    try {
      if (onDelete) {
        await onDelete(value)
      } else {
        await deleteOfferPhoto(value)
      }
      onChange(null)
    } catch {
      toast.error('Erreur lors de la suppression de la photo')
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-[0_1rem_1rem_1rem] border">
          {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic external URL from Supabase Storage */}
          <img src={value} alt="Photo du produit" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-11 w-11"
            onClick={handleDelete}
            aria-label="Supprimer la photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex aspect-video w-full flex-col items-center justify-center rounded-[0_1rem_1rem_1rem] border-2 border-dashed',
            'transition-colors hover:border-primary hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
          aria-label="Ajouter une photo du produit"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ajouter une photo</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG ou WebP (max 5 MB)</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
