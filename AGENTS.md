# Where Have I Been To - Agent Context

## Project Overview

**Where Have I Been To** is a travel visualization web application that displays a user's flight history and country visits on an interactive map. The app shows airports visited, flight routes, and countries traveled to, with toggleable views for different data types.

## Architecture

### High-Level Structure
```
wherehaveibeento/
├── be/                 # Backend (placeholder - coming soon)
├── src/
│   ├── fe/             # Frontend React application
│   └── admin/          # Admin interface (legacy - for data management)
├── AGENTS.md           # This file
└── README.md           # Project documentation
```

## Frontend (`src/fe/`)

### Technology Stack
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18 with Shadcn/UI components
- **Maps**: Leaflet.js + react-leaflet
- **Port**: 8100

### Directory Structure
```
src/fe/
├── public/
│   └── data/
│       ├── flights/              # User flight data
│       │   ├── airports.json     # Airport reference data (IATA codes, coords, names)
│       │   ├── sd.json           # User 'sd' flight data
│       │   └── easita.json       # User 'easita' flight data
│       └── visits/               # User country visit data
│           ├── shom_countriesTravelled.json
│           ├── alex_countriesTravelled.json
│           ├── anjani_countriesTravelled.json
│           └── bala_countriesTravelled.json
├── src/
│   ├── components/
│   │   ├── TravelMap.jsx        # Main map component with Leaflet
│   │   └── MapControls.jsx      # Toggle controls for view modes
│   ├── hooks/
│   │   └── useUserData.js       # Custom hook for data loading
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Entry point
└── package.json
```

### Key Components

#### 1. **App.jsx**
- Main application container
- Manages view mode state (airports/visits/both)
- Displays header, stats, and map
- No authentication required
- User selection via query parameter: `?user=sd`

#### 2. **TravelMap.jsx**
- Renders Leaflet map with OpenStreetMap tiles
- Shows airport markers (purple dots) with flight information
- Shows country visit markers (orange dots) with visit details
- Displays flight routes as blue polylines
- Popups show detailed information on click
- Supports three view modes: airports, visits, or both

#### 3. **MapControls.jsx**
- Toggle buttons for view modes
- Statistics display (airport count, country count)
- Visual indicators for marker types

#### 4. **useUserData.js**
- Custom React hook for loading user data
- Fetches flights, airports, and visits data
- Handles loading and error states
- `useUsername()` hook extracts user from query params (defaults to 'sd')

### Data Formats

#### Flights Data (`flights/{user}.json`)
```json
[
  {
    "tripDate": "2023-01-01",
    "from": "JFK",        // IATA code
    "to": "LAX",          // IATA code
    "flight": "AA123"     // Flight number
  }
]
```

#### Airports Data (`flights/airports.json`)
```json
{
  "JFK": {
    "name": "John F. Kennedy International Airport",
    "city": "New York",
    "coords": [40.6413, -73.7781]  // [latitude, longitude]
  }
}
```

#### Visits Data (`visits/{user}_countriesTravelled.json`)
```json
[
  {
    "name": "Maldives",
    "code": "MV",               // 2-letter country code
    "flag": "🇲🇻",
    "continent": "Asia",
    "coordinates": {
      "lat": 3.2028,
      "lng": 73.2207
    },
    "visits": [
      {
        "startDate": "2017-12-23",
        "endDate": "2017-12-26",
        "stayType": "trip",     // "trip" or "stay"
        "places": "Male, Hulhumale"  // Optional
      }
    ]
  }
]
```

### Features

1. **Interactive Map**
   - Zoom and pan controls
   - Click markers for details
   - Auto-centers on first location

2. **View Modes**
   - **Airports Only**: Shows airports and flight routes
   - **Visits Only**: Shows countries visited
   - **Both**: Shows all data simultaneously

3. **Airport Details**
   - Airport name and city
   - IATA code
   - Total visit count
   - List of departures and arrivals with dates

4. **Country Visit Details**
   - Country name with flag
   - Continent
   - Visit count
   - Date ranges for each visit
   - Trip vs Stay classification

