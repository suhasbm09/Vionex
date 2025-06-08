// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col text-white relative bg-black/70 overflow-x-hidden">

      {/* 🔲 Optional grid overlay */}
      <div className="absolute inset-0 z-0 bg-dot-grid pointer-events-none" />

      {/* 💫 Gradient overlay (in CSS) */}
      <div className="absolute inset-0 z-[-1]"></div>

      {/* 🔝 Header */}
      <Header />

      {/* 📦 Main content */}
      <main className="flex-grow pt-30 px-4 sm:px-8  animate-fade-in">
        <Outlet />
      </main>

      {/* 🔚 Footer */}
      <Footer />
    </div>
  );
}
