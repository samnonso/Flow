
# ChordFlow Deployment Guide

This guide outlines the steps to deploy the ChordFlow application using two popular methods: **GitHub via Vercel** (easiest for frontend) and **Google Cloud Run** (for containerized scalability).

## Prerequisites

1.  **Codebase**: Ensure your project is pushed to a Git repository (GitHub, GitLab, or Bitbucket).
2.  **Environment Variables**: You will need your Google Gemini `API_KEY`.
3.  **Build Configuration**: Ensure your project has a `package.json` with a build script (standard Angular `ng build` or Vite `vite build`).

---

## Option 1: Deploy via Vercel (Recommended)

Vercel provides the smoothest deployment experience for Angular/Single Page Applications with automatic CI/CD on every push.

### Steps

1.  **Push to GitHub**:
    Ensure your latest code is committed and pushed to your GitHub repository.

2.  **Import Project in Vercel**:
    - Log in to [Vercel](https://vercel.com/).
    - Click **"Add New..."** -> **"Project"**.
    - Select your `chord-flow` repository.

3.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Angular**. If not, select it manually.
    - **Build Command**: `ng build` (or your specific build command).
    - **Output Directory**: `dist/chord-flow` (or `dist/chord-flow/browser` for newer Angular versions).

4.  **Environment Variables**:
    - Expand the **"Environment Variables"** section.
    - Add the following key-value pair:
        - Key: `API_KEY`
        - Value: `your_google_gemini_api_key_here`

5.  **Deploy**:
    - Click **"Deploy"**. Vercel will build your application and assign a live URL (e.g., `https://chord-flow.vercel.app`).

### Handling Client-Side Env Vars
Since this is a client-side app, accessing `process.env` directly might require configuration depending on your build tool.
*   **If using Angular CLI**: You may need to use `src/environments/environment.ts` or a custom webpack builder to inject the key.
*   **If using Vite**: Use `import.meta.env.VITE_API_KEY` and prefix your variable with `VITE_`.

---

## Option 2: Deploy to Google Cloud Run

Cloud Run serves your application as a stateless container. This requires Dockerizing your application.

### 1. Create a `Dockerfile`

Create a file named `Dockerfile` in the root of your project:

```dockerfile
# Stage 1: Build the Angular application
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
# Note: Ensure you pass the API key during build if using compile-time injection, 
# OR configure your app to read from a runtime config.json.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from Stage 1
# Update 'chord-flow' to match the name in your angular.json output path
COPY --from=build /app/dist/chord-flow/browser /usr/share/nginx/html

# Copy custom nginx config (optional, required for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create `nginx.conf`

Create an `nginx.conf` file in the root to handle Angular routing (redirecting 404s to index.html):

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Build and Push to Google Container Registry (GCR)

1.  **Initialize SDK**:
    ```bash
    gcloud init
    gcloud auth configure-docker
    ```

2.  **Build the Image**:
    Replace `PROJECT_ID` with your Google Cloud Project ID.
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/chordflow
    ```

### 4. Deploy to Cloud Run

Deploy the container image to Cloud Run.

```bash
gcloud run deploy chordflow \
  --image gcr.io/PROJECT_ID/chordflow \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### 5. Runtime Configuration

If your application needs the `API_KEY` at runtime (and your code supports reading it from window/config), you can set environment variables in Cloud Run:

```bash
gcloud run services update chordflow \
  --set-env-vars API_KEY=your_key_here
```

*Note: For static Angular apps served via Nginx, environment variables set in Cloud Run are not automatically available to the browser code. You typically need a startup script in your Dockerfile to write these env vars into a `assets/config.json` file that Angular reads on startup.*
