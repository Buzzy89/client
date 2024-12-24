'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, PostFormData } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import axios from 'axios'
import { debounce } from 'lodash'

interface FormData {
  title: string
  description: string
  shapes: string[]
  colors: string[]
  materials: string[]
  weight: number
  height: number
  width: number
  depth: number
  wikiDataLabels: Array<{
    qid: string
    title: string
    description: string
  }>
}

interface FormErrors {
  title?: string
  description?: string
  media?: string
  dimensions?: string
}

interface WikiDataSearchResult {
  qid: string
  title: string
  description: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [wikiDataSearch, setWikiDataSearch] = useState('')
  const [wikiDataResults, setWikiDataResults] = useState<WikiDataSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    shapes: [],
    colors: [],
    materials: [],
    weight: 0,
    height: 0,
    width: 0,
    depth: 0,
    wikiDataLabels: []
  })

  const searchWikiData = debounce(async (query: string) => {
    if (!query) {
      setWikiDataResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
        params: {
          action: 'wbsearchentities',
          search: query,
          language: 'en',
          format: 'json',
          origin: '*'
        }
      })

      const results = response.data.search.map((item: any) => ({
        qid: item.id,
        title: item.label,
        description: item.description || ''
      }))

      setWikiDataResults(results)
    } catch (error) {
      console.error('Error searching WikiData:', error)
    } finally {
      setSearchLoading(false)
    }
  }, 500)

  const handleWikiDataSelect = (result: WikiDataSearchResult) => {
    setFormData(prev => ({
      ...prev,
      wikiDataLabels: [...prev.wikiDataLabels, result]
    }))
    setWikiDataSearch('')
    setWikiDataResults([])
  }

  const removeWikiDataLabel = (qid: string) => {
    setFormData(prev => ({
      ...prev,
      wikiDataLabels: prev.wikiDataLabels.filter(label => label.qid !== qid)
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setErrors({})

    // WikiData labels kontrolü
    const validLabels = formData.wikiDataLabels.filter(label => 
      label.qid && label.title
    );
    
    if (validLabels.length !== formData.wikiDataLabels.length) {
      setErrors({ title: 'Invalid WikiData labels' });
      return;
    }

    try {
      console.log('Preparing post data with form:', formData)
      
      const typedPostData: PostFormData = {
        title: formData.title,
        description: formData.description,
        userId: Number(user.id),
        media: selectedFile,
        shapes: formData.shapes,
        colors: formData.colors,
        materials: formData.materials,
        wikiDataLabels: formData.wikiDataLabels,
        weight: formData.weight,
        height: formData.height,
        width: formData.width,
        depth: formData.depth,
        tags: []
      }

      console.log('Sending post data:', typedPostData)
      
      const response = await createPost(typedPostData)
      console.log('Create post response:', response)

      // Başarılı olursa yönlendir
      router.push('/')
    } catch (error: any) {
      console.error('Create post error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });
      
      setErrors({ 
        title: error.response?.data?.message || error.message || 'Failed to create post'
      });
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Special handling for array inputs (shapes, colors, materials)
    if (name === 'shapes' || name === 'colors' || name === 'materials') {
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '')
      setFormData(prev => ({ ...prev, [name]: arrayValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayInputChange = (name: keyof Pick<FormData, 'shapes' | 'colors' | 'materials'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-dark-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-neon-blue mb-8">Create New Post</h1>
        
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
            {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
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
              name="media"
              onChange={handleFileChange}
              accept="image/*"
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

          {/* Physical Attributes */}
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
                defaultValue={formData.shapes.join(', ')}
                onBlur={(e) => {
                  const values = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                  setFormData(prev => ({ ...prev, shapes: values }))
                }}
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
                defaultValue={formData.colors.join(', ')}
                onBlur={(e) => {
                  const values = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                  setFormData(prev => ({ ...prev, colors: values }))
                }}
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
                defaultValue={formData.materials.join(', ')}
                onBlur={(e) => {
                  const values = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                  setFormData(prev => ({ ...prev, materials: values }))
                }}
                className="w-full bg-dark-200 text-white rounded p-2"
                placeholder="Enter materials, separated by commas"
              />
            </div>
          </div>

          {/* WikiData Search */}
          <div>
            <label className="block text-white mb-2">Search WikiData Labels</label>
            <input
              type="text"
              value={wikiDataSearch}
              onChange={(e) => {
                setWikiDataSearch(e.target.value)
                searchWikiData(e.target.value)
              }}
              className="w-full bg-dark-200 text-white rounded p-2"
              placeholder="Search for labels..."
            />
            {searchLoading && (
              <div className="mt-2 text-neon-blue">Searching...</div>
            )}
            {wikiDataResults.length > 0 && (
              <div className="mt-2 bg-dark-200 rounded p-2 max-h-60 overflow-y-auto">
                {wikiDataResults.map(result => (
                  <div
                    key={result.qid}
                    onClick={() => handleWikiDataSelect(result)}
                    className="p-2 hover:bg-dark-300 cursor-pointer"
                  >
                    <div className="text-neon-blue">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-gray-400">{result.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected WikiData Labels */}
          {formData.wikiDataLabels.length > 0 && (
            <div>
              <label className="block text-white mb-2">Selected Labels</label>
              <div className="space-y-2">
                {formData.wikiDataLabels.map(label => (
                  <div key={label.qid} className="flex items-center justify-between bg-dark-200 p-2 rounded">
                    <div>
                      <div className="text-neon-blue">{label.title}</div>
                      <div className="text-sm text-gray-400">{label.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWikiDataLabel(label.qid)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  )
}

