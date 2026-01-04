# Where Have I Been To 🗺️

A travel visualization web app that displays your flight history and country visits on an interactive map.

## Quick Start

```bash
cd src/fe
npm install
npm run dev
```

Visit: `http://localhost:8100?user=sd`

## Features

- **Interactive Map**: View airports visited and flight routes on a Leaflet map
- **Country Visits**: See all countries you've traveled to with visit details
- **Toggle Views**: Switch between airports, visits, or both
- **Travel Stats**: Track total flights, unique airports, and countries visited

## Structure

- `fe/` - React frontend (Vite + Tailwind + Shadcn)
- `be/` - Backend (coming soon)
- `src/admin/` - Data management interface

## Usage

Access different users via query parameter: `?user={username}`

Available users: `sd`, `easita`, `shom`, `alex`, `anjani`, `bala`

See [AGENTS.md](AGENTS.md) for detailed documentation.
