"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { 
  Loader2, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock,
  AlertCircle
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
}

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
    sellerId: string;
}

export default function NegotiationDetailPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    
    const [negotiation, setNegotiation] = useState<Negotiation | null>(null)
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [newOffer, setNewOffer] = useState<number>(0)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(() => {
        const fetchNegotiationAndProduct = async () => {
            try {
                setIsLoading(true)
                const negotiationResponse = await axios.get(`/api/negotiations/${id}`)
                const negotiationData = negotiationResponse.data
                setNegotiation(negotiationData)

                // Check for valid product ID before fetching
                if (negotiationData.productId && /^[0-9a-fA-F]{24}$/.test(negotiationData.productId)) {
                    try {
                        const productResponse = await axios.get(`/api/products/${negotiationData.productId}`)
                        setProduct(productResponse.data.product)
                    } catch (prodErr) {
                        console.error("Product fetch failed", prodErr)
                        // Allow negotiation to load even if product fails (optional, but good for data recovery)
                    }
                }

                if (!negotiationData.counterOffer) {
                    setNewOffer(negotiationData.initialPrice)
                } else {
                    setNewOffer(negotiationData.counterOffer)
                }
            } catch (err: unknown) {
                console.error("Error fetching negotiation details:", err)
                const e = err as { response?: { data?: { error?: string } } };
                setError(e.response?.data?.error || "Failed to load negotiation details")
            } finally {
                setIsLoading(false)
            }
        }
        
        if (id) {
            fetchNegotiationAndProduct()
        }
    }, [id])
    
    useEffect(() => {
        scrollToBottom()
    }, [negotiation?.messages])
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!negotiation || !session?.user || !newMessage.trim()) return
        
        try {
            setIsSendingMessage(true)
            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, {
                messages: [
                    ...negotiation.messages,
                    {
                        userId: session.user.id,
                        message: newMessage.trim(),
                        timestamp: new Date()
                    }
                ]
            })
            setNegotiation(updatedNegotiation.data)
            setNewMessage("")
        } catch (err: unknown) {
            console.error("Error sending message:", err)
            alert("Failed to send message.")
        } finally {
            setIsSendingMessage(false)
        }
    }
    
    // Action Handlers (Accept, Reject, Counter)
    const handleAction = async (action: 'accept' | 'reject' | 'counter') => {
        if (!negotiation || !session?.user) return
        if (action !== 'counter' && !confirm(`Are you sure you want to ${action} this offer?`)) return

        try {
            let payload: Record<string, unknown> = {}
            let systemMessage = ""

            if (action === 'accept') {
                payload = { status: 'accepted' }
                systemMessage = "Offer Accepted. Proceeding to checkout."
            } else if (action === 'reject') {
                payload = { status: 'rejected' }
                systemMessage = "Offer Rejected."
            } else if (action === 'counter') {
                payload = { status: 'countered', counterOffer: newOffer }
                systemMessage = `Counter Offer made: ₹${newOffer}`
            }

            // Append system message
            (payload as Record<string, unknown>).messages = [
                ...negotiation.messages,
                {
                    userId: session.user.id,
                    message: systemMessage,
                    timestamp: new Date()
                }
            ]

            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, payload)
            setNegotiation(updatedNegotiation.data)
        } catch (err) {
            console.error(`Error performing ${action}:`, err)
            alert("Action failed. Please try again.")
        }
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }
    
    if (error || !negotiation || !product) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
                <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Error Loading Deal</h3>
                    <p className="text-gray-500 mb-6">{error || "Negotiation not found"}</p>
                    <Link href="/negotiations" className="text-blue-600 font-medium hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        )
    }
    
    const isCustomer = session?.user?.id === negotiation.customerId
    const isSeller = session?.user?.id === negotiation.sellerId
    const isResolved = ['accepted', 'rejected'].includes(negotiation.status)
    const activePrice = negotiation.counterOffer || negotiation.initialPrice

    // Determine if user needs to take action
    const requiresAction = 
        (isSeller && negotiation.status === 'pending') || 
        (isCustomer && negotiation.status === 'countered');

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <Link 
                    href="/negotiation"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Negotiations
                </Link>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:h-[calc(100vh-180px)] lg:min-h-[600px]">

                    <div className="lg:col-span-1 flex flex-col">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:h-full">

                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-5 border border-slate-100 h-64 sm:h-72 lg:h-auto">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">No Image</div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
                                    REF: #{product._id.slice(-4)}
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                                <Link href={`/products/${product._id}`} className="hover:text-blue-600 transition-colors">
                                    {product.title}
                                </Link>
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">Sold by {isSeller ? "You" : "Verified Seller"}</p>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-500">Original Price</span>
                                    <span className="font-mono text-slate-500 line-through">₹{product.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <span className="text-sm font-bold text-blue-800">Current Offer</span>
                                    <span className="text-lg font-bold text-blue-700">₹{activePrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Protected by Escrow</span>
                                </div>
                                <div className={`w-full py-2 px-3 rounded-lg text-center text-sm font-bold border ${
                                    isResolved ? (negotiation.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200') : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    Status: {negotiation.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">Negotiation History</span>
                            </div>
                            <span className="text-xs text-slate-400">ID: {negotiation._id}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 max-h-[36rem] sm:max-h-none">
                            {negotiation.messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                negotiation.messages.map((msg, index) => {
                                    const isOwn = msg.userId === session?.user?.id;
                                    const isSystem = msg.message.includes("Offer Accepted") || msg.message.includes("Offer Rejected");

                                    if (isSystem) {
                                        return (
                                            <div key={index} className="flex justify-center my-4">
                                                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide">
                                                    {msg.message}
                                                </span>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] space-y-1`}>
                                                <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
                                                    isOwn 
                                                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                                                }`}>
                                                    {msg.message}
                                                </div>
                                                <p className={`text-[10px] ${isOwn ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {!isResolved && (
                            <div className="border-t border-slate-200 bg-white p-4 space-y-4">
                                {requiresAction && (
                                    <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-bold text-slate-700">Action Required: Respond to Offer</span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <button 
                                                onClick={() => handleAction('accept')}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Accept Deal
                                            </button>
                                            
                                            <div className="flex-1 flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                                    <input
                                                        type="number"
                                                        value={newOffer}
                                                        onChange={(e) => setNewOffer(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleAction('counter')}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Counter
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleAction('reject')}
                                                className="self-center sm:self-auto px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 transition-colors"
                                                title="Reject Offer"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message to discuss details..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        disabled={isSendingMessage}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSendingMessage}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20"
                                    >
                                        {isSendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        )}

                        {isResolved && (
                             <div className={`p-6 border-t ${
                                negotiation.status === 'accepted' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                            }`}>
                                <div className="text-center">
                                    <h3 className={`text-lg font-bold ${
                                        negotiation.status === 'accepted' ? 'text-emerald-800' : 'text-red-800'
                                    }`}>
                                        Negotiation {negotiation.status === 'accepted' ? 'Successful' : 'Closed'}
                                    </h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        {negotiation.status === 'accepted' 
                                            ? "You can now proceed to payment and delivery arrangements." 
                                            : "This deal was declined. You can start a new negotiation from the product page."}
                                    </p>
                                    {negotiation.status === 'accepted' && isCustomer && (
                                        <button className="mt-4 px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md">
                                            Proceed to Checkout
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    )
}