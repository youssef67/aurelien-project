-- Policy : un fournisseur peut mettre à jour les demandes sur ses offres
-- LIMITATION : RLS ne peut pas restreindre les colonnes modifiables.
-- La restriction aux seules colonnes `status` et `updated_at` DOIT être
-- appliquée au niveau applicatif (server action Story 5.3).
CREATE POLICY "requests_supplier_update" ON requests
  FOR UPDATE USING (auth.uid() = supplier_id);
