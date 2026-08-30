import React, { useState, useEffect } from 'react';
import { imageStorageService } from '../../services/imageStorageService';

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

export const StorageImage: React.FC<StorageImageProps> = ({
  src,
  fallbackSrc = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  alt = 'Decoração',
  className,
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setResolvedSrc(fallbackSrc);
      return;
    }

    if (!src.startsWith('local-storage://')) {
      setResolvedSrc(src);
      return;
    }

    imageStorageService.resolveImageUrl(src).then((url) => {
      if (isMounted) {
        setResolvedSrc(url || fallbackSrc);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  return (
    <img
      src={resolvedSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallbackSrc;
      }}
      {...props}
    />
  );
};
