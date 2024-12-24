'use client'

import { useEffect, useState } from 'react'
import { getUserProfile, type Post, type Comment } from '@/utils/api'
import Image from 'next/image'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: number
  username: string
  email: string
  avatar: string | null
  recentPosts: Post[]
  recentComments: Comment[]
}

interface Props {
  userId: string
}

export default function ProfileContent({ userId }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getUserProfile(parseInt(userId))
        if (!data) {
          setError('Profile not found')
          return
        }
        setProfile(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (error instanceof Error) {
          setError(error.message || 'Failed to load profile')
        } else {
          setError('Failed to load profile')
        }
        // Redirect to home page if profile not found
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center text-red-500">
        {error || 'Profile not found'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-dark-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-dark-300 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">{profile.username[0].toUpperCase()}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neon-blue">{profile.username}</h1>
              <p className="text-gray-400">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-neon-purple mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {profile.recentPosts && profile.recentPosts.length > 0 ? (
                profile.recentPosts.map(post => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="block bg-dark-200 rounded-lg overflow-hidden hover:shadow-neon-blue transition-shadow duration-300"
                  >
                    <div className="relative h-48 w-full">
                      {post.mediaUrl ? (
                        <Image
                          src={post.mediaUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-300 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-neon-blue">{post.title}</h3>
                      <p className="text-gray-400 text-sm mt-2">{post.description}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400">No posts yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-neon-purple mb-4">Recent Comments</h2>
            <div className="space-y-4">
              {profile.recentComments && profile.recentComments.length > 0 ? (
                profile.recentComments.map(comment => (
                  <Link
                    key={comment.id}
                    href={`/post/${comment.postId}`}
                    className="block bg-dark-200 p-4 rounded-lg hover:shadow-neon-blue transition-shadow duration-300"
                  >
                    <p className="text-gray-300">{comment.content}</p>
                    <div className="mt-2 flex justify-between items-center text-sm">
                      <span className="text-neon-blue">On Post #{comment.postId}</span>
                      <span className="text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}