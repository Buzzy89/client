'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateAvatar } from '@/utils/api'
import Image from 'next/image'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)
      await updateAvatar(user.id, file)
      await refreshUser() // Refresh user data to get new avatar URL
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-dark-200 rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-neon-blue mb-6">Profile</h1>
          
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={user?.avatar || '/default-avatar.png'}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <label className="cursor-pointer bg-neon-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                {uploading ? 'Uploading...' : 'Change Avatar'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-400">Username</label>
              <p className="text-white text-lg">{user?.username}</p>
            </div>
            <div>
              <label className="text-gray-400">Email</label>
              <p className="text-white text-lg">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 