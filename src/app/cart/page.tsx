"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useSession } from "next-auth/react"
import {
  Trash2,
  ArrowLeft,
  Loader,
  Truck,
  Factory,
  Minus,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Navbar from "../../components/navbar"
import SiteFooter from "@/components/site-footer"

interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  negotiatedPrice?: number
  quantity: number
  image: string
  category: string
  sellerId: string
  negotiable: boolean
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>(
    { message: "", type: "success", visible: false }
  )
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: session, status } = useSession()
  const userRole = session?.user?.role
  const isCartUser = status === "authenticated" && (userRole === "customer" || userRole === "seller")

  const materialSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.negotiatedPrice || item.price) * item.quantity,
    0
  )

  const listedSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const totalSavings = listedSubtotal - materialSubtotal

  const platformFee = Math.round(materialSubtotal * 0.02)

  const payableNow = materialSubtotal + platformFee

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (status === "loading") return

    if (!isCartUser) {
      setCartItems([])
      setLoading(false)
      return
    }

    async function fetchCart() {
      try {
        setLoading(true)
        const response = await axios.get("/api/cart")
        setCartItems(response.data.items || [])
        setError(null)
      } catch (err: unknown) {
        const serverError =
          axios.isAxiosError(err) &&
          err.response &&
          typeof err.response.data === "object" &&
          err.response.data !== null &&
          "error" in err.response.data &&
          typeof (err.response.data as { error?: unknown }).error === "string"
            ? (err.response.data as { error: string }).error
            : undefined

        setError(serverError || "Failed to load cart items")
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [isCartUser, status])

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }

    setToast({ message, type, visible: true })
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 3200)
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) return
      setUpdatingItem(productId)

      await axios.patch("/api/cart", { productId, quantity: newQuantity })

      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      )

      showToastMessage("Cart updated", "success")

      window.dispatchEvent(new Event("cart:updated"))
    } catch {
      showToastMessage("Failed to update quantity", "error")
    } finally {
      setUpdatingItem(null)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      setRemovingItem(productId)
      await axios.delete(`/api/cart?productId=${productId}`)
      setCartItems(prev => prev.filter(item => item.productId !== productId))

      window.dispatchEvent(new Event("cart:updated"))
    } catch {
      showToastMessage("Failed to remove item", "error")
    } finally {
      setRemovingItem(null)
    }
  }

  const checkout = () => {
    if (cartItems.length === 0) {
      showToastMessage("Your cart is empty", "error")
      return
    }

    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-6 w-6 mr-2 animate-spin" />
        Loading cart...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
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

        <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-8 pb-32 md:pb-12 grid md:grid-cols-3 gap-8">

        {error && (
          <div className="md:col-span-3 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>Items</span>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">({totalItems} items)</span>
          </div>

          <div className="space-y-4">
            {cartItems.map(item => {
              const productUrl = `/products/${item.productId}`

              return (
                <div
                  key={item.productId}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
                >
                  <div className="space-y-4">
                      <Link
                        href={productUrl}
                        className="flex flex-col sm:flex-row gap-4 text-current focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                      <div className="w-full sm:w-28 h-48 sm:h-28 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700">
                        <Image
                          src={item.image || "/product-placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                {item.category}
                              </span>
                              {item.negotiable && (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Negotiable
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:block justify-between items-center bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:text-right">
                            <span className="sm:hidden text-sm font-medium text-gray-500">Price</span>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                ₹{((item.negotiatedPrice || item.price) * item.quantity).toFixed(0)}
                              </div>
                              {item.negotiatedPrice ? (
                                <div className="text-xs text-emerald-600 font-medium">Negotiated applied</div>
                              ) : (
                                <div className="text-xs text-gray-500">₹{item.price.toFixed(0)} each</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="mt-0 flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 sm:border-0 sm:pt-0">
                      <div className="inline-flex items-center rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 touch-manipulation"
                          disabled={item.quantity <= 1 || updatingItem === item.productId}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">
                          {updatingItem === item.productId ? (
                            <Loader className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 touch-manipulation"
                          disabled={updatingItem === item.productId}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        disabled={removingItem === item.productId}
                        className="group p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition ml-auto"
                        aria-label="Remove item"
                      >
                        {removingItem === item.productId ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">

            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm text-gray-600">

              <div className="flex justify-between">
                <span>Material Subtotal</span>
                <span className="font-medium">₹{materialSubtotal.toFixed(0)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Negotiation Savings</span>
                  <span>-₹{totalSavings.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Platform & Handling Fee (2%)</span>
                <span>₹{platformFee.toFixed(0)}</span>
              </div>

              <div className="border-t pt-3" />

              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Payable Now</span>
                <span className="text-xl font-semibold">₹{payableNow.toFixed(0)}</span>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-700 flex gap-2">
                <Truck className="h-4 w-4 mt-0.5" />
                <p className="text-xs leading-snug">
                  Transport / loading / unloading charges are paid separately
                  based on distance, material weight & vehicle type.
                </p>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex gap-2">
                <Factory className="h-4 w-4 mt-0.5" />
                <p className="text-xs leading-snug">
                  Pickup availability & warehouse location will be confirmed by the seller after checkout.
                </p>
              </div>

            </div>
            <button
              onClick={checkout}
              className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-500 hover:to-blue-500 hover:shadow-lg transition"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-center text-gray-500 mt-3">
              Secure order — payment handled safely through marketplace
            </p>

          </div>
        </div>

      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Payable</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900 dark:text-white">₹{payableNow.toFixed(0)}</span>
              {(totalSavings > 0) && (
                <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                  Saved ₹{totalSavings.toFixed(0)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={checkout}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-sm"
          >
            Checkout
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}