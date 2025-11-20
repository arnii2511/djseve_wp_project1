# College Event Management - Frontend

This folder contains a React frontend for the College Event Management portal.

Quick start

1. Run `npm install` inside `frontend`.
2. Create `.env` with `REACT_APP_API_URL=http://localhost:5000/api`.
3. Run `npm start`.

Deployment

- Vercel: import the frontend folder as a new Vercel project. Set `REACT_APP_API_URL` in Vercel project env vars. Build command: `npm run build`, Output directory: `build`.
- Netlify: drag & drop the build output or connect to repo. Set `REACT_APP_API_URL` as env var in the site settings.

Notes

- Ensure backend is reachable from deployed frontend (CORS allowed).
- Store API URL and any cloud storage keys in environment variables.

