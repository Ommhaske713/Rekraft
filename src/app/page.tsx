"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Phone, Mail, Menu, X, LogOut, Hammer, Loader2, Home as HomeIcon, Info, Briefcase, ShieldCheck, TrendingDown, Leaf } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import SiteFooter from "@/components/site-footer"
import ViewExperienceTip from "@/components/view-experience-tip"

const TESTIMONIALS = [
  {
    name: "Rajesh Singh",
    role: "Builder, Mumbai",
    time: "2 days ago",
    content: "Bought premium quality bricks at 60% less than market price! The negotiation feature helped me get an even better deal. Perfect for my construction project. Highly recommended!",
    initials: "RS",
    gradient: "from-green-500 to-blue-500"
  },
  {
    name: "Anita Patel",
    role: "Architect, Pune",
    time: "5 days ago",
    content: "Amazing platform for sustainable construction! Got authentic reclaimed doors and metal fixtures. The quality verification process gives peace of mind. Great for eco-conscious projects.",
    initials: "AP",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Vikram Malhotra",
    role: "Contractor, Delhi",
    time: "1 week ago",
    content: "I was skeptical about buying used materials, but reKraftt changed my mind. The quality is top-notch and the savings are huge. Will definitely use again.",
    initials: "VM",
    gradient: "from-orange-500 to-red-500"
  },
  {
    name: "Suresh Reddy",
    role: "Developer, Hyderabad",
    time: "3 days ago",
    content: "Found excellent steel reinforcement bars for my new project. The sellers are genuine and the transaction was smooth. A game changer for the industry.",
    initials: "SR",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    name: "Priya Sharma",
    role: "Interior Designer, Bangalore",
    time: "2 weeks ago",
    content: "Sourced some beautiful vintage tiles and wood panels. My clients loved the unique look and the sustainability aspect. Thank you reKraftt!",
    initials: "PS",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    name: "Amit Verma",
    role: "Civil Engineer, Chennai",
    time: "4 days ago",
    content: "Great initiative to reduce construction waste. The platform is easy to use and the material quality is verified. Good for the pocket and the planet.",
    initials: "AV",
    gradient: "from-teal-500 to-emerald-500"
  },
  {
    name: "Neha Gupta",
    role: "Homeowner, Gurgaon",
    time: "1 day ago",
    content: "Renovating my home on a budget was made possible by reKraftt. Found great bathroom fittings and tiles at a fraction of the cost.",
    initials: "NG",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    name: "Rohan Das",
    role: "Construction Manager, Kolkata",
    time: "6 days ago",
    content: "We saved a lot on bulk purchase of cement blocks. The logistics support was also helpful. Highly efficient marketplace.",
    initials: "RD",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    name: "Kavita Iyer",
    role: "Sustainability Consultant, Kochi",
    time: "1 week ago",
    content: "Finally a platform that addresses construction waste seriously. I recommend reKraftt to all my clients for sourcing low-carbon materials.",
    initials: "KI",
    gradient: "from-lime-500 to-green-500"
  },
  {
    name: "Arjun Nair",
    role: "DIY Enthusiast, Trivandrum",
    time: "3 days ago",
    content: "Found some great wood scraps for my weekend projects. It's like a treasure hunt! Love the concept.",
    initials: "AN",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    name: "Meera Joshi",
    role: "Renovation Specialist, Ahmedabad",
    time: "5 days ago",
    content: "The variety of materials available is impressive. From electrical fixtures to plumbing, I found everything I needed for a quick office renovation.",
    initials: "MJ",
    gradient: "from-fuchsia-500 to-pink-500"
  },
  {
    name: "Sanjay Kapoor",
    role: "Real Estate Developer, Noida",
    time: "2 days ago",
    content: "Cost efficiency is key in our business. reKraftt helps us cut material costs without compromising on quality. A must-have tool for developers.",
    initials: "SK",
    gradient: "from-red-500 to-orange-500"
  },
  {
    name: "Divya Singh",
    role: "Landscape Architect, Jaipur",
    time: "1 week ago",
    content: "Sourced natural stones and pavers for a landscaping project. The materials were in excellent condition and added a rustic charm.",
    initials: "DS",
    gradient: "from-amber-500 to-yellow-500"
  },
  {
    name: "Rahul Mehta",
    role: "Site Supervisor, Surat",
    time: "4 days ago",
    content: "Easy to list leftover materials and equally easy to buy what we are short of. Keeps the site clean and recovers some costs.",
    initials: "RM",
    gradient: "from-sky-500 to-blue-500"
  },
  {
    name: "Anjali Desai",
    role: "Green Building Auditor, Mumbai",
    time: "3 days ago",
    content: "Using reclaimed materials contributes significantly to green building points. reKraftt makes documentation and sourcing transparent and easy.",
    initials: "AD",
    gradient: "from-emerald-500 to-teal-500"
  }
]

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
  const [emailError, setEmailError] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [navigationState, setNavigationState] = useState<"idle" | "buy" | "sell" | "signin">("idle")
  const [displayedTestimonials, setDisplayedTestimonials] = useState(TESTIMONIALS.slice(0, 2))

  useEffect(() => {
    // Randomly select 2 testimonials on mount
    const shuffled = [...TESTIMONIALS].sort(() => 0.5 - Math.random())
    setDisplayedTestimonials(shuffled.slice(0, 2))
  }, [])

  const isNavigating = navigationState !== "idle"
  const isBuyLoading = navigationState === "buy"
  const isSellLoading = navigationState === "sell"
  const isSignInLoading = navigationState === "signin"
  const desktopProfileLabel = isAuthenticated
    ? (session?.user?.role === 'seller' ? 'Dashboard' : 'Explore Materials')
    : (isSignInLoading ? 'Signing In...' : 'Sign In')
  const mobileProfileLabel = isAuthenticated
    ? (session?.user?.role === 'seller' ? 'Dashboard' : 'Explore Materials')
    : (isSignInLoading ? 'Signing In...' : 'Sign In')

  const handleBuyClick = () => {
    setNavigationState("buy")
    router.push(isAuthenticated ? "/products" : "/signup")
  }

  const handleSellClick = () => {
    setNavigationState("sell")
    if (isAuthenticated && session?.user?.role === 'seller') {
      router.push('/seller-dashboard')
    } else {
        router.push('/seller-form')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleProfileClick = () => {
    if (isAuthenticated) {
      const userRole = session?.user?.role || 'customer'
      
      if (userRole === 'seller') {
        router.push('/seller-dashboard')
      } else {
        router.push('/products')
      }
      return
    }

    setNavigationState("signin")
    router.push('/signin')
  }

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false) 
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const isValidEmail = (email: string) => {
    const value = email.trim()
    if (!value) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(contactForm.email)) {
      setEmailError("Please provide a valid email so we can reply directly.")
      return
    }

    setEmailError("")
    // Here you would typically send this to your backend
    console.log('Contact form submitted:', contactForm)
    
    // Show success toast
    setShowToast(true)
    
    // Clear form
    setContactForm({ name: "", email: "", message: "" })
    
    // Hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container flex h-16 items-center justify-between">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12" style={{margin: '0px 0px 0px -90px'}}>
            <button
              onClick={() => scrollToSection("home")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              About Us
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact Us
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <button 
              type="button"
              onClick={handleProfileClick}
              disabled={isSignInLoading}
              className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 dark:from-green-500 dark:to-blue-500 text-white px-4 py-2 rounded-md hidden sm:block ${isSignInLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isAuthenticated ? desktopProfileLabel : (
                isSignInLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </span>
                ) : 'Sign In'
              )}
            </button>
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md hidden sm:block ml-2"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Logout
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-800 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-5 duration-200">
            <div className="container py-4 space-y-2 px-4">
              <button
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-3 font-medium p-3 text-gray-800 dark:text-gray-200 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HomeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="flex items-center gap-3 font-medium p-3 text-gray-800 dark:text-gray-200 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                About Us
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="flex items-center gap-3 font-medium p-3 text-gray-800 dark:text-gray-200 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Services
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="flex items-center gap-3 font-medium p-3 text-gray-800 dark:text-gray-200 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Contact Us
              </button>
              <button 
                type="button"
                onClick={handleProfileClick}
                disabled={isSignInLoading}
                className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 dark:from-green-500 dark:to-blue-500 text-white px-4 py-2 rounded-md w-full sm:hidden ${isSignInLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isAuthenticated ? mobileProfileLabel : (
                  isSignInLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing In...</span>
                    </span>
                  ) : 'Sign In'
                )}
              </button>
              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md w-full sm:hidden flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative h-[350px] sm:h-[400px] md:h-[450px]">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="relative h-full bg-[url(/home.jpg?height=450&width=1200)] bg-cover bg-center">
            <div className="container relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
              <div className="w-full max-w-xs sm:max-w-md mx-auto mb-6 md:mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-10 py-2 md:py-3 rounded-md w-full bg-white text-black dark:bg-gray-800 dark:text-white shadow-lg md:shadow-none"
                    placeholder="Find your product"
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 md:mb-4 px-4">
                Turn Waste Into Opportunity
              </h1>
              <p className="text-center mb-6 md:mb-8 px-4 text-sm sm:text-base">
                From Waste To Worth - Connecting Builders, Buyers And Sustainability
              </p>
              <div className="flex space-x-4">
                <button
                  className={`flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base transition ${isNavigating ? "opacity-80 cursor-wait" : ""}`}
                  onClick={handleBuyClick}
                  disabled={isNavigating}
                  type="button"
                >
                  {isBuyLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Buy"
                  )}
                </button>
                <button
                  className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base transition ${isNavigating ? "opacity-80 cursor-wait" : ""}`}
                  onClick={handleSellClick}
                  disabled={isNavigating}
                  type="button"
                >
                  {isSellLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Sell"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-10 md:py-16 bg-white dark:bg-gray-900">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="h-[200px] sm:h-[250px] md:h-[300px] relative rounded-lg overflow-hidden shadow-lg md:shadow-none">
                <Image
                  src="/homepageImage.png?height=300&width=500"
                  alt="Sustainable materials"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-6 md:mt-0 text-center md:text-left">
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">About Us</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                  Get Sustainable With Reusability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-6 text-sm sm:text-base leading-relaxed">
                  reKraftt is India&apos;s premier marketplace for construction waste materials. We connect builders and sellers with buyers who value quality, affordability, and sustainability.
                </p>

                {/* Mobile View: Feature Cards */}
                <div className="grid grid-cols-3 gap-3 md:hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Verified</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Save 70%</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Eco-Friendly</span>
                  </div>
                </div>

                {/* Desktop View: List (Hidden on Mobile) */}
                <div className="hidden md:block space-y-3 md:space-y-4 text-left">
                  <div className="flex items-start">
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">✓ Verified Products:</span> All listings are verified for quality and authenticity
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">✓ Save Up to 70%:</span> Get premium construction materials at affordable prices
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">✓ Eco-Friendly:</span> Reduce waste and contribute to a sustainable future
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-10 md:py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              What We Offer
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-8 md:mb-12 max-w-3xl mx-auto text-center">
              Discover premium construction materials at unbeatable prices. Every product is quality-verified and sourced sustainably to support your building projects.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="relative group overflow-hidden rounded-lg shadow-lg md:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/40 z-10"></div>
                <Image
                  src="/bricks2.jpg?height=300&width=300"
                  alt="Bricks & Blocks"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Bricks & Blocks</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg shadow-lg md:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/40 z-10"></div>
                <Image
                  src="/paint.jpg?height=300&width=300"
                  alt="Paints & Chemicals"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Paints & Chemicals</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg shadow-lg md:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/40 z-10"></div>
                <Image
                  src="/metal.jpg?height=300&width=300"
                  alt="Metal"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Metal</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg shadow-lg md:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/40 z-10"></div>
                <Image
                  src="/07.jpg?height=300&width=300"
                  alt="Doors"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Doors</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-10 md:py-16 bg-white dark:bg-gray-900">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">What Our Clients Say</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                  Real Stories From Our Community
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4">
                  Join thousands of satisfied customers who are saving money and building sustainably with reKraftt.
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 hidden md:block">
                  We take pride in fostering a transparent marketplace where quality meets affordability. Every transaction on our platform represents a step towards a greener construction industry.
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base hidden md:block">
                  Whether you&apos;re sourcing materials for a large project or a home renovation, our community&apos;s experiences highlight the value and reliability we bring to every deal.
                </p>
              </div>
              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                {displayedTestimonials.map((testimonial, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} text-white flex items-center justify-center mr-3 font-semibold`}>
                        <span>{testimonial.initials}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                      </div>
                      <div className="ml-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400">{testimonial.time}</div>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      &quot;{testimonial.content}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="py-10 md:py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3 md:mb-4">
              Get In Touch
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 md:mb-8 text-sm sm:text-base px-4">
              Have questions or feedback? We&apos;d love to hear from you. Drop us a message!
            </p>
            <div className="max-w-md mx-auto px-4 sm:px-0 relative">
              {showToast && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in">
                  <span className="text-lg">✓</span>
                  <span>Message sent successfully!</span>
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  placeholder="Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                  <input
                    placeholder="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => {
                      setContactForm({...contactForm, email: e.target.value})
                      if (emailError) {
                        setEmailError("")
                      }
                    }}
                    required
                    className="w-full px-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-rose-600">{emailError}</p>
                  )}
                <textarea
                  placeholder="Message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                  className="w-full px-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent min-h-[120px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <div className="flex justify-center">
                  <button type="submit" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 sm:px-8 py-2 rounded-md text-sm sm:text-base transition-colors">
                    Send Message
                  </button>
                </div>
              </form>
              <div className="mt-6 md:mt-8 flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email: contact@rekraftt.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Phone: +123 456 7890</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ViewExperienceTip />
      <SiteFooter />
    </div>
  )
}

