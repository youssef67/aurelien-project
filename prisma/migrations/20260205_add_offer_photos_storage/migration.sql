-- Create the offer-photos storage bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offer-photos',
  'offer-photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public read access (photos are public)
CREATE POLICY "Public read access on offer-photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'offer-photos');

-- Policy: Authenticated suppliers can upload in their own folder
-- Path format: {supplier_id}/{uuid}.{ext}
CREATE POLICY "Suppliers can upload offer photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'offer-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Suppliers can delete their own photos
CREATE POLICY "Suppliers can delete own offer photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'offer-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
