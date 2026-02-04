/**
 * Supplier Route Group Layout
 *
 * This layout wraps all supplier-specific routes.
 * Currently a pass-through - MobileLayout with bottom nav is handled per-page.
 *
 * Future enhancements (Story 1.4+):
 * - Role-based access control (verify user is supplier)
 * - Supplier-specific navigation
 * - Supplier context provider
 */
export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
