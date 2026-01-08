"use client"

import { Suspense, useState, useEffect, useRef, type MouseEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import axios from "axios"
import { Search, Filter, ChevronDown, ShoppingCart, Loader2, Edit, MapPin, X, CheckCircle2, AlertCircle, LogOut, Hammer } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SiteFooter from "@/components/site-footer"

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  quantity: number;
  unit: string;
  negotiable: boolean;
  images: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  sellerId: string;
  createdAt: string;
}

type CartItem = {
  quantity?: number
}

const categories = [
  { id: "all", label: "All Categories" },
  { id: "bricks", label: "Bricks" },
  { id: "doors", label: "Doors" },
  { id: "windows", label: "Windows" },
  { id: "metals", label: "Metals" },
  { id: "wood", label: "Wood" },
  { id: "tiles", label: "Tiles" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "other", label: "Other" }
]

const conditions = [
  { id: "all", label: "All Conditions" },
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "salvage", label: "Salvage" }
]

function ProductsPageContent() {
  const router = useRouter()
  const [navigatingEditId, setNavigatingEditId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [navigatingProductId, setNavigatingProductId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "all")
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || ""
  })
  const [negotiatedPrices, setNegotiatedPrices] = useState<Record<string, number>>({});
  const [isNegotiatedPricesLoading, setIsNegotiatedPricesLoading] = useState(false)
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [sortBy, setSortBy] = useState("newest")
  const [cartCount, setCartCount] = useState(0)
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string, role: string } | null>(null)
  const { data: authSession, status } = useSession()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false
  })
  const [isProfileNavLoading, setIsProfileNavLoading] = useState(false)
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resolvedUserRole = authSession?.user?.role || currentUser?.role
  const isCustomer = resolvedUserRole === "customer"
  const isSeller = resolvedUserRole === "seller"
  const canAccessCart = Boolean(currentUser)
  
  const isOwnProduct = (productSellerId: string) => {
    return isSeller && currentUser?.id === productSellerId
  }
  
  const canAddToCart = (productSellerId: string) => {
    if (!currentUser) return false
    if (isCustomer) return true
    if (isSeller) {
      return currentUser.id !== productSellerId
    }
    return false
  }

  const toTitleCase = (value: string | undefined | null) => {
    if (!value) return ""
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }

    setToast({ message, type, visible: true })
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 3200)
  }

  const handleProductImageLoad = (productId: string) => {
    setLoadedImages((prev) => {
      if (prev[productId]) return prev
      return { ...prev, [productId]: true }
    })
  }

  const handleProductNavigation = (event: MouseEvent<HTMLAnchorElement>, productId: string) => {
    setNavigatingProductId(productId)
  }

  useEffect(() => {
    if (authSession?.user?.id && authSession.user.role) {
      setCurrentUser({
        id: authSession.user.id,
        role: authSession.user.role
      })
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        if (response.data && response.data.user) {
          setCurrentUser({
            id: response.data.user.id,
            role: response.data.user.role
          })
          console.log("Current user:", response.data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err)
      }
    }

    fetchUserData()
  }, [authSession])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!currentUser?.id) return

    let cancelled = false

    const fetchNegotiatedPrices = async () => {
      try {
        setIsNegotiatedPricesLoading(true)
        const response = await axios.get(
          '/api/negotiations',
          {
            params: { customerId: currentUser.id },
            withCredentials: true,
          }
        )

        const negotiations = response.data || []
        const priceMap: Record<string, number> = {}

        const getNegotiationProductId = (negotiation: Record<string, unknown>): string | null => {
          const productId = negotiation?.productId
          if (!productId) return null
          if (typeof productId === 'string') return productId
          if (typeof productId === 'object' && productId !== null && '_id' in productId) {
            return String((productId as Record<string, unknown>)._id)
          }
          return String(productId)
        }

        negotiations.forEach((negotiation: Record<string, unknown>) => {
          if (negotiation.status === 'accepted') {
            const productId = getNegotiationProductId(negotiation)
            if (!productId) return
            const rawPrice = negotiation.counterOffer ?? negotiation.initialPrice
            const numericPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice)
            if (Number.isFinite(numericPrice)) {
              priceMap[productId] = numericPrice
            }
          }
        })

        if (!cancelled) {
          setNegotiatedPrices(priceMap)
        }
      } catch (err) {
        console.error('Failed to fetch negotiated prices:', err)
      } finally {
        if (!cancelled) {
          setIsNegotiatedPricesLoading(false)
        }
      }
    }

    fetchNegotiatedPrices()
    const intervalId = setInterval(fetchNegotiatedPrices, 30000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (!canAccessCart) {
      setCartCount(0)
      return
    }

    const fetchCart = async () => {
      try {
        console.log("Fetching cart data...")
        const response = await axios.get('/api/cart', { withCredentials: true })
        console.log("Cart response:", response.data)

        const cartItems: CartItem[] = response.data.items || []
        console.log("Cart items:", cartItems)

        const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
        console.log("Total items in cart:", totalItems)
        setCartCount(totalItems)
      } catch (err) {
        console.error("Failed to fetch cart:", err)
      }
    }

    fetchCart()

    const intervalId = setInterval(fetchCart, 30000)

    return () => clearInterval(intervalId)
  }, [canAccessCart])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
        if (selectedCondition && selectedCondition !== "all") params.append("condition", selectedCondition)
        if (priceRange.min) params.append("minPrice", priceRange.min)
        if (priceRange.max) params.append("maxPrice", priceRange.max)
        if (location) params.append("location", location)
        if (searchQuery) params.append("query", searchQuery)

        const response = await axios.get(`/api/products?${params.toString()}`)
        let productList = response.data.products || []

        if (sortBy === "newest") {
          productList = productList.sort((a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        } else if (sortBy === "price-low") {
          productList = productList.sort((a: Product, b: Product) => a.price - b.price)
        } else if (sortBy === "price-high") {
          productList = productList.sort((a: Product, b: Product) => b.price - a.price)
        }

        setProducts(productList)
      } catch (err: Error | unknown) {
        const error = err instanceof Error ? err : { response: { data: { error: String(err) }, status: null }, message: undefined };
        console.error("Failed to fetch products:", err)
        const e = error as { response?: { data?: { error?: string } }; message?: string };
        setError(e.response?.data?.error || e.message || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, selectedCondition, priceRange.min, priceRange.max, location, sortBy, searchQuery])

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      handleCartAccessClick()
      return
    }

    const product = products.find(p => p._id === productId)
    if (!product) return

    if (isOwnProduct(product.sellerId)) {
      showToastMessage("You cannot add your own listing to the cart.", "error")
      return
    }

    setAddingToCartId(productId)

    try {
      console.log("Adding product to cart:", productId)

      const payload: { productId: string; quantity: number } = {
        productId,
        quantity: 1
      };

      await axios.post('/api/cart', payload, { withCredentials: true });

      const cartResponse = await axios.get('/api/cart', { withCredentials: true })
      console.log("Updated cart:", cartResponse.data)
  
      const cartItems = cartResponse.data.items || []
      const totalItems = cartItems.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0)
      console.log("New cart count:", totalItems)
  
      setCartCount(totalItems)

      const cartItem = cartItems.find((item: { productId?: string }) => item.productId === productId);
      const inCartQuantity = cartItem ? cartItem.quantity : 0;
      const remainingQuantity = product.quantity - inCartQuantity;

      showToastMessage(`Product added to cart! ${remainingQuantity} ${product.unit} remaining available.`, "success")
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : { response: { data: { error: String(err) }, status: null }, message: undefined };
      console.error("Failed to add to cart:", err)
      const e = error as { response?: { data?: { error?: string } }; message?: string };
      showToastMessage(e.response?.data?.error || e.message || "Failed to add product to cart", "error")
    } finally {
      setAddingToCartId(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append("query", searchQuery)
    if (selectedCategory !== "all") params.append("category", selectedCategory)
    if (selectedCondition !== "all") params.append("condition", selectedCondition)
    if (priceRange.min) params.append("minPrice", priceRange.min)
    if (priceRange.max) params.append("maxPrice", priceRange.max)
    if (location) params.append("location", location)

    router.push(`/products?${params.toString()}`)
  }

  const handleResetFilters = () => {
    setSelectedCategory("all")
    setSelectedCondition("all")
    setPriceRange({ min: "", max: "" })
    setLocation("")
    setSearchQuery("")
    setSortBy("newest")
    router.push("/products")
  }

  const handleCartAccessClick = () => {
    if (currentUser) {
      showToastMessage("Only customer or seller accounts can add items to the cart.", "error")
      return
    }

    router.push('/signin')
  }

  const profileDestination = resolvedUserRole === "seller" ? "/seller-dashboard" : "/customer-dashboard"

  const toggleMobileProfile = () => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return
    setIsMobileProfileOpen((prev) => !prev)
  }

  const closeMobileProfile = () => setIsMobileProfileOpen(false)

  const navigateToProfile = (
    event?: MouseEvent<HTMLAnchorElement>,
    options?: { hideMobile?: boolean }
  ) => {
    event?.preventDefault()
    if (options?.hideMobile) {
      closeMobileProfile()
    }

    if (isProfileNavLoading) {
      return
    }

    setIsProfileNavLoading(true)
    router.push(profileDestination)
  }

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsMobileProfileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {toast.visible && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur transition duration-200 ${toast.type === "success" ? "border-emerald-200 bg-white/90 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/70 dark:text-emerald-200" : "border-rose-200 bg-white/90 text-rose-700 dark:border-rose-500 dark:bg-rose-900/70 dark:text-rose-200"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
            )}
            <p className="text-sm font-semibold leading-tight">
              {toast.message}
            </p>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
                <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md transition-transform duration-200 ease-out hover:-translate-0.5 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #2563eb)',
                }}
                >
                <Hammer className="w-5 h-5" />
                </div>
              <span className="text-xl md:text-2xl font-bold" style={{
                background: 'linear-gradient(to right, #16a34a, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                reKraftt
              </span>
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative mx-4 flex-1 max-w-md"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-10 py-2 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          </form>

          <div className="flex items-center space-x-3">
            <Link
              href="/cart"
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isSeller && (
              <Link
                href="/seller-dashboard"
                className="hidden md:inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transition-colors shadow-sm"
              >
                List a product
              </Link>
            )}
            {status === "loading" ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : authSession ? (
              <div className="relative group">
                <button onClick={toggleMobileProfile} className="flex items-center gap-2 focus:outline-none ml-2">
                  <Avatar className="w-9 h-9">
                    <AvatarImage
                      src={authSession.user?.image || "https://github.com/shadcn.png"}
                      alt={authSession.user?.name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {authSession.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all transform origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{authSession.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{authSession.user?.email}</p>
                  </div>
                  <Link
                    href={profileDestination}
                    onClick={navigateToProfile}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isProfileNavLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>My Profile</span>
                      </span>
                    ) : (
                      "My Profile"
                    )}
                  </Link>
                  <a
                    href="mailto:hello@rekraftt.com"
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{authSession.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{authSession.user?.email}</p>
                  </div>
                  <Link
                    href={profileDestination}
                    onClick={(event) => navigateToProfile(event, { hideMobile: true })}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isProfileNavLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>My Profile</span>
                      </span>
                    ) : (
                      "My Profile"
                    )}
                  </Link>
                  <a
                    href="mailto:hello@rekraftt.com"
                    onClick={closeMobileProfile}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Contact reKraftt
                  </a>
                  <button
                    onClick={() => {
                      closeMobileProfile()
                      signOut()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 py-2 border-b border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900">
        <form
          onSubmit={handleSearch}
          className="relative flex"
        >
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 dark:border-gray-700 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        </form>
      </div>

      <main className="flex-1 container py-6">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold" style={{
              background: 'linear-gradient(0deg, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'}}>
            Marketplace Products
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 rounded-xl mb-4 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filters</span>
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="md:hidden fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close filters"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowFilters(false)}
              />
              <aside className="absolute right-0 top-0 h-full w-[min(22rem,85vw)] overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200/80 dark:border-gray-700/80 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    <p className="font-semibold text-gray-900 dark:text-white">Filters</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.id}
                            onChange={() => setSelectedCategory(category.id)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Condition</h3>
                    <div className="space-y-2">
                      {conditions.map(condition => (
                        <label key={condition.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="condition"
                            checked={selectedCondition === condition.id}
                            onChange={() => setSelectedCondition(condition.id)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{condition.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Price Range</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Location</h3>
                    <input
                      type="text"
                      placeholder="City, state or country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-2 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-900/70 p-4 shadow-xl backdrop-blur">
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      Filters apply as soon as you touch a control.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetFilters()
                        setShowFilters(false)
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
                    >
                      <X className="h-3 w-3" />
                      Reset filters
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          <aside className="hidden md:block w-full md:w-72 space-y-4 md:sticky md:top-24 md:self-start">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Condition</h3>
              <div className="space-y-2">
                {conditions.map(condition => (
                  <label key={condition.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      checked={selectedCondition === condition.id}
                      onChange={() => setSelectedCondition(condition.id)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{condition.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Location</h3>
              <input
                type="text"
                placeholder="City, state or country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/50 p-3 text-xs text-gray-500 dark:border-gray-700/70 dark:bg-gray-900/60 dark:text-gray-400">
              <p>Filters update instantly as you tweak them.</p>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                onClick={handleResetFilters}
              >
                Reset filters
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:inline">
                  Sort by
                </span>
                <div className="relative inline-flex items-center rounded-full border border-gray-300/70 dark:border-gray-600/70 bg-white dark:bg-gray-800 shadow-sm px-3 py-1.5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            )}

            {!isLoading && error && (
              <div className="py-12 text-center">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No products found matching your criteria.</p>
              </div>
            )}

            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => {
                  const negotiatedPrice = negotiatedPrices[product._id]
                  const hasNegotiated = negotiatedPrice !== undefined

                  return (
                    <div
                      key={product._id}
                      className="group relative border border-gray-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Link
                        href={`/products/${product._id}`}
                        onClick={(event) => handleProductNavigation(event, product._id)}
                      >
                          <div className="relative h-52 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
                          {!loadedImages[product._id] && (
                            <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-700 dark:to-gray-600" />
                          )}
                          <Image
                            src={product.images?.[0] || "/07.jpg"}
                            alt={product.title}
                            fill
                            loading={index < 4 ? "eager" : "lazy"}
                            priority={index < 4}
                            unoptimized={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${loadedImages[product._id] ? 'opacity-100' : 'opacity-0'}`}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                            onLoadingComplete={() => handleProductImageLoad(product._id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
                          {product.negotiable && (
                            <div className="absolute top-3 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-[clamp(0.5rem,1vw,0.65rem)] tracking-wider text-blue-700 shadow">
                              <span className="h-2 w-1 rounded-full bg-blue-500" />
                              Negotiable
                            </div>
                          )}
                          {product.quantity < 1 && (
                            <div className="absolute top-3 right-3 rounded-full bg-gray-900/80 text-white text-xs font-semibold px-3 py-1">
                              Out of stock
                            </div>
                          )}
                        </div>
                      </Link>
                      {navigatingProductId === product._id && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-gray-900/70">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="p-5">
                        <Link href={`/products/${product._id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • {
                            product.condition.replace('_', ' ').charAt(0).toUpperCase() +
                            product.condition.replace('_', ' ').slice(1)
                          }
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <MapPin className="h-4 w-4" />
                          <p className="truncate">{toTitleCase(product.location.city)}, {toTitleCase(product.location.state)}</p>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            {isNegotiatedPricesLoading ? (
                              <div className="h-7 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            ) : hasNegotiated ? (
                              <div>
                                <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Deal Unlocked
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                                    ₹{negotiatedPrice.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                                ₹{product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.quantity} {product.unit}
                          </p>
                        </div>
                        {isOwnProduct(product.sellerId) ? (
                          <div className="mt-3 flex gap-2">
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl text-center text-sm font-semibold">
                              Your Product
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNavigatingEditId(product._id)
                                router.push(`/seller-dashboard/edit-product/${product._id}`)
                              }}
                              disabled={navigatingEditId === product._id}
                              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl disabled:cursor-wait disabled:opacity-70"
                            >
                              {navigatingEditId === product._id ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Editing...
                                </span>
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ) : canAddToCart(product.sellerId) ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddToCart(product._id)
                            }}
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={product.quantity < 1 || addingToCartId === product._id}
                          >
                            {addingToCartId === product._id ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding…
                              </span>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                {product.quantity < 1 ? "Out of Stock" : "Add to Cart"}
                              </>
                            )}
                          </button>
                        ) : currentUser ? (
                          <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-xl text-center text-sm">
                            Only customers and other sellers can buy this listing
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCartAccessClick}
                            className="mt-3 w-full bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center hover:bg-gray-300"
                          >
                            Sign in to buy
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  )
}