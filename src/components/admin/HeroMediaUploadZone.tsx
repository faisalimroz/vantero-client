'use client';

import React, { useState } from 'react';
import { uploadMedia } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';
import { UploadCloud, X, Loader2, Film, Image as ImageIcon } from 'lucide-react';

interface HeroMediaUploadZoneProps {
  label?: string;
  folder?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  publicId?: string;
  onMediaUploaded: (media: { url: string; publicId: string; type: 'image' | 'video' }) => void;
  onMediaRemoved?: () => void;
}

export const HeroMediaUploadZone: React.FC<HeroMediaUploadZoneProps> = ({
  label = 'Slide Media (Image or Video)',
  folder = 'hero',
  mediaUrl,
  mediaType = 'image',
  publicId,
  onMediaUploaded,
  onMediaRemoved,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo =
    mediaType === 'video' ||
    Boolean(mediaUrl && /\.(mp4|webm|mov)$/i.test(mediaUrl));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoFile = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    const isImageFile = file.type.startsWith('image/');

    if (!isVideoFile && !isImageFile) {
      setError('Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).');
      return;
    }

    if (isImageFile && file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds the 5MB maximum limit.');
      return;
    }

    if (isVideoFile && file.size > 50 * 1024 * 1024) {
      setError('Video file size exceeds the 50MB maximum limit.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await uploadMedia(file, folder);
      if (data?.success && (data.media || data.image)) {
        const uploaded = data.media || data.image;
        const finalType: 'image' | 'video' = isVideoFile ? 'video' : 'image';
        onMediaUploaded({
          url: uploaded.url,
          publicId: uploaded.publicId || '',
          type: finalType,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload media file.');
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

      {mediaUrl ? (
        <div className="relative aspect-[16/9] w-full max-w-sm bg-black rounded-sm overflow-hidden border border-line shadow-sm">
          {isVideo ? (
            <video
              src={resolveImageUrl(mediaUrl)}
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={resolveImageUrl(mediaUrl)}
              alt="Slide preview"
              className="w-full h-full object-cover"
            />
          )}

          {onMediaRemoved && (
            <button
              type="button"
              onClick={onMediaRemoved}
              className="absolute top-2 right-2 p-1.5 bg-ink-900/80 hover:bg-rose-600 text-white rounded-full transition-colors z-10"
              title="Remove slide media"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-ink-900/90 text-[10px] text-white font-mono rounded-xs flex items-center gap-1 z-10">
            {isVideo ? (
              <>
                <Film className="w-3 h-3 text-gold-400" />
                <span>Video (Plays on loop until ended)</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3 h-3 text-gold-400" />
                <span>Image (3s duration)</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-line hover:border-gold-500 rounded-sm cursor-pointer bg-white transition-colors">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {loading ? (
              <div className="flex items-center space-x-2 text-xs text-ink-600">
                <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                <span>Uploading slide media to local storage...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-ink-400 mb-2 group-hover:text-gold-500" />
                <p className="text-xs font-medium text-ink-800">
                  Click or drag photo / video to upload
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  Images ≤5MB (JPEG, PNG, WebP) · Videos ≤50MB (MP4, WebM, MOV)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xs">
          {error}
        </p>
      )}
    </div>
  );
};
