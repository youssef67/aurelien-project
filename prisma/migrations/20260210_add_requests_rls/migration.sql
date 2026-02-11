-- Activer RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy : un magasin ne voit que ses propres demandes
CREATE POLICY "requests_store_select" ON requests
  FOR SELECT USING (auth.uid() = store_id);

-- Policy : un magasin ne peut créer que des demandes pour lui-même
CREATE POLICY "requests_store_insert" ON requests
  FOR INSERT WITH CHECK (auth.uid() = store_id);

-- Policy : un fournisseur voit les demandes sur ses offres (prépare Epic 5)
CREATE POLICY "requests_supplier_select" ON requests
  FOR SELECT USING (auth.uid() = supplier_id);
