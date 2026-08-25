import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface ImageUploadResult {
  url: string;
  isCloudStorage: boolean;
  error?: string;
}

/**
 * Validates that the selected file is an image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WEBP)' };
  }
  // 15MB maximum input size before compression
  if (file.size > 15 * 1024 * 1024) {
    return { valid: false, error: 'Image is too large. Please choose an image under 15MB' };
  }
  return { valid: true };
}

/**
 * Optimizes, square-crops, and downsamples an image client-side to a web-ready avatar (~20KB - 40KB)
 */
export async function optimizeAvatarImage(
  file: File,
  maxDimension = 360,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Invalid image format'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for optimization'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas context not available'));
          }

          // Determine square crop bounds
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          const targetSize = Math.min(maxDimension, minSide);
          canvas.width = targetSize;
          canvas.height = targetSize;

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw cropped center square
          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            targetSize,
            targetSize
          );

          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          canvas.toBlob(
            blob => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                resolve({ blob: file, dataUrl });
              }
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads player avatar to Firebase Cloud Storage.
 * If cloud storage encounters a permission/CORS issue, seamlessly falls back
 * to the ultra-compact optimized data URL so it never blocks the user and saves to Firestore.
 */
export async function uploadPlayerAvatar(
  file: File,
  playerIdOrPrefix = 'player'
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file');
  }

  // 1. Optimize & downsample image client-side first
  const { blob, dataUrl } = await optimizeAvatarImage(file, 360, 0.82);

  // 2. Attempt upload to Firebase Cloud Storage
  try {
    const cleanPrefix = playerIdOrPrefix.replace(/[^a-zA-Z0-9_]/g, '_');
    const timestamp = Date.now();
    const storagePath = `avatars/${cleanPrefix}_${timestamp}.jpg`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        playerId: playerIdOrPrefix,
      },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('[Cloud Storage] Avatar uploaded successfully:', downloadUrl);
    return {
      url: downloadUrl,
      isCloudStorage: true,
    };
  } catch (storageError) {
    console.warn(
      '[Cloud Storage] Storage upload failed or not enabled, falling back to optimized inline avatar:',
      storageError
    );
    // Fallback: Use the optimized compact base64 (~25KB) which easily fits in Firestore (1MB limit)
    return {
      url: dataUrl,
      isCloudStorage: false,
    };
  }
}
