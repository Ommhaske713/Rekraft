"use client"

import Link from "next/link"
import { Menu, X, Search } from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Marketplace", href: "/products" },
  { label: "Sell with us", href: "/seller-form" },
  { label: "Dashboard", href: "/customer-dashboard" },
  { label: "Contact", href: "mailto:hello@rekraftt.com", external: true }
]

type MobileMenuProps = {
  onLogout?: () => void
}

export default function MobileMenu({ onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="md:hidden">
      <button
        className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-blue-600 focus:outline-none shadow-sm"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl animate-in slide-in-from-top-2 z-50">
          <div className="px-4 py-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search materials..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
            {onLogout && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    onLogout()
                    setIsOpen(false)
                  }}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

