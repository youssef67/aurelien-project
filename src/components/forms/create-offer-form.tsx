'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie']

export function CreateOfferForm() {
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
    },
  })

  // Restaurer brouillon localStorage au mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        form.reset(parsed)
      } catch {
        /* ignore invalid draft */
      }
    }
  }, [form])

  // Sauvegarder brouillon à chaque changement
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Validation par étape avant de passer à la suivante
  async function handleNext() {
    const values = form.getValues()
    const stepSchema = currentStep === 1 ? createOfferStep1Schema : createOfferStep2Schema
    const stepFields =
      currentStep === 1
        ? { name: values.name, promoPrice: values.promoPrice, discountPercent: values.discountPercent }
        : { startDate: values.startDate, endDate: values.endDate, category: values.category }

    const result = stepSchema.safeParse(stepFields)
    if (!result.success) {
      // Trigger validation errors on current step fields
      const fieldNames = Object.keys(stepFields) as (keyof CreateOfferInput)[]
      for (const field of fieldNames) {
        await form.trigger(field)
      }
      return
    }
    setCurrentStep((prev) => prev + 1)
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
        <StepIndicator currentStep={currentStep} totalSteps={2} labels={STEP_LABELS} />

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

          {currentStep < 2 ? (
            <Button type="button" className="flex-1 h-11" onClick={handleNext}>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
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
