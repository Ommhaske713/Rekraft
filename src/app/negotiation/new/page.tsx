"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import axios from "axios"
import { 
  Loader2, 
  ArrowLeft, 
  IndianRupee, 
  ShieldCheck, 
  MessageSquare, 
  TrendingDown, 
  Store,
  AlertCircle
} from "lucide-react"
import Navbar from "@/components/navbar" 

interface Product {
  _id: string;
  title: string;
  price: number;
  sellerId: string;
  category: string;
  condition: string;
  images: string[];
}

function NewNegotiationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")
  const { data: session } = useSession()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // FIX 1: Initialize type to allow empty string specifically
  const [offerPrice, setOfferPrice] = useState<number | ''>('')
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived State
  const numericOffer = offerPrice === '' ? 0 : offerPrice
  const savings = product ? product.price - numericOffer : 0
  const discountPercent = product && numericOffer > 0 
    ? ((product.price - numericOffer) / product.price) * 100 
    : 0

  useEffect(() => {
    const fetchProduct = async () => {
      // Validate Product ID format (MongoDB ObjectId)
      if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
        setError("Invalid Product ID");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/products/${productId}`)
        const productData = response.data.product
        setProduct(productData)
        // Set initial offer
        setOfferPrice(Math.floor(productData.price * 0.9)) 
      } catch (err: unknown) {
        console.error("Error fetching product:", err)
        const e = err as { response?: { data?: { error?: string } } };
        setError(e.response?.data?.error || "Product not found")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const handleQuickOffer = (percentOff: number) => {
    if (!product) return
    const newPrice = Math.floor(product.price * (1 - percentOff / 100))
    setOfferPrice(newPrice)
  }

  const isOfferTooHigh = product ? numericOffer >= product.price : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || isSubmitting || !numericOffer || isOfferTooHigh) return
    
    try {
      setIsSubmitting(true)
      await axios.post("/api/negotiations", {
        productId: product._id,
        sellerId: product.sellerId,
        customerId: session?.user?.id, 
        initialPrice: numericOffer,
        messages: [{
          userId: session?.user?.id, 
          message: message || `I'd like to buy this product for ₹${numericOffer}`,
          timestamp: new Date()
        }]
      })
      router.push("/negotiation?status=created")
    } catch (err: unknown) {
      console.error("Error creating negotiation:", err)
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "Failed to create negotiation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto max-w-lg p-8 mt-10">
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error || "Product not found"}</p>
            </div>
          </div>
          <Link href="/products" className="mt-6 inline-flex items-center text-gray-600 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
            <Link 
            href={`/products/${productId}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Negotiation
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">

          <div className="lg:col-span-1 space-y-4 md:space-y-6 w-full">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 w-full">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-6 border border-gray-100">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {product.category || "Item"}
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    {product.condition || "Used"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    Seller: {product.sellerId.substring(0, 6)}...
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 font-medium">Asking Price</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex gap-3 border border-blue-100 w-full">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-blue-800">Secure Process</h4>
                <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                  Funds stay in escrow until you confirm the purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 w-full">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
              
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  Make Your Offer
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Propose a price. The seller can accept, reject, or counter.
                </p>
              </div>

              <div className="p-4 md:p-8 space-y-6 md:space-y-8">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Offer Price (₹)
                  </label>
                  
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setOfferPrice(val === '' ? '' : Number(val))
                      }}
                      className="block w-full pl-14 pr-28 md:pr-32 py-3 md:py-4 text-xl md:text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                      required
                      min={1}
                    />

                      {isOfferTooHigh && (
                        <p className="mt-2 text-xs text-red-600">
                          Offer must be lower than the listed price (₹{product.price.toLocaleString()}).
                        </p>
                      )}
                    
                    {numericOffer > 0 && numericOffer < product.price && (
                      <div className="absolute inset-y-2 right-2 flex items-center">
                        <span className="bg-emerald-100 text-emerald-700 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-sm">
                          {discountPercent.toFixed(0)}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-gray-500 py-1.5 mr-1">Quick discount:</span>
                    {[5, 10, 15, 20, 25].map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => handleQuickOffer(percent)}
                        className="px-3 py-2 md:py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200"
                      >
                        -{percent}%
                      </button>
                    ))}
                  </div>

                  {numericOffer > 0 && (
                     <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-500">Listed: <span className="line-through">₹{product.price}</span></span>
                        <span className="font-medium text-emerald-600">You save ₹{savings.toLocaleString()}</span>
                     </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Message <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative w-full">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white p-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-sm"
                      rows={4}
                      placeholder="Hi, I am interested in buying this. Can we close the deal at this price?"
                    ></textarea>
                    <MessageSquare className="absolute bottom-4 right-4 h-5 w-5 text-gray-300 pointer-events-none" />
                  </div>
                </div>

              </div>

              <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-xs text-gray-500 hidden sm:block">
                    Offers are non-binding until accepted.
                 </div>
                 <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                        disabled={isSubmitting || !numericOffer || isOfferTooHigh}
                      className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Offer"
                      )}
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function NewNegotiationPage() {
  return (
    <Suspense fallback={null}>
      <NewNegotiationContent />
    </Suspense>
  )
}