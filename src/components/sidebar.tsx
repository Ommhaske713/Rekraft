"use client"

import { LayoutGrid, FileText, BarChart2, Wallet, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface SidebarProps {
  activeIcon?: "grid" | "file" | "chart" | "wallet"
}

export default function Sidebar({ activeIcon = "grid" }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [active, setActive] = useState<string>(activeIcon)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const isBricksBlocksPage = pathname === "/products/bricks-blocks"

  const handleIconClick = (icon: string) => {
    if (icon === "grid") {
      if (isBricksBlocksPage) {
        setIsFilterOpen(!isFilterOpen)
      }
    } else if (icon === "chart") {
      router.push("/analytics")
    } else if (icon === "wallet") {
      router.push("/negotiation")
    }
    setActive(icon)
  }

  useEffect(() => {
    if (!isBricksBlocksPage) {
      setIsFilterOpen(false)
    }
  }, [pathname, isBricksBlocksPage])

  return (
    <div className="flex">
      <div
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-40 bg-white dark:bg-gray-900 transition-all duration-300 overflow-y-auto ${
          isFilterOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0"
        }`}
      >
        <div className="w-64 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">Filters</h2>
            <button
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsFilterOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">Sofa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">Table</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">Windows</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-900 dark:text-blue-500 focus:ring-blue-900 dark:focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">Lamps</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">Budget</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select a price range</p>
            <div className="relative pt-1">
              <input
                type="range"
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">1,000 Rs</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">1L+ Rs</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">Location</h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
              <input
                type="text"
                placeholder="Enter Pincode"
                className="w-full bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsFilterOpen(false)}
        ></div>
      )}

      <aside className="w-full md:w-16 mb-6 md:mb-0 flex md:flex-col justify-around md:justify-start items-center md:items-center md:space-y-8 md:pr-4 md:py-8 z-20">
        <button
          className={`p-2 rounded-md ${
            active === "grid"
              ? "text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-300"
          } ${!isBricksBlocksPage && active === "grid" ? "cursor-default" : "cursor-pointer"}`}
          onClick={() => handleIconClick("grid")}
          title={isBricksBlocksPage ? "Open Filters" : "Filters (only available on Bricks & Blocks page)"}
        >
          <LayoutGrid className="h-6 w-6" />
        </button>
        <button
          className={`p-2 rounded-md ${
            active === "file"
              ? "text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-300"
          }`}
          onClick={() => handleIconClick("file")}
        >
          <FileText className="h-6 w-6" />
        </button>
        <button
          className={`p-2 rounded-md ${
            active === "chart"
              ? "text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-300"
          }`}
          onClick={() => handleIconClick("chart")}
        >
          <BarChart2 className="h-6 w-6" />
        </button>
        <button
          className={`p-2 rounded-md ${
            active === "wallet"
              ? "text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-300"
          }`}
          onClick={() => handleIconClick("wallet")}
        >
          <Wallet className="h-6 w-6" />
        </button>
      </aside>
    </div>
  )
}

