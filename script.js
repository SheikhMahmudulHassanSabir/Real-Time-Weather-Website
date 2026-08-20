(() => {
  "use strict";

  /* =========================================================
     Endpoints & Constants
  ========================================================= */
  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const SAVED_KEY = "weathernow_saved_locations";

  /* Weather Code Descriptions and Clean Thin Line Icons */
  const WEATHER_CODES = {
    0:  { text: "Clear Sky",             icon: "clear",   severe: false },
    1:  { text: "Mainly Clear",          icon: "clear",   severe: false },
    2:  { text: "Partly Cloudy",         icon: "partly",  severe: false },
    3:  { text: "Overcast",              icon: "cloudy",  severe: false },
    45: { text: "Foggy",                 icon: "fog",     severe: false },
    48: { text: "Depositing Rime Fog",   icon: "fog",     severe: false },
    51: { text: "Light Drizzle",         icon: "drizzle", severe: false },
    53: { text: "Moderate Drizzle",      icon: "drizzle", severe: false },
    55: { text: "Dense Drizzle",         icon: "drizzle", severe: false },
    56: { text: "Freezing Drizzle",      icon: "drizzle", severe: false },
    57: { text: "Freezing Drizzle",      icon: "drizzle", severe: false },
    61: { text: "Slight Rain",           icon: "rain",    severe: false },
    63: { text: "Moderate Rain",         icon: "rain",    severe: false },
    65: { text: "Heavy Rainfall",        icon: "rain",    severe: true },
    66: { text: "Freezing Rain",         icon: "rain",    severe: true },
    67: { text: "Freezing Rain",         icon: "rain",    severe: true },
    71: { text: "Slight Snow",           icon: "snow",    severe: false },
    73: { text: "Moderate Snow",         icon: "snow",    severe: false },
    75: { text: "Heavy Snowfall",        icon: "snow",    severe: true },
    77: { text: "Snow Grains",           icon: "snow",    severe: false },
    80: { text: "Rain Showers",          icon: "rain",    severe: false },
    81: { text: "Moderate Showers",      icon: "rain",    severe: false },
    82: { text: "Violent Rain Showers",  icon: "rain",    severe: true },
    85: { text: "Snow Showers",          icon: "snow",    severe: false },
    86: { text: "Heavy Snow Showers",    icon: "snow",    severe: true },
    95: { text: "Thunderstorm",          icon: "storm",   severe: true },
    96: { text: "Thunderstorm & Hail",   icon: "storm",   severe: true },
    99: { text: "Heavy Thunderstorm",    icon: "storm",   severe: true }
  };

  const ICONS = {
    clear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    partly: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2"/><path d="M17.5 19a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 15.5a4.5 4.5 0 0 0 4.5 3.5h8z"/></svg>`,
    cloudy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 15.5a4.5 4.5 0 0 0 4.5 3.5h8z"/></svg>`,
    fog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16M3 12h18M4 16h16M6 20h12"/></svg>`,
    drizzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 15a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 11.5a4.5 4.5 0 0 0 4.5 3.5h8z"/><path d="M8 18v2M12 18v2M16 18v2"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 14a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 10.5a4.5 4.5 0 0 0 4.5 3.5h8z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 14a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 10.5a4.5 4.5 0 0 0 4.5 3.5h8z"/><path d="M8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01"/></svg>`,
    storm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 13a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-3.1 1.3A6 6 0 0 0 5 9.5a4.5 4.5 0 0 0 4.5 3.5h8z"/><path d="M13 13l-3 5h4l-2 5"/></svg>`
  };

  /* ---------- App State ---------- */
  let unit = "C";          // "C" | "F"
  let lastData = null;     // Cache of fetched weather payload
  let requestSeq = 0;      // Guard against race conditions
  let savedLocations = []; // Loaded from localStorage

  /* ---------- DOM Ref Helper ---------- */
  const $ = (id) => document.getElementById(id);

  const els = {
    form: $("searchForm"),
    input: $("citySearch"),
    dropdown: $("searchDropdown"),
    locateBtn: $("locateBtn"),
    refreshBtn: $("refreshBtn"),
    savedBtn: $("savedLocationsBtn"),
    savedDrawer: $("savedDrawer"),
    closeSavedBtn: $("closeSavedBtn"),
    savedList: $("savedList"),
    bookmarkBtn: $("bookmarkBtn"),
    unitC: $("unitC"),
    unitF: $("unitF"),

    // State Containers
    statusPanel: $("statusPanel"),
    loadingState: $("loadingState"),
    notFoundState: $("notFoundState"),
    errorState: $("errorState"),
    dashboard: $("dashboard"),
    alertBanner: $("alertBanner"),
    alertTitle: $("alertTitle"),
    alertDesc: $("alertDesc"),

    // Dashboard Elements
    cityName: $("cityName"),
    countryName: $("countryName"),
    lastUpdated: $("lastUpdated"),
    tempIconWrap: $("tempIconWrap"),
    temperature: $("temperature"),
    tempUnitLabel: $("tempUnitLabel"),
    conditionText: $("conditionText"),
    feelsLike: $("feelsLike"),
    tempHigh: $("tempHigh"),
    tempLow: $("tempLow"),

    hourlyContainer: $("hourlyContainer"),
    dailyContainer: $("dailyContainer"),
    chartWrap: $("chartWrap"),

    // Metrics
    humidity: $("humidity"),
    humiditySub: $("humiditySub"),
    windSpeed: $("windSpeed"),
    windDir: $("windDir"),
    uvIndex: $("uvIndex"),
    uvSub: $("uvSub"),
    visibility: $("visibility"),
    visibilitySub: $("visibilitySub"),
    pressure: $("pressure"),
    pressureSub: $("pressureSub"),
    sunrise: $("sunrise"),
    sunset: $("sunset")
  };

  /* ---------- Unit Conversion Helpers ---------- */
  const cToF = (c) => (c * 9) / 5 + 32;
  const kmhToMph = (kmh) => kmh * 0.621371;
  const kmToMi = (km) => km * 0.621371;

  function compassFromDeg(deg) {
    if (deg == null) return "—";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  function formatTime(isoStr) {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function formatDayName(dateStr, index) {
    if (index === 0) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString([], { weekday: "short" });
  }

  /* =========================================================
     API Data Fetching
  ========================================================= */
  async function geocodeCity(name) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("geocode_failed");
    const data = await res.json();
    return data.results || [];
  }

  async function fetchForecast(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index",
      hourly: "temperature_2m,weather_code,precipitation_probability,uv_index,visibility",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "7"
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("forecast_failed");
    return res.json();
  }

  /* =========================================================
     UI Renderers
  ========================================================= */
  function showStatus(stateName) {
    els.statusPanel.hidden = false;
    els.dashboard.hidden = true;
    els.loadingState.hidden = stateName !== "loading";
    els.notFoundState.hidden = stateName !== "notFound";
    els.errorState.hidden = stateName !== "error";
  }

  function showDashboard() {
    els.statusPanel.hidden = true;
    els.dashboard.hidden = false;
  }

  function renderDashboard(payload) {
    lastData = payload;
    const { place, forecast } = payload;
    const current = forecast.current;
    const daily = forecast.daily;
    const hourly = forecast.hourly;

    const weatherMeta = WEATHER_CODES[current.weather_code] || { text: "Unknown", icon: "cloudy", severe: false };

    // 1. City & Location Header
    els.cityName.textContent = place.name;
    els.countryName.textContent = [place.admin1, place.country].filter(Boolean).join(", ");
    els.lastUpdated.textContent = `Updated ${formatTime(new Date().toISOString())}`;

    // Bookmark button state
    updateBookmarkStatus(place);

    // 2. Alert Banner Check
    if (weatherMeta.severe || (current.precipitation && current.precipitation > 2)) {
      els.alertBanner.hidden = false;
      els.alertTitle.textContent = `${weatherMeta.text} Alert`;
      els.alertDesc.textContent = `Active weather advisory for ${place.name}: ${weatherMeta.text.toLowerCase()} expected.`;
    } else {
      els.alertBanner.hidden = true;
    }

    // 3. Hero Weather Section
    els.conditionText.textContent = weatherMeta.text;
    els.tempIconWrap.innerHTML = ICONS[weatherMeta.icon] || ICONS.cloudy;

    // 4. Hourly Timeline
    renderHourly(hourly, forecast.timezone);

    // 5. 24-Hour SVG Interactive Chart
    renderChart(hourly);

    // 6. Daily 7-Day List
    renderDaily(daily);

    // 7. Secondary Weather Metrics
    renderMetrics(current, daily, hourly);

    // Apply Unit Formatting
    applyUnits();

    showDashboard();
  }

  /* Hourly Cards Renderer */
  function renderHourly(hourly, timezone) {
    els.hourlyContainer.innerHTML = "";
    if (!hourly || !hourly.time) return;

    // Get current hour index
    const nowIso = new Date().toISOString().slice(0, 13);
    let currentIdx = hourly.time.findIndex((t) => t.startsWith(nowIso));
    if (currentIdx < 0) currentIdx = 0;

    // Render 24 hours starting from current hour
    const endIdx = Math.min(hourly.time.length, currentIdx + 24);

    for (let i = currentIdx; i < endIdx; i++) {
      const timeStr = hourly.time[i];
      const tempC = hourly.temperature_2m[i];
      const code = hourly.weather_code[i];
      const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
      const meta = WEATHER_CODES[code] || { icon: "cloudy" };
      const isNow = i === currentIdx;

      const dateObj = new Date(timeStr);
      const timeLabel = isNow ? "Now" : dateObj.toLocaleTimeString([], { hour: "numeric" });

      const card = document.createElement("div");
      card.className = `hourly-card ${isNow ? "is-now" : ""}`;
      card.innerHTML = `
        <span class="hourly-time">${timeLabel}</span>
        <div class="hourly-icon" aria-hidden="true">${ICONS[meta.icon]}</div>
        <span class="hourly-temp" data-temp-c="${Math.round(tempC)}">${unit === "C" ? Math.round(tempC) + "°" : Math.round(cToF(tempC)) + "°"}</span>
        ${rainProb > 10 ? `<span class="hourly-rain">💧 ${rainProb}%</span>` : ""}
      `;
      els.hourlyContainer.appendChild(card);
    }
  }

  /* 24-Hour SVG Chart Renderer */
  function renderChart(hourly) {
    els.chartWrap.innerHTML = "";
    if (!hourly || !hourly.temperature_2m) return;

    const temps = hourly.temperature_2m.slice(0, 24);
    const rains = (hourly.precipitation_probability || []).slice(0, 24);
    const hours = (hourly.time || []).slice(0, 24).map((t, idx) => {
      if (idx === 0) return "Now";
      return new Date(t).toLocaleTimeString([], { hour: "numeric" });
    });

    const width = 680;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 20 };

    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (i) => padding.left + (i / (temps.length - 1)) * chartWidth;
    const getY = (temp) => padding.top + chartHeight - ((temp - minTemp) / (maxTemp - minTemp)) * chartHeight;

    // SVG Element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "chart-svg");

    // Rain Bars (background)
    rains.forEach((rain, i) => {
      if (rain > 0) {
        const barHeight = (rain / 100) * (chartHeight * 0.5);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", (getX(i) - 6).toFixed(1));
        rect.setAttribute("y", (padding.top + chartHeight - barHeight).toFixed(1));
        rect.setAttribute("width", "12");
        rect.setAttribute("height", barHeight.toFixed(1));
        rect.setAttribute("fill", "var(--accent-rain)");
        rect.setAttribute("opacity", "0.25");
        rect.setAttribute("rx", "2");
        svg.appendChild(rect);
      }
    });

    // Temperature Polyline Path
    const points = temps.map((t, i) => `${getX(i).toFixed(1)},${getY(t).toFixed(1)}`).join(" ");

    // Gradient Fill under temperature curve
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "tempGrad");
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    grad.innerHTML = `
      <stop offset="0%" stop-color="var(--accent-blue)" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="var(--accent-blue)" stop-opacity="0.0"/>
    `;
    defs.appendChild(grad);
    svg.appendChild(defs);

    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const firstX = getX(0).toFixed(1);
    const lastX = getX(temps.length - 1).toFixed(1);
    const bottomY = (padding.top + chartHeight).toFixed(1);
    areaPath.setAttribute("d", `M ${firstX},${bottomY} L ${points} L ${lastX},${bottomY} Z`);
    areaPath.setAttribute("fill", "url(#tempGrad)");
    svg.appendChild(areaPath);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "var(--accent-blue)");
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    line.setAttribute("points", points);
    svg.appendChild(line);

    // Interactive Hover Data Dots
    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.style.opacity = "0";
    els.chartWrap.appendChild(tooltip);

    temps.forEach((t, i) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", getX(i).toFixed(1));
      circle.setAttribute("cy", getY(t).toFixed(1));
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#ffffff");
      circle.setAttribute("stroke", "var(--accent-blue)");
      circle.setAttribute("stroke-width", "2");
      circle.style.cursor = "pointer";

      circle.addEventListener("mouseenter", (e) => {
        circle.setAttribute("r", "6");
        const displayVal = unit === "C" ? `${Math.round(t)}°C` : `${Math.round(cToF(t))}°F`;
        const rainStr = rains[i] ? ` · Rain ${rains[i]}%` : "";
        tooltip.innerHTML = `${hours[i]}: <strong>${displayVal}</strong>${rainStr}`;
        tooltip.style.left = `${(getX(i) / width) * 100}%`;
        tooltip.style.top = `${(getY(t) / height) * 100}%`;
        tooltip.style.opacity = "1";
      });

      circle.addEventListener("mouseleave", () => {
        circle.setAttribute("r", "4");
        tooltip.style.opacity = "0";
      });

      svg.appendChild(circle);
    });

    els.chartWrap.appendChild(svg);
  }

  /* 7-Day Forecast Renderer */
  function renderDaily(daily) {
    els.dailyContainer.innerHTML = "";
    if (!daily || !daily.time) return;

    daily.time.forEach((timeStr, i) => {
      const code = daily.weather_code[i];
      const maxC = daily.temperature_2m_max[i];
      const minC = daily.temperature_2m_min[i];
      const meta = WEATHER_CODES[code] || { text: "Cloudy", icon: "cloudy" };
      const dayName = formatDayName(timeStr, i);

      const row = document.createElement("div");
      row.className = `daily-row ${i === 0 ? "is-today" : ""}`;
      row.innerHTML = `
        <span class="daily-day">${dayName}</span>
        <div class="daily-icon" aria-hidden="true">${ICONS[meta.icon]}</div>
        <span class="daily-condition">${meta.text}</span>
        <div class="daily-temps">
          <span class="daily-high" data-temp-c="${Math.round(maxC)}">${unit === "C" ? Math.round(maxC) + "°" : Math.round(cToF(maxC)) + "°"}</span>
          <span class="daily-low" data-temp-c="${Math.round(minC)}">${unit === "C" ? Math.round(minC) + "°" : Math.round(cToF(minC)) + "°"}</span>
        </div>
      `;
      els.dailyContainer.appendChild(row);
    });
  }

  /* Weather Metrics Renderer */
  function renderMetrics(current, daily, hourly) {
    // Humidity
    const hum = current.relative_humidity_2m;
    els.humidity.textContent = hum != null ? `${Math.round(hum)}%` : "—";
    els.humiditySub.textContent = hum < 30 ? "Dry air" : hum > 70 ? "Humid conditions" : "Comfortable";

    // Wind
    const windKmh = current.wind_speed_10m;
    const windDir = current.wind_direction_10m;
    if (unit === "C") {
      els.windSpeed.textContent = windKmh != null ? `${Math.round(windKmh)} km/h` : "—";
    } else {
      els.windSpeed.textContent = windKmh != null ? `${Math.round(kmhToMph(windKmh))} mph` : "—";
    }
    els.windDir.textContent = `${compassFromDeg(windDir)} direction`;

    // UV Index
    const uv = current.uv_index != null ? current.uv_index : (daily?.uv_index_max?.[0] ?? "—");
    els.uvIndex.textContent = typeof uv === "number" ? Math.round(uv) : uv;
    const uvVal = typeof uv === "number" ? uv : 0;
    els.uvSub.textContent = uvVal <= 2 ? "Low risk" : uvVal <= 5 ? "Moderate risk" : uvVal <= 8 ? "High protection needed" : "Very high risk";

    // Visibility
    let visKm = null;
    if (hourly && hourly.visibility) {
      visKm = hourly.visibility[0] / 1000;
    }
    if (unit === "C") {
      els.visibility.textContent = visKm != null ? `${visKm.toFixed(1)} km` : "10.0 km";
    } else {
      els.visibility.textContent = visKm != null ? `${kmToMi(visKm).toFixed(1)} mi` : "6.2 mi";
    }
    els.visibilitySub.textContent = "Optimal clarity";

    // Pressure
    const p = current.pressure_msl;
    els.pressure.textContent = p != null ? `${Math.round(p)} hPa` : "—";
    els.pressureSub.textContent = p > 1013 ? "High pressure" : "Normal pressure";

    // Sun & Horizon
    els.sunrise.textContent = formatTime(daily?.sunrise?.[0]);
    els.sunset.textContent = formatTime(daily?.sunset?.[0]);
  }

  /* =========================================================
     Unit Switching & Formatting Logic
  ========================================================= */
  function applyUnits() {
    if (!lastData) return;
    const current = lastData.forecast.current;
    const daily = lastData.forecast.daily;

    const tempC = current.temperature_2m;
    const feelsC = current.apparent_temperature;
    const highC = daily?.temperature_2m_max?.[0] ?? tempC;
    const lowC = daily?.temperature_2m_min?.[0] ?? tempC;

    if (unit === "C") {
      els.temperature.textContent = Math.round(tempC);
      els.feelsLike.textContent = `${Math.round(feelsC)}°`;
      els.tempHigh.textContent = `${Math.round(highC)}°`;
      els.tempLow.textContent = `${Math.round(lowC)}°`;
      els.tempUnitLabel.textContent = "°C";

      els.windSpeed.textContent = current.wind_speed_10m != null ? `${Math.round(current.wind_speed_10m)} km/h` : "—";
      if (lastData.forecast.hourly?.visibility) {
        const visKm = lastData.forecast.hourly.visibility[0] / 1000;
        els.visibility.textContent = `${visKm.toFixed(1)} km`;
      }
    } else {
      els.temperature.textContent = Math.round(cToF(tempC));
      els.feelsLike.textContent = `${Math.round(cToF(feelsC))}°`;
      els.tempHigh.textContent = `${Math.round(cToF(highC))}°`;
      els.tempLow.textContent = `${Math.round(cToF(lowC))}°`;
      els.tempUnitLabel.textContent = "°F";

      els.windSpeed.textContent = current.wind_speed_10m != null ? `${Math.round(kmhToMph(current.wind_speed_10m))} mph` : "—";
      if (lastData.forecast.hourly?.visibility) {
        const visKm = lastData.forecast.hourly.visibility[0] / 1000;
        els.visibility.textContent = `${kmToMi(visKm).toFixed(1)} mi`;
      }
    }

    // Update hourly forecast unit values
    renderHourly(lastData.forecast.hourly, lastData.forecast.timezone);
    renderDaily(lastData.forecast.daily);
  }

  function setUnit(nextUnit) {
    unit = nextUnit;
    els.unitC.classList.toggle("is-active", unit === "C");
    els.unitC.setAttribute("aria-checked", String(unit === "C"));
    els.unitF.classList.toggle("is-active", unit === "F");
    els.unitF.setAttribute("aria-checked", String(unit === "F"));
    applyUnits();
  }

  /* =========================================================
     Saved Locations / Bookmarking Logic
  ========================================================= */
  function loadSavedLocations() {
    try {
      savedLocations = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    } catch {
      savedLocations = [];
    }
    renderSavedList();
  }

  function saveSavedLocations() {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedLocations));
    } catch (e) {}
    renderSavedList();
  }

  function updateBookmarkStatus(place) {
    const isSaved = savedLocations.some((item) => item.name.toLowerCase() === place.name.toLowerCase());
    els.bookmarkBtn.classList.toggle("is-saved", isSaved);
    els.bookmarkBtn.setAttribute("title", isSaved ? "Remove from saved locations" : "Save location");
  }

  function toggleBookmark() {
    if (!lastData) return;
    const place = lastData.place;
    const idx = savedLocations.findIndex((item) => item.name.toLowerCase() === place.name.toLowerCase());

    if (idx >= 0) {
      savedLocations.splice(idx, 1);
    } else {
      savedLocations.push({
        name: place.name,
        admin1: place.admin1,
        country: place.country,
        latitude: place.latitude,
        longitude: place.longitude
      });
    }

    saveSavedLocations();
    updateBookmarkStatus(place);
  }

  function renderSavedList() {
    els.savedList.innerHTML = "";
    if (savedLocations.length === 0) {
      els.savedList.innerHTML = `<p class="empty-text">No saved locations yet.</p>`;
      return;
    }

    savedLocations.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "saved-item";
      el.innerHTML = `
        <div>
          <div class="saved-item-name">${item.name}</div>
          <div class="saved-item-sub">${[item.admin1, item.country].filter(Boolean).join(", ")}</div>
        </div>
        <button type="button" class="saved-item-remove" title="Remove" aria-label="Remove saved location">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      el.addEventListener("click", (e) => {
        if (e.target.closest(".saved-item-remove")) {
          e.stopPropagation();
          savedLocations.splice(i, 1);
          saveSavedLocations();
          if (lastData) updateBookmarkStatus(lastData.place);
          return;
        }
        loadCoords(item.latitude, item.longitude, item.name, item.admin1, item.country);
        els.savedDrawer.hidden = true;
      });

      els.savedList.appendChild(el);
    });
  }

  /* =========================================================
     Search & Geolocation Execution
  ========================================================= */
  async function loadCity(cityName) {
    const seq = ++requestSeq;
    showStatus("loading");
    els.dropdown.hidden = true;

    try {
      const results = await geocodeCity(cityName);
      if (seq !== requestSeq) return;

      if (!results || results.length === 0) {
        showStatus("notFound");
        return;
      }

      const place = results[0];
      const forecast = await fetchForecast(place.latitude, place.longitude);
      if (seq !== requestSeq) return;

      renderDashboard({
        place: {
          name: place.name,
          admin1: place.admin1 || "",
          country: place.country || "",
          latitude: place.latitude,
          longitude: place.longitude
        },
        forecast
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      showStatus("error");
    }
  }

  async function loadCoords(lat, lon, labelName, admin1 = "", country = "") {
    const seq = ++requestSeq;
    showStatus("loading");
    els.dropdown.hidden = true;

    try {
      const forecast = await fetchForecast(lat, lon);
      if (seq !== requestSeq) return;

      renderDashboard({
        place: {
          name: labelName,
          admin1,
          country,
          latitude: lat,
          longitude: lon
        },
        forecast
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      showStatus("error");
    }
  }

  // Auto-suggestion search input handler
  let searchDebounce = null;
  els.input.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    clearTimeout(searchDebounce);

    if (val.length < 2) {
      els.dropdown.hidden = true;
      return;
    }

    searchDebounce = setTimeout(async () => {
      try {
        const results = await geocodeCity(val);
        if (results && results.length > 0) {
          els.dropdown.innerHTML = "";
          results.slice(0, 4).forEach((item) => {
            const dropItem = document.createElement("div");
            dropItem.className = "search-dropdown-item";

            const titleSpan = document.createElement("span");
            titleSpan.className = "city-title";
            titleSpan.textContent = item.name;

            const subSpan = document.createElement("span");
            subSpan.className = "country-title";
            subSpan.textContent = [item.admin1, item.country].filter(Boolean).join(", ");

            dropItem.appendChild(titleSpan);
            dropItem.appendChild(subSpan);

            dropItem.addEventListener("click", () => {
              els.input.value = item.name;
              loadCoords(item.latitude, item.longitude, item.name, item.admin1, item.country);
            });
            els.dropdown.appendChild(dropItem);
          });
          els.dropdown.hidden = false;
        } else {
          els.dropdown.hidden = true;
        }
      } catch {
        els.dropdown.hidden = true;
      }
    }, 250);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!els.form.contains(e.target)) {
      els.dropdown.hidden = true;
    }
  });

  /* =========================================================
     Event Listeners Wiring
  ========================================================= */
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = els.input.value.trim();
    if (query) loadCity(query);
  });

  els.locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showStatus("error");
      return;
    }
    showStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => loadCoords(pos.coords.latitude, pos.coords.longitude, "Your Location"),
      () => showStatus("error"),
      { timeout: 10000 }
    );
  });

  els.refreshBtn.addEventListener("click", () => {
    if (!lastData) return;
    const p = lastData.place;
    loadCoords(p.latitude, p.longitude, p.name, p.admin1, p.country);
  });

  els.unitC.addEventListener("click", () => setUnit("C"));
  els.unitF.addEventListener("click", () => setUnit("F"));

  els.bookmarkBtn.addEventListener("click", toggleBookmark);

  els.savedBtn.addEventListener("click", () => {
    els.savedDrawer.hidden = !els.savedDrawer.hidden;
  });

  els.closeSavedBtn.addEventListener("click", () => {
    els.savedDrawer.hidden = true;
  });

  /* ---------- Initial Boot ---------- */
  loadSavedLocations();
  // Default load Kolkata for instant dashboard display
  loadCity("Kolkata");
})();
