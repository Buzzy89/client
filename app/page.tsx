'use client'

import { useEffect, useState } from 'react'
import { getHomePosts } from '@/utils/api'
import PostCard from '@/components/PostCard'
import type { Post } from '@/utils/api'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getHomePosts()
        setPosts(response.content)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div className="text-center mt-8 text-neon-blue">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center mt-8 text-neon-blue">No posts found</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

