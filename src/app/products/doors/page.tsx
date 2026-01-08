"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, User, Edit, Trash2 } from "lucide-react"
import Sidebar from "@/components/sidebar"
import MobileMenu from "../../(auth)/signin/mobile-menu"

export default function DoorsProductPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              reKraftt.
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

          <div className="flex items-center space-x-2">
            <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
            <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container flex flex-col md:flex-row">
          <Sidebar activeIcon="grid" />

          <div className="flex-1 px-4 md:pl-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-900 dark:text-blue-300 mb-10">Doors</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image src="/07.jpg?height=300&width=400" alt="Steel Door" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Doors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Steel Door</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Negotiable</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image src="/wooden.jpg?height=300&width=400" alt="Wooden Door" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Doors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Wooden Door</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image src="/steeldoor.jpg?height=300&width=400" alt="Plastic Door" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Doors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Plastic Door</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-10 space-x-4">
              <button className="flex items-center bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-md">
                <Edit className="h-5 w-5 mr-2" />
                Edit Product
              </button>
              <button className="flex items-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 py-3 rounded-md">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

