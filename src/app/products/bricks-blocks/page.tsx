"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import MobileMenu from "../../(auth)/signin/mobile-menu"

export default function BricksBlocksPage() {
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const handleAddToCart = () => {
    router.push("/cart")
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((product) => product !== productId) : [...prev, productId]
    )
  }

  const isProductSelected = useMemo(() => {
    return (productId: string) => selectedProducts.includes(productId)
  }, [selectedProducts])

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
            <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-900 dark:text-blue-300 mb-10">
              Bricks & Blocks
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image src="/bricks2.jpg?height=300&width=400" alt="Brick" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Bricks & Blocks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Brick</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Negotiable...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivery</p>
                    <div className="flex space-x-4 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Pick Up</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Deliver</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>

                  <button
                    className="w-full py-2 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md"
                    onClick={() => toggleProductSelection("brick")}
                  >
                    {isProductSelected("brick") ? "Added" : "Add to selection"}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image src="/blocks.webp?height=300&width=400" alt="Cement Block" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Bricks & Blocks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Cement Block</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Negotiable...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivery</p>
                    <div className="flex space-x-4 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Pick Up</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Deliver</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>

                  <button
                    className="w-full py-2 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md"
                    onClick={() => toggleProductSelection("cement-block")}
                  >
                    {isProductSelected("cement-block") ? "Added" : "Add to selection"}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="h-64 relative">
                  <Image
                    src="/solidconcrete.webp?height=300&width=400"
                    alt="Concrete Brick"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Bricks & Blocks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Rs. 1245 Each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Concrete Brick</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Negotiable...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">2</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivery</p>
                    <div className="flex space-x-4 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Pick Up</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">Deliver</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
                    </p>
                  </div>

                  <button
                    className="w-full py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-md hover:bg-blue-800 dark:hover:bg-blue-600"
                    onClick={handleAddToCart}
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

