"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Trash2, LogOut, Loader2, AlertCircle, X, Hammer } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import MobileMenu from "../(auth)/signin/mobile-menu"
import { signOut } from "next-auth/react"
import axios from "axios"
import SiteFooter from "@/components/site-footer"

interface SellerData {
  _id: string;
  username: string;
  businessName: string;
  email: string;
  phone: string;
  businessDescription: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  createdAt: string;
  verified: boolean;
}

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
  createdAt: string;
}

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

export default function SellerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [, setLoadingNegotiations] = useState(false)


  const fileInputRef = useRef<HTMLInputElement>(null)
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(["/product-placeholder.svg"])
  
  const [productForm, setProductForm] = useState({
    title: "",
    category: "doors", 
    condition: "good", 
    description: "",
    price: "",
    negotiable: false,
    quantity: "1",
    unit: "piece", 
    images: ["/product-placeholder.svg"],
  })

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/seller/me')
        setSellerData(response.data.seller)

        if (response.data.seller._id) {
          fetchSellerProducts(response.data.seller._id)
          fetchNegotiations(response.data.seller._id)
        }
      } catch (err: Error | unknown) {
        const error = err instanceof Error ? err : { response: { data: { error: String(err) }, status: null }, message: undefined };
        console.error("Failed to fetch seller data:", err)
        const e = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
        setError(e.response?.data?.error || e.message || "Failed to load seller information")

        if (e.response?.status === 401) {
          setTimeout(() => {
            router.push('/signin')
          }, 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchSellerProducts = async (sellerId: string) => {
      try {
        const response = await axios.get(`/api/products?sellerId=${sellerId}`)
        setSellerProducts(response.data.products || [])
      } catch (err: unknown) {
        console.error("Failed to fetch seller products:", err)
      }
    }

    const fetchNegotiations = async (sellerId: string) => {
      try {
        setLoadingNegotiations(true)
        const response = await axios.get(`/api/negotiations?sellerId=${sellerId}`)
        setNegotiations(response.data || [])
      } catch (err: unknown) {
        console.error("Failed to fetch negotiations:", err)
      } finally {
        setLoadingNegotiations(false)
      }
    }
    
    fetchSellerData()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/signin")
    } catch (err: unknown) {
      console.error("Failed to sign out:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProductForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setProductForm((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        setSubmitError("Only image files are allowed")
        return
      }

      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setSubmitError("Images must be less than 5MB each")
        return
      }

      const combinedFiles = [...productImages, ...newFiles].slice(0, 5)
      setProductImages(combinedFiles)

      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(newPreviews.length > 0 ? newPreviews : ["/product-placeholder.svg"])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productImages]
    newImages.splice(index, 1)
    setProductImages(newImages)

    URL.revokeObjectURL(imagePreviewUrls[index])
    
    const newPreviewUrls = [...imagePreviewUrls]
    newPreviewUrls.splice(index, 1)
    setImagePreviewUrls(newPreviewUrls.length > 0 ? newPreviewUrls : ["/product-placeholder.svg"])
  }

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url !== "/product-placeholder.svg") {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imagePreviewUrls])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess("")
    
    try {
      const productData = {
        title: productForm.title,
        description: productForm.description,
        price: productForm.price === "" ? 0 : Number(productForm.price),
        category: productForm.category,
        condition: productForm.condition,
        quantity: Number(productForm.quantity),
        unit: productForm.unit,
        negotiable: productForm.negotiable,
        location: {
          city: sellerData?.address?.city || "",
          state: sellerData?.address?.state || "",
          country: sellerData?.address?.country || "India"
        }
      }

      if (!productData.title) throw new Error("Product name is required")
      if (!productData.description) throw new Error("Product description is required")
      if (productData.price < 0) throw new Error("Price cannot be negative")
      if (productData.quantity <= 0) throw new Error("Quantity must be greater than 0")
      if (!productData.location.city || !productData.location.state) {
        throw new Error("Your seller profile must have a complete address to list products")
      }

      const response = await axios.post('/api/products', productData)
      const productId = response.data.product._id

      if (productImages.length > 0) {
        const formData = new FormData()
        productImages.forEach(image => {
          formData.append('images', image)
        })
        
        await axios.post(`/api/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setProductForm({
        title: "",
        category: "doors",
        condition: "good",
        description: "",
        price: "",
        negotiable: false,
        quantity: "1",
        unit: "piece",
        images: ["/product-placeholder.svg"],
      })

      setProductImages([])

      imagePreviewUrls.forEach(url => {
        if (url !== "/product-placeholder.svg") {
          URL.revokeObjectURL(url)
        }
      })
      
      setImagePreviewUrls(["/product-placeholder.svg"])
      setSubmitSuccess("Product added successfully!")

      if (sellerData?._id) {
        const productsResponse = await axios.get(`/api/products?sellerId=${sellerData._id}`)
        setSellerProducts(productsResponse.data.products || [])
      }

      setTimeout(() => {
        setSubmitSuccess("")
      }, 3000)
      
    } catch (err: unknown) {
      console.error("Product submission error:", err)
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setSubmitError(e.response?.data?.error || e.message || "Failed to add product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
      await axios.delete(`/api/products/${productId}`)
 
      setSellerProducts(prev => prev.filter(product => product._id !== productId))
      
    } catch (err: unknown) {
      console.error("Failed to delete product:", err)
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || "Failed to delete product")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg max-w-md w-full text-center">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => router.push('/signin')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const formattedAddress = sellerData?.address ? 
    `${sellerData.address.street}, ${sellerData.address.city}, ${sellerData.address.state}, ${sellerData.address.postalCode}, ${sellerData.address.country}` : 
    "No address on file";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
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
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              About Us
            </Link>
            <Link
              href="/services"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span>Logout</span>
              </button>
            </div>
            <MobileMenu onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{
            background: 'linear-gradient(1deg, #16a34a, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Seller Dashboard</h1>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4" style={{
              background: 'linear-gradient(1deg, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Profile</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 md:w-48 md:h-48 relative rounded-full md:rounded-lg overflow-hidden mx-auto md:mx-0 shadow-md ring-2 ring-gray-100 dark:ring-gray-700">
                <Image
                  src={sellerData?._id ? `/api/images/${sellerData._id}` : "https://github.com/shadcn.png"}
                  alt="Profile Picture"
                  fill
                  className="object-cover transition-opacity duration-200"
                  onError={(e) => {
                    e.currentTarget.src = "https://github.com/shadcn.png";
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1 text-left">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Display Name</p>
                  <div className="flex items-center md:justify-start gap-2">
                    <p className="text-base sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100">
                      {sellerData?.businessName || "Not Set"}
                    </p>
                    {sellerData?.verified && (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email ID</p>
                  <p className="text-base sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100">
                    {sellerData?.email || "Not Set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</p>
                  <p className="text-base sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100">
                    {sellerData?.username || "Not Set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">GSTIN</p>
                  <p className="text-base sm:text-lg font-mono font-semibold lg:font-medium text-gray-900 dark:text-gray-100">
                    {sellerData?.taxId || "Not Set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mobile Number</p>
                  <p className="text-base sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100">
                    {sellerData?.phone || "Not Set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store Description</p>
                  <p className="text-md sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {sellerData?.businessDescription || "No description available"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store Address</p>
                  <p className="text-md sm:text-lg font-semibold lg:font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {formattedAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{
              background: 'linear-gradient(1deg, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Add New Product</h2>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{submitError}</p>
              </div>
            )}
            
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-700 dark:text-green-300 text-sm">{submitSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  Product Name*
                </label>
                <input
                  id="title"
                  name="title"
                  value={productForm.title}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 h-12"
                    required
                  >
                    <option value="bricks">Bricks</option>
                    <option value="doors">Doors</option>
                    <option value="windows">Windows</option>
                    <option value="metals">Metals</option>
                    <option value="wood">Wood</option>
                    <option value="tiles">Tiles</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label
                    htmlFor="condition"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Condition*
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={productForm.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 h-12"
                    required
                  >
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="salvage">Salvage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Price (₹)*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={handleChange}
                    placeholder="Enter price in rupees"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 mt-0.5">
                    Negotiable
                  </label>
                  <label className="flex items-center h-12 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm">
                    <input
                      type="checkbox"
                      name="negotiable"
                      checked={productForm.negotiable}
                      onChange={handleCheckboxChange}
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Price is negotiable</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Quantity*
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={productForm.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="unit"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Unit*
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={productForm.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 h-12"
                    required
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="sqft">Square Foot</option>
                    <option value="meter">Meter</option>
                    <option value="bundle">Bundle</option>
                    <option value="ton">Ton</option>
                    <option value="sheet">Sheet</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  Product Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleChange}
                  placeholder="Enter detailed description of the product"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {url !== "/product-placeholder.svg" && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {productImages.length < 5 && (
                    <button
                      type="button"
                      onClick={handleImageSelect}
                      className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center hover:border-green-500 dark:hover:border-green-400 transition-colors"
                    >
                      <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can upload up to 5 images. Each image must be less than 5MB.
                </p>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Adding product...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4" style={{
              background: 'linear-gradient(1deg, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Your Products</h2>
            
            {sellerProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4.5m8-4.5v10l-8 4.5m0-9L4 7m8 4.5v10M4 7v10l8 4.5" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">No products yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Add your first product using the form above to get started selling on reKraftt.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {sellerProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="flex flex-col sm:flex-row border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-full h-40 sm:w-32 sm:h-32 relative">
                      <Image 
                        src={product.images?.[0] || "/product-placeholder.svg"} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 p-4 sm:p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-lg sm:text-base text-gray-800 dark:text-gray-100 line-clamp-1">{product.title}</p>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • {product.condition.replace('_', ' ').charAt(0).toUpperCase() + product.condition.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-3 sm:mt-2">
                        <p className="text-lg sm:text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{product.price.toLocaleString('en-IN')} {product.negotiable && <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Slightly Neg.)</span>}
                        </p>
                        <p className="text-xs font-medium bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                          Qty: {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="text-left bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-blue-50 dark:focus-visible:ring-offset-gray-900"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Marketplace</h3>
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4.5m8-4.5v10l-8 4.5m0-9L4 7m8 4.5v10M4 7v10l8 4.5" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{sellerProducts.length}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Explore & list more materials</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center">
                Go to marketplace
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/seller-dashboard/negotiations")}
              className="text-left bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-blue-50 dark:focus-visible:ring-offset-gray-900"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Negotiations</h3>
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {negotiations.filter(n => n.status === 'pending').length}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Pending requests</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center">
                View all
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}