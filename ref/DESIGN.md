---
name: Signature Precision
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  accent-link: '#0055FF'
  surface-white: '#FFFFFF'
  border-subtle: '#E5E5E5'
typography:
  name-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-xs:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  link-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-width: 675px
  container-height: 131px
  stack-gap: 4px
  section-gap: 16px
  margin-sm: 12px
  divider-height: 24px
---

## Brand & Style

The brand personality is professional, organized, and meticulously clear. This design system is built for business communication where reliability and clarity are paramount. It follows a **Minimalist** design style with a focus on high-quality typography and structured information hierarchy.

The visual direction avoids unnecessary decorative elements, favoring a "content-first" approach. By utilizing generous whitespace and a constrained color palette, the UI ensures that contact information is immediately legible and professional in any email client environment.

## Colors

The palette is anchored in a high-contrast monochromatic base to ensure maximum accessibility and a clean "ink-on-paper" feel. 

- **Primary**: Used for the sender's name and critical branding elements. It is a deep, near-black that provides maximum legibility.
- **Secondary**: A mid-tone gray reserved for supporting text like job titles and labels (e.g., "T:", "E:").
- **Accent**: A focused blue used sparingly for actionable links and URLs to distinguish them from static text.
- **Neutral**: The background remains a pure white (`#FFFFFF`) to blend seamlessly with the standard email composition window.

## Typography

This design system uses **Hanken Grotesk** for its sharp, contemporary feel and excellent legibility at small scales. 

Typography is used to create a clear scan-path:
- **Names** are bold and slightly larger to establish identity.
- **Titles** use a medium weight with slight tracking to differentiate the role from the person.
- **Contact Details** use a functional, compact size. 
- **Labels** (T, M, E) are set in uppercase at a smaller size to act as icons without the technical overhead of image assets.

## Layout & Spacing

The layout is a **Fixed Grid** system, constrained to a maximum width of 675px and a height of 131px to ensure it fits within the standard preview panes of most mobile and desktop email clients.

- **Structure**: Use a multi-column approach. Typically, a logo or headshot sits on the left, separated from the contact details by a 1px vertical divider or a 16px gutter.
- **Rhythm**: Information is grouped logically using a tight vertical stack-gap (4px). Related groups (e.g., Name/Title vs. Contact Info) are separated by a larger section-gap (16px).
- **Alignment**: All text should be top-aligned relative to the brand mark to maintain a sense of precision and professional order.

## Elevation & Depth

To maintain a clean and professional appearance that translates well across all email service providers (which often strip complex CSS), this design system avoids shadows and blurs.

Depth is achieved through **Tonal Layers** and **Low-Contrast Outlines**:
- Use subtle 1px borders (`#E5E5E5`) to separate logical sections.
- Information hierarchy is established through "visual weight" (font weight and color intensity) rather than physical z-index.
- Avoid any background gradients; keep the surface flat to ensure maximum compatibility with dark mode rendering in email clients.

## Shapes

The shape language is conservative and geometric. 
- **Brand Assets**: Logos or headshots should use a "Soft" (0.25rem) corner radius.
- **Call-to-Action**: If a small social icon or button is used, it should follow the same soft roundedness to appear approachable but remains professional.
- **Containers**: The main signature container is strictly rectangular with sharp edges to align with the grid of the email body.

## Components

### Contact Block
Consists of a vertical stack of labels and values. Labels (e.g., "P:") should be secondary color, while values (e.g., "+1 234...") should be primary color.

### Social Links
Horizontal row of icons or text links. Use a fixed 12px gap between items. Icons should be monochrome (Primary or Secondary color) to avoid visual clutter.

### Divider
A 1px solid line used either vertically to separate the logo from text, or horizontally to separate the signature from a legal disclaimer. Use `border-subtle`.

### Legal Disclaimer
Small-print text placed at the very bottom. Use `body-md` size but at a 50% opacity or `secondary-color` to reduce its visual prominence.

### Logo/Avatar
A fixed-size square or circular element. Recommended size is 80px x 80px to fit comfortably within the 131px height constraint while allowing for padding.