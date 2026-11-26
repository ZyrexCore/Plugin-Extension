# Printlog — Printing Shop Production Desk

A browser-based job manager for a printing shop. Track every job from the moment it is accepted through production and completion.

## Job workflow
- **Not started:** the job has been accepted but production has not begun.
- **In progress:** the job is being worked on.
- **Finished:** the job is complete, with a production record.

## Production records
When finishing a job, record:
- Machine used (for example Offset, Banner, Konica 4080 or Kyocera)
- Type of work (for example Booklet, Xerox, Bill Book / Receipt, Stamp or Master)
- Materials used (multiple materials can be selected)
- Optional production notes

## Custom shop lists
The **Setup & lists** tab lets you add or remove machines, work types and materials. These options are used by the job completion form.

## Daily carry-forward
Open jobs automatically carry forward to the current day when the app is opened. Their original taken date is preserved. Finished jobs remain finished and keep their completion date.

## Data storage and backup
- All records are saved in the browser's local storage on the device and browser where the app is used.
- Records do not automatically sync between devices or browsers.
- Use **Export backup** regularly to download a JSON backup.
- The app can import older Printlog v1 task and material records automatically on the same browser when the new version is first opened.

## Deploy
This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.
1. Open **Settings → Pages** in the repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Pushes to `main` deploy the website automatically.
4. Open the Pages URL shown in Settings → Pages.
