"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Linkedin } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="bg-blue-950 dark:bg-gray-950 text-white py-10 md:py-12">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">reKraftt</h3>
            <p className="text-gray-300">From Waste to Worth</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-lg sm:text-xl font-bold">Stay Connected</h3>
            <p className="text-center text-gray-300 text-sm sm:text-base md:hidden">
              Follow us for authentic drops, buyer tips, and behind-the-scenes sustainability highlights.
            </p>
            <div className="flex space-x-4 text-gray-300">
              <a href="#" className="hover:text-white" aria-label="Twitter">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <h3 className="text-lg sm:text-xl font-bold leading-snug">Contact</h3>
            <div className="inline-flex items-center justify-center gap-2 text-gray-300 text-sm sm:text-base">
              <MapPin className="h-4 w-4" />
              456 Reuse Street, Greenfield, Pune
            </div>
            <a
              className="text-gray-300 text-sm sm:text-base inline-flex items-center justify-center gap-1 hover:text-white"
              href="mailto:contact@rekraftt.com"
            >
              <Mail className="h-4 w-4" />
              contact@rekraftt.com
            </a>
            <a
              className="text-gray-300 text-sm sm:text-base inline-flex items-center justify-center gap-1 hover:text-white"
              href="tel:+1234567890"
            >
              <Phone className="h-4 w-4" />
              +123 456 7890
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 md:pt-8 flex flex-col gap-3 md:flex-row justify-between items-center text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
            <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
              Terms & Conditions
            </Link>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
              Privacy Policy
            </Link>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
              Sustainability Reports
            </Link>
          </div>
          <div className="text-gray-300 text-xs sm:text-sm">© 2025 reKraftt</div>
        </div>
      </div>
    </footer>
  )
}
