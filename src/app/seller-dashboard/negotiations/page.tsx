"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2, Check, X, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

interface Negotiation {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  customerId: {
    _id: string;
    username: string;
    email: string;
  };
  initialPrice: number;
  counterOffer?: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
  message?: string;
}

type NegotiationActionPayload = {
  status: Negotiation["status"]
  counterOffer?: number
}

export default function NegotiationsPage() {
  const router = useRouter()
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [filteredNegotiations, setFilteredNegotiations] = useState<Negotiation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sellerId, setSellerId] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const sellerResponse = await axios.get('/api/seller/me')
        const id = sellerResponse.data.seller._id
        setSellerId(id)

        const response = await axios.get(`/api/negotiations?sellerId=${id}`)
        const data = response.data || []
        setNegotiations(data)
        setFilteredNegotiations(data)
      } catch (err: unknown) {
        console.error("Failed to fetch negotiations:", err)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/signin')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    let filtered = negotiations

    if (statusFilter !== "all") {
      filtered = filtered.filter(n => n.status === statusFilter)
    }

    setFilteredNegotiations(filtered)
  }, [statusFilter, negotiations])

  const handleNegotiationAction = async (negotiationId: string, action: 'accept' | 'reject', counterOffer?: number) => {
    try {
      const payload: NegotiationActionPayload = { status: action === 'accept' ? 'accepted' : 'rejected' }
      if (counterOffer) {
        payload.counterOffer = counterOffer
        payload.status = 'countered'
      }

      await axios.patch(`/api/negotiations/${negotiationId}`, payload)

      if (sellerId) {
        const response = await axios.get(`/api/negotiations?sellerId=${sellerId}`)
        setNegotiations(response.data || [])
      }

      alert(`Negotiation ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`)
    } catch (err: unknown) {
      console.error("Failed to update negotiation:", err)
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Failed to update negotiation"
      alert(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading negotiations...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-1 py-6 px-3 md:py-10 md:px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href="/seller-dashboard"
              className="inline-flex items-center text-sm md:text-2xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{
                  background: "linear-gradient(1deg, #16a34a, #2563eb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Negotiations
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Manage buyer offers and negotiate prices</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 h-12 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="countered">Countered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200">
              <div className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-1">Total</div>
              <div className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100">{negotiations.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200">
              <div className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-1">Pending</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-700 dark:text-yellow-200">
                {negotiations.filter((n) => n.status === "pending").length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200">
              <div className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-1">Accepted</div>
              <div className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200">
                {negotiations.filter((n) => n.status === "accepted").length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200">
              <div className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-1">Countered</div>
              <div className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-200">
                {negotiations.filter((n) => n.status === "countered").length}
              </div>
            </div>
          </div>

        {filteredNegotiations.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {statusFilter !== "all" ? "No negotiations match this filter" : "No negotiations yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {statusFilter !== "all" 
                  ? "Try adjusting the status filter to see more results" 
                  : "When buyers negotiate prices on products marked as negotiable, they will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNegotiations.map(negotiation => (
              <div 
                key={negotiation._id} 
                className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="absolute top-4 right-4 md:static md:hidden">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(negotiation.status)}`}>
                      {negotiation.status}
                    </span>
                  </div>

                  <div className="w-full md:w-32 h-36 md:h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={negotiation.productId.images?.[0] || "/product-placeholder.svg"}
                      alt={
                        negotiation.productId.title ||
                        `Image for negotiation ${negotiation._id.slice(-6)}`
                      }
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
                      <div className="flex-1 pr-16 md:pr-0">
                        <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-gray-100 line-clamp-1 md:line-clamp-none">
                          {negotiation.productId.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-0.5">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Buyer:</span> {negotiation.customerId.username}
                          </p>
                          <span className="hidden sm:inline text-gray-400">•</span>
                          <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-500 truncate max-w-[200px] md:max-w-none">
                            {negotiation.customerId.email}
                          </p>
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(negotiation.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(negotiation.status)}`}>
                        {negotiation.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 md:p-4 border border-gray-100 dark:border-gray-600">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-0.5">Your Price</p>
                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">₹{negotiation.productId.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-0.5">Buyer Offer</p>
                        <p className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400">₹{negotiation.initialPrice}</p>
                      </div>
                      {negotiation.counterOffer && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-0.5">Your Counter</p>
                          <p className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">₹{negotiation.counterOffer}</p>
                        </div>
                      )}
                    </div>

                    {negotiation.message && (
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-blue-500 p-2 md:p-3 rounded">
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-blue-700 dark:text-blue-400">Message:</span> {negotiation.message}
                        </p>
                      </div>
                    )}

                    {negotiation.status === 'pending' && (
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 pt-1 md:pt-2">
                        <button
                          onClick={() => handleNegotiationAction(negotiation._id, 'accept')}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const counter = prompt(`Enter your counter offer:\n\nOriginal Price: ₹${negotiation.productId.price}\nBuyer Offer: ₹${negotiation.initialPrice}`)
                            if (counter && !isNaN(Number(counter))) {
                              handleNegotiationAction(negotiation._id, 'accept', Number(counter))
                            }
                          }}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Counter <span className="hidden sm:inline">Offer</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to reject this negotiation?')) {
                              handleNegotiationAction(negotiation._id, 'reject')
                            }
                          }}
                          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg text-sm font-bold transition-all active:scale-[0.98]"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {negotiation.status === 'countered' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⏳ Waiting for buyer&apos;s response to your counter offer of ₹{negotiation.counterOffer}
                        </p>
                      </div>
                    )}

                    {negotiation.status === 'accepted' && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✓ Negotiation accepted. The buyer can now proceed to checkout.
                        </p>
                      </div>
                    )}

                    {negotiation.status === 'rejected' && (
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ✗ This negotiation request was rejected.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
