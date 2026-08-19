(() => {
  "use strict";

  /* =========================================================
     Config
     Open-Meteo requires no API key. If you swap in a provider
     that does (OpenWeatherMap, WeatherAPI, etc.), read the key
     from a build-time env var — never hard-code it here. See
     README.md for how to wire that up safely.
  ========================================================= */
  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const GAUGE_MIN_C = -20;
  const GAUGE_MAX_C = 45;

  const WEATHER_CODES = {
    0:  { text: "Clear sky",         icon: "clear" },
    1:  { text: "Mainly clear",      icon: "clear" },
    2:  { text: "Partly cloudy",     icon: "partly" },
    3:  { text: "Overcast",          icon: "cloudy" },
    45: { text: "Fog",               icon: "fog" },
    48: { text: "Depositing fog",    icon: "fog" },
    51: { text: "Light drizzle",     icon: "drizzle" },
    53: { text: "Drizzle",           icon: "drizzle" },
    55: { text: "Dense drizzle",     icon: "drizzle" },
    56: { text: "Freezing drizzle",  icon: "drizzle" },
    57: { text: "Freezing drizzle",  icon: "drizzle" },
    61: { text: "Light rain",        icon: "rain" },
    63: { text: "Rain",              icon: "rain" },
    65: { text: "Heavy rain",        icon: "rain" },
    66: { text: "Freezing rain",     icon: "rain" },
    67: { text: "Freezing rain",     icon: "rain" },
    71: { text: "Light snow",        icon: "snow" },
    73: { text: "Snow",              icon: "snow" },
    75: { text: "Heavy snow",        icon: "snow" },
    77: { text: "Snow grains",       icon: "snow" },
    80: { text: "Rain showers",      icon: "rain" },
    81: { text: "Rain showers",      icon: "rain" },
    82: { text: "Violent showers",   icon: "rain" },
    85: { text: "Snow showers",      icon: "snow" },
    86: { text: "Snow showers",      icon: "snow" },
    95: { text: "Thunderstorm",      icon: "storm" },
    96: { text: "Thunderstorm, hail",icon: "storm" },
    99: { text: "Thunderstorm, hail",icon: "storm" }
  };

  const SKY_TINTS = {
    clear_day:    ["#3a70a8", "#0f1a22"],
    clear_night:  ["#0d1622", "#0a1017"],
    partly_day:   ["#3c6785", "#131e26"],
    partly_night: ["#101c27", "#0a1017"],
    cloudy_day:   ["#39505f", "#141d23"],
    cloudy_night: ["#141f28", "#0a1017"],
    fog_day:      ["#4a5559", "#181f22"],
    fog_night:    ["#161c1f", "#0a1017"],
    drizzle_day:  ["#334f5c", "#131c22"],
    drizzle_night:["#101a20", "#0a1017"],
    rain_day:     ["#2c4652", "#111a20"],
    rain_night:   ["#0d161c", "#0a1017"],
    snow_day:     ["#4d6272", "#1a232a"],
    snow_night:   ["#182530", "#0a1017"],
    storm_day:    ["#242f38", "#0e161c"],
    storm_night:  ["#0c1218", "#080d12"]
  };

  const ICONS = {
    clear: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M12 2v2.4M12 19.6V22M22 12h-2.4M4.4 12H2M18.7 5.3l-1.7 1.7M7 15.3l-1.7 1.7M18.7 18.7l-1.7-1.7M7 8.7L5.3 5.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    partly: `<svg viewBox="0 0 24 24"><path d="M9 8a4 4 0 013.8 2.7A3.6 3.6 0 0117.5 14H8.2A3.2 3.2 0 019 8z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M5.5 3.5v1.8M2.5 8h1.8M9.8 3.8L8.5 5.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    cloudy: `<svg viewBox="0 0 24 24"><path d="M6.5 10a4.5 4.5 0 014.3 3.1A4 4 0 0119.5 15 3 3 0 0117 18.5H6.8A4.3 4.3 0 016.5 10z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/></svg>`,
    fog: `<svg viewBox="0 0 24 24"><path d="M4 9h13M4 13.5h16M4 18h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    drizzle: `<svg viewBox="0 0 24 24"><path d="M6.5 8.5a4.5 4.5 0 014.3 3.1 4 4 0 015.2 3.9H6.8a3.9 3.9 0 01-.3-7z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M8 18.5L7 20.5M12 18.5l-1 2M16 18.5l-1 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    rain: `<svg viewBox="0 0 24 24"><path d="M6.5 8a4.5 4.5 0 014.3 3.1A4 4 0 0116 14.9H6.8a3.9 3.9 0 01-.3-7z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M7.5 17l-1.3 2.6M11.5 17l-1.3 2.6M15.5 17l-1.3 2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    snow: `<svg viewBox="0 0 24 24"><path d="M6.5 8a4.5 4.5 0 014.3 3.1A4 4 0 0116 14.9H6.8a3.9 3.9 0 01-.3-7z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M8 17.5v3.5M6.5 19h3M13 17.5v3.5M11.5 19h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    storm: `<svg viewBox="0 0 24 24"><path d="M6.5 7.5a4.5 4.5 0 014.3 3.1 4 4 0 015.2 3.9H6.8a3.9 3.9 0 01-.3-7z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M12.5 15l-2.5 4h2.5l-1.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
  };

  /* ---------- state ---------- */
  let unit = "C";          // "C" | "F"
  let lastData = null;     // last successful fetch payload
  let skyToggle = false;   // which sky layer is active
  let requestSeq = 0;      // guards against out-of-order responses

  /* ---------- element refs ---------- */
  const $ = (id) => document.getElementById(id);
  const els = {
    form: $("searchForm"),
    input: $("citySearch"),
    searchBtn: $("searchBtn"),
    locateBtn: $("locateBtn"),
    refreshBtn: $("refreshBtn"),
    unitC: $("unitC"),
    unitF: $("unitF"),
    states: {
      initial: $("initialState"),
      loading: $("loadingState"),
      notFound: $("notFoundState"),
      error: $("errorState"),
      results: $("results")
    },
    cityName: $("cityName"),
    countryName: $("countryName"),
    temperature: $("temperature"),
    tempUnitLabel: $("tempUnitLabel"),
    tempIcon: $("tempIcon"),
    conditionText: $("conditionText"),
    feelsLike: $("feelsLike"),
    lastUpdated: $("lastUpdated"),
    coords: $("coords"),
    humidity: $("humidity"),
    windSpeed: $("windSpeed"),
    windDir: $("windDir"),
    pressure: $("pressure"),
    visibility: $("visibility"),
    sunrise: $("sunrise"),
    sunset: $("sunset"),
    gaugeFill: $("gaugeFill"),
    gaugeTrack: $("gaugeTrack"),
    gaugeTicks: $("gaugeTicks"),
    gaugeNeedle: $("gaugeNeedle"),
    skyA: $("skyA"),
    skyB: $("skyB")
  };

  /* =========================================================
     Gauge geometry (half-circle dial, opens downward is wrong —
     opens upward with hub at bottom center)
  ========================================================= */
  const GC = { cx: 110, cy: 140, r: 78 };

  function polar(angleDeg, r) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: GC.cx + r * Math.cos(rad), y: GC.cy - r * Math.sin(rad) };
  }

  function arcPath(startAngle, endAngle, r) {
    const p1 = polar(startAngle, r);
    const p2 = polar(endAngle, r);
    const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  function angleForTemp(tempC) {
    const clamped = Math.min(GAUGE_MAX_C, Math.max(GAUGE_MIN_C, tempC));
    const frac = (clamped - GAUGE_MIN_C) / (GAUGE_MAX_C - GAUGE_MIN_C);
    return 180 - frac * 180; // 180 (left, cold) -> 0 (right, hot)
  }

  function initGaugeStatic() {
    els.gaugeTrack.setAttribute("d", arcPath(180, 0, GC.r));
    els.gaugeTicks.innerHTML = "";
    for (let a = 0; a <= 180; a += 30) {
      const inner = polar(a, GC.r - 9);
      const outer = polar(a, GC.r - 2);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", inner.x.toFixed(2));
      line.setAttribute("y1", inner.y.toFixed(2));
      line.setAttribute("x2", outer.x.toFixed(2));
      line.setAttribute("y2", outer.y.toFixed(2));
      line.setAttribute("class", "tick");
      els.gaugeTicks.appendChild(line);
    }
  }

  function updateGauge(tempC) {
    const angle = angleForTemp(tempC);
    els.gaugeFill.setAttribute("d", arcPath(180, angle, GC.r));
    const needleP = polar(angle, GC.r - 14);
    const dx = needleP.x - GC.cx;
    const dy = needleP.y - GC.cy;
    const rot = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    els.gaugeNeedle.style.transform = `rotate(${rot}deg)`;
  }

  /* ---------- unit conversions ---------- */
  const cToF = (c) => (c * 9) / 5 + 32;
  const kmToMi = (km) => km * 0.621371;
  const kmhToMph = (kmh) => kmh * 0.621371;

  function compassFromDeg(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  function formatTime(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /* =========================================================
     UI state machine
  ========================================================= */
  function showState(name) {
    Object.entries(els.states).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function setSky(iconKey, isDay) {
    const key = `${iconKey}_${isDay ? "day" : "night"}`;
    const [top, bottom] = SKY_TINTS[key] || SKY_TINTS.cloudy_day;
    const grad = `radial-gradient(120% 70% at 50% -10%, ${top} 0%, ${bottom} 60%)`;
    const nextLayer = skyToggle ? els.skyA : els.skyB;
    const prevLayer = skyToggle ? els.skyB : els.skyA;
    nextLayer.style.background = grad;
    nextLayer.style.opacity = "1";
    prevLayer.style.opacity = "0";
    skyToggle = !skyToggle;
  }

  function renderResult(payload) {
    lastData = payload;
    const { place, current, daily, visibilityKm } = payload;
    const meta = WEATHER_CODES[current.weather_code] || { text: "Unknown", icon: "cloudy" };
    const isDay = current.is_day === 1;

    els.cityName.textContent = place.name;
    els.countryName.textContent = [place.admin1, place.country].filter(Boolean).join(", ");
    els.conditionText.textContent = meta.text;
    els.tempIcon.innerHTML = ICONS[meta.icon] || ICONS.cloudy;
    els.coords.textContent = `${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°`;
    els.lastUpdated.textContent = formatTime(new Date().toISOString());
    els.windDir.textContent = current.wind_direction_10m != null ? compassFromDeg(current.wind_direction_10m) : "";
    els.pressure.textContent = current.pressure_msl != null ? `${Math.round(current.pressure_msl)} hPa` : "—";
    els.humidity.textContent = current.relative_humidity_2m != null ? `${Math.round(current.relative_humidity_2m)}%` : "—";
    els.sunrise.textContent = formatTime(daily?.sunrise?.[0]);
    els.sunset.textContent = formatTime(daily?.sunset?.[0]);

    setSky(meta.icon, isDay);
    applyUnits();
    showState("results");
  }

  function applyUnits() {
    if (!lastData) return;
    const { current, visibilityKm } = lastData;
    const tempC = current.temperature_2m;
    const feelsC = current.apparent_temperature;

    if (unit === "C") {
      els.temperature.textContent = Math.round(tempC);
      els.feelsLike.textContent = `${Math.round(feelsC)}°C`;
      els.tempUnitLabel.textContent = "°C";
      els.windSpeed.textContent = current.wind_speed_10m != null ? `${Math.round(current.wind_speed_10m)} km/h` : "—";
      els.visibility.textContent = visibilityKm != null ? `${visibilityKm.toFixed(1)} km` : "—";
    } else {
      els.temperature.textContent = Math.round(cToF(tempC));
      els.feelsLike.textContent = `${Math.round(cToF(feelsC))}°F`;
      els.tempUnitLabel.textContent = "°F";
      els.windSpeed.textContent = current.wind_speed_10m != null ? `${Math.round(kmhToMph(current.wind_speed_10m))} mph` : "—";
      els.visibility.textContent = visibilityKm != null ? `${kmToMi(visibilityKm).toFixed(1)} mi` : "—";
    }
    updateGauge(tempC);
  }

  /* =========================================================
     Networking
  ========================================================= */
  async function geocodeCity(name) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("geocode_failed");
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    return data.results[0];
  }

  async function fetchForecast(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m",
      hourly: "visibility",
      daily: "sunrise,sunset",
      timezone: "auto",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      forecast_days: "1"
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("forecast_failed");
    return res.json();
  }

  function extractVisibilityKm(forecast) {
    try {
      const idx = forecast.hourly.time.indexOf(forecast.current.time);
      const meters = idx >= 0 ? forecast.hourly.visibility[idx] : forecast.hourly.visibility[0];
      return meters != null ? meters / 1000 : null;
    } catch {
      return null;
    }
  }

  async function loadCity(name) {
    const seq = ++requestSeq;
    showState("loading");
    els.searchBtn.disabled = true;
    try {
      const place = await geocodeCity(name);
      if (seq !== requestSeq) return;
      if (!place) {
        showState("notFound");
        return;
      }
      const forecast = await fetchForecast(place.latitude, place.longitude);
      if (seq !== requestSeq) return;
      renderResult({
        place: {
          name: place.name,
          admin1: place.admin1,
          country: place.country,
          latitude: place.latitude,
          longitude: place.longitude
        },
        current: forecast.current,
        daily: forecast.daily,
        visibilityKm: extractVisibilityKm(forecast)
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      showState("error");
    } finally {
      if (seq === requestSeq) els.searchBtn.disabled = false;
    }
  }

  async function loadCoords(lat, lon, label) {
    const seq = ++requestSeq;
    showState("loading");
    try {
      const forecast = await fetchForecast(lat, lon);
      if (seq !== requestSeq) return;
      renderResult({
        place: { name: label, admin1: "", country: "", latitude: lat, longitude: lon },
        current: forecast.current,
        daily: forecast.daily,
        visibilityKm: extractVisibilityKm(forecast)
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      showState("error");
    }
  }

  /* =========================================================
     Wiring
  ========================================================= */
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = els.input.value.trim();
    if (value) loadCity(value);
  });

  els.locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showState("error");
      return;
    }
    showState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => loadCoords(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => showState("error"),
      { timeout: 10000 }
    );
  });

  els.refreshBtn.addEventListener("click", () => {
    if (!lastData) return;
    loadCoords(lastData.place.latitude, lastData.place.longitude, lastData.place.name);
  });

  function setUnit(next) {
    unit = next;
    els.unitC.classList.toggle("is-active", unit === "C");
    els.unitC.setAttribute("aria-pressed", String(unit === "C"));
    els.unitF.classList.toggle("is-active", unit === "F");
    els.unitF.setAttribute("aria-pressed", String(unit === "F"));
    applyUnits();
  }
  els.unitC.addEventListener("click", () => setUnit("C"));
  els.unitF.addEventListener("click", () => setUnit("F"));

  initGaugeStatic();
  showState("initial");
})();
