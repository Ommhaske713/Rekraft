"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import SiteFooter from "@/components/site-footer"
import { 
    Loader2, 
    ShoppingCart, 
    ArrowLeft, 
    MapPin, 
    Info, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2, 
    AlertCircle,
    ShieldCheck,
    Truck,
    User,
    Star,
    MessageSquare
} from "lucide-react"
import axios from "axios"
import MobileMenu from "../../(auth)/signin/mobile-menu"
import { useSession } from "next-auth/react"

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

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.productId as string
    const { data: session } = useSession()

    const currentUser = session?.user as unknown as { id?: string; role?: string } | undefined
    const currentUserId = currentUser?.id as string | undefined
    const currentUserRole = currentUser?.role as string | undefined
    const isCustomer = currentUserRole === "customer"
    const isSeller = currentUserRole === "seller"

    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null)
    const [isNegotiationLoading, setIsNegotiationLoading] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "",
        type: "success",
        visible: false
    })
    const [isAddToCartLoading, setIsAddToCartLoading] = useState(false)
    const [isOfferRedirecting, setIsOfferRedirecting] = useState(false)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Helper functions
    const toTitleCase = (value: string | undefined | null) => {
        if (!value) return ""
        return value.trim().split(/\s+/).filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    }

    const showToastMessage = (message: string, type: "success" | "error" = "success") => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        setToast({ message, type, visible: true })
        toastTimerRef.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3200)
    }

    const isOwnProduct = Boolean(product && currentUserId && product.sellerId === currentUserId)
    const canAddToCart = Boolean(currentUserId && (isCustomer || (isSeller && !isOwnProduct)))
    const canNegotiate = Boolean(currentUserId && !isOwnProduct && product?.negotiable && !negotiatedPrice)

    // Data Fetching
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
                setError("Invalid Product ID")
                setIsLoading(false)
                return
            }
            try {
                setIsLoading(true)
                const response = await axios.get(`/api/products/${productId}`)
                setProduct(response.data.product)
            } catch (err: unknown) {
                console.error("Error fetching product:", err)
                const e = err as { response?: { data?: { error?: string } }; message?: string };
                setError(e.response?.data?.error || e.message || "Product not found")
            } finally {
                setIsLoading(false)
            }
        }
        if (productId) fetchProduct()
    }, [productId])

    useEffect(() => {
        const refreshCartCount = async () => {
            try {
                const response = await axios.get('/api/cart', { withCredentials: true })
                const items = response.data.items || []
                const totalItems = items.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity || 0), 0)
                setCartCount(totalItems)
            } catch (err: unknown) { console.error('Failed to fetch cart count:', err) }
        }
        refreshCartCount()
    }, [])

    useEffect(() => {
        const checkNegotiations = async () => {
            if (!product || !session?.user) return
            // Validate productId before making request
            if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) return;
            
            try {
                setIsNegotiationLoading(true)
                // Use productId from params
                const response = await axios.get(`/api/negotiations/check?productId=${productId}`)
                if (response.data.hasNegotiation) {
                    setNegotiatedPrice(response.data.negotiation.counterOffer || response.data.negotiation.initialPrice)
                }
            } catch (error) { console.error("Error checking negotiations:", error) } 
            finally { setIsNegotiationLoading(false) }
        }
        checkNegotiations()
    }, [product, session, productId])

    // Handlers
    const handleAddToCart = async () => {
        if (!product) return
        if (!currentUserId) { router.push("/signin"); return }
        if (product.sellerId === currentUserId) { showToastMessage("You cannot add your own listing to the cart.", "error"); return }
        if (product.quantity < 1) { showToastMessage("This product is out of stock.", "error"); return }
        if (!canAddToCart) { showToastMessage("Only customer accounts can buy.", "error"); return }

        setIsAddToCartLoading(true)

        try {
            await axios.post('/api/cart', {
                productId: productId, // Use productId from params
                quantity
            }, { withCredentials: true })
            showToastMessage("Product added to cart!", "success")
            // Update cart count immediately
            setCartCount(prev => prev + quantity)
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            showToastMessage(e.response?.data?.error || e.message || "Failed to add product", "error")
        } finally {
            setIsAddToCartLoading(false)
        }
    }

    const handleStartNegotiation = async () => {
        if (!product) return
        if (!currentUserId) { router.push("/signin"); return }
        if (product.sellerId === currentUserId) { showToastMessage("Cannot negotiate own listing", "error"); return }
        if (!isCustomer) { showToastMessage("Only customers can negotiate", "error"); return }

        setIsOfferRedirecting(true)
        await router.push(`/negotiation/new?productId=${productId}`)
        setIsOfferRedirecting(false)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || "This item may have been removed."}</p>
                    <button onClick={() => router.push('/products')} className="w-full bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans">
            {toast.visible && (
                <div className="fixed top-24 right-5 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border backdrop-blur-md ${toast.type === "success" ? "bg-white/95 border-emerald-100 text-emerald-800" : "bg-white/95 border-rose-100 text-rose-700"}`}>
                        {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />}
                        <p className="font-medium text-sm">{toast.message}</p>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                        reKraftt
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <MobileMenu />
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-8 flex-1">
                <nav className="flex items-center text-sm text-slate-500 mb-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mr-3 rounded-full bg-white p-1 text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <Link href="/products" className="text-black hover:text-blue-600 transition-colors">Marketplace</Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                    <span className="text-slate-900 font-medium line-clamp-1">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="w-full max-w-[640px] mx-auto">
                            <div className="relative aspect-[4/3] w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                            <Image
                                src={product.images?.[currentImageIndex] || "/placeholder.jpg"}
                                alt={product.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                            
                            {product.images?.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                                        className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-md backdrop-blur-sm transition-opacity"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                                        className="hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-md backdrop-blur-sm transition-opacity"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <div className="md:hidden absolute inset-x-4 bottom-4 flex items-center justify-between text-slate-900">
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur"
                                            aria-label="Show previous image"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur"
                                            aria-label="Show next image"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                            
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                                    {toTitleCase(product.condition.replace('_', ' '))}
                                </span>
                                {product.negotiable && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
                                        Negotiable
                                    </span>
                                )}
                            </div>
                        </div>
                        </div>

                        {product.images?.length > 1 && (
                            <div className="w-full max-w-[640px] mx-auto grid grid-cols-5 gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            currentImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-slate-300'
                                        }`}
                                    >
                                        <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" /> 
                                Product Details
                            </h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                            
                            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Category</span>
                                    <p className="text-slate-700 font-medium mt-1">{toTitleCase(product.category)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Posted On</span>
                                    <p className="text-slate-700 font-medium mt-1">{new Date(product.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm top-24">

                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                                    <MapPin className="h-4 w-4" />
                                    {toTitleCase(product.location.city)}, {toTitleCase(product.location.country)}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2">
                                    {product.title}
                                </h1>
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 text-slate-200 fill-current" />
                                    <span className="text-slate-400 ml-1">(4.0)</span>
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                {isNegotiationLoading ? (
                                    <div className="h-8 w-32 bg-slate-200 animate-pulse rounded"></div>
                                ) : negotiatedPrice ? (
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 mb-1 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Deal Unlocked
                                        </p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-extrabold text-slate-900">₹{negotiatedPrice.toLocaleString()}</span>
                                            <span className="text-lg text-slate-400 line-through">₹{product.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                                        <span className="text-sm text-slate-500 font-medium">/ {product.unit}</span>
                                    </div>
                                )}
                                <div className="mt-2 text-xs text-slate-500">
                                    Stock: <span className="font-bold text-slate-700">{product.quantity} {product.unit}s available</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                                    <div className="flex items-center w-32 border border-slate-300 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-r border-slate-300"
                                        > - </button>
                                        <input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                            className="w-12 h-10 text-center focus:outline-none text-slate-900 font-medium"
                                        />
                                        <button 
                                            onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-l border-slate-300"
                                        > + </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    {!currentUserId ? (
                                        <button onClick={() => router.push("/signin")} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                                            Sign in to Buy
                                        </button>
                                    ) : isOwnProduct ? (
                                        <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-500 font-medium text-center border border-slate-200">
                                            This is your listing
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={product.quantity < 1 || isAddToCartLoading}
                                                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isAddToCartLoading ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="h-5 w-5" />
                                                        {product.quantity < 1 ? "Out of Stock" : "Add to Cart"}
                                                    </>
                                                )}
                                            </button>

                                            {canNegotiate && (
                                                <button
                                                    onClick={handleStartNegotiation}
                                                    disabled={isOfferRedirecting}
                                                    className="w-full py-3.5 rounded-xl bg-white text-slate-700 font-bold border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isOfferRedirecting ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                            Redirecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageSquare className="h-5 w-5" />
                                                            Make an Offer
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Buyer Protection</p>
                                        <p className="text-xs text-slate-500">Money stored in escrow until you approve the item.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Verified Logistics</p>
                                        <p className="text-xs text-slate-500">Tracked shipping via reKraftt partners.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <User className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Sold by</p>
                                    <p className="font-bold text-slate-900">Seller #{product.sellerId.slice(-4)}</p>
                                </div>
                            </div>
                            <Link
                                href={`/sellers/${product.sellerId}`}
                                className="text-sm font-medium text-blue-600 hover:underline text-center lg:text-left lg:self-auto w-full lg:w-auto"
                                aria-label="View seller profile in read-only mode"
                            >
                                View Profile (read-only)
                            </Link>
                        </div>
                    </div>
                </div>
            </main>


                        <SiteFooter />
        </div>
    )
}