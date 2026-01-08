"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"
import { useSession } from "next-auth/react"
import {
  Loader2,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface ProductRef {
  _id: string
  title?: string
}

interface NegotiationSummary {
  _id: string
  productId: string | ProductRef
  initialPrice: number
  counterOffer?: number
  status: string
  createdAt: string
}

type CartItem = {
  quantity?: number
}

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState<number>(0)
  const [negotiations, setNegotiations] = useState<NegotiationSummary[]>([])

  const isCustomer = session?.user?.role === "customer"

  useEffect(() => {
    if (status === "loading") return
    if (!session || !isCustomer) {
      setLoading(false)
      return
    }

    const fetchDashboard = async () => {
      setLoading(true)
      try {
        const [cartResp, negResp] = await Promise.all([
          axios.get("/api/cart"),
          axios.get("/api/negotiations", {
            params: { customerId: session.user.id },
          }),
        ])

        const items: CartItem[] = cartResp.data.items || []
        setCartItems(items.reduce((sum, item) => sum + (item.quantity ?? 0), 0))

        const negotiationList: NegotiationSummary[] = Array.isArray(negResp.data)
          ? negResp.data
          : []
        setNegotiations(negotiationList)
      } catch (err) {
        console.error("Failed to load customer dashboard", err)
        setError("We could not refresh your dashboard right now.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [session, status, isCustomer])

  const pendingNegotiations = negotiations.filter((item) => item.status === "pending")

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      default: return null;
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-500 mb-6">This dashboard is only available for buyer accounts.</p>
            <Link 
              href="/login" 
              className="inline-flex w-full justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Sign in as Customer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name || "Customer"}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/cart" 
              className="w-full md:w-auto justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </Link>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Cart</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-90 ml-3">{cartItems}</p>
              <p className="text-sm text-gray-500">Items ready for checkout</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Activity</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 ml-3">{negotiations.length}</p>
              <p className="text-sm text-gray-500">Total negotiations started</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {pendingNegotiations.length > 0 && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full -mr-8 -mt-8"></div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Pending</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 ml-3">{pendingNegotiations.length}</p>
              <p className="text-sm text-gray-500">Awaiting seller response</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                Recent Negotiations
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {negotiations.length === 0 ? (
                <div className="p-10 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">No negotiations yet</p>
                  <p className="text-gray-500 text-sm mb-4">Find a product and make an offer to get started.</p>
                  <Link href="/products" className="text-blue-600 text-sm font-medium hover:underline">
                    Browse Marketplace &rarr;
                  </Link>
                </div>
              ) : (
                negotiations.slice(0, 5).map((item) => {
                  const productIdData = item.productId
                  const productIdValue =
                    typeof productIdData === "string"
                      ? productIdData
                      : productIdData && "_id" in productIdData
                        ? productIdData._id
                        : ""

                  const productTitle =
                    typeof productIdData === "object" && productIdData !== null && "title" in productIdData
                      ? productIdData.title
                      : undefined

                  const productRef = productIdValue ? productIdValue.slice(-6) : "------"

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => router.push(`/negotiation/${item._id}`)}
                      className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between group w-full text-left gap-4 sm:gap-0"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {productTitle ? productTitle : "Product Ref:"} <span className="font-mono text-gray-500">#{productRef}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:block sm:text-right w-full sm:w-auto pl-14 sm:pl-0">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{(item.counterOffer || item.initialPrice).toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border sm:mt-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            
            {negotiations.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => router.push("/negotiation")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All History
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800 rounded-xl p-6 text-white shadow-lg shadow-blue-900/50 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg font-bold mb-2">Find New Materials</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Browse our catalog of reclaimed bricks, tiles, and industrial tools. Start saving today.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Tap into curated picks from nearby sellers and track delivery windows before placing your offer.
                </p>
              </div>
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition shadow-lg shadow-blue-900/50"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}