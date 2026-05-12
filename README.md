# Sonar Bangla Sankalp Tracker

This repository hosts the static website for the Sonar Bangla Sankalp Tracker.

## Auto update

- Push changes to `main`.
- Vercel project: `bjp-sankalp`
- GitHub repo: `moyukh229197/BJP_Sankalpa`
- Vercel is connected to this repo, so each push to `main` triggers an automatic redeploy.

## Backend content editor

- Admin page: `/admin.html`
- API routes:
  - `GET /api/content` loads the site content bundle
  - `PUT /api/content` saves the bundle after admin login
  - `GET /api/auth` checks the admin session
  - `POST /api/auth` logs in or logs out
- Environment variables:
  - `ADMIN_PASSWORD`
  - `ADMIN_SECRET`
  - `GITHUB_TOKEN`
  - `GITHUB_OWNER`
  - `GITHUB_REPO`
  - `GITHUB_BRANCH`
- The frontend no longer depends on `Ctrl + Alt + A`; content is now managed from the admin page and persisted through the backend.

## Local preview

Open `index.html` directly in a browser, or serve the folder with a static server if you prefer.
