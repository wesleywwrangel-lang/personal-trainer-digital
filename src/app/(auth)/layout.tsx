import { Navigation } from '@/components/Navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <main className="pb-16 md:pb-0 md:pl-0">
        {children}
      </main>
      <Navigation />
    </div>
  )
}