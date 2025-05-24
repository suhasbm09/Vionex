// src/components/Footer.jsx
import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full mt-12 px-4">
      <div className="mx-auto  text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg py-6 px-8 text-gray-300 transition-all">
        <p className="text-lg">
          © {new Date().getFullYear()}{' '}
          <span className="text-white font-semibold">Vionex</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  )
}
