// Image interface
export interface Image {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

// Image upload response interface
export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

// Image gallery interface
export interface ImageGallery {
  images: Image[];
  selectedIndex: number;
  thumbnailSize?: number;
  fullSize?: number;
}

// Image optimization options interface
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

// Image metadata interface
export interface ImageMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
}
