# React Native Skia Best Practices for Poster Generator

**Research Date:** December 15, 2025
**Target App:** MeetMeAt Poster Editor
**Package:** @shopify/react-native-skia v2.4.7+

This document provides detailed best practices and code patterns for building a production-ready poster/image generator using React Native Skia.

---

## Table of Contents

1. [Canvas Structure & Composition](#canvas-structure--composition)
2. [Image Loading & Caching](#image-loading--caching)
3. [Gradient Backgrounds](#gradient-backgrounds)
4. [Clipping Images into Shapes](#clipping-images-into-shapes)
5. [Text Rendering with Custom Fonts](#text-rendering-with-custom-fonts)
6. [Layering & Z-Index](#layering--z-index)
7. [Export to Image File](#export-to-image-file)
8. [Performance Optimization](#performance-optimization)
9. [Complete Example Architecture](#complete-example-architecture)

---

## Canvas Structure & Composition

### Best Practice: Use Group Components for Logical Grouping

Group components are essential in React Native Skia for organizing elements and applying transformations, clipping, and effects.

```typescript
import { Canvas, Group, Image, Text, Fill } from '@shopify/react-native-skia';

const PosterCanvas = ({ elements }: { elements: PosterElement[] }) => {
  return (
    <Canvas style={{ width: 1080, height: 1920 }}>
      {/* Background Layer */}
      <Group>
        <Fill color="#FFFFFF" />
      </Group>

      {/* Content Layers */}
      {elements.map((element) => (
        <Group
          key={element.id}
          transform={element.transform}
          opacity={element.opacity}
          zIndex={element.zIndex}
        >
          {renderElement(element)}
        </Group>
      ))}
    </Canvas>
  );
};
```

### Declarative vs Imperative API

**Declarative (Recommended for UI):**
```typescript
// Easy to understand, integrates with React state
<Canvas style={styles.canvas}>
  <Rect x={0} y={0} width={100} height={100} color="red" />
  <Circle cx={50} cy={50} r={25} color="blue" />
</Canvas>
```

**Imperative (For Complex Drawing or Export):**
```typescript
import { Skia } from '@shopify/react-native-skia';

const drawPoster = (canvas: Canvas) => {
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('red'));
  canvas.drawRect(Skia.XYWHRect(0, 0, 100, 100), paint);
};
```

**When to use which:**
- **Declarative**: Main canvas rendering, interactive elements, real-time updates
- **Imperative**: High-resolution export, complex paths, performance-critical sections

---

## Image Loading & Caching

### Loading Images with useImage Hook

```typescript
import { useImage, Image } from '@shopify/react-native-skia';

const LogoImage = ({ uri }: { uri: string }) => {
  // Returns null until loaded - use this for conditional rendering
  const image = useImage(uri);

  if (!image) {
    return <Text text="Loading..." x={10} y={10} />;
  }

  return (
    <Image
      image={image}
      x={0}
      y={0}
      width={200}
      height={200}
      fit="cover" // or "contain", "fill", "fitHeight", "fitWidth"
    />
  );
};
```

### Image Loading Sources

```typescript
// 1. Local require (recommended for static assets)
const logo = useImage(require('./assets/logo.png'));

// 2. Network URL
const eventLogo = useImage('https://example.com/event-logo.jpg');

// 3. Base64 data URI
const base64Image = useImage('data:image/png;base64,iVBORw0KG...');

// 4. Local file path (with react-native-fs)
const cachedImage = useImage(`file://${RNFS.CachesDirectoryPath}/photo.jpg`);
```

### Image Caching Strategy

**Problem:** React Native Skia doesn't have built-in image caching. Images from URLs are fetched every time.

**Solution:** Implement a two-tier caching system:

```typescript
import RNFS from 'react-native-fs';
import { useImage } from '@shopify/react-native-skia';
import { useState, useEffect } from 'react';

interface CachedImage {
  uri: string;
  localPath: string;
  timestamp: number;
}

// Memory cache (app lifetime)
const imageCache = new Map<string, any>();

// Disk cache helper
const CACHE_DIR = `${RNFS.CachesDirectoryPath}/skia-images`;
const MAX_CACHE_SIZE_MB = 50;

const getCacheKey = (uri: string): string => {
  // Use crypto hash for reliable keys
  return uri.replace(/[^a-zA-Z0-9]/g, '_');
};

const downloadAndCacheImage = async (uri: string): Promise<string> => {
  const cacheKey = getCacheKey(uri);
  const localPath = `${CACHE_DIR}/${cacheKey}.jpg`;

  // Check if already cached on disk
  const exists = await RNFS.exists(localPath);
  if (exists) {
    return localPath;
  }

  // Download to cache directory
  await RNFS.mkdir(CACHE_DIR);
  const result = await RNFS.downloadFile({
    fromUrl: uri,
    toFile: localPath,
  }).promise;

  if (result.statusCode === 200) {
    return localPath;
  }

  throw new Error(`Failed to download image: ${uri}`);
};

// Hook for cached image loading
export const useCachedImage = (uri: string) => {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    // Check memory cache first
    if (imageCache.has(uri)) {
      setLocalUri(imageCache.get(uri));
      return;
    }

    // Download and cache
    downloadAndCacheImage(uri)
      .then((path) => {
        const fileUri = `file://${path}`;
        imageCache.set(uri, fileUri);
        setLocalUri(fileUri);
      })
      .catch((error) => {
        console.error('Image cache error:', error);
        // Fallback to direct URI
        setLocalUri(uri);
      });
  }, [uri]);

  return useImage(localUri);
};

// Usage in component
const CachedLogo = ({ uri }: { uri: string }) => {
  const image = useCachedImage(uri);

  if (!image) return null;

  return <Image image={image} x={0} y={0} width={200} height={200} />;
};
```

### GPU Texture Cache Considerations

**Issue:** Skia maintains a GPU texture cache. Too many large images can cause cache thrashing.

**Best Practices:**
1. **Resize images before displaying**: Don't load 4K images for 200x200 display
2. **Limit concurrent images**: Show only visible images in viewport
3. **Use makeTextureImage for control**: Bypass cache for specific images

```typescript
// Resize image before rendering
const optimizedImage = useMemo(() => {
  if (!originalImage) return null;

  // Create smaller version for display
  const surface = Skia.Surface.MakeOffscreen(200, 200);
  const canvas = surface.getCanvas();
  canvas.drawImageRect(originalImage, { x: 0, y: 0, width: 200, height: 200 });
  return surface.makeImageSnapshot();
}, [originalImage]);
```

---

## Gradient Backgrounds

### Linear Gradients

```typescript
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';

const GradientBackground = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={1080} height={1920}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, 1920)}
          colors={['#6C5CE7', '#E74C3C']}
          positions={[0, 1]} // Optional: control color stops
        />
      </Rect>
    </Canvas>
  );
};
```

### Radial Gradients

```typescript
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';

const RadialBackground = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={540} cy={960} r={1000}>
        <RadialGradient
          c={vec(540, 960)}
          r={1000}
          colors={['#FFFFFF', '#6C5CE7']}
        />
      </Circle>
    </Canvas>
  );
};
```

### Two-Point Conical Gradient (Spotlight Effect)

```typescript
import { Canvas, Rect, TwoPointConicalGradient, vec } from '@shopify/react-native-skia';

const SpotlightBackground = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={1080} height={1920}>
        <TwoPointConicalGradient
          start={vec(540, 200)}
          startR={0}
          end={vec(540, 960)}
          endR={800}
          colors={['#FFFFFF', '#6C5CE7', '#1A1A2E']}
          positions={[0, 0.5, 1]}
        />
      </Rect>
    </Canvas>
  );
};
```

### Gradient Overlays

```typescript
const GradientOverlay = () => {
  const image = useImage(require('./background.jpg'));

  return (
    <Canvas style={{ flex: 1 }}>
      {/* Base Image */}
      <Image image={image} x={0} y={0} width={1080} height={1920} fit="cover" />

      {/* Gradient Overlay with Opacity */}
      <Group opacity={0.7}>
        <Rect x={0} y={0} width={1080} height={1920}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 1920)}
            colors={['transparent', '#1A1A2E']}
          />
        </Rect>
      </Group>
    </Canvas>
  );
};
```

---

## Clipping Images into Shapes

### Using Group Clip Property

The `clip` property on `<Group>` defines a clipping region. Only content inside the path is visible.

### Circle Clip (Avatar)

```typescript
import { Canvas, Group, Image, Circle, useImage, Skia } from '@shopify/react-native-skia';

