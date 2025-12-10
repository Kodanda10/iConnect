# iConnect Design System

## Brand Identity: "Emerald Amethyst Glass"

A premium, modern design language combining **glassmorphism** with **jewel-toned accents** for a sophisticated political CRM application.

---

## Color Palette

### Core Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-primary` | Veridian Emerald | `#008F7A` | Primary buttons, active states, links |
| `--color-primary-light` | Soft Emerald | `#00A896` | Gradients, hover states |
| `--color-secondary` | Deep Amethyst | `#5E548E` | FABs, accents, secondary actions |

### Text Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-text-primary` | Deep Charcoal Green | `#1A2A24` | Headings, body text |
| `--color-text-secondary` | Slate Green | `#4F6F65` | Captions, placeholders |

### Surface Colors

| Token | Name | Value | Usage |
|-------|------|-------|-------|
| `--color-glass-surface` | Translucent White | `rgba(255, 255, 255, 0.12)` | Card backgrounds |
| `--color-glass-border` | Specular Highlight | `rgba(255, 255, 255, 0.30)` | Card borders |
| `--color-background` | Mesh Gradient | `linear-gradient(135deg, #0D3B2E 0%, #2A2D4E 100%)` | Page background |

---

## CSS Variables

```css
:root {
  /* Primary Palette */
  --color-primary: #008F7A;
  --color-primary-light: #00A896;
  --color-secondary: #5E548E;
  
  /* Text */
  --color-text-primary: #1A2A24;
  --color-text-secondary: #4F6F65;
  
  /* Surfaces */
  --color-glass-surface: rgba(255, 255, 255, 0.12);
  --color-glass-border: rgba(255, 255, 255, 0.30);
  --color-background: linear-gradient(135deg, #0D3B2E 0%, #2A2D4E 100%);
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #008F7A 0%, #00A896 100%);
  --gradient-secondary: linear-gradient(135deg, #5E548E 0%, #7B6FA6 100%);
  
  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-primary: 0 4px 16px rgba(0, 143, 122, 0.3);
  --shadow-secondary: 0 4px 16px rgba(94, 84, 142, 0.3);
  
  /* Blur */
  --blur-glass: 12px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;
}
```

---

## Component Styles

### Glass Card

```css
.glass-card {
  background: var(--color-glass-surface);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
}
```

### Primary Button

```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  font-weight: var(--font-weight-bold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 143, 122, 0.4);
}

.btn-primary:active {
  transform: scale(0.96);
}
```

### Floating Action Button (FAB)

```css
.fab {
  background: var(--gradient-secondary);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.fab:hover {
  transform: scale(1.1);
}

.fab:active {
  transform: scale(0.95);
}
```

---

## Flutter Theme (Dart)

```dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary
  static const primary = Color(0xFF008F7A);
  static const primaryLight = Color(0xFF00A896);
  static const secondary = Color(0xFF5E548E);
  
  // Text
  static const textPrimary = Color(0xFF1A2A24);
  static const textSecondary = Color(0xFF4F6F65);
  
  // Surfaces
  static const glassSurface = Color.fromRGBO(255, 255, 255, 0.12);
  static const glassBorder = Color.fromRGBO(255, 255, 255, 0.30);
  
  // Background gradient colors
  static const bgGradientStart = Color(0xFF0D3B2E);
  static const bgGradientEnd = Color(0xFF2A2D4E);
}

class AppTheme {
  static ThemeData get theme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.glassSurface,
    ),
    fontFamily: 'Inter',
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.secondary,
      foregroundColor: Colors.white,
      shape: const CircleBorder(),
    ),
  );
}
```

---

## Tailwind Config (Next.js)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008F7A',
          light: '#00A896',
        },
        secondary: '#5E548E',
        text: {
          primary: '#1A2A24',
          secondary: '#4F6F65',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.30)',
        },
      },
      backgroundImage: {
        'mesh-gradient': 'linear-gradient(135deg, #0D3B2E 0%, #2A2D4E 100%)',
        'gradient-primary': 'linear-gradient(135deg, #008F7A 0%, #00A896 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #5E548E 0%, #7B6FA6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## Animation Principles

1. **Spring Easing**: Use `cubic-bezier(0.3, 1.5, 0.5, 1)` for bouncy interactions
2. **iOS Smoothness**: Use `cubic-bezier(0.2, 0.8, 0.2, 1)` for slide-in effects
3. **GPU Acceleration**: Apply `transform: translateZ(0)` for smooth 60fps animations
4. **Subtle Feedback**: All interactive elements should respond to touch/click with scale transforms
