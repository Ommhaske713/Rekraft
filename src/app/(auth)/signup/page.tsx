"use client"

import type React from "react"
import Link from "next/link"
import { User, Loader2, X, Eye, EyeOff } from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"

export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    emailId: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    landmark: "",
    password: "",
    confirmPassword: "",
    businessName: "", 
    businessDescription: "" 
  })

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
        if (!value.trim()) error = "Full name is required"
        else if (value.trim().length < 2) error = "Name must be at least 2 characters"
        break
      case "mobileNumber":
        if (!value.trim()) error = "Mobile number is required"
        else if (!/^\d{10}$/.test(value.replace(/[\s-]/g, ""))) error = "Enter a valid 10-digit mobile number"
        break
      case "emailId":
        if (!value.trim()) error = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address"
        break
      case "address":
        if (!value.trim()) error = "Street address is required"
        else if (value.trim().length < 5) error = "Address must be at least 5 characters"
        break
      case "city":
        if (!value.trim()) error = "City is required"
        else if (value.trim().length < 2) error = "City name must be at least 2 characters"
        break
      case "state":
        if (!value.trim()) error = "State/Province is required"
        break
      case "postalCode":
        if (!value.trim()) error = "Postal code is required"
        else if (!/^\d{6}$/.test(value.replace(/[\s-]/g, ""))) error = "Enter a valid 6-digit postal code"
        break
      case "country":
        if (!value.trim()) error = "Country is required"
        break
      case "password":
        if (!value) error = "Password is required"
        else if (value.length < 8) error = "Password must be at least 8 characters"
        else if (!/(?=.*[a-z])/.test(value)) error = "Password must contain at least one lowercase letter"
        else if (!/(?=.*[A-Z])/.test(value)) error = "Password must contain at least one uppercase letter"
        else if (!/(?=.*\d)/.test(value)) error = "Password must contain at least one number"
        else if (!/(?=.*[@$!%*?&#])/.test(value)) error = "Password must contain at least one special character (@$!%*?&#)"
        break
      case "confirmPassword":
        if (!value) error = "Please confirm your password"
        else if (value !== formData.password) error = "Passwords do not match"
        break
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    return error === ""
  }

  const validateForm = (): boolean => {
    const requiredFields = [
      "fullName",
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

  const validateStep = (step: number): boolean => {
    let fieldsToValidate: string[] = []
    
    switch(step) {
      case 1:
        fieldsToValidate = ["fullName"]
        break
      case 2:
        fieldsToValidate = ["mobileNumber", "address", "city", "state", "postalCode", "country"]
        break
      case 3:
        fieldsToValidate = ["emailId", "password", "confirmPassword"]
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
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError("")
  }

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      setProfileImage(file)

      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearSelectedImage = () => {
    setProfileImage(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      setError("Please fix all errors before submitting")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const role = "customer"

      const userData: {
        username: string;
        phone: string;
        email: string;
        password: string;
        role: string;
        address: {
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
      } = {
        username: formData.fullName,
        phone: formData.mobileNumber,
        email: formData.emailId,
        password: formData.password,
        role,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        }
      }
      
      const response = await axios.post('/api/sign-up', userData)

      if (profileImage && response.data?.id) {
        try {
          const userId = response.data.id
          const formData = new FormData()
          formData.append('avatar', profileImage)

          await axios.patch(`/api/users/${userId}/initial-profile-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } catch (imageError) {
          console.error("Failed to upload profile image:", imageError)
        }
      }

      setShowSuccessToast(true)

      setTimeout(() => {
        router.push(
          `/verify?email=${encodeURIComponent(formData.emailId)}&redirect=/products&password=${encodeURIComponent(formData.password)}`
        )
      }, 2000)
      
    } catch (caughtError: unknown) {
      console.error("Signup error:", caughtError)
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.error || "Failed to create account")
      } else {
        setError("Failed to create account")
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
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Join reKraftt today and start buying sustainable construction materials
            </p>
          </div>

          <div className="flex justify-center mb-6 md:mb-10">
            <div className="flex flex-wrap justify-center gap-2 md:gap-8">
              {[
                { num: 1, label: "Personal Info" },
                { num: 2, label: "Location" },
                { num: 3, label: "Password" }
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
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl && (
                  <div className="relative w-32 h-32 mb-4">
                    <Image 
                      src={previewUrl} 
                      alt="Profile Preview" 
                      width={128} 
                      height={128}
                      className="rounded-full object-cover w-32 h-32 border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleImageSelect}
                  className="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
                >
                  <User className="h-4 w-4 mr-2" />
                  {previewUrl ? "Change Profile Picture" : "Insert Your Display Picture"}
                </button>
              </div>
            </div>
            )}

            {currentStep === 2 && (
            <>
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Location Details</h2>
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

            <div className="space-y-4">
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
              <div>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby Landmark"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            </>
            )}

            {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Email & Password</h2>
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
                  Please enter a valid email—an OTP will be sent for verification.
                </p>
              </div>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
              {currentStep < 3 ? (
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

            <div className="text-center text-gray-600 dark:text-gray-400 text-sm md:text-base mt-6 md:mt-4">
              Are you a vendor? <Link href="/seller-form" className="text-blue-600 hover:underline">Register as a Seller</Link>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}