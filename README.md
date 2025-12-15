# MeetMeAt Frontend

React Native + Expo app for creating conference posters. Web-first development with React Native Skia.

## Quick Start (2 minutes)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development (web)
npm run web

# Open http://localhost:8081 in browser
```

## Tech Stack

- **Framework:** Expo SDK 54 + React Native 0.81
- **Routing:** Expo Router (file-based)
- **Graphics:** React Native Skia (web via CanvasKit)
- **Styling:** StyleSheet + Design System

## Scripts

```bash
npm run web        # Start web development
npm run ios        # Start iOS simulator
npm run android    # Start Android emulator
npm run lint       # Run ESLint (strict)
npm run typecheck  # Run TypeScript check
npm run format     # Format with Prettier
```

## Project Structure

```
app/                  # Expo Router screens
├── (tabs)/           # Tab navigator
│   ├── index.tsx     # Home (Create)
│   ├── history.tsx   # History
│   └── profiles.tsx  # Profiles
├── editor.tsx        # Poster editor (modal)
└── export.tsx        # Export screen (modal)
components/
├── ui/               # Design system components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
└── poster/           # Poster-specific components
constants/            # Design tokens
├── Colors.ts         # #6C5CE7, etc.
├── Spacing.ts        # 8, 12, 16, 20, 24
└── Typography.ts     # Text styles
types/                # TypeScript types
lib/                  # Business logic
├── api/              # Backend API client
├── storage/          # Local storage
└── skia/             # Skia utilities
```

## Design System

```
Colors:
  Primary:    #6C5CE7 (purple)
  Background: #FFFFFF
  Input BG:   #F5F5F7
  Text:       #1A1A2E
  Muted:      #8E8E93
  Danger:     #E74C3C

Spacing: 8, 12, 16, 20, 24, 32px
Corners: 8px (inputs), 12px (cards)
```

## License

MIT
