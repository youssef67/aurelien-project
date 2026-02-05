# Story 2.3: Enrichissement d'Offre (Champs Optionnels)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **fournisseur**,
Je veux **enrichir mon offre avec des informations complémentaires (photo, marge, volume, conditions, animation)**,
Afin d'**augmenter son attractivité auprès des magasins**.

## Acceptance Criteria

### AC1: Étape 3 "Détails" optionnelle accessible après les étapes obligatoires
**Given** je suis sur le formulaire de création d'offre
**When** j'ai complété les champs obligatoires (étapes 1-2)
**Then** une étape 3 "Détails" optionnelle est accessible
**And** le StepIndicator affiche 3 étapes (la 3ème marquée optionnelle)
**And** je peux passer directement à "Publier" sans remplir l'étape 3

### AC2: Champs optionnels de l'étape 3
**Given** je suis à l'étape 3 "Détails"
**When** je remplis les champs optionnels
**Then** je peux saisir une sous-catégorie (texte libre, max 100 caractères)
**And** je peux saisir la marge proposée (décimal %, entre 0.01 et 99.99)
**And** je peux saisir le volume estimé (texte libre: "2 palettes", "50 colis", max 255 caractères)
**And** je peux saisir les conditions commerciales (textarea, max 1000 caractères)
**And** je peux saisir l'animation prévue (textarea: "PLV tête de gondole", max 1000 caractères)

### AC3: Upload photo produit
**Given** je suis à l'étape 3 "Détails"
**When** je clique sur le bouton d'upload photo
**Then** je peux sélectionner une image depuis mon appareil (JPEG, PNG, WebP)
**And** la taille max est 5 MB
**And** l'image est uploadée vers Supabase Storage (bucket `offer-photos`)
**And** un aperçu de l'image s'affiche après upload
**And** une barre de progression s'affiche pendant l'upload
**And** je peux supprimer l'image et en choisir une autre

### AC4: Publication avec champs optionnels
**Given** j'ai rempli des champs optionnels à l'étape 3
**When** je publie l'offre
**Then** tous les champs (obligatoires + optionnels) sont enregistrés
**And** la `photoUrl` est stockée si une image a été uploadée
**And** les champs vides sont sauvegardés comme `null` (pas de string vide)

### AC5: Publication directe depuis l'étape 2 (skip étape 3)
**Given** les étapes 1 et 2 sont complètes
**When** je clique sur "Publier" à l'étape 2
**Then** l'offre est créée avec uniquement les champs obligatoires
**And** les champs optionnels sont `null`
**And** le comportement est identique au flow actuel (toast succès + redirection)

### AC6: Brouillon localStorage étendu
**Given** j'ai saisi des données à l'étape 3
**When** je quitte le formulaire avant de publier
**Then** le brouillon localStorage inclut les champs optionnels
**And** au retour sur `/offers/new`, toutes les données sont restaurées (étapes 1-3)
**And** la photoUrl n'est PAS sauvegardée dans le brouillon (trop volatile)

### AC7: Gestion d'erreur upload photo
**Given** l'upload de la photo échoue
**When** une erreur réseau ou de taille survient
**Then** un toast d'erreur s'affiche avec un message explicite
**And** le formulaire reste utilisable (les autres champs sont préservés)
**And** je peux réessayer l'upload

## Tasks / Subtasks

- [x] **Task 1: Configurer Supabase Storage bucket `offer-photos`** (AC: 3)
  - [x] 1.1 Créer un fichier de migration SQL ou script pour créer le bucket `offer-photos` dans Supabase Storage
  - [x] 1.2 Configurer les policies RLS sur le bucket :
    - INSERT: Seuls les utilisateurs authentifiés dont l'id est dans `suppliers` peuvent upload
    - SELECT: Tout le monde peut lire (photos publiques)
    - DELETE: Seul le propriétaire du fichier peut supprimer
  - [x] 1.3 Configurer les limites : 5 MB max, types MIME autorisés (image/jpeg, image/png, image/webp)
  - [x] 1.4 Organiser le stockage : path `{supplier_id}/{offer_id}/{filename}` pour isolation

