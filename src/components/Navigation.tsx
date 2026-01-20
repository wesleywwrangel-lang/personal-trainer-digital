'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/workout', label: 'Treino', icon: Dumbbell },
  { href: '/nutrition', label: 'Alimentação', icon: Utensils },
  { href: '/progress', label: 'Progresso', icon: TrendingUp },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:bottom-auto md:border-t-0 md:border-b md:border-gray-200">
      <div className="flex justify-around md:justify-start md:space-x-8 md:px-6 md:py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors md:flex-row md:space-x-2 md:py-2 md:px-4',
                isActive
                  ? 'text-blue-600 bg-blue-50 md:bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 md:hover:bg-gray-50'
              )}
            >
              <Icon className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}