const CircleAvatar = ({ uri }: { uri: string }) => {
  const image = useImage(uri);
  const size = 200;
  const radius = size / 2;

  // Create circular clip path
  const clipPath = Skia.Path.Make();
  clipPath.addCircle(radius, radius, radius);

  if (!image) return null;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group clip={clipPath}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
};
```

### Hexagon Clip

```typescript
const createHexagonPath = (width: number, height: number) => {
  const path = Skia.Path.Make();
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  // Create flat-top hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }
  path.close();
  return path;
};

const HexagonClip = ({ uri }: { uri: string }) => {
  const image = useImage(uri);
  const size = 200;
  const hexagonPath = useMemo(() => createHexagonPath(size, size), [size]);

  if (!image) return null;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group clip={hexagonPath}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
};
```

### Custom SVG Path Clip

```typescript
import { Skia } from '@shopify/react-native-skia';

// Star shape from SVG path string
const starPath = Skia.Path.MakeFromSVGString(
  "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
);

const StarClip = ({ uri }: { uri: string }) => {
  const image = useImage(uri);

  if (!image || !starPath) return null;

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Group clip={starPath}>
        <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      </Group>
    </Canvas>
  );
};
```

### Rounded Rectangle Clip

```typescript
import { RoundedRect } from '@shopify/react-native-skia';

