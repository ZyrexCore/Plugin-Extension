# Printlog — Printing Work Tracker

A lightweight daily production tracker for a print shop, published with GitHub Pages.

## Features
- Daily work updates and task list
- Mark jobs finished; pending tasks automatically carry forward to the current day when the app is opened
- Paper/material register with GSM, quantity, unit, size, supplier and job purpose
- Daily history and search
- JSON backup export
- Responsive desktop and mobile layout

## Deploy
This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.
1. Open **Settings → Pages** in the repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Pushes to `main` deploy the website automatically.
4. Open the Pages URL shown in Settings → Pages.

## Data storage note
The first version saves records in the browser's local storage on the device/browser where you use it. Export a JSON backup regularly. Records do not automatically sync between different devices or browsers. A shared cloud database (for example Supabase) can be connected in a later step if multi-device access is needed.

## Pending task behaviour
Unfinished tasks keep their original creation date for history, while their active date is moved forward to the current day on app startup. The task is never duplicated. Completing it marks the same task as finished.
