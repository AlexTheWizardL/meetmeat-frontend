import { useState, useEffect, useRef, useMemo } from 'react';
import { Skia, type SkImage } from '@shopify/react-native-skia';

type ImageCache = Record<string, SkImage | null>;

const imageCache: ImageCache = {};

export function useImageLoader(url: string | undefined): SkImage | null {
  const [image, setImage] = useState<SkImage | null>(url ? imageCache[url] ?? null : null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    if (imageCache[url]) {
      setImage(imageCache[url]);
      return;
    }

    const loadImage = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const skData = Skia.Data.fromBytes(data);
        const loadedImage = Skia.Image.MakeImageFromEncoded(skData);

        if (loadedImage) {
          imageCache[url] = loadedImage;
          if (mountedRef.current) {
            setImage(loadedImage);
          }
        }
      } catch (err) {
        console.warn('Failed to load image:', url, err);
      }
    };

    void loadImage();
  }, [url]);

  return image;
}

export function useMultipleImages(urls: (string | undefined)[]): (SkImage | null)[] {
  const urlsKey = useMemo(() => urls.join(','), [urls]);
  const [images, setImages] = useState<(SkImage | null)[]>(() =>
    urls.map(url => url ? imageCache[url] ?? null : null)
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          if (!url) return null;
          if (imageCache[url]) return imageCache[url];

          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const skData = Skia.Data.fromBytes(data);
            const loadedImage = Skia.Image.MakeImageFromEncoded(skData);

            if (loadedImage) {
              imageCache[url] = loadedImage;
              return loadedImage;
            }
          } catch (err) {
            console.warn('Failed to load image:', url, err);
          }
          return null;
        })
      );

      if (mountedRef.current) {
        setImages(results);
      }
    };

    void loadImages();
  }, [urlsKey, urls]);

  return images;
}

export function clearImageCache(): void {
  for (const key of Object.keys(imageCache)) {
    imageCache[key] = null;
  }
}
