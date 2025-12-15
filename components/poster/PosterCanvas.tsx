import React, { useMemo, useState, useEffect } from 'react';
import {
  Canvas,
  Rect,
  Text,
  Group,
  LinearGradient,
  vec,
  Path,
  Skia,
  Image,
  RoundedRect,
  Fill,
  type SkFont,
} from '@shopify/react-native-skia';
import { Platform, View, Text as RNText, StyleSheet, ActivityIndicator } from 'react-native';
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

interface FontSet {
  font: SkFont;
  titleFont: SkFont;
  smallFont: SkFont;
  badgeFont: SkFont;
  nameFont: SkFont;
}

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

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

function tryLoadFonts(): FontSet | null {
  try {
    const fontMgr = Skia.FontMgr.System();
    const baseTypeface = fontMgr.matchFamilyStyle(fontFamily, { weight: 400 });
    const boldTypeface = fontMgr.matchFamilyStyle(fontFamily, { weight: 700 });

    return {
      font: Skia.Font(baseTypeface, 16),
      titleFont: Skia.Font(boldTypeface, 28),
      smallFont: Skia.Font(baseTypeface, 12),
      badgeFont: Skia.Font(boldTypeface, 18),
      nameFont: Skia.Font(boldTypeface, 22),
    };
  } catch {
    return null;
  }
}

function useSkiaFonts(): FontSet | null {
  const [fonts, setFonts] = useState<FontSet | null>(() => tryLoadFonts());

  useEffect(() => {
    if (fonts) return;

    let attempts = 0;
    const maxAttempts = 20;

    const tryLoad = () => {
      const loaded = tryLoadFonts();
      if (loaded) {
        setFonts(loaded);
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryLoad, 100);
      }
    };

    const timeoutId = setTimeout(tryLoad, 100);
    return () => clearTimeout(timeoutId);
  }, [fonts]);

  return fonts;
}

export function PosterCanvas({ width, height, event, user, layout = 'modern' }: PosterCanvasProps) {
  const fonts = useSkiaFonts();
  const logoImage = useImageLoader(event?.logoUrl);
  const heroImage = useImageLoader(event?.heroImageUrl);
  const userPhoto = useImageLoader(user.photoUrl);

  const primaryColor = event?.brandColors?.primary ?? '#6C5CE7';
  const textColor = getContrastColor(primaryColor);
  const gradientColors = useMemo(
    () => getGradientColors(primaryColor, layout),
    [primaryColor, layout]
  );

  const photoRadius = width * 0.15;
  const photoY = height * 0.5;

  const hexPath = useMemo(() => {
    try {
      return Skia.Path.MakeFromSVGString(createHexagonPath(width / 2, photoY, photoRadius));
    } catch {
      return null;
    }
  }, [width, photoY, photoRadius]);

  const eventName = event?.name ?? 'Event Name';
  const dateText = formatDate(event?.startDate);
  const locationText = event?.location
    ? [event.location.city, event.location.country].filter(Boolean).join(', ')
    : '';

  if (!fonts) {
    return (
      <View style={[styles.fallback, { width, height, backgroundColor: primaryColor }]}>
        <ActivityIndicator size="large" color={textColor} />
        <RNText style={[styles.fallbackText, { color: textColor }]}>Preparing canvas...</RNText>
      </View>
    );
  }

  const badgeText = "I'm attending!";
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

      <Text
        x={width * 0.05}
        y={height * 0.22}
        text={eventName}
        font={fonts.titleFont}
        color={textColor}
      />

      {dateText && (
        <Text
          x={width * 0.05}
          y={height * 0.28}
          text={dateText}
          font={fonts.smallFont}
          color={textColor}
          opacity={0.8}
        />
      )}

      <Group>
        <RoundedRect
          x={width * 0.05}
          y={height * 0.32}
          width={badgeWidth}
          height={badgeHeight}
          r={6}
          color={textColor}
        />
        <Text
          x={width * 0.05 + 16}
          y={height * 0.32 + badgeHeight / 2 + 6}
          text={badgeText}
          font={fonts.badgeFont}
          color={primaryColor}
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

      <Text
        x={width * 0.1}
        y={height * 0.72}
        text={user.name}
        font={fonts.nameFont}
        color={textColor}
      />

      <Text
        x={width * 0.1}
        y={height * 0.78}
        text={user.title}
        font={fonts.font}
        color={textColor}
        opacity={0.9}
      />

      {user.company && (
        <Text
          x={width * 0.1}
          y={height * 0.83}
          text={user.company}
          font={fonts.smallFont}
          color={textColor}
          opacity={0.7}
        />
      )}

      {locationText && (
        <Text
          x={width * 0.05}
          y={height * 0.94}
          text={locationText}
          font={fonts.smallFont}
          color={textColor}
          opacity={0.6}
        />
      )}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 14,
    marginTop: 8,
  },
});