const RoundedRectClip = ({ uri }: { uri: string }) => {
  const image = useImage(uri);
  const width = 300;
  const height = 400;
  const cornerRadius = 24;

  // Create rounded rect path
  const clipPath = Skia.Path.Make();
  clipPath.addRRect({
    rect: { x: 0, y: 0, width, height },
    rx: cornerRadius,
    ry: cornerRadius,
  });

  if (!image) return null;

  return (
    <Canvas style={{ width, height }}>
      <Group clip={clipPath}>
        <Image image={image} x={0} y={0} width={width} height={height} fit="cover" />
      </Group>
    </Canvas>
  );
};
```

### Inverted Clip (Show Outside Region)

```typescript
const InvertedClip = ({ uri }: { uri: string }) => {
  const image = useImage(uri);
  const circlePath = Skia.Path.Make();
  circlePath.addCircle(150, 150, 100);

  if (!image) return null;

  return (
    <Canvas style={{ width: 300, height: 300 }}>
      {/* invertClip shows everything OUTSIDE the circle */}
      <Group clip={circlePath} invertClip>
        <Image image={image} x={0} y={0} width={300} height={300} fit="cover" />
      </Group>
    </Canvas>
  );
};
```

---

## Text Rendering with Custom Fonts

### Loading Custom Fonts

```typescript
import { useFonts, Text, matchFont } from '@shopify/react-native-skia';

const CustomText = () => {
  // Load multiple font weights
  const fontMgr = useFonts({
    Roboto: [
      require('./assets/fonts/Roboto-Regular.ttf'),
      require('./assets/fonts/Roboto-Medium.ttf'),
      require('./assets/fonts/Roboto-Bold.ttf'),
    ],
    Montserrat: [
      require('./assets/fonts/Montserrat-Regular.ttf'),
      require('./assets/fonts/Montserrat-Bold.ttf'),
    ],
  });

  if (!fontMgr) return null;

  // Match font with specific weight and style
  const regularFont = matchFont(
    { fontFamily: 'Roboto', fontWeight: 400 },
    fontMgr
  );

  const boldFont = matchFont(
    { fontFamily: 'Roboto', fontWeight: 700 },
    fontMgr
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={20}
        y={50}
        text="Regular Text"
        font={regularFont}
        size={24}
        color="#1A1A2E"
      />
      <Text
        x={20}
        y={100}
        text="Bold Text"
        font={boldFont}
        size={24}
        color="#6C5CE7"
      />
    </Canvas>
  );
};
```

### Using Paragraph API for Complex Text Layouts

The Paragraph API allows multi-line text, line breaking, alignment, and mixed styles.

```typescript
import {
  useFonts,
  Paragraph,
  Skia,
  TextAlign,
  matchFont
} from '@shopify/react-native-skia';

const MultiLineText = () => {
  const fontMgr = useFonts({
    Roboto: [require('./assets/fonts/Roboto-Regular.ttf')],
  });

  if (!fontMgr) return null;

  const font = matchFont({ fontFamily: 'Roboto' }, fontMgr);

  // Create paragraph style
  const paragraphStyle = {
    textAlign: TextAlign.Center,
  };

  // Create text style
  const textStyle = {
    color: Skia.Color('#1A1A2E'),
    fontFamilies: ['Roboto'],
    fontSize: 18,
  };

  // Build paragraph
  const paragraph = Skia.ParagraphBuilder.Make(paragraphStyle, fontMgr)
    .pushStyle(textStyle)
    .addText('This is a multi-line paragraph that will automatically wrap based on the width you provide.')
    .pop()
    .build();

  // Layout paragraph with max width
  paragraph.layout(300);

  return (
    <Canvas style={{ flex: 1 }}>
      <Paragraph
        paragraph={paragraph}
        x={20}
        y={50}
        width={300}
      />
    </Canvas>
  );
};
```

### Text with Gradient Fill

```typescript
import { Text, LinearGradient, vec } from '@shopify/react-native-skia';

const GradientText = () => {
  const font = useFont(require('./assets/fonts/Roboto-Bold.ttf'), 48);

  if (!font) return null;

  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={20}
        y={100}
        text="Gradient Text"
        font={font}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(300, 0)}
          colors={['#6C5CE7', '#E74C3C']}
        />
      </Text>
    </Canvas>
  );
};
```

### Measuring Text Dimensions

```typescript
import { useFont } from '@shopify/react-native-skia';

const MeasuredText = () => {
  const font = useFont(require('./assets/fonts/Roboto-Regular.ttf'), 24);
  const text = "Measure me!";

  if (!font) return null;

  // Get text dimensions
  const { width, height } = font.measureText(text);

  console.log(`Text width: ${width}, height: ${height}`);

  // Use measurements for positioning
  const x = (screenWidth - width) / 2; // Center horizontally

  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={x}
        y={100}
        text={text}
        font={font}
        color="#1A1A2E"
      />
    </Canvas>
  );
};
```

### Performance: Font Loading Optimization

**Problem:** Loading fonts with `useFont` can be slow, especially for large emoji fonts.

**Best Practices:**
1. **Preload fonts at app startup**: Load once and reuse
2. **Avoid multiple font instances**: Cache font objects
3. **Use smaller font files**: Remove unused glyphs
4. **Limit font variety**: Use 2-3 font families maximum

```typescript
// Global font cache
const fontCache = new Map<string, SkFont>();

