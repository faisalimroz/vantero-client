'use client';

import React, { useState } from 'react';
import { uploadImage } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface ImageUploadZoneProps {
  label?: string;
  folder?: string;
  currentImage?: { url: string; publicId: string } | null;
  onImageUploaded: (image: { url: string; publicId: string }) => void;
  onImageRemoved?: () => void;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  label = 'Upload Image (Multer Disk Storage)',
  folder = 'misc',
  currentImage,
  onImageUploaded,
  onImageRemoved,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, WebP) are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB maximum limit.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await uploadImage(file, folder);
      if (data?.success && data?.image) {
        onImageUploaded(data.image);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image via Multer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
          {label}
        </label>
      )}

      {currentImage?.url ? (
        <div className="relative aspect-[16/9] w-full max-w-sm bg-stone/40 rounded-sm overflow-hidden border border-line">
          <img
            src={resolveImageUrl(currentImage.url)}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          {onImageRemoved && (
            <button
              type="button"
              onClick={onImageRemoved}
              className="absolute top-2 right-2 p-1.5 bg-ink-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-ink-900/80 text-[10px] text-white font-mono rounded-xs">
            Local Storage Synced
          </div>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-line hover:border-gold-500 rounded-sm cursor-pointer bg-white transition-colors">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {loading ? (
              <div className="flex items-center space-x-2 text-xs text-ink-600">
                <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                <span>Saving to local uploads storage...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-ink-400 mb-2 group-hover:text-gold-500" />
                <p className="text-xs font-medium text-ink-800">
                  Click or drag image to upload
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  5MB max · JPEG, PNG, WebP (Multer diskStorage)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
};
