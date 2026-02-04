import { z } from 'zod'

// Constantes de validation
const MIN_PASSWORD_LENGTH = 8
const MIN_COMPANY_NAME_LENGTH = 2
const MAX_COMPANY_NAME_LENGTH = 100
const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 100
const MIN_CITY_LENGTH = 2
const MAX_CITY_LENGTH = 100

// Regex pour téléphone français (formats: 0612345678, 06 12 34 56 78, +33612345678)
const phoneRegex = /^(?:(?:\+33|0)[1-9])(?:[\s]?[0-9]{2}){4}$/

// ============================================
// Store Registration Schemas
// ============================================

// Enum pour les enseignes
export const BrandEnum = z.enum(['LECLERC', 'INTERMARCHE', 'SUPER_U', 'SYSTEME_U'])
export type BrandType = z.infer<typeof BrandEnum>

// Labels pour l'affichage dans le dropdown
export const BRAND_LABELS: Record<BrandType, string> = {
  LECLERC: 'Leclerc',
  INTERMARCHE: 'Intermarché',
  SUPER_U: 'Super U',
  SYSTEME_U: 'Système U',
}

// Schéma de base pour les champs communs Store
const baseStoreSchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, `Le nom du magasin doit contenir au moins ${MIN_NAME_LENGTH} caractères`)
    .max(MAX_NAME_LENGTH, `Le nom du magasin ne peut pas dépasser ${MAX_NAME_LENGTH} caractères`),
  brand: BrandEnum,
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  city: z
    .string()
    .min(MIN_CITY_LENGTH, `La ville doit contenir au moins ${MIN_CITY_LENGTH} caractères`)
    .max(MAX_CITY_LENGTH, `La ville ne peut pas dépasser ${MAX_CITY_LENGTH} caractères`),
  phone: z
    .string()
    .regex(phoneRegex, 'Veuillez entrer un numéro de téléphone valide')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`),
})

// Schéma client avec confirmation mot de passe
export const registerStoreSchema = baseStoreSchema
  .extend({
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterStoreInput = z.infer<typeof registerStoreSchema>

// Version serveur sans confirmPassword (pour la Server Action)
export const registerStoreServerSchema = baseStoreSchema

export type RegisterStoreServerInput = z.infer<typeof registerStoreServerSchema>

// Schéma de base pour les champs communs
const baseSupplierSchema = z.object({
  companyName: z
    .string()
    .min(MIN_COMPANY_NAME_LENGTH, `Le nom de l'entreprise doit contenir au moins ${MIN_COMPANY_NAME_LENGTH} caractères`)
    .max(MAX_COMPANY_NAME_LENGTH, `Le nom de l'entreprise ne peut pas dépasser ${MAX_COMPANY_NAME_LENGTH} caractères`),
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .regex(phoneRegex, 'Veuillez entrer un numéro de téléphone valide')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`),
})

// Schéma client avec confirmation mot de passe
export const registerSupplierSchema = baseSupplierSchema
  .extend({
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterSupplierInput = z.infer<typeof registerSupplierSchema>

// Version serveur sans confirmPassword (pour la Server Action)
export const registerSupplierServerSchema = baseSupplierSchema

export type RegisterSupplierServerInput = z.infer<typeof registerSupplierServerSchema>

// ============================================
// Login Schema
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
})

export type LoginInput = z.infer<typeof loginSchema>
