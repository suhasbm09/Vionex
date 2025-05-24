// src/components/Header.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X } from 'lucide-react'

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isLoggedIn = Boolean(user.id)
  const displayName = user.displayName

  const pages = [
    { label: '🏠 Home', path: '/' },
    { label: '📦 Donor', path: '/donor-dashboard' },
    { label: '🏥 NGO', path: '/ngo-dashboard' },
    { label: '👤 Edit Donor', path: '/donor-profile' },
    { label: '📝 Edit NGO', path: '/ngo-profile' },
  ]

  const toggleDark = () => {
    setDarkMode(d => !d)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  const handleAuth = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <>
      <header className="fixed inset-x-4 top-4 z-50 flex justify-between items-center p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2">
            {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
          <div className="text-2xl font-bold tracking-wide">Vionex</div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDark}
            className="p-2 bg-white/10 rounded-full border border-white/20 transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleAuth}
              className="px-4 py-1 bg-red-600 hover:bg-red-500 rounded-full transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-full transition"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl text-white z-40">
          <nav className="flex flex-col gap-2">
            {pages.map(p => (
              <Link
                key={p.path}
                to={p.path}
                onClick={() => setSidebarOpen(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  pathname === p.path
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-white/20'
                }`}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}
    </>
  )
}
