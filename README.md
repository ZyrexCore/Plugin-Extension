# Nudi Web — Kannada ASCII Typing

A browser-based Kannada typing workspace using the **KGP / Nudi keyboard layout** and converting Unicode Kannada text into **legacy Nudi ASCII encoding**. This is a keyboard-layout editor, not English-to-Kannada transliteration.

## Run locally
Open `index.html` in a modern browser. An internet connection is required for Wikimedia jQuery.IME assets and Google Fonts.

## GitHub Pages
In repository Settings → Pages, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

## Notes
- Input method: `kn-kgp` (KGP keyboard layout via Wikimedia jQuery.IME).
- Output: legacy Nudi byte-position encoding using the included Sanchaya conversion engine.
- Unicode preview is shown separately for proofreading.
- Use legacy ASCII output with a compatible Nudi font/editor.
- Conversion engine is distributed under GPL-3.0-or-later; see [LICENSE](LICENSE) and the source header for attribution.
