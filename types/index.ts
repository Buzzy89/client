export interface WikiDataLabel {
  qid: string;
  title: string;
  description: string;
}

export interface Tag {
  id?: string | number;
  name: string;
}

export interface User {
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
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
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
  user: User;
  parentId?: number;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
} 