const useOptimizedFont = (
  source: number | string,
  size: number
): SkFont | null => {
  const cacheKey = `${source}_${size}`;

  const [font, setFont] = useState<SkFont | null>(() => {
    return fontCache.get(cacheKey) || null;
  });

  useEffect(() => {
    if (font) return;

    // Load font only if not cached
    const loadFont = async () => {
      const loadedFont = await Skia.Font(source, size);
      fontCache.set(cacheKey, loadedFont);
      setFont(loadedFont);
    };

    loadFont();
  }, [source, size]);

  return font;
};
```

---

## Layering & Z-Index

### Official zIndex Support (v2.4.0+)

React Native Skia supports `zIndex` property on Group and drawing components.

```typescript
import { Canvas, Group, Rect, Circle } from '@shopify/react-native-skia';

const LayeredCanvas = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      {/* Default zIndex is 0 */}
      <Rect x={0} y={0} width={200} height={200} color="blue" />

      {/* Higher zIndex appears on top */}
      <Circle cx={100} cy={100} r={75} color="red" zIndex={10} />

      {/* Negative zIndex goes behind */}
      <Rect x={50} y={50} width={100} height={100} color="green" zIndex={-1} />
    </Canvas>
  );
};
```

### zIndex Scoping with Groups

zIndex is scoped to the parent Group. Elements in different Groups have independent zIndex contexts.

```typescript
const ScopedLayers = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      {/* Group A - has its own zIndex scope */}
      <Group>
        <Rect x={0} y={0} width={100} height={100} color="red" zIndex={2} />
        <Rect x={20} y={20} width={100} height={100} color="blue" zIndex={1} />
      </Group>

      {/* Group B - independent zIndex scope */}
      <Group zIndex={10}>
        <Rect x={50} y={50} width={100} height={100} color="green" zIndex={1} />
        <Rect x={70} y={70} width={100} height={100} color="yellow" zIndex={2} />
      </Group>
    </Canvas>
  );
};
```

### Dynamic Layer Ordering (Interactive Poster Editor)

```typescript
interface PosterElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  zIndex: number;
  // ... other properties
}

const InteractiveCanvas = () => {
  const [elements, setElements] = useState<PosterElement[]>([]);

  const bringToFront = (elementId: string) => {
    setElements((prev) => {
      const maxZ = Math.max(...prev.map(e => e.zIndex));
      return prev.map(e =>
        e.id === elementId
          ? { ...e, zIndex: maxZ + 1 }
          : e
      );
    });
  };

  const sendToBack = (elementId: string) => {
    setElements((prev) => {
      const minZ = Math.min(...prev.map(e => e.zIndex));
      return prev.map(e =>
        e.id === elementId
          ? { ...e, zIndex: minZ - 1 }
          : e
      );
    });
  };

  return (
    <Canvas style={{ flex: 1 }}>
      {elements.map((element) => (
        <Group key={element.id} zIndex={element.zIndex}>
          {renderElement(element)}
        </Group>
      ))}
    </Canvas>
  );
};
```

### Legacy: Array Sorting for Layer Order (Pre-v2.4.0)

If using older versions without zIndex support:

```typescript
const SortedLayers = () => {
  const [elements, setElements] = useState<PosterElement[]>([]);

  // Sort by zIndex before rendering
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => a.zIndex - b.zIndex);
  }, [elements]);

  return (
    <Canvas style={{ flex: 1 }}>
      {sortedElements.map((element) => (
        <Group key={element.id}>
          {renderElement(element)}
        </Group>
      ))}
    </Canvas>
  );
};
```

---

## Export to Image File

### Method 1: Synchronous makeImageSnapshot (No Textures)

For simple canvases without textures (images from network/files).

```typescript
import { useCanvasRef, ImageFormat } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';

