'use client';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  title: string;
  description: string;
  mediaUrl?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-dark-200 rounded-lg overflow-hidden border-2 border-neon-blue hover:border-neon-purple transition-all duration-300 shadow-neon hover:shadow-neon-purple">
      {post.mediaUrl && (
        <div className="relative aspect-square">
          <Image
            src={post.mediaUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center space-x-2 text-sm text-neon-blue mb-2">
          <Link href={`/profile/${post.user.id}`} className="hover:text-neon-purple transition-colors font-display">
            {post.user.username}
          </Link>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
        </div>

        <Link href={`/post/${post.id}`}>
          <h2 className="text-xl font-display text-neon-blue hover:text-neon-purple transition-colors mb-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-300 line-clamp-2 mb-4">
          {post.description}
        </p>
      </div>
    </div>
  );
} 