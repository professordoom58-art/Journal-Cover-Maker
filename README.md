# Journal Cover Studio 📖

A professional, browser-based wrap-around journal cover designer and print-ready A4 imposition studio built with React, Vite, TypeScript, Tailwind CSS, and HTML5 Canvas.

## Features

### 1. Cover Designer (Spread Editor)
- **Real-World Print Specifications (300 DPI)**:
  - Closed journal: **4.0 in wide × 5.5 in tall**
  - Editable spine width: **0.0 to 1.0 in** (default 0.25 in)
  - Flat spread (trim): **8.25 in × 5.5 in** (2475 × 1650 px at 300 DPI)
  - Outer bleed: **0.125 in** on all 4 edges (38 px at 300 DPI)
  - Safe margin: **0.25 in** inside trim line (75 px at 300 DPI)
  - Back, spine, and front touch with zero gaps
- **Photo Zones (Front & Back)**:
  - Drag and drop images directly onto cover zones, or browse, or paste from clipboard (JPG, PNG, WebP)
  - Fit modes: Fill, Fit, Stretch
  - Reposition with pan drag, zoom (100% to 400%), rotate 90°, free rotation slider (-180° to 180°), flip H/V
  - Crop tool with locked aspect ratio
  - Real-time adjustments: Brightness, Contrast, Saturation, Exposure, Warmth, Tint, Blur, Sharpness, Grayscale, Sepia, Vignette
  - Filter presets: Vintage, Noir, Vivid, Faded, Cool, Warm
  - Gradient overlays with custom direction, colors, and opacity
  - Low-resolution warning if below 300 DPI at printed size
- **Spine**:
  - Background color picker, editable vertical text (rotated 90°, centered along the spine), Google Fonts, font size, text color, letter spacing
- **Front Cover Title**:
  - Editable text with Google Fonts (Cinzel, Playfair Display, Inter, Montserrat, Merriweather, Oswald, Caveat, Dancing Script)
  - Font weight, color, alignment, letter spacing, drop shadow, draggable position
- **Back Cover Info Block (Bottom 1.6 in)**:
  - Semi-transparent backing panel with color picker, opacity, and corner radius
  - Description blurb (up to 5 lines, 10 pt, 150% line height) with dynamic character remaining counter
  - Details line (8 pt)
  - Price box (rounded rectangle ~0.9 × 0.4 in) with editable price and color
  - Barcode placeholder box (~1.2 × 0.6 in) with scan-ready vector bars and digits
  - Individual visibility toggles and draggable positioning
- **General Canvas Tools**:
  - Add extra text, shapes (rectangle, circle, line), and SVG stickers (stars, celestial, botanical, vintage)
  - Layer manager: reorder, hide/show, duplicate, delete
  - Toggleable guides: Bleed (red dashed), Safe Area (green), Trim (black solid), Spine Fold lines, Inch rulers
  - Interactive pan & zoom, fit-to-screen button

### 2. A4 Print Sheet (Imposition Studio)
- Imposes Cover A on top and Cover B below (or duplicate Cover A) on a standard A4 portrait sheet (210 × 297 mm / 2480 × 3508 px at 300 DPI)
- Scale options: 100%, 95%, 90% (default), 85%
- Automatic margin warning when margins are under 0.25 in
- Adjustable gap between covers (default 0.4 in)
- Toggleable printer crop marks and bleed inclusion
- "Rotate spreads 90°" mode for true 100% size printing
- Print button configured for browser printing ("Set scale to 100% / Actual size, margins to None")

### 3. Exports & Project Persistence
- Export A4 Sheet as: PDF (exact 210 × 297 mm), PNG at 300 DPI (2480 × 3508 px), JPG at 300 DPI
- Export Single Spread as: PDF (exact physical dimensions) or PNG at 300 DPI
- Guides, rulers, and selection handles are automatically omitted from all exports
- Autosave to `localStorage`
- Save and open `.json` project files
- Keyboard shortcuts: `Ctrl+Z` / `Ctrl+Y` (Undo / Redo), `Delete`, `Ctrl+D` (Duplicate), Arrow keys (Nudge 2px or 10px with Shift)

---

## Installation & Running Locally

1. Clone or open this repository:
   ```bash
   cd "temp JORUNAL"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Open the displayed URL (usually `http://localhost:5173/`) in your browser.

4. To build for production:
   ```bash
   npm run build
   ```
