'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-dark-200 border-b border-neon-blue shadow-neon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-display text-neon-blue hover:text-neon-purple transition-colors duration-300 tracking-wider">
                Mystical Object Emporium
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6">
                <Link 
                  href="/createpost"
                  className="btn"
                >
                  Create Post
                </Link>

                <div className="ml-3 relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="h-10 w-10 rounded-full bg-dark-100 border-2 border-neon-blue 
                    flex items-center justify-center text-neon-blue hover:text-neon-purple 
                    hover:border-neon-purple transition-all duration-300 shadow-neon 
                    hover:shadow-neon-purple font-display"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user?.username?.[0]?.toUpperCase()}
                  </button>

                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md 
                    bg-dark-100 border border-neon-blue shadow-neon">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-neon-blue hover:text-neon-purple hover:bg-dark-200"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-neon-blue hover:text-neon-purple hover:bg-dark-200"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-neon-blue hover:text-neon-purple transition-colors px-3 py-2 rounded-md text-sm font-display"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

