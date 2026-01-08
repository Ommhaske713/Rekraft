"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Loader2, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Search,
  ArrowRight
} from "lucide-react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import Navbar from "@/components/navbar" 

interface NegotiationMessage {
  userId: string;
  message: string;
  timestamp: Date;
}

interface Negotiation {
  _id: string;
  productId: string;
  customerId: string;
  sellerId: string;
  initialPrice: number;
  counterOffer?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category?: string;
  };
}

function NegotiationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")
  const { data: session, status: sessionStatus } = useSession() 
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNegotiations = async () => {
      if (sessionStatus === "loading") return;

      if (sessionStatus === "unauthenticated" || !session?.user?.id) {
        setError("You must be logged in to view negotiations")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const userId = session.user.id

        const [customerResponse, sellerResponse] = await Promise.all([
          axios.get(`/api/negotiations?customerId=${userId}`),
          axios.get(`/api/negotiations?sellerId=${userId}`)
        ])

        const allNegotiations = [...customerResponse.data, ...sellerResponse.data]

        allNegotiations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        type ProductMinimal = { _id?: string; title?: string; price?: number; images?: string[] }

        const negotiationsWithProducts = await Promise.all(
          allNegotiations.map(async (negotiationRaw: unknown) => {
            const negotiation = negotiationRaw as unknown as Negotiation

            const maybeProduct = negotiation.product as unknown
            if (maybeProduct && typeof maybeProduct === 'object') {
              const prod = maybeProduct as ProductMinimal
              return {
                ...(negotiation as unknown as Record<string, unknown>),
                product: {
                  _id: prod._id || String(negotiation.productId),
                  title: prod.title || undefined,
                  price: prod.price || undefined,
                  images: prod.images || []
                },
                productId: prod._id || negotiation.productId
              } as Negotiation
            }

            if (typeof negotiation.productId === 'string' && /^[0-9a-fA-F]{24}$/.test(negotiation.productId)) {
              try {
                const productResponse = await axios.get(`/api/products/${negotiation.productId}`)
                const prod = productResponse.data?.product as ProductMinimal | undefined
                return {
                  ...(negotiation as unknown as Record<string, unknown>),
                  product: prod ? { _id: prod._id, title: prod.title, price: prod.price, images: prod.images || [] } : undefined,
                } as Negotiation
              } catch (err) {
                console.error(`Error fetching product ${negotiation.productId}:`, err)
              }
            }

            return negotiation
          })
        )

        setNegotiations(negotiationsWithProducts as Negotiation[])
      } catch (err: Error | unknown) {
        const error = err instanceof Error ? err : { response: { data: { error: String(err) }, status: null }, message: undefined };
        console.error("Error fetching negotiations:", err)
        const e = error as { response?: { data?: { error?: string } }; message?: string };
        setError(e.response?.data?.error || e.message || "Failed to load negotiations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNegotiations()
  }, [session, sessionStatus]) 

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted': 
        return { 
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 
        };
      case 'rejected': 
        return { 
          bg: 'bg-red-50 text-red-700 border-red-200', 
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5" /> 
        };
      case 'countered': 
        return { 
          bg: 'bg-blue-50 text-blue-700 border-blue-200', 
          icon: <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> 
        };
      default:
        return { 
          bg: 'bg-amber-50 text-amber-800 border-amber-200', 
          icon: <Clock className="w-3.5 h-3.5 mr-1.5" /> 
        };
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Negotiations</h1>
            <p className="text-slate-500 mt-1">Track offers, counter-offers, and deal status.</p>
          </div>
          <Link 
            href="/products" 
            className="group flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Link>
        </div>

        {statusParam === "created" && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">Offer Sent Successfully</h3>
              <p className="text-emerald-700 text-sm mt-0.5">The seller has been notified. Check back here for updates.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
             <XCircle className="h-5 w-5 text-red-600" />
             <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {negotiations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No negotiations found</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
              You haven&apos;t made any offers yet. Find a product you like and start negotiating to get the best deal.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {negotiations.map((negotiation) => {
              const statusStyle = getStatusStyle(negotiation.status)
              const activePrice = negotiation.counterOffer || negotiation.initialPrice
              const isBuyer = session?.user?.id === negotiation.customerId

              return (
                <div
                  key={negotiation._id}
                  onClick={() => router.push(`/negotiation/${negotiation._id}`)}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {negotiation.product?.images && negotiation.product.images[0] ? (
                      <Image
                        src={negotiation.product.images[0]}
                        alt={negotiation.product.title || "Product"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        No Image Available
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-sm ${statusStyle.bg}`}>
                        {statusStyle.icon}
                        {negotiation.status.charAt(0).toUpperCase() + negotiation.status.slice(1)}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                           {isBuyer ? "Buying" : "Selling"}
                        </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                         {negotiation.product?.title || "Unknown Product"}
                       </h3>
                    </div>

                    <div className="mt-1 mb-4 space-y-1">
                       {negotiation.product?.price ? (
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Original</span>
                            <span className="text-sm text-slate-400 line-through">₹{negotiation.product.price.toLocaleString()}</span>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between opacity-50">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Original</span>
                            <span className="text-sm text-slate-400">N/A</span>
                         </div>
                       )}
                       
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                             {negotiation.counterOffer ? "Counter Offer" : "Your Offer"}
                          </span>
                          <span className={`text-lg font-bold ${negotiation.counterOffer ? 'text-blue-600' : 'text-slate-900'}`}>
                             ₹{activePrice.toLocaleString()}
                          </span>
                       </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{negotiation.messages?.length || 0} messages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{new Date(negotiation.updatedAt).toLocaleDateString()}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function NegotiationsPage() {
  return (
    <Suspense fallback={null}>
      <NegotiationsContent />
    </Suspense>
  )
}