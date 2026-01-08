"use client"

import type React from "react"
import { User, Loader2, X, Eye, EyeOff } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"

export default function SellerFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    mobileNumber: "",
    emailId: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    storeLocation: "",
    storeDescription: "",
    password: "",
    confirmPassword: "",
    profileImage: null as File | null,
  })

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName)
  }

  const validateField = (fieldName: string): boolean => {
    const value = formData[fieldName as keyof typeof formData]
    let error = ""

    switch (fieldName) {
      case "fullName":
        if (!value || typeof value === 'string' && !value.trim()) error = "Full name is required"
        else if (typeof value === 'string' && value.trim().length < 2) error = "Name must be at least 2 characters"
        break
      case "displayName":
        if (!value || typeof value === 'string' && !value.trim()) error = "Business/Display name is required"
        else if (typeof value === 'string' && value.trim().length < 2) error = "Business name must be at least 2 characters"
        break
      case "mobileNumber":
        if (!value || typeof value === 'string' && !value.trim()) error = "Mobile number is required"
        else if (typeof value === 'string' && !/^\d{10}$/.test(value.replace(/[\s-]/g, ""))) error = "Enter a valid 10-digit mobile number"
        break
      case "emailId":
        if (!value || typeof value === 'string' && !value.trim()) error = "Email is required"
        else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address"
        break
      case "address":
        if (!value || typeof value === 'string' && !value.trim()) error = "Street address is required"
        else if (typeof value === 'string' && value.trim().length < 5) error = "Address must be at least 5 characters"
        break
      case "storeLocation":
        if (value && typeof value === 'string' && value.trim().length > 0 && value.trim().length < 5) {
          error = "Store location must be at least 5 characters"
        }
        break
      case "storeDescription":
        if (value && typeof value === 'string' && value.trim().length > 0 && value.trim().length < 10) {
          error = "Description must be at least 10 characters"
        }
        break
      case "city":
        if (!value || typeof value === 'string' && !value.trim()) error = "City is required"
        else if (typeof value === 'string' && value.trim().length < 2) error = "City name must be at least 2 characters"
        break
      case "state":
        if (!value || typeof value === 'string' && !value.trim()) error = "State/Province is required"
        break
      case "postalCode":
        if (!value || typeof value === 'string' && !value.trim()) error = "Postal code is required"
        else if (typeof value === 'string' && !/^\d{6}$/.test(value.replace(/[\s-]/g, ""))) error = "Enter a valid 6-digit postal code"
        break
      case "country":
        if (!value || typeof value === 'string' && !value.trim()) error = "Country is required"
        break
      case "password":
        if (!value) error = "Password is required"
        else if (typeof value === 'string' && value.length < 8) error = "Password must be at least 8 characters"
        else if (typeof value === 'string' && !/(?=.*[a-z])/.test(value)) error = "Password must contain at least one lowercase letter"
        else if (typeof value === 'string' && !/(?=.*[A-Z])/.test(value)) error = "Password must contain at least one uppercase letter"
        else if (typeof value === 'string' && !/(?=.*\d)/.test(value)) error = "Password must contain at least one number"
        else if (typeof value === 'string' && !/(?=.*[@$!%*?&#])/.test(value)) error = "Password must contain at least one special character (@$!%*?&#)"
        break
      case "confirmPassword":
        if (!value) error = "Please confirm your password"
        else if (value !== formData.password) error = "Passwords do not match"
        break
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    return error === ""
  }

  const validateAllFields = (): boolean => {
    const requiredFields = [
      "fullName",
      "displayName",
      "mobileNumber",
      "emailId",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "password",
      "confirmPassword"
    ]

    let isValid = true

    requiredFields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })

    const newTouched: { [key: string]: boolean } = {}
    requiredFields.forEach((field) => {
      newTouched[field] = true
    })
    setTouched(newTouched)

    return isValid
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setFormData((prev) => ({ ...prev, profileImage: file }))

      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, profileImage: null }))
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateStep = (step: number): boolean => {
    let fieldsToValidate: string[] = []
    
    switch(step) {
      case 1:
        fieldsToValidate = ["fullName", "displayName"]
        break
      case 2:
        fieldsToValidate = ["mobileNumber", "emailId"]
        break
      case 3:
        fieldsToValidate = ["address", "city", "state", "postalCode", "country"]
        break
      case 4:
        fieldsToValidate = ["password", "confirmPassword"]
        break
    }

    let isValid = true
    fieldsToValidate.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      if (!validateField(field)) {
        isValid = false
      }
    })

    if (!isValid) {
      setError("Please fix all validations before continuing")
    } else {
      setError("")
    }
    
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateAllFields()) {
      setError("Please fix all errors before submitting")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const userData = {
        username: formData.fullName,
        phone: formData.mobileNumber,
        email: formData.emailId,
        password: formData.password,
        role: 'seller',
        address: {
          street: formData.address || formData.storeLocation,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country || "India"
        },
        businessName: formData.displayName || formData.fullName,
        businessDescription: formData.storeDescription,
        negotiable: true
      }

      const response = await axios.post('/api/sign-up', userData)

      if (formData.profileImage && response.data?.id) {
        try {
          const imageFormData = new FormData()
          imageFormData.append('avatar', formData.profileImage)
          
          await axios.patch(
            `/api/users/${response.data.id}/initial-profile-image`, 
            imageFormData, 
            { headers: { 'Content-Type': 'multipart/form-data' }}
          )
        } catch (imageError) {
          console.error("Failed to upload profile image:", imageError)
        }
      }

      setShowSuccessToast(true)

      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(formData.emailId)}&password=${encodeURIComponent(formData.password)}`)
      }, 2000)
      
    } catch (caughtError: unknown) {
      console.error("Seller signup error:", caughtError)
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.error || "Failed to create seller account")
      } else {
        setError("Failed to create seller account")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestPassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "@$!%*?&#"
    const allChars = lowercase + uppercase + numbers + special
    
    let password = ""
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += special.charAt(Math.floor(Math.random() * special.length))

    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setFormData((prev) => ({ ...prev, password, confirmPassword: "" }))
    setFieldErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }))
    setTouched((prev) => ({ ...prev, password: true }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <main className="flex-1 py-6 md:py-10 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto relative">
          {showSuccessToast && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-fade-in max-w-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">Account Created Successfully!</p>
                <p className="text-sm text-green-100">Redirecting to verification...</p>
              </div>
            </div>
          )}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{
              background: 'linear-gradient(to right, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Become a Seller
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Start selling construction materials and grow your business with reKraftt
            </p>
          </div>

          <div className="flex justify-center mb-6 md:mb-10">
            <div className="flex flex-wrap justify-center gap-2 md:gap-8">
              {[
                { num: 1, label: "Display Info" },
                { num: 2, label: "Email & Phone" },
                { num: 3, label: "Store Details" },
                { num: 4, label: "Password" }
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    currentStep === step.num
                      ? 'bg-green-600 text-white'
                      : currentStep > step.num
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className={`text-xs md:text-sm mt-1 ${
                    currentStep === step.num
                      ? 'text-green-600 dark:text-green-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Personal Information</h2>
              <div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("fullName")}
                  placeholder="Enter Full Name*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.fullName && fieldErrors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {touched.fullName && fieldErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("displayName")}
                  placeholder="Enter Business Name*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.displayName && fieldErrors.displayName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {touched.displayName && fieldErrors.displayName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.displayName}</p>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {imagePreview ? "Change Profile Picture" : "Insert Your Display Picture"}
                  </button>

                  {imagePreview && (
                    <div className="mt-2">
                      <div className="flex items-start gap-2">
                        <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                          <Image 
                            src={imagePreview} 
                            alt="Profile preview" 
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Mobile Number & Email ID</h2>
              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur("mobileNumber")}
                  placeholder="Enter Mobile Number*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.mobileNumber && fieldErrors.mobileNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {touched.mobileNumber && fieldErrors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.mobileNumber}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  onBlur={() => handleBlur("emailId")}
                  placeholder="Enter Email ID*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.emailId && fieldErrors.emailId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {touched.emailId && fieldErrors.emailId && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.emailId}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please enter a valid email an OTP will be sent for verification.
                </p>
              </div>
            </div>
            )}

            {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Store Details</h2>
              <div>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  onBlur={() => handleBlur("storeDescription")}
                  placeholder="Store Description*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.storeDescription && fieldErrors.storeDescription ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  rows={3}
                  required
                />
                {touched.storeDescription && fieldErrors.storeDescription && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.storeDescription}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur("address")}
                  placeholder="Street Address*"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    touched.address && fieldErrors.address ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {touched.address && fieldErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={() => handleBlur("city")}
                    placeholder="City*"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.city && fieldErrors.city ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  {touched.city && fieldErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={() => handleBlur("state")}
                    placeholder="State/Province*"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.state && fieldErrors.state ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  {touched.state && fieldErrors.state && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.state}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={() => handleBlur("postalCode")}
                    placeholder="Postal Code*"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.postalCode && fieldErrors.postalCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  {touched.postalCode && fieldErrors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.postalCode}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={() => handleBlur("country")}
                    placeholder="Country*"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.country && fieldErrors.country ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  {touched.country && fieldErrors.country && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.country}</p>
                  )}
                </div>
              </div>
            </div>
            )}

            {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Create Password</h2>
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Create Password*"
                    className={`w-full px-4 py-3 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.password && fieldErrors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-1">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirm Password*"
                    className={`w-full px-4 py-3 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      touched.confirmPassword && fieldErrors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={suggestPassword}
                  className="text-blue-900 dark:text-blue-300 hover:underline text-sm"
                >
                  Suggest Strong Password
                </button>
              </div>
            </div>
            )}

            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              >
                ← Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-md font-medium transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>

            <div className="flex justify-center pt-4">
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}