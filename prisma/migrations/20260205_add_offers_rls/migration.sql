-- Enable RLS on offers table
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;

-- Policy: Suppliers can view their own offers
CREATE POLICY "Suppliers can view their own offers"
ON "offers"
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = supplier_id::text
);

-- Policy: Suppliers can create offers linked to their ID
CREATE POLICY "Suppliers can create their own offers"
ON "offers"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = supplier_id::text
);

-- Policy: Suppliers can update their own offers
CREATE POLICY "Suppliers can update their own offers"
ON "offers"
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = supplier_id::text
)
WITH CHECK (
  auth.uid()::text = supplier_id::text
);

-- Policy: Suppliers can delete (soft delete) their own offers
CREATE POLICY "Suppliers can delete their own offers"
ON "offers"
FOR DELETE
TO authenticated
USING (
  auth.uid()::text = supplier_id::text
);

-- Policy: Stores can view all active offers (not deleted)
CREATE POLICY "Stores can view active offers"
ON "offers"
FOR SELECT
TO authenticated
USING (
  status = 'ACTIVE'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM stores WHERE stores.id::text = auth.uid()::text
  )
);
