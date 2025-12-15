import React, { useMemo } from 'react';
import {
  Canvas,
  Rect,
  Group,
  LinearGradient,
  vec,
  Path,
  Skia,
  Image,
  RoundedRect,
  Fill,
  Paragraph,
  type SkTypefaceFontProvider,
} from '@shopify/react-native-skia';
import { useSkiaLoaded } from '@/components/async-skia';
import { useImageLoader } from './useImageLoader';
import type { Event, TemplateLayout } from '@/types';

interface UserInfo {
  name: string;
  title: string;
  company?: string;
  photoUrl?: string;
}

interface PosterCanvasProps {
  width: number;
  height: number;
  event: Event | null;
  user: UserInfo;
  layout?: TemplateLayout;
}

const getGradientColors = (primaryColor: string, layout: TemplateLayout): [string, string] => {
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  switch (layout) {
    case 'modern':
      return [primaryColor, `rgba(${r}, ${g}, ${b}, 0.7)`];
    case 'minimal':
      return [primaryColor, primaryColor];
    case 'bold':
      return [
        `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`,
        primaryColor,
      ];
    case 'classic':
    default:
      return [
        primaryColor,
        `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`,
      ];
  }
};

const getContrastColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1A1A2E' : '#FFFFFF';
};

const createHexagonPath = (cx: number, cy: number, radius: number): string => {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  const first = points[0];
  if (!first) return '';
  return `M ${first[0]} ${first[1]} ${points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function createParagraph(
  text: string,
  fontSize: number,
  color: string,
  width: number,
  fontProvider: SkTypefaceFontProvider,
  bold = false
) {
  const paragraphStyle = {
    textAlign: 0,
  };

  const textStyle = {
    color: Skia.Color(color),
    fontSize,
    fontFamilies: ['Roboto', 'sans-serif'],
    fontStyle: { weight: bold ? 700 : 400 },
  };

  const builder = Skia.ParagraphBuilder.Make(paragraphStyle, fontProvider);
  builder.pushStyle(textStyle);
  builder.addText(text);
  builder.pop();

  const paragraph = builder.build();
  paragraph.layout(width);
  return paragraph;
}

export function PosterCanvas({ width, height, event, user, layout = 'modern' }: PosterCanvasProps) {
  // This will suspend until Skia is loaded
  useSkiaLoaded();

  const logoImage = useImageLoader(event?.logoUrl);
  const heroImage = useImageLoader(event?.heroImageUrl);
  const userPhoto = useImageLoader(user.photoUrl);

  const primaryColor = event?.brandColors?.primary ?? '#6C5CE7';
  const textColor = getContrastColor(primaryColor);
  const gradientColors = useMemo(
    () => getGradientColors(primaryColor, layout),
    [primaryColor, layout]
  );

  // Now that Skia is loaded, we can safely create the font provider
  const fontProvider = useMemo(() => {
    return Skia.TypefaceFontProvider.Make();
  }, []);

  const photoRadius = width * 0.15;
  const photoY = height * 0.5;

  const hexPath = useMemo(() => {
    return Skia.Path.MakeFromSVGString(createHexagonPath(width / 2, photoY, photoRadius));
  }, [width, photoY, photoRadius]);

  const eventName = event?.name ?? 'Event Name';
  const dateText = formatDate(event?.startDate);
  const locationText = event?.location
    ? [event.location.city, event.location.country].filter(Boolean).join(', ')
    : '';

  const paragraphs = useMemo(() => {
    return {
      title: createParagraph(eventName, 24, textColor, width * 0.9, fontProvider, true),
      date: dateText ? createParagraph(dateText, 12, textColor, width * 0.9, fontProvider) : null,
      badge: createParagraph("I'm attending!", 16, primaryColor, width * 0.4, fontProvider, true),
      name: createParagraph(user.name, 20, textColor, width * 0.8, fontProvider, true),
      title2: createParagraph(user.title, 14, textColor, width * 0.8, fontProvider),
      company: user.company ? createParagraph(user.company, 12, textColor, width * 0.8, fontProvider) : null,
      location: locationText ? createParagraph(locationText, 12, textColor, width * 0.9, fontProvider) : null,
    };
  }, [fontProvider, eventName, dateText, textColor, primaryColor, user.name, user.title, user.company, locationText, width]);

  const badgeHeight = height * 0.06;
  const badgeWidth = width * 0.45;

  return (
    <Canvas style={{ width, height }}>
      <Fill color={primaryColor} />
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={gradientColors}
        />
      </Rect>

      {heroImage && (
        <Group opacity={0.15}>
          <Image
            image={heroImage}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Group>
      )}

      {logoImage && (
        <Image
          image={logoImage}
          x={width * 0.05}
          y={height * 0.05}
          width={width * 0.4}
          height={height * 0.1}
          fit="contain"
        />
      )}

      <Paragraph
        paragraph={paragraphs.title}
        x={width * 0.05}
        y={height * 0.18}
        width={width * 0.9}
      />

      {paragraphs.date && (
        <Paragraph
          paragraph={paragraphs.date}
          x={width * 0.05}
          y={height * 0.25}
          width={width * 0.9}
        />
      )}

      <Group>
        <RoundedRect
          x={width * 0.05}
          y={height * 0.30}
          width={badgeWidth}
          height={badgeHeight}
          r={6}
          color={textColor}
        />
        <Paragraph
          paragraph={paragraphs.badge}
          x={width * 0.05 + 12}
          y={height * 0.30 + 8}
          width={badgeWidth - 24}
        />
      </Group>

      {hexPath && (
        <Group clip={hexPath}>
          {userPhoto ? (
            <Image
              image={userPhoto}
              x={width / 2 - photoRadius}
              y={photoY - photoRadius}
              width={photoRadius * 2}
              height={photoRadius * 2}
              fit="cover"
            />
          ) : (
            <Rect
              x={width / 2 - photoRadius}
              y={photoY - photoRadius}
              width={photoRadius * 2}
              height={photoRadius * 2}
              color={`${textColor}33`}
            />
          )}
        </Group>
      )}

      {hexPath && (
        <Path path={hexPath} style="stroke" strokeWidth={3} color={textColor} />
      )}

      <Paragraph
        paragraph={paragraphs.name}
        x={width * 0.1}
        y={height * 0.68}
        width={width * 0.8}
      />

      <Paragraph
        paragraph={paragraphs.title2}
        x={width * 0.1}
        y={height * 0.74}
        width={width * 0.8}
      />

      {paragraphs.company && (
        <Paragraph
          paragraph={paragraphs.company}
          x={width * 0.1}
          y={height * 0.79}
          width={width * 0.8}
        />
      )}

      {paragraphs.location && (
        <Paragraph
          paragraph={paragraphs.location}
          x={width * 0.05}
          y={height * 0.92}
          width={width * 0.9}
        />
      )}
    </Canvas>
  );
}
