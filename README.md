# D31.GG

A scrim (practice match) matching platform for competitive **VALORANT** teams in Korea.

Live: **https://d31.gg**

D31.GG helps teams find balanced practice partners without hopping across countless Discord servers. Teams post scrim listings by tier, format, and time, and get matched with opponents of a similar skill level.

## Features

- **Scrim board & matching** — post listings (tier / format / time) and find similar-skill opponents
- **Auto-match** — automatically discover teams near your tier
- **Team management** — rosters, roles, captain transfer, invites
- **Recruitment board** — players and coaches find each other (LFT / LFP / LFC)
- **Strategy notes** — map strategies and opponent analysis, shared within the team only (RLS-isolated)
- **In-house hub** — run and track community in-house matches
- **Leaderboards & calendar** — team rankings from scrim results, date-based scrim listings
- **Player/team profiles** — verified Riot identity, tier, and match stats (via the VALORANT API)

## Riot API usage

Player verification uses **Riot Sign-On (RSO)** via OAuth. With each player's explicit **opt-in**, the VALORANT APIs (Account, Match, Ranked) are used to:

1. verify identity and current competitive rank for fair, tier-based matchmaking,
2. display the player's own match history and aggregate stats on their profile,
3. show verified team rosters and tiers.

Riot data is used only for these purposes, never sold or shared with third parties, and is deleted when a user unlinks their account or deletes it. Players who do not opt in are not exposed to others. A "not endorsed by Riot Games" disclaimer is shown in the footer.

> D31.GG is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing VALORANT.

## Tech stack

- **Framework:** Next.js (App Router, React Server Components)
- **Database / Auth / Realtime:** Supabase (PostgreSQL with Row-Level Security)
- **Styling:** Tailwind CSS
- **Deploy:** Vercel

## Project structure

```
src/app/               routes (App Router) + API route handlers
src/components/         UI components (layout, team, match, common, ...)
src/lib/               data access, utilities, types
supabase/migrations/   versioned DB schema & RLS policies
discord-bot/           Discord match-lobby bot
```

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Environment variables (Supabase URL/keys, etc.) are required. Secrets are never committed.