5. **Statistics**
   - Total flights
   - Unique airports visited
   - Countries visited

### Running the Application

```bash
cd src/fe
npm install
npm run dev
```

Access at: `http://localhost:8100?user=sd`

### User Selection

Users are selected via query parameter:
- `?user=sd` - Load sd's data
- `?user=easita` - Load easita's data
- Default: `sd`

## Backend (`be/`)

Currently a placeholder. Future implementation will include:
- Express server with TypeScript
- Database (likely PostgreSQL with Prisma)
- RESTful API endpoints
- Authentication system
- Cron jobs for data synchronization

## Admin Interface (`src/admin/`)

Legacy admin tool for managing flight and airport data:
- Load user flight data
- Add/edit/remove flights
- Fetch airport details from RapidAPI
- Download JSON files
- Remote data source: `https://flights.wherehaveibeento.me/`

**Note**: This is kept for backward compatibility and data management.

## Migration History

This codebase was restructured from three separate applications:

### Previous Structure (Deleted)
1. **globeApp** - 3D globe visualization using Globe.gl (Vanilla JS)
   - Showed visited countries on rotating 3D globe
   - Journey animation feature
   - Subdomain-based user selection
   - **Migrated to**: `fe/` with 2D map approach

2. **flightTracker** - 2D flight map using Leaflet (Vanilla JS)
   - Showed airports and flight routes
   - Query parameter user selection
   - **Migrated to**: `fe/` as primary functionality

3. **admin** - Data management interface
   - **Kept as-is** in `src/admin/`

### Key Changes in Migration
- Switched from 3D globe to 2D Leaflet map for better React integration
- Consolidated two apps into single React application
- Changed from subdomain-based to query parameter user selection
- Removed authentication (was present in template, not in original apps)
- Unified data loading and state management

## Common Tasks

### Adding a New User
1. Add flight data: `src/fe/public/data/flights/{username}.json`
2. Add visit data: `src/fe/public/data/visits/{username}_countriesTravelled.json`
3. Access via: `?user={username}`

### Adding New Airports
Update `src/fe/public/data/flights/airports.json` with:
```json
{
  "XXX": {
    "name": "Airport Name",
    "city": "City Name",
    "coords": [latitude, longitude]
  }
}
```

### Customizing Map Appearance
- **Markers**: Edit `TravelMap.jsx` functions `createAirportIcon()` and `createCountryIcon()`
- **Flight paths**: Modify `Polyline` pathOptions in `TravelMap.jsx`
- **Colors**: Update Tailwind classes or add custom CSS

### Future Enhancements
- 3D globe view option (reintegrate Globe.gl)
- Animated journey playback
- Search and filter functionality
- User authentication with profiles
- Social sharing features
- Statistics dashboard
- Export data as PDF/images

## Environment Notes

- **No environment variables required** for frontend (all static data)
- **No API keys needed** (uses public OpenStreetMap tiles)
- **No backend connection** (fully client-side currently)

## Dependencies Overview

### Core
- `react`, `react-dom` - UI framework
- `vite` - Build tool and dev server

### Maps
- `leaflet` - Map rendering library
- `react-leaflet` - React bindings for Leaflet

### UI
- `tailwindcss` - Utility-first CSS
- `@radix-ui/*` - Unstyled UI primitives (Shadcn basis)
- `lucide-react` - Icon library
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities

### Auth (Currently Unused)
- `better-auth` - Authentication library (configured but not active)

## Troubleshooting

### Map not displaying
- Check if Leaflet CSS is imported in `TravelMap.jsx`
- Verify marker icon paths are correct
- Check browser console for loading errors

### No data showing
- Verify JSON files exist in `public/data/` directories
- Check username matches file naming convention
- Inspect network tab for 404 errors

### Markers not appearing
- Ensure airport codes in flight data match airports.json
- Verify coordinate format is `[lat, lng]` (not `{lat, lng}`)
- Check that visit data has valid coordinates

## Contact & Contribution

This is a personal project for tracking travel history. Data files are user-specific and should be managed individually.
