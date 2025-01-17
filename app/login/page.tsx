'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      
      // Store the token and user data using AuthContext
      if (data.token && data.user) {
        await login(credentials.username, credentials.password); // This will update the AuthContext
        router.push('/'); // Redirect to home page after successful login
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-dark-200 border-2 border-neon-blue rounded-lg shadow-neon max-w-md w-full p-8 transform transition-all">
        <h2 className="text-3xl font-display text-neon-blue text-center mb-8">
          Sign In
        </h2>
        
        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-neon-blue font-display text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="input mt-1"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-neon-blue font-display text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input mt-1"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn w-full"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
} 