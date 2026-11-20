Mudra Mod — Extension Repository

The Assets directory is now present and contains:
- Assets/icon.png
- Assets/payment-qr.png
- Assets/review-qr.jpeg

manifest.json now points Chrome's extension icons and web-accessible resources to those exact paths.

Still required at the repository root before the extension is installable:
- popup.html
- popup.js
- content.js

Important: the current scripts in the source ZIP still refer to the original root-level asset names (icon.png, review-qr.png, payment-qr.png). Those references must be updated to Assets/icon.png, Assets/review-qr.jpeg, and Assets/payment-qr.png when the scripts are uploaded.

Install only after all required files and paths are present: download the repository, open chrome://extensions, enable Developer mode, choose Load unpacked, and select the extension folder.