- [x] **Task 2: Créer le composant PhotoUpload** (AC: 3, 7)
  - [x] 2.1 Créer `/src/components/custom/photo-upload.tsx` avec `'use client'`
  - [x] 2.2 Props: `value?: string` (URL photo existante), `onChange: (url: string | null) => void`, `supplierId: string`
  - [x] 2.3 Zone de drop/click avec icône Camera (lucide-react) et texte "Ajouter une photo"
  - [x] 2.4 Validation client: taille < 5 MB, type MIME image/jpeg|png|webp
  - [x] 2.5 Upload vers Supabase Storage via `createClient()` (client-side) → `supabase.storage.from('offer-photos').upload()`
  - [x] 2.6 Barre de progression pendant l'upload (état loading avec pourcentage si possible, sinon spinner)
  - [x] 2.7 Aperçu de l'image avec `next/image` ou `<img>` après upload réussi
  - [x] 2.8 Bouton "Supprimer" pour retirer la photo → supprime de Supabase Storage + appelle `onChange(null)`
  - [x] 2.9 Gestion d'erreur: toast.error avec message approprié ("Fichier trop volumineux", "Format non supporté", "Erreur réseau")
  - [x] 2.10 Accessibilité: `aria-label` sur zone upload, alt text sur aperçu

- [x] **Task 3: Étendre les schémas Zod pour l'étape 3** (AC: 2, 4)
  - [x] 3.1 Dans `/src/lib/validations/offers.ts`, ajouter `createOfferStep3Schema` avec tous les champs optionnels
  - [x] 3.2 Schema step 3: `subcategory` (string optionnel max 100), `margin` (number optionnel 0.01-99.99), `volume` (string optionnel max 255), `conditions` (string optionnel max 1000), `animation` (string optionnel max 1000), `photoUrl` (string optionnel URL)
  - [x] 3.3 Mettre à jour `createOfferSchema` pour merger step1 + step2 + step3 (les champs step3 restent optionnels)
  - [x] 3.4 Exporter `CreateOfferStep3Input` type
  - [x] 3.5 Mettre à jour `CreateOfferInput` pour inclure les champs optionnels

- [x] **Task 4: Mettre à jour la Server Action `createOffer`** (AC: 4, 5)
  - [x] 4.1 Dans `/src/lib/actions/offers.ts`, mettre à jour le schéma de validation pour accepter les champs optionnels
  - [x] 4.2 Destructurer les champs optionnels : `subcategory, margin, volume, conditions, animation, photoUrl`
  - [x] 4.3 Passer les champs optionnels à `prisma.offer.create()` — `undefined` si non fourni (Prisma traite comme null)
  - [x] 4.4 Garder la même signature retour `ActionResult<{ offerId: string }>`
  - [x] 4.5 NE PAS casser le flow existant (publier sans step 3 doit toujours fonctionner)

