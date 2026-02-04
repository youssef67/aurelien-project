/**
 * Store Route Group Layout
 *
 * This layout wraps all store-specific routes.
 * Currently a pass-through - MobileLayout with bottom nav is handled per-page.
 *
 * Future enhancements (Story 1.5+):
 * - Role-based access control (verify user is store)
 * - Store-specific navigation
 * - Store context provider
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
