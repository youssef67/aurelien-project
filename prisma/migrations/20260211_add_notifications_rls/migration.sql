-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : un utilisateur ne voit que ses propres notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy UPDATE : un utilisateur peut marquer ses notifications comme lues (colonne read uniquement)
CREATE POLICY "Users can mark own notifications as read"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy INSERT : seul le service role peut créer des notifications
CREATE POLICY "Service role can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role');
