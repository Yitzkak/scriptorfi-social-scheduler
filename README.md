# Scriptorfi Social Scheduler

A web app for managing Scriptorfi's 14-day social media strategy across Instagram, TikTok, and Bluesky.

## Features

- **Strategy parser** — Upload the 14-day markdown file, app auto-organizes by day
- **Day-by-day dashboard** — Navigate all 14 days with completion tracking
- **Platform tabs** — Instagram, TikTok, and Bluesky content per day
- **Copy-to-clipboard** — One-click copy for captions, scripts, threads
- **AI Image Generation** — Uses ChatGPT prompts to generate images via DALL-E 3
- **Image gallery** — View all generated images per day, download them
- **Status tracking** — Mark days/platforms as complete (saved locally)
- **Phone preview** — See how your post looks on social media
- **Pre-loaded** — Comes with the full 14-day strategy built in

## Deploy to Vercel (free, 5 min)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo
4. Deploy — that's it

## Setup OpenAI API Key (for image generation)

Once deployed:
1. Get an API key at https://platform.openai.com/api-keys
2. In the app, open the sidebar (hamburger menu on mobile)
3. Paste your key in the "OpenAI API Key" field
4. Click "Generate" on any image prompt

The key is saved in your browser's localStorage — nothing sent to our servers.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js 14 (React 18, TypeScript)
- Tailwind CSS
- OpenAI DALL-E 3 API
- LocalStorage for state persistence
- Deployed via Vercel
