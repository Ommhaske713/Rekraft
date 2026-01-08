"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Hammer, MapPin, Tag, Box, CheckCircle2, Scale } from "lucide-react"
import axios from "axios"
import { useSession } from "next-auth/react"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  quantity: number
  unit: string
  negotiable: boolean
  location: {
    city: string
    state: string
    country: string
  }
  sellerId: string | { _id?: string }
}

interface FormState {
  title: string
  description: string
  price: string
  category: string
  condition: string
  quantity: string
  unit: string
  negotiable: boolean
}

const categories = [
  "bricks", "doors", "windows", "metals", "wood", "tiles", "plumbing", "electrical", "other",
]
const conditions = ["new", "like_new", "good", "fair", "salvage"]
const units = ["piece", "kg", "sqft", "meter", "bundle", "ton"]

const defaultFormState: FormState = {
  title: "",
  description: "",
  price: "",
  category: "metals",
  condition: "good",
  quantity: "",
  unit: "kg",
  negotiable: false,
}

const resolveSellerId = (sellerId?: string | { _id?: string } | { toString(): string }) => {
  if (!sellerId) return ""
  if (typeof sellerId === "string") return sellerId
  if (typeof sellerId === "object") {
    if ("_id" in sellerId && sellerId._id) return sellerId._id
    if (typeof sellerId.toString === "function") return sellerId.toString()
  }
  return String(sellerId)
}

