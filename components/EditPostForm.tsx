import React, { useState } from 'react';
import { Post, PostFormData, Tag } from '../types';
import { updatePost } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { WikiDataSearch } from './WikiDataSearch';
import { TagInput } from './TagInput';
import Image from 'next/image';
import { PostFormData as ApiPostFormData } from '@/utils/api';

interface EditPostFormProps {
  post: Post;
  onSuccess: () => void;
}

type ApiTag = {
  id?: number;
  name: string;
};

export const EditPostForm: React.FC<EditPostFormProps> = ({ post, onSuccess }) => {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(post.mediaUrl);
  const [formData, setFormData] = useState<PostFormData>({
    title: post.title,
    description: post.description,
    media: null,
    shapes: post.shapes,
    colors: post.colors,
    materials: post.materials,
    wikiDataLabels: post.wikiDataLabels,
    weight: post.weight,
    height: post.height,
    width: post.width,
    depth: post.depth,
    tags: post.tags,
    userId: user?.id || 0,
  });

  const convertToClientTags = (tags: ApiTag[]): Tag[] => {
    return tags.map(tag => ({
      id: tag.id?.toString() || tag.name,
      name: tag.name
    }));
  };

  const convertToApiTags = (tags: Tag[]): ApiTag[] => {
    return tags.map(tag => ({
      id: typeof tag.id === 'string' ? undefined : tag.id as number,
      name: tag.name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiFormData: ApiPostFormData = {
        ...formData,
        tags: convertToApiTags(formData.tags)
      };
      
      await updatePost(post.id, apiFormData);
      onSuccess();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        media: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-neon-blue mb-8">Edit Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label htmlFor="title" className="block text-white mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-dark-200 text-white rounded p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-white mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-dark-200 text-white rounded p-2 h-32"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="media" className="block text-white mb-2">Image</label>
            <input
              type="file"
              id="media"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-dark-200 text-white rounded p-2"
            />
            {preview && (
              <div className="mt-4 relative h-48 w-full">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-white mb-2">Weight (g)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full bg-dark-200 text-white rounded p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-white mb-2">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full bg-dark-200 text-white rounded p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="width" className="block text-white mb-2">Width (cm)</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                className="w-full bg-dark-200 text-white rounded p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="depth" className="block text-white mb-2">Depth (cm)</label>
              <input
                type="number"
                id="depth"
                name="depth"
                value={formData.depth}
                onChange={handleInputChange}
                className="w-full bg-dark-200 text-white rounded p-2"
                min="0"
                required
              />
            </div>
          </div>

          {/* Shapes, Colors, Materials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="shapes" className="block text-white mb-2">Shapes</label>
              <input
                type="text"
                id="shapes"
                name="shapes"
                value={formData.shapes.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, shapes: e.target.value.split(',').map(s => s.trim()) }))}
                className="w-full bg-dark-200 text-white rounded p-2"
                placeholder="Enter shapes, separated by commas"
              />
            </div>
            <div>
              <label htmlFor="colors" className="block text-white mb-2">Colors</label>
              <input
                type="text"
                id="colors"
                name="colors"
                value={formData.colors.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value.split(',').map(s => s.trim()) }))}
                className="w-full bg-dark-200 text-white rounded p-2"
                placeholder="Enter colors, separated by commas"
              />
            </div>
            <div>
              <label htmlFor="materials" className="block text-white mb-2">Materials</label>
              <input
                type="text"
                id="materials"
                name="materials"
                value={formData.materials.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value.split(',').map(s => s.trim()) }))}
                className="w-full bg-dark-200 text-white rounded p-2"
                placeholder="Enter materials, separated by commas"
              />
            </div>
          </div>

          {/* WikiData Search */}
          <div>
            <label className="block text-white mb-2">WikiData Labels</label>
            <WikiDataSearch
              selectedLabels={formData.wikiDataLabels}
              onLabelsChange={(labels) => setFormData(prev => ({ ...prev, wikiDataLabels: labels }))}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white mb-2">Tags</label>
            <TagInput
              tags={formData.tags}
              onTagsChange={(tags: Tag[]) => setFormData(prev => ({ 
                ...prev, 
                tags: tags
              }))}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onSuccess()}
              className="px-6 py-2 bg-dark-200 text-white rounded hover:bg-dark-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-neon-purple text-white rounded hover:bg-opacity-80 transition-colors"
            >
              Update Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 