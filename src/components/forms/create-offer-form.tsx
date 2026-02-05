'use client'

import { useState, useEffect } from 'react'
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
  createOfferSchema,
  createOfferStep1Schema,
  createOfferStep2Schema,
  OFFER_CATEGORIES,
  OFFER_CATEGORY_LABELS,
  type CreateOfferInput,
} from '@/lib/validations/offers'
import { createOffer } from '@/lib/actions/offers'

const DRAFT_KEY = 'create-offer-draft'
const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie', 'Détails (optionnel)']

interface CreateOfferFormProps {
  supplierId?: string
}

export function CreateOfferForm({ supplierId = '' }: CreateOfferFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      promoPrice: undefined as unknown as number,
      discountPercent: undefined as unknown as number,
      startDate: '',
      endDate: '',
      category: undefined as unknown as (typeof OFFER_CATEGORIES)[number],
      subcategory: '',
      margin: undefined,
      volume: '',
      conditions: '',
      animation: '',
      photoUrl: '',
    },
  })

  // Restaurer brouillon localStorage au mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        // Ne pas restaurer photoUrl (trop volatile)
        delete parsed.photoUrl
        form.reset(parsed)
      } catch {
        /* ignore invalid draft */
      }
    }
  }, [form])

  // Sauvegarder brouillon à chaque changement (sauf photoUrl)
  useEffect(() => {
    const subscription = form.watch((values) => {
      const draftValues = { ...values }
      delete draftValues.photoUrl
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftValues))
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Validation par étape avant de passer à la suivante
  async function handleNext() {
    const values = form.getValues()

    if (currentStep === 1) {
      const stepFields = { name: values.name, promoPrice: values.promoPrice, discountPercent: values.discountPercent }
      const result = createOfferStep1Schema.safeParse(stepFields)
      if (!result.success) {
        const fieldNames = Object.keys(stepFields) as (keyof CreateOfferInput)[]
        for (const field of fieldNames) {
          await form.trigger(field)
        }
        return
      }
    } else if (currentStep === 2) {
      const stepFields = { startDate: values.startDate, endDate: values.endDate, category: values.category }
      const result = createOfferStep2Schema.safeParse(stepFields)
      if (!result.success) {
        const fieldNames = Object.keys(stepFields) as (keyof CreateOfferInput)[]
        for (const field of fieldNames) {
          await form.trigger(field)
        }
        return
      }
    }
    // Step 3 has no blocking validation (all optional)
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  async function onSubmit(data: CreateOfferInput) {
    setIsLoading(true)
    try {
      const result = await createOffer(data)
      if (result.success) {
        localStorage.removeItem(DRAFT_KEY)
        toast.success('Offre publiée !')
        router.push('/dashboard')
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
                    <Input type="date" {...field} />
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
                    Publication...
                  </>
                ) : (
                  "Publier l'offre"
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
                  Publication...
                </>
              ) : (
                "Publier l'offre"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
