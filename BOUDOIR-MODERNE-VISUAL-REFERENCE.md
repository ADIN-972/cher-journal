# 🎨 Boudoir Moderne - Visual Reference Guide

---

## 🌈 Complete Color Reference

### Primary Deep Palette (70% of UI)

```
┌─────────────────────────────────────────┐
│ PRUNE PURPLE (purple-900)               │
│ #6B1B47                                 │
│ Usage: Main backgrounds, card bases     │
│ Text on top: Light pink (AAA contrast) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BLEU NUIT NAVY (blue-900)               │
│ #1E3A8A                                 │
│ Usage: Secondary backgrounds, layers    │
│ Text on top: Light pink (AAA contrast) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SLATE DARK (slate-900)                  │
│ #0F172A                                 │
│ Usage: Dark overlays, neutral accents   │
│ Text on top: Any light color           │
└─────────────────────────────────────────┘
```

### Accent Palette (20% of UI)

```
┌─────────────────────────────────────────┐
│ ROSE POUDRÉ (pink-300)                  │
│ #F9A8D4                                 │
│ Usage: Text, borders, highlights        │
│ Background: Yes (on light surfaces)     │
│ Interactive Elements: Primary           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ LAVENDER (purple-300)                   │
│ #D8B4FE                                 │
│ Usage: Secondary text, gradients        │
│ Background: Layered, semi-transparent   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ GOLD LIGHT (yellow-400)                 │
│ #FBBF24                                 │
│ Usage: Premium features, highlights     │
│ Sparingly used (10% of accents)         │
└─────────────────────────────────────────┘
```

### Gradient Combinations

```
Primary Gradient:
  from-purple-900 via-blue-950 to-slate-900
  ╔════════════════════════════════════╗
  ║ ■ ■ ■ → ■ ■ ■ → ■ ■ ■            ║
  ║ Purple  Navy   Slate               ║
  ╚════════════════════════════════════╝

Rose-to-Purple Gradient:
  from-rose-500 to-purple-500
  ╔════════════════════════════════════╗
  ║ ■ ■ ■ → ■ ■ ■                    ║
  ║ Rose    Purple                     ║
  ╚════════════════════════════════════╝

Pink-to-Lavender Gradient:
  from-pink-300 to-purple-300
  ╔════════════════════════════════════╗
  ║ ■ ■ ■ → ■ ■ ■                    ║
  ║ Pink    Lavender                   ║
  ╚════════════════════════════════════╝
```

---

## 📐 Component Visual Examples

### 1. Theme Filter Button States

```
INACTIVE STATE:
┌────────────────────────────┐
│ 🌙 Mystère                 │  ← border-gray-700
│ bg-gray-800/50             │  ← semi-transparent dark
└────────────────────────────┘
  Hover: bg-gray-700/50 (slightly lighter)

ACTIVE STATE:
┌────────────────────────────┐
│ 🌙 Mystère                 │  ← text-white
│ from-purple-500 to-indigo  │  ← gradient background
│ shadow-lg shadow-purple    │  ← colored shadow
└────────────────────────────┘
  Scale: 105% (slightly larger)
  Animation: 300ms smooth
```

### 2. Paper Color Grid

```
┌─────┬─────┬─────┬─────┐
│ ☀️  │ ⚪  │ 🌿  │ 🩶  │  Row 1: Light tones
│ [Active with ring effect]
├─────┼─────┼─────┼─────┤
│ 💜  │ 🍷  │ 🌙  │     │  Row 2: Deep tones
│
└─────┴─────┴─────┴─────┘

ACTIVE STATE:
┌─────────────────┐
│ 💜              │  ← Ring: ring-2 ring-pink-400
│ bg-purple-100   │  ← Paper color preview
│ scale-105 ⭐   │  ← Slightly larger
│ shadow-pink     │  ← Glowing shadow
└─────────────────┘
```

### 3. Range Slider

```
MIN ◄─────●─────────► MAX
    ▓▓▓▓▓ (selected area - gradient)

Gradient: from-purple-600 to-pink-600
Thumb: accent-pink-400 (circular handle)
Current Value: "18px" (display above)
```

### 4. Floating Action Button

```
CLOSED STATE:
┌─────────────┐
│    ✨       │  ← Sparkle emoji
│   (button)  │  ← 16x16 size
│  from-purple│  ← Gradient purple→blue
│  to-blue    │  ← shadow-purple-600/50
└─────────────┘
Position: fixed bottom-8 right-8

OPEN STATE:
┌─────────────┐
│    ✕        │  ← Close X
│  from-pink  │  ← Gradient pink→purple
│  to-purple  │  ← shadow-pink-500/50
└─────────────┘
Rotated: 90 degrees
```

---

## 🎬 Animation Timeline