const ExportSync = () => {
  const canvasRef = useCanvasRef();

  const exportToPNG = () => {
    const image = canvasRef.current?.makeImageSnapshot();

    if (!image) {
      console.error('Failed to create snapshot');
      return;
    }

    // Encode to PNG bytes
    const bytes = image.encodeToBytes(ImageFormat.PNG, 100);

    // Save to file
    const path = `${RNFS.DocumentDirectoryPath}/poster.png`;
    RNFS.writeFile(path, Buffer.from(bytes).toString('base64'), 'base64')
      .then(() => console.log('Saved:', path))
      .catch(console.error);
  };

  return (
    <>
      <Canvas ref={canvasRef} style={{ flex: 1 }}>
        {/* Your poster content */}
      </Canvas>
      <Button title="Export" onPress={exportToPNG} />
    </>
  );
};
```

### Method 2: Asynchronous makeImageSnapshotAsync (With Textures)

**Recommended:** Works with images loaded from network/files.

```typescript
import { useCanvasRef, ImageFormat } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const ExportAsync = () => {
  const canvasRef = useCanvasRef();

  const exportToPNG = async () => {
    try {
      // Async snapshot - waits for textures to load
      const image = await canvasRef.current?.makeImageSnapshotAsync();

      if (!image) {
        throw new Error('Failed to create snapshot');
      }

      // Encode to PNG with quality 100
      const bytes = image.encodeToBytes(ImageFormat.PNG, 100);

      // Save to file
      const path = `${RNFS.CachesDirectoryPath}/poster_${Date.now()}.png`;
      await RNFS.writeFile(
        path,
        Buffer.from(bytes).toString('base64'),
        'base64'
      );

      console.log('✅ Exported:', path);

      // Optional: Share via native share sheet
      await Share.open({
        url: `file://${path}`,
        type: 'image/png',
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <Canvas ref={canvasRef} style={{ flex: 1 }}>
        {/* Poster with images from network */}
      </Canvas>
      <Button title="Export & Share" onPress={exportToPNG} />
    </>
  );
};
```

### Method 3: Offscreen Rendering (High Resolution Export)

Export at higher resolution than screen display.

```typescript
import { Skia } from '@shopify/react-native-skia';

const ExportHighRes = async () => {
  // Create offscreen surface at 2x resolution
  const width = 1080 * 2;  // 2160px
  const height = 1920 * 2; // 3840px

  const surface = Skia.Surface.MakeOffscreen(width, height)!;
  const canvas = surface.getCanvas();

  // Draw your poster imperatively
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('#FFFFFF'));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);

  // Draw images, text, etc.
  // ...

  // Get snapshot
  surface.flush();
  const image = surface.makeImageSnapshot();

  // Encode and save
  const bytes = image.encodeToBytes(ImageFormat.JPEG, 95);
  const path = `${RNFS.DocumentDirectoryPath}/poster_hires.jpg`;
  await RNFS.writeFile(path, Buffer.from(bytes).toString('base64'), 'base64');

  return path;
};
```

### Method 4: Base64 Encoding (For Upload to API)

```typescript
const exportToBase64 = async (): Promise<string> => {
  const image = await canvasRef.current?.makeImageSnapshotAsync();

  if (!image) {
    throw new Error('Failed to create snapshot');
  }

  // Encode directly to base64
  const base64 = image.encodeToBase64(ImageFormat.JPEG, 90);

  // Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  return base64;
};

// Upload to backend
const uploadPoster = async () => {
  const base64 = await exportToBase64();

  await fetch('https://api.example.com/posters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  });
};
```

### Export Format Options

```typescript
// PNG - Lossless, larger file size, supports transparency
image.encodeToBytes(ImageFormat.PNG, 100);

// JPEG - Lossy, smaller file size, no transparency
image.encodeToBytes(ImageFormat.JPEG, 90); // Quality 0-100

// WebP - Modern format, good compression, transparency support
image.encodeToBytes(ImageFormat.WEBP, 80);
```

### Capturing Partial Canvas

```typescript
const exportRegion = async (x: number, y: number, width: number, height: number) => {
  const rect = { x, y, width, height };
  const image = await canvasRef.current?.makeImageSnapshotAsync(rect);

  if (!image) return null;

  return image.encodeToBytes(ImageFormat.PNG, 100);
};
```

### Important: Timing Considerations

```typescript
// ❌ BAD: Snapshot might be taken before render completes
const exportImmediately = () => {
  updateCanvas(); // Triggers re-render
  exportToPNG();  // Might capture old state
};

// ✅ GOOD: Wait for next frame
const exportAfterRender = () => {
  updateCanvas();

  // Wait for render to complete
  requestAnimationFrame(async () => {
    await exportToPNG();
  });
};

// ✅ BETTER: Use setTimeout for safety
const exportSafely = () => {
  updateCanvas();

  setTimeout(async () => {
    await exportToPNG();
  }, 100); // Small delay ensures render completion
};
```

---

## Performance Optimization

### 1. Minimize Re-renders

**Problem:** Canvas re-renders on every state change in parent component.

**Solution:** Memoize canvas content and use stable references.

```typescript
import { memo, useMemo } from 'react';

// Memoize static elements
const BackgroundLayer = memo(() => (
  <Group>
    <Fill color="#FFFFFF" />
    <Rect x={0} y={0} width={1080} height={1920}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, 1920)}
        colors={['#6C5CE7', '#E74C3C']}
      />
    </Rect>
  </Group>
));

// Memoize element rendering
const PosterElement = memo(({ element }: { element: Element }) => {
  return (
    <Group transform={element.transform} zIndex={element.zIndex}>
      {element.type === 'image' && <ImageElement {...element} />}
      {element.type === 'text' && <TextElement {...element} />}
    </Group>
  );
});

const OptimizedCanvas = ({ elements }: { elements: Element[] }) => {
  return (
    <Canvas style={{ flex: 1 }}>
      <BackgroundLayer />
      {elements.map(el => (
        <PosterElement key={el.id} element={el} />
      ))}
    </Canvas>
  );
};
```

### 2. Use Reanimated Shared Values

For smooth 60 FPS animations, use react-native-reanimated shared values that run on UI thread.

```typescript
import { useSharedValue } from 'react-native-reanimated';
import { Canvas, Group, Circle } from '@shopify/react-native-skia';

