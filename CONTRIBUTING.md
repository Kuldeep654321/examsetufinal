# Contributing to ExamSetu

Thank you for helping improve ExamSetu.

## Development setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and fill in local values.
3. Install dependencies with `npm install`.
4. Initialize the database with `npm run db:init`.
5. Start the development server with `npm run dev`.

## Before opening a pull request

Run the following commands:

```bash
npm test
npm run build
```

Keep changes focused and describe any database or seed-data changes in the pull request.

## Data contribution rules

- Use official authority portals and notifications as the source of truth.
- Do not invent exam dates, vacancies, fees or eligibility conditions.
- Use `unannounced` events with null dates when an official schedule is unavailable.
- Check existing slugs and organizations before adding a new exam to avoid duplicates.
- Include the official source URL and verification context for new records.

## Code style

Follow the existing TypeScript, Next.js App Router and Tailwind CSS patterns. Avoid unrelated formatting or refactoring in the same change.