- [x] **Task 5: Mettre à jour le formulaire CreateOfferForm** (AC: 1, 2, 3, 5, 6)
  - [x] 5.1 Dans `/src/components/forms/create-offer-form.tsx`, passer le StepIndicator de 2 à 3 étapes avec labels `['Produit & Prix', 'Dates & Catégorie', 'Détails (optionnel)']`
  - [x] 5.2 Sur l'étape 2, remplacer le bouton "Publier" par DEUX boutons : "Publier l'offre" (variant outline) et "Enrichir >" (variant default)
  - [x] 5.3 Ajouter l'étape 3 avec les FormField pour: subcategory (Input), margin (Input type number step 0.01), volume (Input), conditions (Textarea), animation (Textarea)
  - [x] 5.4 Intégrer le composant `PhotoUpload` dans l'étape 3
  - [x] 5.5 Sur l'étape 3, boutons: "Retour" (outline) et "Publier l'offre" (default)
  - [x] 5.6 Mettre à jour `defaultValues` pour inclure les champs optionnels (tous `undefined` ou `''`)
  - [x] 5.7 Mettre à jour le resolver pour utiliser le nouveau `createOfferSchema` étendu
  - [x] 5.8 Mettre à jour le brouillon localStorage pour inclure les champs step 3 SAUF `photoUrl`
  - [x] 5.9 Navigation: `handleNext` doit gérer step 2→3 correctement (step 3 n'a pas de validation bloquante car tout est optionnel)
  - [x] 5.10 Passer le `supplierId` au composant `PhotoUpload` — récupérer via un hook `useAuth` ou via le contexte Supabase

- [x] **Task 6: Créer la Server Action `uploadOfferPhoto`** (AC: 3, 7)
  - [x] 6.1 Créer une action dans `/src/lib/actions/offers.ts` pour upload photo OU faire l'upload côté client via Supabase SDK
  - [x] 6.2 **Décision recommandée: Upload côté client** — la RLS sur le bucket gère la sécurité, pas besoin de server action
  - [x] 6.3 Créer une fonction utilitaire `uploadOfferPhoto(file: File, supplierId: string): Promise<string>` dans `/src/lib/supabase/storage.ts`
  - [x] 6.4 Créer `deleteOfferPhoto(photoUrl: string): Promise<void>` dans le même fichier
  - [x] 6.5 Générer un nom de fichier unique: `{supplierId}/{uuid}.{extension}`
  - [x] 6.6 Retourner l'URL publique via `supabase.storage.from('offer-photos').getPublicUrl()`

- [x] **Task 7: Tests** (AC: 1-7)
  - [x] 7.1 Mettre à jour `/src/lib/validations/offers.test.ts` — tests des champs optionnels step 3
  - [x] 7.2 Mettre à jour `/src/lib/actions/offers.test.ts` — tests server action avec champs optionnels
  - [x] 7.3 Créer `/src/components/custom/photo-upload.test.tsx` — tests du composant upload
  - [x] 7.4 Mettre à jour `/src/components/forms/create-offer-form.test.tsx` — tests step 3, skip step 3, photo upload
  - [x] 7.5 Créer `/src/lib/supabase/storage.test.ts` — tests upload/delete functions
  - [x] 7.6 Tous les tests passent
  - [x] 7.7 `npm run build` passe
  - [x] 7.8 `npm run lint` passe

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- `ActionResult<T>` pour toutes les Server Actions [Source: architecture.md#Format Patterns]
- Validation Zod côté client ET serveur [Source: architecture.md#Process Patterns]
- `supplierId` TOUJOURS depuis `auth.uid()`, JAMAIS depuis le formulaire [Source: architecture.md#Authentication & Security]
- Fichiers en `kebab-case` [Source: architecture.md#Naming Patterns]
- Composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts` [Source: architecture.md#Structure Patterns]
- `"use client"` seulement si nécessaire (composants interactifs = oui) [Source: project-context.md#Next.js Rules]

### Schéma Zod — Extension avec champs optionnels

```typescript
// src/lib/validations/offers.ts — AJOUTS pour Step 3

const SUBCATEGORY_MAX = 100
const VOLUME_MAX = 255
const TEXT_FIELD_MAX = 1000
const MARGIN_MIN = 0.01
const MARGIN_MAX = 99.99

// Étape 3: Détails (optionnel)
export const createOfferStep3Schema = z.object({
  subcategory: z
    .string()
    .max(SUBCATEGORY_MAX, `La sous-catégorie ne peut pas dépasser ${SUBCATEGORY_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  margin: z
    .number()
    .min(MARGIN_MIN, `La marge doit être d'au moins ${MARGIN_MIN}%`)
    .max(MARGIN_MAX, `La marge ne peut pas dépasser ${MARGIN_MAX}%`)
    .multipleOf(0.01, 'La marge doit avoir maximum 2 décimales')
    .optional()
    .nullable(),
  volume: z
    .string()
    .max(VOLUME_MAX, `Le volume ne peut pas dépasser ${VOLUME_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  conditions: z
    .string()
    .max(TEXT_FIELD_MAX, `Les conditions ne peuvent pas dépasser ${TEXT_FIELD_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  animation: z
    .string()
    .max(TEXT_FIELD_MAX, `L'animation ne peut pas dépasser ${TEXT_FIELD_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
})

// Mettre à jour createOfferSchema:
export const createOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .merge(createOfferStep3Schema)
  .refine(/* ... existing refinements ... */)

export type CreateOfferStep3Input = z.infer<typeof createOfferStep3Schema>
// CreateOfferInput sera automatiquement mis à jour par l'inférence
```

**ATTENTION:** Les champs optionnels vides (string vide `''`) doivent être transformés en `null`/`undefined` avant l'envoi au serveur. Utiliser `.transform()` ou nettoyage dans la Server Action. Prisma traite `undefined` comme "ne pas inclure le champ".

### Server Action — Extension createOffer

```typescript
// src/lib/actions/offers.ts — MODIFICATIONS

export async function createOffer(
  input: CreateOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // ... validation + auth check existants ...

  // 4. Créer l'offre avec champs optionnels
  const {
    name, promoPrice, discountPercent, startDate, endDate, category,
    subcategory, margin, volume, conditions, animation, photoUrl,
  } = validated.data

  const offer = await prisma.offer.create({
    data: {
      supplierId: user.id,
      name,
      promoPrice,
      discountPercent,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      category,
      status: 'ACTIVE',
      // Champs optionnels — transformer '' en undefined pour que Prisma les ignore
      subcategory: subcategory || undefined,
      margin: margin ?? undefined,
      volume: volume || undefined,
      conditions: conditions || undefined,
      animation: animation || undefined,
      photoUrl: photoUrl || undefined,
    },
  })
  // ... suite existante ...
}
```

### Composant PhotoUpload — Structure

```typescript
// src/components/custom/photo-upload.tsx
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
  supplierId: string
}

export function PhotoUpload({ value, onChange, supplierId }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation client
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier est trop volumineux (max 5 MB)')
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPEG, PNG ou WebP')
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
      // Reset input pour permettre re-upload du même fichier
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!value) return
    try {
      await deleteOfferPhoto(value)
      onChange(null)
    } catch {
      toast.error('Erreur lors de la suppression de la photo')
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        // Aperçu photo
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img src={value} alt="Photo du produit" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={handleDelete}
            aria-label="Supprimer la photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Zone d'upload
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed',
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
```

### Utilitaires Supabase Storage

```typescript
// src/lib/supabase/storage.ts
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
  // Extraire le path depuis l'URL publique
  const url = new URL(photoUrl)
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
  const filePath = pathParts[1]

  if (!filePath) throw new Error('Invalid photo URL')

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
  if (error) throw error
}
```

### Formulaire CreateOfferForm — Modifications clés

```typescript
// Points de modification dans create-offer-form.tsx:

// 1. Step labels
const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie', 'Détails (optionnel)']

// 2. StepIndicator totalSteps
<StepIndicator currentStep={currentStep} totalSteps={3} labels={STEP_LABELS} />

// 3. Boutons étape 2: ajouter option "Enrichir"
{currentStep === 2 && (
  <div className="flex gap-3">
    <Button type="button" variant="outline" className="flex-1 h-11"
      onClick={() => setCurrentStep(1)}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Retour
    </Button>
    <Button type="submit" variant="outline" className="flex-1 h-11" disabled={isLoading}>
      Publier
    </Button>
    <Button type="button" className="flex-1 h-11" onClick={handleNext}>
      Enrichir <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
)}

// 4. Étape 3: champs optionnels + PhotoUpload
{currentStep === 3 && (
  <div className="space-y-4">
    <PhotoUpload value={form.watch('photoUrl')} onChange={(url) => form.setValue('photoUrl', url ?? '')} supplierId={supplierId} />
    {/* subcategory Input, margin Input number, volume Input, conditions Textarea, animation Textarea */}
  </div>
)}

// 5. handleNext: step 2→3 ne nécessite pas de validation step3 (tout est optionnel)
```

**CRITIQUE: Récupération du supplierId pour PhotoUpload**
Le composant `CreateOfferForm` est côté client. Il a besoin du `supplierId` pour organiser les fichiers dans le Storage. Options:
1. **Passer en prop depuis la page** — la page server component peut récupérer l'user id via Supabase
2. **Utiliser `useAuth` hook client** — lire depuis Supabase client SDK
Option 2 est plus simple car elle ne nécessite pas de modifier la page. Utiliser `createClient()` côté client pour `supabase.auth.getUser()`.

### Supabase Storage — Setup du bucket

Le bucket `offer-photos` doit être créé dans le dashboard Supabase ou via SQL:

```sql
-- Créer le bucket (via Supabase Dashboard > Storage ou SQL)
INSERT INTO storage.buckets (id, name, public) VALUES ('offer-photos', 'offer-photos', true);

-- Policies RLS sur le bucket
-- 1. Tout le monde peut lire (photos publiques)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'offer-photos');

-- 2. Les fournisseurs authentifiés peuvent upload dans leur dossier
CREATE POLICY "Suppliers can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'offer-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Les fournisseurs peuvent supprimer leurs propres photos
CREATE POLICY "Suppliers can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'offer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**IMPORTANT:** Configurer les limites dans le dashboard Supabase :
- File size limit: 5 MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### Project Structure Notes

**Fichiers à créer:**
- `/src/components/custom/photo-upload.tsx` — Composant upload photo
- `/src/components/custom/photo-upload.test.tsx` — Tests composant upload
- `/src/lib/supabase/storage.ts` — Utilitaires Storage (upload/delete)
- `/src/lib/supabase/storage.test.ts` — Tests utilitaires Storage

**Fichiers à modifier:**
- `/src/lib/validations/offers.ts` — Ajouter step 3 schema + merger
- `/src/lib/validations/offers.test.ts` — Ajouter tests step 3
- `/src/lib/actions/offers.ts` — Accepter champs optionnels
- `/src/lib/actions/offers.test.ts` — Tester champs optionnels
- `/src/components/forms/create-offer-form.tsx` — Ajouter étape 3 + PhotoUpload
- `/src/components/forms/create-offer-form.test.tsx` — Tests étape 3

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/lib/supabase/server.ts` → `createClient()` (server)
- `/src/lib/supabase/client.ts` → `createClient()` (client)
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/types/api.ts` → `ActionResult`, `ErrorCode`
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/components/ui/form.tsx` → Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- `/src/components/ui/input.tsx` → Input
- `/src/components/ui/textarea.tsx` → Textarea (shadcn/ui, DEJA INSTALLE)
- `/src/components/ui/select.tsx` → Select
- `/src/components/ui/button.tsx` → Button
- `/src/components/custom/step-indicator.tsx` → StepIndicator (supporte N étapes)
- `/src/components/layout/page-header.tsx` → PageHeader

### Previous Story Intelligence

**Story 2.2 — Learnings critiques:**
- Formulaire en 2 étapes avec React Hook Form + Zod fonctionne parfaitement
- `CreateOfferForm` utilise `zodResolver(createOfferSchema)` avec `mode: 'onChange'`
- Brouillon localStorage avec `DRAFT_KEY = 'create-offer-draft'` — watch + save à chaque changement
- `handleNext()` valide par étape avant de permettre la progression
- Le StepIndicator accepte `totalSteps` et `labels[]` dynamiquement — passer de 2 à 3 étapes est trivial
- Zod 4 API: utiliser `error: string` au lieu de `invalid_type_error` / `errorMap`
- Radix Select jsdom polyfill dans `vitest.setup.ts` — les polyfills sont déjà en place
- Boutons `h-11` (44px) pour les touch targets mobile — GARDER cette convention
- `revalidatePath('/dashboard')` et `revalidatePath('/offers')` dans la server action

**Story 2.2 — Code review issues (FIXÉES):**
- Select controlled warning → utiliser `value={field.value ?? ""}` sur Select
- `console.error` restauré dans la server action (ne pas supprimer)
- `revalidatePath` ajouté après succès

**Issue H3 de la code review (Story 2.1) — TOUJOURS en vigueur:**
- RLS policies potentiellement contournées par Prisma (DATABASE_URL = service role)
- **Le contrôle d'accès applicatif (vérification `supplier.id === user.id`) EST la vraie barrière**
- Pour le storage: les RLS fonctionnent car on utilise l'anon key côté client

### Git Intelligence

**Commits récents:**
```
4630284 feat: Création offre champs obligatoires avec formulaire en étapes (Story 2.2)
4a05a76 feat: Schema offres, RLS policies et page liste vide avec dashboard fournisseur (Story 2.1)
```

**Pattern de commit à suivre:**
```
feat: Enrichissement offre champs optionnels avec upload photo (Story 2.3)
```

**Fichiers modifiés dans Story 2.2 (à ne pas casser):**
- `src/lib/validations/offers.ts` — MODIFIER (étendre, pas remplacer)
- `src/lib/actions/offers.ts` — MODIFIER (étendre, pas remplacer)
- `src/components/forms/create-offer-form.tsx` — MODIFIER (ajouter step 3)
- `src/components/custom/step-indicator.tsx` — NE PAS MODIFIER (déjà flexible)
- `vitest.setup.ts` — NE PAS MODIFIER (polyfills déjà en place)

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `react-hook-form@^7.71.1` — Gestion d'état du formulaire
- `@hookform/resolvers@^5.2.2` — Intégration Zod
- `zod@^4.3.6` — Validation
- `sonner@^2.0.7` — Toast (`import { toast } from 'sonner'`)
- `lucide-react@^0.563.0` — Icônes (Camera, X, Loader2 disponibles)
- `@prisma/client@^6.19.2` — ORM
- `next@16.1.6` — Framework
- `@supabase/supabase-js@^2.94.0` — Client Supabase (inclut Storage SDK)
- `@supabase/ssr@^0.8.0` — SSR support

**Composants shadcn/ui disponibles:**
Form, Input, **Textarea**, Select, Button, Label, Card, Badge, Sheet, Tabs, Dialog, Skeleton, Alert, Avatar

**Aucune nouvelle dépendance requise.** Le `@supabase/supabase-js` inclut déjà le module Storage.

### Testing Requirements

**Validation tests (`offers.test.ts` — AJOUTS):**
- Step 3 schema: subcategory max 100, margin 0.01-99.99, volume max 255, conditions/animation max 1000
- Step 3 schema: tous les champs optionnels → valide quand tous vides
- Schema complet: step1 + step2 obligatoires, step3 optionnel → valide sans step3
- Schema complet: step1 + step2 + step3 rempli → valide avec step3

**Server action tests (`offers.test.ts` — AJOUTS):**
- Créer offre avec champs optionnels → success, champs sauvegardés
- Créer offre sans champs optionnels → success, champs null (backward compatibility)
- Champs optionnels vides (string `''`) → transformés en null/undefined
- PhotoUrl optionnelle → sauvegardée si fournie

**Composant tests (`photo-upload.test.tsx` — NOUVEAU):**
- Rendu zone upload (pas de photo)
- Rendu aperçu (photo existante)
- Clic sur zone → ouvre file picker
- Fichier trop volumineux → toast erreur
- Format non supporté → toast erreur
- Upload réussi → aperçu affiché + onChange appelé
- Supprimer photo → deleteOfferPhoto appelé + onChange(null)
- État loading pendant upload

**Form tests (`create-offer-form.test.tsx` — AJOUTS):**
- StepIndicator affiche 3 étapes
- Étape 2: bouton "Enrichir" → navigue à étape 3
- Étape 2: bouton "Publier" → soumet sans step 3
- Étape 3: affiche les champs optionnels
- Étape 3: retour → revient à étape 2
- Étape 3: publier → soumet avec champs optionnels
- Brouillon restaure champs step 3 (sauf photoUrl)

**Storage tests (`storage.test.ts` — NOUVEAU):**
- `uploadOfferPhoto`: mock Supabase → retourne URL publique
- `deleteOfferPhoto`: mock Supabase → suppression OK
- `uploadOfferPhoto`: erreur upload → throw
- `deleteOfferPhoto`: URL invalide → throw

**Pattern de test — identique Story 2.2:**
- `@testing-library/react` + `vitest`
- Mock des fonctions Supabase Storage
- Mock `createClient` pour les tests Storage
- `screen.getByLabelText()` / `screen.getByRole()`
- `userEvent.type()` / `userEvent.click()`
- `waitFor()` pour les assertions async

### UX Considerations

**Formulaire en 3 étapes (UX Spec):**
- StepIndicator avec 3 étapes, la 3ème marquée "(optionnel)" [Source: ux-design-specification.md#StepIndicator]
- Step 3 est une porte d'enrichissement, PAS une obligation
- Le parcours critique (publier rapidement) reste en 2 étapes

**Photo upload (UX Spec):**
- "Photo en 1 tap" — zone de clic large, pas de processus complexe [Source: ux-design-specification.md#Effortless Interactions]
- Barre de progression pendant l'upload [Source: ux-design-specification.md#Loading Feedback]
- Aperçu immédiat après upload [Source: ux-design-specification.md#Success Feedback]
- Touch targets 44x44px sur le bouton supprimer

**Champs optionnels:**
- Textarea pour conditions et animation — auto-resize si possible
- Margin: afficher le symbole % à côté du champ
- Volume: placeholder "Ex: 2 palettes, 50 colis"
- Conditions: placeholder "Ex: Franco à partir de 500€"
- Animation: placeholder "Ex: PLV tête de gondole fournie"

**Touch targets:**
- Boutons `h-11` (44px minimum) [Source: ux-design-specification.md#Touch targets]
- Zone de drop photo large (aspect-video = 16:9)

### Security Considerations

- **Upload photo côté client** : RLS sur le bucket Supabase gère la sécurité
- **Path avec supplierId** : Le fichier est uploadé dans `{auth.uid()}/...` — la policy RLS vérifie que le dossier correspond au user
- **Pas de supplierId dans le formulaire** : Le PhotoUpload utilise l'id de l'utilisateur authentifié
- **Validation MIME type** : Côté client (UX) + côté Supabase Storage (sécurité)
- **Taille fichier** : Limite 5 MB côté client + côté Supabase Storage
- **Server Action** : Toujours vérifier que le user est un fournisseur avant de créer (existant)
- **CRITIQUE:** Ne JAMAIS accepter de `supplierId` depuis l'input du formulaire

### Prisma Schema — Rappel (AUCUNE modification nécessaire)

Le schéma `Offer` dans `prisma/schema.prisma` a DEJA tous les champs optionnels :
```prisma
subcategory     String?
photoUrl        String?       @map("photo_url")
margin          Decimal?      @db.Decimal(5, 2)
volume          String?
conditions      String?       @db.Text
animation       String?       @db.Text
```
**Aucune migration Prisma n'est nécessaire pour cette story.**

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Enrichissement d'Offre (Champs Optionnels)]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Loading Feedback]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/prd.md#FR7 - Enrichissement offre champs optionnels]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/project-context.md#Security Rules]
- [Source: _bmad-output/implementation-artifacts/2-2-creation-offre-champs-obligatoires.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Photo upload test: `userEvent.upload` respects `accept` attribute — fixed by using `dispatchEvent` directly for MIME type validation test

### Completion Notes List

- Task 1: SQL migration for Supabase Storage bucket `offer-photos` with RLS policies (public read, supplier upload/delete by folder), 5MB limit, JPEG/PNG/WebP only
- Task 2: PhotoUpload component with click-to-upload, client-side validation (size/MIME), loading spinner, image preview, delete button, accessibility labels. 12 tests.
- Task 3: `createOfferStep3Schema` with all optional fields (subcategory, margin, volume, conditions, animation, photoUrl). Merged into `createOfferSchema`. 20 new tests (50 total).
- Task 4: Server Action `createOffer` extended to accept optional fields. Empty strings transformed to `undefined` for Prisma. 3 new tests (12 total).
- Task 5: Form updated to 3 steps. Step 2 has "Publier" + "Enrichir" buttons. Step 3 has all optional fields + PhotoUpload. localStorage draft excludes photoUrl. supplierId from Supabase auth client. 7 new tests (22 total).
- Task 6: `uploadOfferPhoto` and `deleteOfferPhoto` utilities in `src/lib/supabase/storage.ts`. Client-side upload using Supabase SDK with RLS for security. 6 tests.
- Task 7: All 325 tests pass. Build OK. Lint clean (0 errors, 0 warnings).

### Change Log

- 2026-02-05: Implemented Story 2.3 — Enrichissement offre champs optionnels avec upload photo
- 2026-02-05: Code Review fixes — Suppression fichiers hors scope (offers/[id]), ajout 2 tests manquants (step 3 submit + draft restore), fix touch target delete button 44px, ajout guard handleNext, mise à jour File List

### Known Limitations

- **Storage path format**: Le path utilise `{supplier_id}/{uuid}.{ext}` au lieu de `{supplier_id}/{offer_id}/{filename}` car l'offre n'existe pas encore au moment de l'upload. La RLS sécurise l'isolation par supplier.
- **Photos orphelines**: Si un utilisateur upload une photo puis abandonne le formulaire, la photo reste dans Supabase Storage. Un job de nettoyage (CRON) pourrait être ajouté dans une future story d'infrastructure.

### File List

**New files:**
- `prisma/migrations/20260205_add_offer_photos_storage/migration.sql` — Storage bucket + RLS policies
- `src/components/custom/photo-upload.tsx` — PhotoUpload component
- `src/components/custom/photo-upload.test.tsx` — PhotoUpload tests (12)
- `src/lib/supabase/storage.ts` — Upload/delete utility functions
- `src/lib/supabase/storage.test.ts` — Storage utility tests (6)

**Modified files:**
- `src/app/(supplier)/offers/new/page.tsx` — Pass `supplierId` prop to CreateOfferForm
- `src/lib/validations/offers.ts` — Added `createOfferStep3Schema` + merged schema
- `src/lib/validations/offers.test.ts` — Added step 3 + combined schema tests (20 new)
- `src/lib/actions/offers.ts` — Extended `createOffer` for optional fields
- `src/lib/actions/offers.test.ts` — Added optional fields tests (3 new)
- `src/components/forms/create-offer-form.tsx` — Added step 3, Enrichir button, PhotoUpload integration, handleNext guard
- `src/components/forms/create-offer-form.test.tsx` — Added step 3 tests (9 new: navigation, rendering, submission, draft restore)

**Tracking files:**
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status → review
- `_bmad-output/implementation-artifacts/2-3-enrichissement-offre-champs-optionnels.md` — Tasks marked [x], status → review