const AnimatedElement = () => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // Animations run on UI thread - no JS thread bottleneck
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    });

  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ translateX: x }, { translateY: y }]}>
        <Circle cx={100} cy={100} r={50} color="red" />
      </Group>
    </Canvas>
  );
};
```

### 3. Optimize Image Sizes

```typescript
// ❌ BAD: Loading 4K image for small display
const largeImage = useImage('https://example.com/4k-image.jpg');

// ✅ GOOD: Request appropriately sized image
const optimizedImage = useImage('https://example.com/image-400x400.jpg');

// ✅ BETTER: Use image CDN with resize parameters
const cdnImage = useImage(
  'https://cdn.example.com/image.jpg?w=400&h=400&fit=cover'
);
```

### 4. Limit Concurrent Skia Canvases

```typescript
// ❌ BAD: Multiple canvases on one screen
<ScrollView>
  {items.map(item => (
    <Canvas key={item.id} style={{ width: 200, height: 200 }}>
      {/* Complex rendering */}
    </Canvas>
  ))}
</ScrollView>

// ✅ GOOD: Single canvas, render multiple items
<Canvas style={{ flex: 1 }}>
  {items.map((item, index) => (
    <Group key={item.id} transform={[{ translateY: index * 220 }]}>
      {/* Item rendering */}
    </Group>
  ))}
</Canvas>
```

### 5. Dispose of Large Images

```typescript
useEffect(() => {
  return () => {
    // Cleanup large images when component unmounts
    if (largeImage) {
      largeImage.dispose?.();
    }
  };
}, [largeImage]);
```

### 6. Use Canvas Layering (Layer Component)

For complex static backgrounds that don't change:

```typescript
import { Canvas, Group, Layer } from '@shopify/react-native-skia';

const LayeredCanvas = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      {/* Static background - rendered once, cached */}
      <Layer>
        <BackgroundGradient />
        <StaticDecorations />
      </Layer>

      {/* Interactive elements - re-render on changes */}
      <InteractiveElements />
    </Canvas>
  );
};
```

### 7. Avoid Expensive Operations in Render

```typescript
// ❌ BAD: Creating path on every render
const BadComponent = () => {
  const path = Skia.Path.Make();
  path.addCircle(100, 100, 50);

  return <Path path={path} />;
};

// ✅ GOOD: Memoize path creation
const GoodComponent = () => {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(100, 100, 50);
    return p;
  }, []);

  return <Path path={path} />;
};
```

### 8. Performance Monitoring

```typescript
const MonitoredCanvas = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTime.current;
      const fps = (frameCount.current / elapsed) * 1000;

      console.log(`FPS: ${fps.toFixed(1)}`);

      frameCount.current = 0;
      lastTime.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Canvas
      style={{ flex: 1 }}
      onFrame={() => {
        frameCount.current++;
      }}
    >
      {/* Canvas content */}
    </Canvas>
  );
};
```

---

## Complete Example Architecture

Here's a complete example structure for a poster generator:

```typescript
// types.ts
export interface PosterElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
}

export interface ImageElement extends PosterElement {
  type: 'image';
  uri: string;
  clipShape?: 'circle' | 'hexagon' | 'rounded-rect';
}

export interface TextElement extends PosterElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface ShapeElement extends PosterElement {
  type: 'shape';
  shape: 'rect' | 'circle' | 'triangle';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}
```

```typescript
// PosterCanvas.tsx
import React, { memo } from 'react';
import { Canvas, Group, Fill } from '@shopify/react-native-skia';
import { PosterElement } from './types';
import { BackgroundLayer } from './BackgroundLayer';
import { ElementRenderer } from './ElementRenderer';

interface PosterCanvasProps {
  width: number;
  height: number;
  backgroundColor: string;
  gradient?: { colors: string[]; positions?: number[] };
  elements: PosterElement[];
  onElementPress?: (elementId: string) => void;
}

export const PosterCanvas = memo(({
  width,
  height,
  backgroundColor,
  gradient,
  elements,
  onElementPress,
}: PosterCanvasProps) => {
  // Sort elements by zIndex
  const sortedElements = React.useMemo(() => {
    return [...elements].sort((a, b) => a.zIndex - b.zIndex);
  }, [elements]);

  return (
    <Canvas style={{ width, height }}>
      {/* Background */}
      <BackgroundLayer
        width={width}
        height={height}
        color={backgroundColor}
        gradient={gradient}
      />

      {/* Elements */}
      {sortedElements.map((element) => (
        <ElementRenderer
          key={element.id}
          element={element}
          onPress={onElementPress}
        />
      ))}
    </Canvas>
  );
});
```

```typescript
// BackgroundLayer.tsx
import React, { memo } from 'react';
import { Group, Rect, Fill, LinearGradient, vec } from '@shopify/react-native-skia';

