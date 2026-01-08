"use client"

import Link from "next/link"
import { Search, User, ChevronDown } from "lucide-react"
import { useState } from "react"
import Sidebar from "@/components/sidebar"
import MobileMenu from "../(auth)/signin/mobile-menu"

export default function AnalyticsPage() {
  const [timeframeStats] = useState("Days")
  const [timeframeOverview] = useState("Month")

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
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
          {/* Sidebar Component */}
          <Sidebar activeIcon="chart" />

          {/* Main Content */}
          <div className="flex-1 px-4 md:pl-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-300 mb-8">Analytics Page</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Statistics</h2>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1">
                      {timeframeStats}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-center">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48 mx-auto md:mx-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Dark Blue Segment - Furniture */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#0F3B5C"
                          strokeWidth="20"
                          strokeDasharray="150 250"
                          strokeDashoffset="0"
                        />
                        {/* Medium Blue Segment - Fixture & fittings */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#3B7EA1"
                          strokeWidth="20"
                          strokeDasharray="70 250"
                          strokeDashoffset="-150"
                        />
                        {/* Light Blue Segment - Windows & Door */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#7FB3D5"
                          strokeWidth="20"
                          strokeDasharray="30 250"
                          strokeDashoffset="-220"
                        />
                        {/* Very Light Blue Segment - Glass & mirror */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#D4E6F1"
                          strokeWidth="20"
                          strokeDasharray="50 250"
                          strokeDashoffset="-250"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-blue-900 dark:text-blue-300">10K</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-0 md:ml-8 w-full">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#0F3B5C] mr-2"></div>
                        <div>
                          <p className="text-blue-900 dark:text-blue-300">Furniture</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">5,132.50</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#3B7EA1] mr-2"></div>
                        <div>
                          <p className="text-blue-900 dark:text-blue-300">Fixture & fittings</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">2,302.00</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#7FB3D5] mr-2"></div>
                        <div>
                          <p className="text-blue-900 dark:text-blue-300">Windows & Door</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">1,090.70</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#D4E6F1] mr-2"></div>
                        <div>
                          <p className="text-blue-900 dark:text-blue-300">Glass & mirror</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">2,007.30</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overview Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Overview</h2>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1">
                      {timeframeOverview}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative h-64">
                    {/* Line Chart */}
                    <svg viewBox="0 0 800 200" className="w-full h-full">
                      {/* X-axis */}
                      <line
                        x1="50"
                        y1="180"
                        x2="750"
                        y2="180"
                        stroke="#E5E7EB"
                        className="dark:stroke-gray-600"
                        strokeWidth="1"
                      />

                      {/* Y-axis */}
                      <line
                        x1="50"
                        y1="20"
                        x2="50"
                        y2="180"
                        stroke="#E5E7EB"
                        className="dark:stroke-gray-600"
                        strokeWidth="1"
                      />

                      {/* Y-axis labels */}
                      <text x="30" y="180" fontSize="10" textAnchor="end" fill="#6B7280" className="dark:fill-gray-400">
                        10k
                      </text>
                      <text x="30" y="140" fontSize="10" textAnchor="end" fill="#6B7280" className="dark:fill-gray-400">
                        20k
                      </text>
                      <text x="30" y="100" fontSize="10" textAnchor="end" fill="#6B7280" className="dark:fill-gray-400">
                        30k
                      </text>
                      <text x="30" y="60" fontSize="10" textAnchor="end" fill="#6B7280" className="dark:fill-gray-400">
                        50k
                      </text>

                      {/* X-axis labels */}
                      <text
                        x="100"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        JAN
                      </text>
                      <text
                        x="200"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        FEB
                      </text>
                      <text
                        x="300"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        MAR
                      </text>
                      <text
                        x="400"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        APR
                      </text>
                      <text
                        x="500"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        MAY
                      </text>
                      <text
                        x="600"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        JUN
                      </text>
                      <text
                        x="700"
                        y="195"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        JUL
                      </text>

                      {/* Line chart path */}
                      <path
                        d="M100,160 C150,140 180,170 200,130 C220,100 250,120 300,150 C350,170 380,120 400,100 C420,80 450,70 500,80 C550,90 580,60 600,70 C620,80 650,120 700,130"
                        fill="none"
                        stroke="#3B7EA1"
                        strokeWidth="3"
                      />

                      {/* Area under the line */}
                      <path
                        d="M100,160 C150,140 180,170 200,130 C220,100 250,120 300,150 C350,170 380,120 400,100 C420,80 450,70 500,80 C550,90 580,60 600,70 C620,80 650,120 700,130 L700,180 L100,180 Z"
                        fill="url(#blueGradient)"
                        opacity="0.3"
                      />

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B7EA1" />
                          <stop offset="100%" stopColor="#D4E6F1" />
                        </linearGradient>
                      </defs>

                      {/* Highlighted point */}
                      <circle cx="500" cy="80" r="5" fill="#3B7EA1" />
                      <line x1="500" y1="80" x2="500" y2="180" stroke="#3B7EA1" strokeWidth="1" strokeDasharray="4" />

                      {/* Highlighted point label */}
                      <rect x="470" y="50" width="60" height="20" rx="4" fill="#3B7EA1" />
                      <text x="500" y="65" fontSize="12" textAnchor="middle" fill="white">
                        25200
                      </text>
                      <text
                        x="500"
                        y="40"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        This Month
                      </text>
                      <text
                        x="500"
                        y="25"
                        fontSize="10"
                        textAnchor="middle"
                        fill="#6B7280"
                        className="dark:fill-gray-400"
                      >
                        May
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column - Metrics */}
              <div className="space-y-6">
                {/* Total Cash Balance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-200 dark:bg-yellow-900/30 flex items-center justify-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-300 dark:bg-yellow-700"></div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total Cash Balance</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">₹15,200</p>
                  </div>
                </div>

                {/* Inventory Left */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-blue-300 dark:bg-blue-700"></div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Inventory Left</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">112</p>
                  </div>
                </div>

                {/* Sales */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center">
                  <div className="w-16 h-16 rounded-full bg-red-200 dark:bg-red-900/30 flex items-center justify-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-red-300 dark:bg-red-700"></div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Sales</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">420</p>
                  </div>
                </div>

                {/* Growth */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center">
                  <div className="w-16 h-16 rounded-full bg-green-200 dark:bg-green-900/30 flex items-center justify-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-green-300 dark:bg-green-700"></div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Growth</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">5.6%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

