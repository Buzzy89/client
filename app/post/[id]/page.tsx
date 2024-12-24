'use client'

import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPostById, createComment, getCommentsByPost, type Comment as ApiComment, type Post as ApiPost } from '@/utils/api'
import Image from 'next/image'
import { format, formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { EditPostForm } from '@/components/EditPostForm'
import type { Post, Tag } from '@/utils/api'
import api from '@/utils/api'

export default function PostDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<ApiComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuth()

  const fetchPost = useCallback(async () => {
    try {
      console.log('Fetching post details - ID:', params?.id);
      const fetchedPost = await getPostById(Number(params?.id));
      console.log('Post data received:', fetchedPost);
      const formattedPost = {
        ...fetchedPost,
        tags: fetchedPost.tags || []
      } as Post;
      setPost(formattedPost);
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [fetchPost]);

  const fetchComments = useCallback(async () => {
    try {
      console.log('Fetching comments for post:', id);
      const fetchedComments = await getCommentsByPost(Number(id));
      console.log('Comments received:', fetchedComments);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [fetchComments]);

  const handleEditSuccess = async () => {
    await fetchPost();
    setIsEditing(false);
  };

  // Move CommentForm inside to access post.id
  const CommentForm = ({ parentId, onCommentSubmit }: { parentId?: number, onCommentSubmit: () => void }) => {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user || !content.trim() || !post?.id) return;

      setIsSubmitting(true)
      try {
        console.log('Creating comment with token:', localStorage.getItem('token'));
        console.log('Comment data:', {
          content: content.trim(),
          postId: post.id,
          userId: user.id,
          parentId
        });

        const response = await createComment({
          content: content.trim(),
          postId: post.id,
          userId: user.id,
          parentId: parentId || undefined
        });

        console.log('Comment created:', response);
        setContent('')
        onCommentSubmit()
      } catch (error) {
        console.error('Failed to submit comment:', error);
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 bg-dark-300 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`mt-2 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-purple transition-colors ${
            isSubmitting || !content.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    )
  }

  // Move CommentComponent inside to access CommentForm
  const CommentComponent = ({ comment, onReply }: { comment: ApiComment, onReply: (parentId: number) => void }) => {
    const [showReplyForm, setShowReplyForm] = useState(false)

    return (
      <div className="mb-4">
        <div className="bg-dark-300 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image
                src={comment.user?.avatar || '/default-avatar.png'}
                alt={comment.user?.username || 'User'}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-neon-purple">{comment.user?.username}</span>
            <span className="text-gray-500 text-xs ml-2">
              {format(new Date(comment.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-gray-300 mb-2">{comment.content}</p>
          {user && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-neon-blue text-sm hover:underline"
            >
              Reply
            </button>
          )}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                parentId={comment.id}
                onCommentSubmit={() => {
                  setShowReplyForm(false)
                  onReply(comment.id)
                }}
              />
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-4">
              {comment.replies.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-dark-100 text-white flex items-center justify-center">
        <div className="text-red-500">{error || 'Post not found'}</div>
      </div>
    )
  }

  const isOwner = user?.id === post.userId;
  const wasEdited = post.updatedAt && post.createdAt !== post.updatedAt;

  if (isEditing && post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-300 text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditPostForm 
            post={{
              ...post,
              tags: post.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag)
            }} 
            onSuccess={handleEditSuccess} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-300 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-neon-blue font-display">{post.title}</h1>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Edit Post
            </button>
          )}
        </div>

        {/* User Card */}
        {post.user && (
          <div className="bg-dark-200 rounded-lg shadow-lg p-4 mb-8 flex items-center space-x-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              {post.user.avatar ? (
                <Image
                  src={post.user.avatar}
                  alt={post.user.username}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-full bg-neon-purple flex items-center justify-center text-2xl font-bold text-white">
                  {post.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neon-purple">{post.user.username}</h3>
              <p className="text-gray-400">{post.user.email}</p>
              <p className="text-sm text-gray-500">
                Posted on {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                {wasEdited && ` (edited ${format(new Date(post.updatedAt), 'MMMM d, yyyy')})`}
              </p>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="bg-dark-200 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-96 w-full">
            <Image 
              src={post.mediaUrl || ''} 
              alt={post.title}
              fill
              unoptimized={true}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-6">
            <p className="text-lg mb-4">{post.description}</p>
            
            {/* WikiData Labels */}
            {post.wikiDataLabels && post.wikiDataLabels.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-neon-purple">Identified Elements:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.wikiDataLabels.map((label) => (
                    <span key={label.qid} className="bg-neon-purple bg-opacity-20 text-neon-purple px-3 py-1 rounded-full">
                      {label.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span key={index} className="bg-neon-purple text-white px-2 py-1 rounded-full text-sm">
                    {typeof tag === 'string' ? tag : (tag as Tag).name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Object Details */}
        <div className="bg-dark-200 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-blue font-display">Object Details</h2>
          
          {/* Physical Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {post.shapes?.length > 0 && (
              <div>
                <p className="text-neon-purple font-semibold">Shapes</p>
                <p>{post.shapes.join(', ')}</p>
              </div>
            )}
            {post.colors?.length > 0 && (
              <div>
                <p className="text-neon-purple font-semibold">Colors</p>
                <p>{post.colors.join(', ')}</p>
              </div>
            )}
            {post.materials?.length > 0 && (
              <div>
                <p className="text-neon-purple font-semibold">Materials</p>
                <p>{post.materials.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-neon-purple font-semibold">Weight</p>
              <p>{post.weight} g</p>
            </div>
            <div>
              <p className="text-neon-purple font-semibold">Height</p>
              <p>{post.height} cm</p>
            </div>
            <div>
              <p className="text-neon-purple font-semibold">Width</p>
              <p>{post.width} cm</p>
            </div>
            <div>
              <p className="text-neon-purple font-semibold">Depth</p>
              <p>{post.depth} cm</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-dark-200 rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-blue font-display">Comments</h2>
          
          {user && (
            <CommentForm onCommentSubmit={fetchComments} />
          )}

          {comments.length > 0 ? (
            <div className="space-y-4 mt-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-dark-300 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-neon-blue font-display">{comment.user.username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

