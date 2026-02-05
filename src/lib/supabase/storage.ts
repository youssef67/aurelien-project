import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'offer-photos'

export async function uploadOfferPhoto(file: File, supplierId: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const fileName = `${supplierId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteOfferPhoto(photoUrl: string): Promise<void> {
  const supabase = createClient()
  const url = new URL(photoUrl)
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
  const filePath = pathParts[1]

  if (!filePath) throw new Error('Invalid photo URL')

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
  if (error) throw error
}
