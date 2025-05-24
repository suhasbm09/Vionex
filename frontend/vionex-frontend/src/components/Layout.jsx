// src/components/Layout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#00121F] to-[#002F34] text-white relative overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute -bottom-28 -right-24 w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />

      <Header />

      <main className="flex-grow pt-24 px-4 sm:px-8 pb-12">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
