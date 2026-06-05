---
name: Nexus Collective
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b413a'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f7069'
  outline-variant: '#e3beb6'
  surface-tint: '#b52701'
  primary: '#b52701'
  on-primary: '#ffffff'
  primary-container: '#ff5c35'
  on-primary-container: '#5a0e00'
  inverse-primary: '#ffb4a3'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#494bd6'
  on-tertiary: '#ffffff'
  tertiary-container: '#8386ff'
  on-tertiary-container: '#0e009c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0700'
  on-primary-fixed-variant: '#8a1c00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
  card-padding: 32px
---

## Brand & Style

This design system is built for a premium, crowd-sourced FAQ platform that prioritizes clarity, community-driven wisdom, and modern efficiency. The brand personality is **authoritative yet accessible**, bridging the gap between high-end agency aesthetics and functional SaaS utility.

The visual style is **Corporate Modern with Tactile Softness**. It utilizes high-end "Agency-style" layouts—characterized by generous negative space, sophisticated typography, and structured content blocks—and softens them with subtle shadows and pill-shaped accents. The goal is to evoke a sense of trust and "AI-adjacent" intelligence, where information is curated and presented with surgical precision on a warm, human-centric canvas.

## Colors

The palette is anchored by a high-energy **Vibrant Coral (#FF5C35)**, used strategically for primary CTAs and critical status indicators to drive user engagement. 

*   **Backgrounds:** A tiered system of whites and soft grays. The base canvas is pure white, while containers and secondary sections use a refined neutral (#F8F9FA) to create subtle depth.
*   **Typography:** The primary text color is a deep, near-black (#121212) for maximum readability, with secondary text using a muted charcoal to establish hierarchy.
*   **Accents:** A soft indigo/blue is used sparingly for secondary interactive elements or links, ensuring the Coral remains the dominant focal point.

## Typography

The design system uses **Plus Jakarta Sans** across all levels to maintain a friendly yet professional geometric appearance. 

The hierarchy is built on extreme contrast between display sizes and body text. Large headlines utilize tight letter-spacing and heavy weights to feel "architectural," while body copy is given ample line-height (1.6) to ensure long-form FAQ content remains legible and approachable. Labels use an all-caps treatment with slight tracking to clearly distinguish them from functional UI text.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for large screens, centering the content within a 1280px container to maintain a premium "editorial" feel. 

*   **Rhythm:** We use a strict 8px base unit. Section gaps are intentionally large (120px) to give content room to breathe, preventing information overload which is common in FAQ platforms.
*   **Grid:** A 12-column grid is used for desktop. 
    *   **Desktop:** 12 columns | 24px gutter | 64px margins.
    *   **Tablet:** 8 columns | 16px gutter | 40px margins.
    *   **Mobile:** 4 columns | 16px gutter | 20px margins.
*   **Cards:** Internal padding within FAQ cards or "Book a Call" modules should never drop below 32px to maintain the spacious, high-end aesthetic.

## Elevation & Depth

Depth is achieved through **Soft Ambient Shadows** and **Tonal Layering**. 

*   **Primary Surface:** Pure white cards sit on a light gray (#F1F3F5) background. 
*   **Shadows:** We use a "Double Shadow" technique: a very soft, wide-spread ambient shadow (15% opacity, 40px blur) combined with a tighter, more saturated shadow near the base of the element. This creates a "looming" effect where cards feel like they are floating just above the surface.
*   **Glassmorphism:** Navigation bars and dropdown menus use a backdrop blur (20px) with a semi-transparent white fill (80%) to maintain context of the content behind them while providing a clear interactive layer.

## Shapes

The shape language is defined by **Generous Roundedness**. 

Standard UI elements like input fields and small buttons use a 0.5rem (8px) radius. However, primary cards, FAQ containers, and large CTA banners utilize "Extra-Large" rounding (1.5rem or 24px) to create a soft, inviting container for data-heavy information. Primary action buttons should be fully pill-shaped (rounded-full) to stand out against the more structured rectangular cards.

## Components

### Buttons
*   **Primary:** Pill-shaped, #FF5C35 background, white text. Large horizontal padding.
*   **Secondary:** Pill-shaped, transparent background with a subtle 1px border (#E9ECEF) or a soft gray fill.

### FAQ Accordions
*   White background with a subtle bottom border for separation.
*   Icons should be minimalist "plus/minus" or "chevron" in the accent color to guide the eye.
*   Active state should involve a slight lift (increased shadow) and the accent color applied to the question text.

### Cards
*   Use a "Feature Card" style: White background, 24px corner radius, and the dual-shadow depth mentioned in the Elevation section.
*   Include a "Spotlight" variant for CTAs (like "Book a Call") which utilizes the primary accent color as a subtle background gradient or border glow.

### Input Fields
*   Soft gray backgrounds (#F1F3F5) with no borders in their default state.
*   On focus, the border transitions to the primary coral color with a soft outer glow.