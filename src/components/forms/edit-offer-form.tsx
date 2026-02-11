'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepIndicator } from '@/components/custom/step-indicator'
import { PhotoUpload } from '@/components/custom/photo-upload'
import {
  updateOfferSchema,
  createOfferStep1Schema,
  createOfferStep2Schema,
  OFFER_CATEGORIES,
  OFFER_CATEGORY_LABELS,
  type UpdateOfferInput,
} from '@/lib/validations/offers'
import { updateOffer } from '@/lib/actions/offers'
import type { SerializedOffer } from '@/lib/utils/offers'

const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie', 'Détails (optionnel)']

interface EditOfferFormProps {
  offer: SerializedOffer
  supplierId: string
}

export function EditOfferForm({ offer, supplierId }: EditOfferFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Déterminer si la date de début est passée (offre en cours)
  const todayString = new Date().toISOString().split('T')[0]
  const isStartDatePast = new Date(offer.startDate) < new Date(todayString)

  const form = useForm<UpdateOfferInput>({
    resolver: zodResolver(updateOfferSchema),
    mode: 'onChange',
    defaultValues: {
      id: offer.id,
      name: offer.name,
      promoPrice: offer.promoPrice,
      discountPercent: offer.discountPercent,
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      category: offer.category as UpdateOfferInput['category'],
      subcategory: offer.subcategory ?? '',
      margin: offer.margin ?? undefined,
      volume: offer.volume ?? '',
      conditions: offer.conditions ?? '',
      animation: offer.animation ?? '',
      photoUrl: offer.photoUrl ?? '',
    },
  })

  // Validation par étape avant de passer à la suivante
  async function handleNext() {
    const values = form.getValues()

    if (currentStep === 1) {
      const stepFields = { name: values.name, promoPrice: values.promoPrice, discountPercent: values.discountPercent }
      const result = createOfferStep1Schema.safeParse(stepFields)
      if (!result.success) {
        const fieldNames = Object.keys(stepFields) as (keyof UpdateOfferInput)[]
        for (const field of fieldNames) {
          await form.trigger(field)
        }
        return
      }
    } else if (currentStep === 2) {
      const stepFields = { startDate: values.startDate, endDate: values.endDate, category: values.category }
      const result = createOfferStep2Schema.safeParse(stepFields)
      if (!result.success) {
        const fieldNames = Object.keys(stepFields) as (keyof UpdateOfferInput)[]
        for (const field of fieldNames) {
          await form.trigger(field)
        }
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  async function onSubmit(data: UpdateOfferInput) {
    setIsLoading(true)
    try {
      const result = await updateOffer(data)
      if (result.success) {
        toast.success('Offre modifiée')
        router.push(`/my-offers/${offer.id}`)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <StepIndicator currentStep={currentStep} totalSteps={3} labels={STEP_LABELS} />

        {/* Étape 1: Produit & Prix */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nutella 1kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promoPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix promo (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="12.99"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remise (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      placeholder="25"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Étape 2: Dates & Catégorie */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isStartDatePast} min={!isStartDatePast ? todayString : undefined} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OFFER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {OFFER_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Étape 3: Détails (optionnel) */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <PhotoUpload
              value={form.watch('photoUrl') || null}
              onChange={(url) => form.setValue('photoUrl', url ?? '')}
              onDelete={async () => { /* Déféré: suppression gérée côté serveur au submit */ }}
              supplierId={supplierId}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sous-catégorie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bio, Sans gluten" maxLength={100} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marge proposée (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="99.99"
                      placeholder="15.50"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume estimé</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2 palettes, 50 colis" maxLength={255} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions commerciales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Franco à partir de 500€"
                      maxLength={1000}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="animation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animation prévue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: PLV tête de gondole fournie"
                      maxLength={1000}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          )}

          {currentStep === 1 && (
            <Button type="button" className="flex-1 h-11" onClick={handleNext}>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === 2 && (
            <>
              <Button type="submit" variant="outline" className="flex-1 h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
              <Button type="button" className="flex-1 h-11" onClick={handleNext}>
                Enrichir
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
