# WeatherNow

A clean, responsive weather dashboard styled as a station observation plate — search any city and get a live reading: temperature, condition, feels-like, humidity, wind, pressure, visibility, and sunrise/sunset.

## Live data, no API key

WeatherNow uses [Open-Meteo](https://open-meteo.com/), a free weather API that requires **no API key** for the request volumes this app makes. That's a deliberate choice: it satisfies the brief's requirement to never expose a private key in frontend code, with nothing to configure.

Two endpoints are called directly from the browser:
- `https://geocoding-api.open-meteo.com/v1/search` — turns a city name into coordinates
- `https://api.open-meteo.com/v1/forecast` — current conditions, hourly visibility, and today's sunrise/sunset for those coordinates

## Running it

No build step or dependencies. Either:

1. Open `index.html` directly in a browser, or
2. Serve the folder locally (needed in some browsers for `fetch` + geolocation to behave well):
   ```bash
   cd weather-app
   python3 -m http.server 8080
   # then visit http://localhost:8080
   ```

## If you swap in a key-based provider

To use OpenWeatherMap, WeatherAPI, or similar instead:

1. Never hard-code the key in `script.js`.
2. If you keep this as a static site, put your key behind a small serverless function or backend proxy that the frontend calls — the browser should never hold a secret key directly, since anything shipped to the client is publicly visible.
3. If you move to a bundled setup (Vite, Create React App, etc.), read the key from an environment variable (e.g. `.env`, gitignored) and inject it at build time, then route requests through your own backend rather than calling the provider straight from the browser.

## Project structure

```
weather-app/
├── index.html   structure and markup for all UI states
├── style.css    design system + responsive layout
├── script.js    search, geolocation, fetch logic, gauge rendering
└── README.md
```

## Features

- City search with Enter-to-submit, plus a "use my location" button (browser Geolocation API)
- Current temperature shown on a custom radial gauge, feels-like, humidity, wind speed + direction, pressure, visibility, sunrise/sunset
- °C / °F toggle that re-renders instantly without a new search
- Manual refresh button and a "last updated" timestamp
- Distinct states for initial / loading / city-not-found / API-error / success, none of which leak raw technical errors to the user
- Responsive from mobile to desktop; no horizontal scroll
- Keyboard-accessible controls, visible focus states, ARIA labels on icon-only buttons, `prefers-reduced-motion` respected
