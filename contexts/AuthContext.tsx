'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '@/utils/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  ProtectedRoute: (props: { children: React.ReactNode }) => React.ReactNode
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      console.log('Initial auth check - token:', token)
      
      if (token) {
        try {
          api.protected.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await refreshUser()
          console.log('Auth initialized with token')
        } catch (error) {
          console.error('Auth initialization error:', error)
          handleLogout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current token in AuthContext:', token);
    
    if (token) {
      // Token'ı decode edip süresini kontrol edelim
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        console.log('Token payload:', payload);
        
        // Token süresi dolmuş mu?
        if (payload.exp * 1000 < Date.now()) {
          console.warn('Token expired, logging out');
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.protected.get('/api/users/me')
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Refresh user error:', error)
      handleLogout()
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await api.public.post('/auth/login', { username, password });
      console.log('Login response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Token'ı api instance'ına da ekleyelim
        api.protected.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        console.log('Token stored:', {
          localStorage: localStorage.getItem('token'),
          headers: api.protected.defaults.headers.common['Authorization']
        });

        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        console.error('No token in response:', response.data);
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.public.post('/api/auth/register', {
        username,
        email,
        password
      })
      
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      api.protected.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete api.protected.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  // Protected route wrapper component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
      if (!isAuthenticated && !loading) {
        router.push('/login')
      }
    }, [isAuthenticated, loading])

    if (loading) return <div>Loading...</div>
    if (!isAuthenticated) return null

    return <>{children}</>
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout: handleLogout,
      refreshUser,
      ProtectedRoute
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

