'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { login, register } from '../utils/api'

interface AuthPopupProps {
  onClose: () => void
}

export default function AuthPopup({ onClose }: AuthPopupProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const { token, user } = await login(username, password)
        authLogin(token, user)
        onClose()
      } else {
        await register(username, password, email)
        const { token, user } = await login(username, password)
        authLogin(token, user)
        setIsLogin(true)
        onClose()
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-200 p-8 rounded-lg shadow-lg w-96 border border-neon-blue">
        <h2 className="text-2xl font-bold mb-6 text-center text-neon-blue font-display">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
          />
          {!isLogin && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input"
            />
          )}
          <button
            type="submit"
            className="btn w-full"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-neon-purple hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-dark-300 text-white px-4 py-2 rounded-md hover:bg-dark-100 transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}