interface BackgroundLayerProps {
  width: number;
  height: number;
  color: string;
  gradient?: { colors: string[]; positions?: number[] };
}

export const BackgroundLayer = memo(({
  width,
  height,
  color,
  gradient,
}: BackgroundLayerProps) => {
  if (gradient) {
    return (
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={gradient.colors}
          positions={gradient.positions}
        />
      </Rect>
    );
  }

  return <Fill color={color} />;
});
```

```typescript
// ElementRenderer.tsx
import React, { memo } from 'react';
import { Group } from '@shopify/react-native-skia';
import { PosterElement, ImageElement, TextElement, ShapeElement } from './types';
import { ImageElementComponent } from './ImageElementComponent';
import { TextElementComponent } from './TextElementComponent';
import { ShapeElementComponent } from './ShapeElementComponent';

interface ElementRendererProps {
  element: PosterElement;
  onPress?: (elementId: string) => void;
}

export const ElementRenderer = memo(({ element, onPress }: ElementRendererProps) => {
  const transform = React.useMemo(() => {
    return [
      { translateX: element.position.x },
      { translateY: element.position.y },
      { rotate: element.rotation },
    ];
  }, [element.position.x, element.position.y, element.rotation]);

  return (
    <Group
      transform={transform}
      opacity={element.opacity}
      zIndex={element.zIndex}
    >
      {element.type === 'image' && (
        <ImageElementComponent element={element as ImageElement} />
      )}
      {element.type === 'text' && (
        <TextElementComponent element={element as TextElement} />
      )}
      {element.type === 'shape' && (
        <ShapeElementComponent element={element as ShapeElement} />
      )}
    </Group>
  );
});
```

```typescript
// ImageElementComponent.tsx
import React, { memo, useMemo } from 'react';
import { Group, Image, useImage, Skia } from '@shopify/react-native-skia';
import { ImageElement } from './types';
import { useCachedImage } from './hooks/useCachedImage';

