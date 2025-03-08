import { useState, useEffect } from 'react';

const imageCache = new Map<string, string>();

const checkImageUrl = async (url: string): Promise<boolean> => {
  try {
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  } catch {
    return false;
  }
};

export function useImageCache(urls: string[], symbol: string) {
  const [cachedUrl, setCachedUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Use cached URL if available
      if (imageCache.has(symbol)) {
        setCachedUrl(imageCache.get(symbol)!);
        setError(false);
        return;
      }

      let imageLoaded = false;

      // Try each URL in order until we find one that works
      for (const url of urls) {
        const isValid = await checkImageUrl(url);
        if (isValid) {
          imageCache.set(symbol, url);
          setCachedUrl(url);
          setError(false);
          imageLoaded = true;
          break;
        }
      }

      if (!imageLoaded) {
        setError(true);
        // Store a fallback URL to prevent continuous retries
        imageCache.set(symbol, '');
      }
    };

    loadImage();
  }, [urls, symbol]);

  return { cachedUrl, error };
}
