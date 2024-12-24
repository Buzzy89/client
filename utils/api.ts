import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: BASE_URL
});

// Request interceptor ekle
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface WikiDataLabel {
  qid: string;
  title: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  userId: number;
  user: User;
  mediaUrl: string | null;
  shapes: string[];
  colors: string[];
  materials: string[];
  wikiDataLabels: WikiDataLabel[];
  weight: number;
  height: number;
  width: number;
  depth: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
}

export interface PostFormData {
  title: string;
  description: string;
  media: File | null;
  shapes: string[];
  colors: string[];
  materials: string[];
  wikiDataLabels: WikiDataLabel[];
  weight: number;
  height: number;
  width: number;
  depth: number;
  tags: Tag[];
  userId: number;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
  };
  parentId?: number;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentRequest {
  content: string;
  postId: number;
  userId: number;
  parentId?: number | undefined;
}

interface UserProfile extends User {
  recentPosts: Post[];
  recentComments: Comment[];
}

export interface Tag {
  id?: number | string;
  name: string;
}

// Public endpoints (no auth required)
export const login = async (username: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { username, password })
  return response.data
}

export const register = async (username: string, password: string, email: string) => {
  const response = await axiosInstance.post('/auth/register', { username, password, email })
  return response.data
}

export const getHomePosts = async (page: number = 0, size: number = 20): Promise<PaginatedResponse<Post>> => {
  console.log('Fetching posts with params:', { page, size });
  const response = await axiosInstance.get('/posts/main', {
    params: { page, size }
  });
  console.log('Posts response:', response.data);
  return response.data;
}

export const getPostById = async (id: number): Promise<Post> => {
  console.log('Making API request to get post by ID:', id);
  console.log('Request headers:', axiosInstance.defaults.headers);  // Public API headers
  
  try {
    const response = await axiosInstance.get(`/posts/${id}`);  // public API kullan
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
}

// Protected endpoints (require auth)
export const createPost = async (formData: PostFormData): Promise<Post> => {
  try {
    const token = localStorage.getItem('token');
    console.log('Current token:', token?.substring(0, 20) + '...');
    
    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    if (formData.media) {
      form.append('media', formData.media);
    }
    form.append('shapes', JSON.stringify(formData.shapes));
    form.append('colors', JSON.stringify(formData.colors));
    form.append('materials', JSON.stringify(formData.materials));
    form.append('wikiDataLabels', JSON.stringify(formData.wikiDataLabels));
    form.append('weight', formData.weight.toString());
    form.append('height', formData.height.toString());
    form.append('width', formData.width.toString());
    form.append('depth', formData.depth.toString());
    form.append('tags', JSON.stringify(formData.tags));
    form.append('userId', formData.userId.toString());
    
    console.log('Making request to:', `${BASE_URL}/posts/create`);

    const response = await axiosInstance.post<Post>('/posts/create', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Create post response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create post error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;  // Orijinal hatayı fırlat
  }
};

export const updatePost = async (id: number, formData: PostFormData) => {
  const postFormData = new FormData();
  postFormData.append('title', formData.title);
  postFormData.append('description', formData.description);
  if (formData.media) {
    postFormData.append('media', formData.media);
  }
  
  postFormData.append('shapes', JSON.stringify(formData.shapes));
  postFormData.append('colors', JSON.stringify(formData.colors));
  postFormData.append('materials', JSON.stringify(formData.materials));
  postFormData.append('wikiDataLabels', JSON.stringify(formData.wikiDataLabels));
  
  postFormData.append('weight', formData.weight.toString());
  postFormData.append('height', formData.height.toString());
  postFormData.append('width', formData.width.toString());
  postFormData.append('depth', formData.depth.toString());
  postFormData.append('tags', JSON.stringify(formData.tags));
  postFormData.append('userId', formData.userId.toString());

  const response = await axiosInstance.put(`/posts/${id}`, postFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export const getPostsByUser = async (userId: number): Promise<Post[]> => {
  const response = await axiosInstance.get(`/posts/user/${userId}`)
  return response.data
}

export const searchPosts = async (query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<Post>> => {
  const response = await axiosInstance.get(`/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  return response.data;
}

// Protected Comment endpoints
export const createComment = async (comment: CommentRequest): Promise<Comment> => {
  console.log('Creating comment with config:', {
    url: '/api/comments/create',
    headers: axiosInstance.defaults.headers,
    data: comment
  });

  const response = await axiosInstance.post('/comments/create', comment);
  console.log('Comment response:', response);
  return response.data;
}

export const getCommentsByPost = async (postId: number): Promise<Comment[]> => {
  const response = await axiosInstance.get(`/comments/post/${postId}`);
  console.log('Comments response:', response);
  return response.data;
}

export const getCommentsByUser = async (userId: number): Promise<Comment[]> => {
  const response = await axiosInstance.get(`/comments/user/${userId}`);
  return response.data;
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await axiosInstance.delete(`/comments/${commentId}`);
}

// Protected Profile endpoints
export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const response = await axiosInstance.get(`/users/profile/${userId}`);
  return response.data;
}

export const updateAvatar = async (userId: number, avatarFile: File): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);

  const response = await axiosInstance.post(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export default {
  public: axiosInstance,
  protected: axiosInstance
}

