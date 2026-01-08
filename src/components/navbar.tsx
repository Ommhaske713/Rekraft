"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag, 
  User, 
  LogOut, 
  ArrowLeft,
  Hammer, 
  PlusCircle, 
  Package,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type NavbarProps = {
  hideSearch?: boolean
  hideAuthCtas?: boolean
  showBackButton?: boolean
}

export default function Navbar({
  hideSearch = false,
  hideAuthCtas = false,
  showBackButton = false,
}: NavbarProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileProfileOpen(false)
    }
  }, [isMobileMenuOpen])

  const handleAvatarClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileProfileOpen((prev) => !prev)
    }
  }

  const startNavigation = () => {
    setIsNavigating(true)
    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current)
    }
    navigationTimerRef.current = window.setTimeout(() => {
      setIsNavigating(false)
      navigationTimerRef.current = null
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current)
      }
    }
  }, [])

  const isSeller = session?.user?.role === "seller"
  const profileDestination = isSeller ? "/seller-dashboard" : "/customer-dashboard"

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" })
      if (!res.ok) {
        setCartItemCount(0)
        return
      }

      const data: unknown = await res.json()
      const items =
        typeof data === "object" && data !== null && "items" in data && Array.isArray((data as Record<string, unknown>).items)
          ? ((data as Record<string, unknown>).items as Array<{ quantity?: unknown }> )
          : []

      const count = items.reduce((sum, item) => {
        const qty = typeof item.quantity === "number" ? item.quantity : 0
        return sum + qty
      }, 0)

      setCartItemCount(count)
    } catch {
      setCartItemCount(0)
    }
  }

  useEffect(() => {
    fetchCartCount()
  }, [pathname])

  useEffect(() => {
    const handler = () => {
      fetchCartCount()
    }
    window.addEventListener("cart:updated", handler)
    return () => window.removeEventListener("cart:updated", handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      startNavigation()
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setIsMobileMenuOpen(false)
    }
  }

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        {showBackButton && (
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group" onClick={startNavigation}>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #2563eb)',
            }}
          >
            <Hammer className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="hidden sm:block">
            <h1
              className="text-xl font-bold leading-none"
              style={{
                background: 'linear-gradient(to right, #16a34a, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              reKraftt
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
              Material Exchange
            </p>
          </div>
          <div className="sm:hidden flex flex-col leading-tight">
            <span
              className="text-sm font-bold bg-gradient-to-r from-[#16a34a] to-[#2563eb] bg-clip-text text-transparent"
            >
              reKraftt
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-gray-500 dark:text-gray-400">
              Material Exchange
            </span>
          </div>
        </Link>

        {!hideSearch && (
          <div className="hidden md:flex flex-1 max-w-xl px-6">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                placeholder="Search bricks, tiles, tools..."
              />
            </form>
          </div>
        )}

        <div className="hidden md:flex items-center gap-6">
          {isSeller && (
            <Link 
              href="/seller-dashboard" 
              onClick={startNavigation}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Sell Material
            </Link>
          )}

          <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-6">
            <Link href="/cart" className="group relative text-gray-500 hover:text-blue-600 transition-colors" onClick={startNavigation}>
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <div className="relative group">
                <button onClick={handleAvatarClick} className="flex items-center gap-2 focus:outline-none" type="button">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user?.image || "https://github.com/shadcn.png"} alt={session.user?.name || "User"} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all transform origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                  <Link href={profileDestination} onClick={startNavigation} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    My Profile
                  </Link>
                  <a
                    href="mailto:hello@rekraftt.com"
                    onClick={startNavigation}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Contact reKraftt
                  </a>
                  <button 
                    onClick={() => signOut()} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
                <div className={`md:hidden absolute right-0 mt-2 w-44 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg z-50 ${isMobileProfileOpen ? "block" : "hidden"}`}>
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                  <Link href={profileDestination} onClick={startNavigation} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    My Profile
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              !hideAuthCtas && (
                <Link 
                  href="/signin" 
                  onClick={startNavigation}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              )
            )}
            {isNavigating && (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            )}
          </div>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" onClick={startNavigation} className="relative text-gray-600 dark:text-gray-300">
            <ShoppingBag className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>
          {isNavigating && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          )}
          <button 
            onClick={toggleMenu}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pb-4 shadow-lg animate-in slide-in-from-top-2">
          {!hideSearch && (
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}

          <div className="space-y-1 px-2">
            <Link 
              href="/products" 
              onClick={startNavigation}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${isActive('/products') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
            >
              <Package className="w-5 h-5" /> Browse Materials
            </Link>
            {isSeller && (
              <Link 
                href="/seller-dashboard" 
                onClick={startNavigation}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <PlusCircle className="w-5 h-5" /> Sell Material
              </Link>
            )}
            
            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              {session ? (
                <>
                  <Link href={profileDestination} onClick={startNavigation} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200">
                    <User className="w-5 h-5" /> My Profile
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                !hideAuthCtas && (
                  <div className="p-4 flex flex-col gap-3">
                    <Link 
                      href="/signin" 
                      onClick={startNavigation}
                      className="w-full py-2 bg-blue-600 text-white text-center rounded-lg font-medium text-sm"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={startNavigation}
                      className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-center rounded-lg font-medium text-sm"
                    >
                      Create Account
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