### Theme Button Hover (300ms)

```
0ms:      Scale: 100%,   Shadow: initial
150ms:    Scale: 102.5%, Shadow: 50%
300ms:    Scale: 105%,   Shadow: full ✓
```

### Paper Color Selection (300ms)

```
0ms:      Ring: none,    Scale: 100%
150ms:    Ring: 50%,     Scale: 102.5%
300ms:    Ring: full,    Scale: 105% ✓
          Offset: ring-offset-2
          Shadow: full shadow-pink-400/50
```

### Settings Panel Open (fade-in)

```
0ms:      Opacity: 0,   Transform: translate-y-4
150ms:    Opacity: 50%, Transform: translate-y-2
300ms:    Opacity: 100%, Transform: translate-y-0 ✓
```

---

## 📱 Responsive Layout Examples

### Mobile (< 640px)

```
┌──────────────────────────┐
│   Home Page Mobile       │
├──────────────────────────┤
│  [Hero Full Width]       │
├──────────────────────────┤
│  Theme Buttons (Stack)   │
│  ┌──────────────────────┐│
│  │ 💕 Romance          ││
│  └──────────────────────┘│
│  ┌──────────────────────┐│
│  │ 🔥 Passion          ││
│  └──────────────────────┘│
├──────────────────────────┤
│  [Chapter Cards 2-col]   │
│  ┌──────────┬──────────┐ │
│  │ Card 1   │ Card 2   │ │
│  └──────────┴──────────┘ │
│  ┌──────────┬──────────┐ │
│  │ Card 3   │ Card 4   │ │
│  └──────────┴──────────┘ │
└──────────────────────────┘
```

### Tablet (640px - 1024px)

```
┌──────────────────────────────────────┐
│         Home Page Tablet             │
├──────────────────────────────────────┤
│      [Hero with Max Width]           │
├──────────────────────────────────────┤
│  Theme Buttons (Flex, Centered)      │
│  ┌──────────┬────────────┬─────────┐ │
│  │ 💕 Rom   │ 🔥 Passion │ 🌙 Myst │ │
│  └──────────┴────────────┴─────────┘ │
├──────────────────────────────────────┤
│  [Chapter Cards 3-col]               │
│  ┌─────┬──────┬──────┐              │
│  │ C1  │ C2   │ C3   │              │
│  ├─────┼──────┼──────┤              │
│  │ C4  │ C5   │ C6   │              │
│  └─────┴──────┴──────┘              │
└──────────────────────────────────────┘
```

### Desktop (> 1024px)

```
┌────────────────────────────────────────────────────────┐
│              Home Page Desktop                         │
├────────────────────────────────────────────────────────┤
│           [Hero - Full Width Immersive]                │
├────────────────────────────────────────────────────────┤
│     Theme Buttons (Centered Flex with Gap)             │
│  ┌──────┬──────────┬──────────┬────────┐               │
│  │  ✨  │   💕    │    🔥    │  🌙   │               │
│  │ All  │ Romance │ Passion  │Mystery │               │
│  └──────┴──────────┴──────────┴────────┘               │
├────────────────────────────────────────────────────────┤
│          [Chapter Cards 4-5 col Grid]                  │
│  ┌────┬────┬────┬────┬────┐                           │
│  │ 1  │ 2  │ 3  │ 4  │ 5  │                           │
│  ├────┼────┼────┼────┼────┤                           │
│  │ 6  │ 7  │ 8  │ 9  │ 10 │                           │
│  └────┴────┴────┴────┴────┘                           │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 Typography Hierarchy

### Font Sizes

```
H1 (Hero Title)        6xl   (3.75rem)    Main heading
H2 (Section Title)     4xl   (2.25rem)    Section headings
H3 (Subsection)        2xl   (1.5rem)     Card titles
H4 (Component Title)    xl    (1.25rem)    Settings header
Body Text              base   (1rem)      Normal reading
Caption               sm     (0.875rem)   Small details
Tiny Label            xs     (0.75rem)    Value displays
```

### Font Weight

```
Bold (700)              H1, H2, H3, H4, Strong emphasis
Semibold (600)          Labels, badges, important text
Medium (500)            Buttons, interactive
Regular (400)           Body text, paragraphs
Light (300)             Subtitles, descriptions
```

### Font Families

```
Serif:     Georgia, 'Garamond', serif     Elegant, literary
Sans:      system-ui, sans-serif          Modern, readable
Mono:      'Courier New', monospace       Code, displays
```

---

## 🎯 Call-to-Action Buttons

### Primary CTA (Hero)

```
┌────────────────────────────┐
│  Commencer à lire          │  ← White text
│ from-rose-500 to-pink      │  ← Gradient background
│ hover:shadow-rose-500/40   │  ← Enhanced shadow
│ hover:scale-105            │  ← Slight grow
│ px-8 py-4 rounded-full     │  ← Large, round
└────────────────────────────┘
Icon: → (arrow) with animation
```

### Secondary CTA

```
┌────────────────────────────┐
│  Explorer le catalogue     │  ← Text color
│ border-2 border-rose      │  ← Outline style
│ text-rose hover:bg-rose/10 │  ← Fills on hover
│ px-6 py-4 rounded-full     │  ← Medium, round
└────────────────────────────┘
Icon: ↓ (chevron down)
```

---

## 🌙 Dark/Light Theme Comparison

### Light Mode

```
Background:    white (bg-white)
Text:          gray-900 (dark gray)
Accents:       rose-500 (vibrant)
Borders:       gray-200 (light gray)

