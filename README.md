# Hotseat

A voice-first AI mock interviewer that reads your actual resume and grills you on it, then hands back a shareable scorecard.

**Live: [hotseat-black.vercel.app](https://hotseat-black.vercel.app)**

Built solo for Gnani AI's Great Indian AI Internship Challenge (Nov 2026).

## What it does

Paste or upload a resume, pick a company style (service / product / startup) and a duration between 5 and 30 minutes. Then you talk. The interviewer asks about your own projects, chases vague answers with follow-ups, and stops when the clock runs out — there is no fixed question list. At the end you get a scored breakdown with specific fixes, downloadable as a PNG, plus the full transcript.

## How it works

- **Hands-free voice loop.** Browser-side voice activity detection keeps the mic open, so there's no push-to-talk. Barge-in cuts the interviewer's audio the moment you start speaking.
- **Adaptive, time-based interviews.** `/api/turn` is conversational rather than a scripted sequence: the model picks the next move from the transcript so far and wraps up as the timer runs down. A live `mm:ss` ticker drives the pacing.
- **No login, no database.** Profile, resumes and run history live in `localStorage`. Each new session personalises off the previous scorecard's weak points and your onboarding answers.
- **Speech.** Gnani Prisma for STT (WAV recorded in-browser, clips up to 30 s) and Gnani Timbre for TTS (`en-IN`). API keys stay server-side behind Next.js route handlers.
- **Brain.** Groq with a primary/fallback model chain, JSON mode for structured scorecards.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Gnani Prisma STT + Timbre TTS · Groq · Vercel

## Running locally

```bash
npm install
cp .env.example .env.local   # add your own GNANI_API_KEY and GROQ_API_KEY
npm run dev
```

Open <http://localhost:3000>.

## Notes

- `src/components/Hotseat.tsx` holds the app shell; shared primitives are in `src/components/ui.tsx`.
- `BRAND.md` documents the design system (editorial type, hard-shadow buttons, the always-dark interview "stage").
- The demo uses a sample resume and an AI-voiced candidate — synthetic data only.
