"use client"

import Link from "next/link"
import { ArrowLeft, Rocket, Construction } from "lucide-react"

export default function CheckoutComingSoonPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Construction className="w-10 h-10 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">checkout unavailable</h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          We&apos;re working hard to bring you a seamless checkout experience. 
          This feature will be available in the next update.
        </p>

        <Link 
          href="/products" 
          className="inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Explore Marketplace
        </Link>
        <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                <Rocket className="w-3 h-3 mr-1.5" />
                Launching Soon
             </div>
        </div>

      </div>
    </div>
  )
}