export default function SellerEditProductPage() {
  const params = useParams()
  const productId = params?.productId as string

  const { data: session, status } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formState, setFormState] = useState<FormState>(defaultFormState)
  const [locationFields, setLocationFields] = useState({ city: "", state: "", country: "" })
  const [fetchError, setFetchError] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const isSeller = session?.user?.role === "seller"
  const userId = session?.user?.id || ""
  const productOwnerId = useMemo(() => resolveSellerId(product?.sellerId), [product])
  const isOwner = Boolean(product && productOwnerId && userId && productOwnerId === userId)
  const showForm = Boolean(product && isSeller && isOwner)

  useEffect(() => {
    if (!productId) return
    let isMounted = true
    setIsFetching(true)
    setFetchError("")

    axios
      .get(`/api/products/${productId}`)
      .then((response) => {
        if (!isMounted) return
        const fetchedProduct = response.data.product
        if (!fetchedProduct) {
          setFetchError("Listing not found.")
          return
        }

        setProduct(fetchedProduct)
        setFormState({
          title: fetchedProduct.title,
          description: fetchedProduct.description,
          price: String(fetchedProduct.price),
          category: fetchedProduct.category,
          condition: fetchedProduct.condition,
          quantity: String(fetchedProduct.quantity),
          unit: fetchedProduct.unit,
          negotiable: Boolean(fetchedProduct.negotiable),
        })

        setLocationFields({
          city: fetchedProduct.location?.city || "",
          state: fetchedProduct.location?.state || "",
          country: fetchedProduct.location?.country || "",
        })
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch product details:", error)
        const e = error as { response?: { data?: { error?: string } } };
        if (isMounted) {
          setFetchError(e.response?.data?.error || "Unable to load this listing.")
        }
      })
      .finally(() => {
        if (isMounted) setIsFetching(false)
      })

    return () => {
      isMounted = false
    }
  }, [productId])

  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => setStatusMessage(null), 4500)
    return () => clearTimeout(timer)
  }, [statusMessage])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!productId) return

    const trimmedTitle = formState.title.trim()
    const trimmedDescription = formState.description.trim()
    
    if (!trimmedTitle || !trimmedDescription || !formState.price) {
      setStatusMessage({ type: "error", text: "Please fill in all required fields." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)

    try {
      await axios.patch(`/api/products/${productId}`, {
        title: trimmedTitle,
        description: trimmedDescription,
        price: Number(formState.price),
        quantity: Number(formState.quantity),
        category: formState.category,
        condition: formState.condition,
        unit: formState.unit,
        negotiable: formState.negotiable,
        location: {
            city: locationFields.city.trim(),
            state: locationFields.state.trim(),
            country: locationFields.country.trim(),
        },
      })
      setStatusMessage({ type: "success", text: "Listing updated successfully." })
    } catch (error: unknown) {
      const e = error as { response?: { data?: { error?: string } }; message?: string };
      setStatusMessage({
        type: "error",
        text: e.response?.data?.error || e.message || "Could not update the listing.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
  const selectClass = "w-full appearance-none rounded-xl border border-gray-300 bg-white pl-10 pr-8 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"

  if (status === "loading" || (isFetching && !product)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <Hammer className="h-6 w-6 text-green-600 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        reKraftt
                    </span>
                </Link>
                <span className="hidden sm:inline-block h-5 w-px bg-gray-300 mx-2"></span>
                <span className="hidden sm:inline-block text-xs font-semibold tracking-widest uppercase text-gray-500">Seller Studio</span>
            </div>
            
            <Link 
                href="/seller-dashboard" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm px-4 py-2 rounded-full transition-all"
            >
                Back to dashboard
            </Link>
        </div>
      </nav>

      <main className="container mx-auto py-10 px-4 max-w-2xl lg:max-w-3xl lg:py-8">
        
        <div className="mb-8">
            <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Edit Listing</h6>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Fine-tune your product</h1>
            <p className="text-gray-500">Update pricing, availability, and details without creating a new listing.</p>
        </div>

        {statusMessage && (
            <div className={`mb-6 rounded-xl border p-4 flex items-center gap-3 ${
                statusMessage.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
                {statusMessage.type === "success" ? <CheckCircle2 className="h-5 w-5"/> : <div className="h-2 w-2 rounded-full bg-red-500"/>}
                <p className="text-sm font-medium">{statusMessage.text}</p>
            </div>
        )}

        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        {!isSeller && (
             <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 mb-6">
                Access restricted to Seller accounts.
             </div>
        )}

        {showForm && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden lg:shadow-lg">
            <form onSubmit={handleSubmit} className="p-8 space-y-8 lg:p-6 lg:space-y-6">
                    
                    <section className="space-y-6 lg:space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Title</label>
                            <input
                                type="text"
                                value={formState.title}
                                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                className={inputClass}
                                placeholder="Product Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Description</label>
                            <textarea
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                rows={4}
                                className={`${inputClass} resize-none`}
                                placeholder="Describe your item..."
                            />
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Price (₹)</label>
                            <input
                                type="number"
                                value={formState.price}
                                onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Quantity</label>
                            <input
                                type="number"
                                value={formState.quantity}
                                onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <select
                                    value={formState.category}
                                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                    className={selectClass}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Condition</label>
                            <div className="relative">
                                <Box className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <select
                                    value={formState.condition}
                                    onChange={(e) => setFormState({ ...formState, condition: e.target.value })}
                                    className={selectClass}
                                >
                                    {conditions.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Unit</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <select
                                    value={formState.unit}
                                    onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
                                    className={selectClass}
                                >
                                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <input
                            id="negotiable"
                            type="checkbox"
                            checked={formState.negotiable}
                            onChange={(e) => setFormState({ ...formState, negotiable: e.target.checked })}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="negotiable" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            Mark this price as negotiable
                        </label>
                    </div>

                     <section className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900">Product Location</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                placeholder="City"
                                value={locationFields.city}
                                onChange={(e) => setLocationFields({ ...locationFields, city: e.target.value })}
                                className={inputClass}
                            />
                            <input
                                placeholder="State"
                                value={locationFields.state}
                                onChange={(e) => setLocationFields({ ...locationFields, state: e.target.value })}
                                className={inputClass}
                            />
                            <input
                                placeholder="Country"
                                value={locationFields.country}
                                onChange={(e) => setLocationFields({ ...locationFields, country: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </section>
                    <div className="pt-4 flex justify-center md:justify-end lg:justify-center">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full md:w-3xs max-w-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving changes...
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        )}
      </main>
    </div>
  )
}