Paper Colors:
☀️  Crème      - Warm yellow-50
⚪  Blanc      - Pure white
🌿  Sauge      - Soft emerald-50
🩶  Ardoise    - Cool slate-100
```

### Dark Mode

```
Background:    gray-950 (near black)
Text:          gray-100 (light gray)
Accents:       rose-400 (softer)
Borders:       gray-800 (dark gray)

Paper Colors:
💜  Prune      - Deep purple-100 (inverted light)
🍷  Bordeaux   - Warm red-100 (inverted light)
🌙  Bleu Nuit  - Deep blue-900 (immersive)
```

---

## ✨ Shadow & Depth System

### Light Shadows (Cards)

```
shadow-md:     0 4px 6px -1px rgba(0,0,0,0.1)
shadow-lg:     0 10px 15px -3px rgba(0,0,0,0.1)

Usage: Cards, buttons, containers
```

### Colored Shadows (Glow Effects)

```
shadow-rose-500/50:     Glowing rose effect
shadow-pink-400/50:     Glowing pink effect
shadow-purple-600/50:   Glowing purple effect

Usage: Active states, premium features, emphasis
```

### Depth Layering

```
Layer 1 (Surface):     bg-white / bg-gray-900
Layer 2 (Card):        bg-gray-50 / bg-gray-800
Layer 3 (Elevated):    shadow-md on card bg
Layer 4 (Floating):    shadow-xl / backdrop-blur
```

---

## 🎭 State Indicators

### Button States

```
INACTIVE           HOVER              ACTIVE
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ bg-gray-100 │   │ bg-gray-200 │   │ gradient    │
│ text-gray   │   │ text-darker │   │ text-white  │
│ cursor-ptr  │   │ shadow-md   │   │ shadow-lg   │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Form Input States

```
EMPTY              FOCUS              FILLED
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│             │   │ ╔═══════════╗   │             │
│ border-gray │   │ ║ring-2      ║   │ text-filled │
│ bg-white    │   │ ║ring-rose   ║   │ border-rose │
│ cursor-text │   │ ╚═══════════╝   │ checked     │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

## 🎨 Component Color Mapping

### Settings Panel Components

```
HEADER:
┌──────────────────────────────┐
│ Title: gradient pink→purple  │
│ Subtitle: text-pink-200/60   │
│ Icon: text-4xl animate-pulse │
└──────────────────────────────┘

LABEL:
│ text-pink-200                │
│ font-serif semibold          │

INPUT CONTAINER:
│ bg-purple-500/20             │
│ border border-purple-400/20  │

VALUE DISPLAY:
│ bg-purple-500/30             │
│ text-pink-300 px-2 py-1      │
│ rounded-full                 │

ACTIVE BUTTON:
│ from-purple-600 to-pink      │
│ text-white shadow-pink-500/30│
```

---

## 📊 Visual Consistency Checklist

- [x] All headings use serif font
- [x] All primary CTAs are rose gradients
- [x] All secondary buttons have pink borders
- [x] All backgrounds follow purple→navy gradient
- [x] All accents use rose-poudré or gold
- [x] All transitions are 300ms smooth
- [x] All buttons have rounded-full or rounded-lg
- [x] All cards have shadow-lg and rounded-2xl
- [x] All text on dark backgrounds is light
- [x] All interactive elements have hover states

---

## 🎓 Designer Notes

### Color Psychology
- **Purple**: Luxury, creativity, sophistication
- **Rose/Pink**: Intimacy, romance, warmth
- **Gold**: Premium, elegance, value
- **Navy**: Trust, depth, mystery

### Typography Psychology
- **Serif**: Literary, classic, intimate
- **Sans-serif**: Modern, clean, accessible

### Spatial Design
- **Rounded corners**: Softness, approachability
- **Blur effects**: Depth, mystery, focus
- **Gradients**: Movement, modernity, luxury

---

**Visual Reference Version:** 1.0
**Last Updated:** 2026-01-21
**Status:** ✅ Complete & Production Ready
