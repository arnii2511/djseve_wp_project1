# College Event Management - Backend

This folder contains the Express backend for the College Event Management portal.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.

APIs are mounted under `/api`:
- `/api/auth` - register/login
- `/api/events` - event and requests
- `/api/registrations` - user registrations
- `/api/users` - user admin endpoints

Deployment

- Render / Railway: create a new Node service, connect repo, set environment variables from `.env` (`MONGO_URI`, `JWT_SECRET`, `PORT`). Set the start command to `npm start`.

Notes

- Use a hosted MongoDB (Atlas) and place the connection string in `MONGO_URI`.
- Configure cloud storage or use direct image URLs for event images. Multer is included for local multipart handling but production image storage (S3 / Cloudinary) is recommended.