export const ImageElementComponent = memo(({ element }: { element: ImageElement }) => {
  const image = useCachedImage(element.uri);

  const clipPath = useMemo(() => {
    if (!element.clipShape) return null;

    const { width, height } = element.size;
    const path = Skia.Path.Make();

    switch (element.clipShape) {
      case 'circle':
        const radius = Math.min(width, height) / 2;
        path.addCircle(width / 2, height / 2, radius);
        break;

      case 'hexagon':
        // Hexagon path implementation
        const centerX = width / 2;
        const centerY = height / 2;
        const hexRadius = Math.min(width, height) / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = centerX + hexRadius * Math.cos(angle);
          const y = centerY + hexRadius * Math.sin(angle);
          if (i === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        path.close();
        break;

      case 'rounded-rect':
        path.addRRect({
          rect: { x: 0, y: 0, width, height },
          rx: 16,
          ry: 16,
        });
        break;
    }

    return path;
  }, [element.clipShape, element.size]);

  if (!image) return null;

  const content = (
    <Image
      image={image}
      x={0}
      y={0}
      width={element.size.width}
      height={element.size.height}
      fit="cover"
    />
  );

  if (clipPath) {
    return <Group clip={clipPath}>{content}</Group>;
  }

  return content;
});
```

```typescript
// TextElementComponent.tsx
import React, { memo } from 'react';
import { Text, useFonts, matchFont } from '@shopify/react-native-skia';
import { TextElement } from './types';

export const TextElementComponent = memo(({ element }: { element: TextElement }) => {
  const fontMgr = useFonts({
    Roboto: [
      require('./assets/fonts/Roboto-Regular.ttf'),
      require('./assets/fonts/Roboto-Bold.ttf'),
    ],
  });

  if (!fontMgr) return null;

  const font = matchFont(
    { fontFamily: element.fontFamily },
    fontMgr
  );

  // Calculate x position based on alignment
  const x = React.useMemo(() => {
    if (element.align === 'center') {
      const { width } = font?.measureText(element.content) || { width: 0 };
      return (element.size.width - width) / 2;
    }
    if (element.align === 'right') {
      const { width } = font?.measureText(element.content) || { width: 0 };
      return element.size.width - width;
    }
    return 0;
  }, [element.align, element.content, element.size.width, font]);

  return (
    <Text
      x={x}
      y={element.fontSize} // baseline
      text={element.content}
      font={font}
      size={element.fontSize}
      color={element.color}
    />
  );
});
```

```typescript
// usePosterExport.ts
import { useCallback } from 'react';
import { useCanvasRef, ImageFormat } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const usePosterExport = () => {
  const canvasRef = useCanvasRef();

  const exportToPNG = useCallback(async () => {
    try {
      const image = await canvasRef.current?.makeImageSnapshotAsync();

      if (!image) {
        throw new Error('Failed to create snapshot');
      }

      const bytes = image.encodeToBytes(ImageFormat.PNG, 100);
      const path = `${RNFS.CachesDirectoryPath}/poster_${Date.now()}.png`;

      await RNFS.writeFile(
        path,
        Buffer.from(bytes).toString('base64'),
        'base64'
      );

      return path;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }, [canvasRef]);

  const exportAndShare = useCallback(async () => {
    const path = await exportToPNG();

    await Share.open({
      url: `file://${path}`,
      type: 'image/png',
    });
  }, [exportToPNG]);

  return {
    canvasRef,
    exportToPNG,
    exportAndShare,
  };
};
```

```typescript
// PosterEditorScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { PosterCanvas } from './PosterCanvas';
import { usePosterExport } from './hooks/usePosterExport';
import { PosterElement } from './types';

export const PosterEditorScreen = () => {
  const [elements, setElements] = useState<PosterElement[]>([
    {
      id: '1',
      type: 'image',
      uri: 'https://example.com/event-logo.jpg',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      clipShape: 'circle',
    },
    {
      id: '2',
      type: 'text',
      content: "I'm attending React Conf 2025!",
      fontFamily: 'Roboto',
      fontSize: 32,
      color: '#1A1A2E',
      position: { x: 50, y: 350 },
      size: { width: 980, height: 100 },
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      align: 'center',
    },
  ]);

  const { canvasRef, exportAndShare } = usePosterExport();

  return (
    <View style={styles.container}>
      <PosterCanvas
        ref={canvasRef}
        width={1080}
        height={1920}
        backgroundColor="#FFFFFF"
        gradient={{
          colors: ['#6C5CE7', '#E74C3C'],
          positions: [0, 1],
        }}
        elements={elements}
      />

      <View style={styles.toolbar}>
        <Button title="Export & Share" onPress={exportAndShare} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    padding: 16,
    backgroundColor: '#F5F5F7',
  },
});
```

---

## Key Takeaways

### 1. **Architecture**
- Use Group components for logical element grouping
- Implement proper zIndex management for layering
- Separate background, content, and interactive layers

### 2. **Images**
- Implement two-tier caching (memory + disk) for network images
- Resize images to appropriate display size
- Use `useCachedImage` hook for performance
- Be mindful of GPU texture cache limits

### 3. **Gradients**
- Use LinearGradient for vertical/horizontal gradients
- Use RadialGradient for circular effects
- Combine gradients with opacity for overlay effects

### 4. **Clipping**
- Use Group clip property for shape masks
- Create custom clip paths with Skia.Path
- Support common shapes: circle, hexagon, rounded rectangle

### 5. **Text**
- Load fonts once and cache them
- Use Paragraph API for multi-line text
- Measure text dimensions for precise positioning
- Avoid loading large emoji fonts

### 6. **Layering**
- Use zIndex property (v2.4.0+) for z-ordering
- zIndex is scoped to parent Group
- Implement bringToFront/sendToBack functions

### 7. **Export**
- Use makeImageSnapshotAsync for textures/images
- Export at higher resolution with offscreen rendering
- Support PNG (lossless) and JPEG (smaller) formats
- Wait for render completion before exporting

### 8. **Performance**
- Memoize static elements with React.memo
- Use Reanimated shared values for animations
- Limit concurrent Skia canvases
- Dispose of large images when unmounting
- Monitor FPS in development

---

## Resources

### Official Documentation
- [React Native Skia Documentation](https://shopify.github.io/react-native-skia/)
- [Canvas Overview](https://shopify.github.io/react-native-skia/docs/canvas/overview/)
- [Images Documentation](https://shopify.github.io/react-native-skia/docs/images/)
- [Text & Paragraph API](https://shopify.github.io/react-native-skia/docs/text/paragraph/)
- [Gradients](https://shopify.github.io/react-native-skia/docs/shaders/gradients/)
- [Group & Clipping](https://shopify.github.io/react-native-skia/docs/group/)
- [Snapshot Views](https://shopify.github.io/react-native-skia/docs/snapshotviews/)

### Tutorials & Examples
- [Getting Started with React Native Skia (Shopify)](https://shopify.engineering/getting-started-with-react-native-skia)
- [Building a 60 FPS Drawing App (Notesnook)](https://blog.notesnook.com/drawing-app-with-react-native-skia/)
- [Animated Gradient Tutorial](https://reactiive.io/articles/animated-gradient)
- [CodeSandbox Examples](https://codesandbox.io/examples/package/@shopify/react-native-skia)
- [Skia Animations Examples](https://github.com/SolankiYogesh/SkiaAnimations)

### Community Resources
- [GitHub Repository](https://github.com/Shopify/react-native-skia)
- [NPM Package](https://www.npmjs.com/package/@shopify/react-native-skia)
- [Expo Skia Documentation](https://docs.expo.dev/versions/latest/sdk/skia/)
- [React Native Skia Catalog](https://github.com/SimformSolutionsPvtLtd/react-native-skia-catalog)

### Related Libraries
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [react-native-fs](https://github.com/itinance/react-native-fs)
- [react-native-share](https://github.com/react-native-share/react-native-share)

---

**Research completed:** December 15, 2025
**For:** MeetMeAt Poster Generator
**Next Steps:** Implement proof-of-concept with basic canvas, image, and text rendering
