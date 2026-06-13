import { state } from "../state.js";

class WeatherComponent {
  constructor() {
    this.container = null;
  }

  init() {
    this.render();

    // Subscribe to state to update when weather changes
    state.subscribe(() => {
      this.render();
    });
  }

  render() {
    const section = document.getElementById("weather-section");
    if (!section) return;

    const { washes, currentWeather } = state.getState();

    // Generate weekly forecast dynamically starting from today
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = new Date().getDay();
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const dayName = i === 0 ? "Today" : daysOfWeek[(todayIndex + i) % 7];
      let weather = "sunny";
      if (i === 0) {
        weather = currentWeather;
      } else {
        const r = (todayIndex + i) % 4;
        if (r === 1) weather = "rainy";
        else if (r === 2) weather = "stormy";
        else if (r === 3) weather = "freezing";
      }
      return { day: dayName, weather };
    });

    // Estimate weekly volume for each wash based on their traffic load history
    const washVolumes = washes.map(w => {
      const base = w.trafficHistory ? w.trafficHistory.reduce((sum, val) => sum + val, 0) : 50;
      const scale = w.status === "open" ? 1.0 : 0.1;
      const vol = Math.round(base * 10 * scale);
      return {
        name: w.name,
        volume: vol > 0 ? vol.toLocaleString() : "-"
      };
    });

    // Calculate metrics
    const totalWashes = washes.length;
    const closedWashes = washes.filter(w => w.status === "closed" || w.status === "maintenance").length;
    const openWashes = washes.filter(w => w.status === "open").length;

    let weatherDesc = "";
    let weatherAlert = "";
    let weatherClass = "weather-sunny";

    if (currentWeather === "sunny") {
      weatherDesc = "☀️ Clear Skies & Sunny — Ideal washing conditions. All tunnels operating at peak capacity. Expect high traffic loads across the DFW metroplex.";
      weatherAlert = "☀️ <strong>Advisory: High Traffic Load</strong>. Drive-thru lanes experiencing longer queues. Average wait times up by 5–10 minutes.";
      weatherClass = "weather-sunny";
    } else if (currentWeather === "rainy") {
      weatherDesc = "🌧️ Heavy Rain & Wet Roads — Low washing demand. Tunnels remain open, but traffic is light. Excellent time for detail prep services.";
      weatherAlert = "🌧️ <strong>Advisory: Wet Road Conditions</strong>. Single-wash volume down by 80%. Self-serve vacuum bays are mostly empty.";
      weatherClass = "weather-rainy";
    } else if (currentWeather === "stormy") {
      weatherDesc = "⛈️ Severe Thunderstorms — Safety precautions active. Tunnels are closing early due to lightning strikes and high winds.";
      weatherAlert = "⛈️ <strong>Severe Weather Warning: Lightning Risks</strong>. 30% of express conveyor systems are offline. Local flooding reported.";
      weatherClass = "weather-stormy";
    } else if (currentWeather === "freezing") {
      weatherDesc = "❄️ Freezing Temperatures & Ice — High operational downtime. Pipes, tracks, and manifolds are freezing, forcing automatic system shutdowns.";
      weatherAlert = "❄️ <strong>Advisory: Sub-Freezing Equipment Shutdown</strong>. Major downtime warning: 50% of washes closed or in maintenance. Est. recovery: 24h.";
      weatherClass = "weather-freezing";
    }

    section.innerHTML = `
      <div class="weather-tab-container">
        <!-- Weather Selector Card -->
        <div class="weather-selector-card glass">
          <div class="panel-header">
            <h2>Live Weather & Operations Simulator</h2>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Change weather to forecast competitor status & closures</span>
          </div>
          
          <div class="weather-buttons-grid">
            <button class="weather-btn ${currentWeather === 'sunny' ? 'active-sunny' : ''}" data-weather="sunny">
              <span class="weather-icon">☀️</span>
              <span class="weather-label">Sunny & Clear</span>
            </button>
            <button class="weather-btn ${currentWeather === 'rainy' ? 'active-rainy' : ''}" data-weather="rainy">
              <span class="weather-icon">🌧️</span>
              <span class="weather-label">Heavy Rain</span>
            </button>
            <button class="weather-btn ${currentWeather === 'stormy' ? 'active-stormy' : ''}" data-weather="stormy">
              <span class="weather-icon">⛈️</span>
              <span class="weather-label">Storms & Wind</span>
            </button>
            <button class="weather-btn ${currentWeather === 'freezing' ? 'active-freezing' : ''}" data-weather="freezing">
              <span class="weather-icon">❄️</span>
              <span class="weather-label">Freezing / Ice</span>
            </button>
          </div>

          <div class="weather-status-detail">
            <p>${weatherDesc}</p>
          </div>

          <div class="weather-alert-banner ${weatherClass}">
            ${weatherAlert}
          </div>
        </div>

        <!-- Weather Stats Cards -->
        <div class="weather-stats-grid" style="margin-top: 24px;">
          <div class="metric-card washes glass">
            <div class="metric-header">
              <span>Operational Washes</span>
            </div>
            <div class="metric-value" style="color: var(--color-green);">${openWashes}/${totalWashes}</div>
            <div class="metric-footer">Washes open & active</div>
          </div>
          <div class="metric-card closures glass">
            <div class="metric-header">
              <span>Weather Closures</span>
            </div>
            <div class="metric-value" style="color: var(--color-red);">${closedWashes}</div>
            <div class="metric-footer">Offline due to weather/maint</div>
          </div>
          <div class="metric-card construction glass">
            <div class="metric-header">
              <span>Est. Industry Downtime</span>
            </div>
            <div class="metric-value" style="color: var(--color-amber);">${closedWashes > 0 ? `${closedWashes * 12} hrs` : "0 hrs"}</div>
            <div class="metric-footer">Combined wait & repairs</div>
          </div>
        </div>
<!-- Weekly Weather Forecast -->
<div class="weather-forecast-card glass" style="margin-top: 24px; padding: 16px; border-radius: var(--border-radius-lg);">
  <h3 style="margin-bottom:12px; color: var(--text-primary);">7‑Day Forecast</h3>
  <div class="forecast-grid" style="display:flex; gap:12px;">
    ${forecast.map(f => {
      let icon = "☀️", label = "Sunny";
      if (f.weather === "rainy") { icon = "🌧️"; label = "Rainy"; }
      else if (f.weather === "stormy") { icon = "⛈️"; label = "Stormy"; }
      else if (f.weather === "freezing") { icon = "❄️"; label = "Freezing"; }
      return `<div class="forecast-day" style="text-align:center; flex:1; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px;">
        <div style="font-weight:600;">${f.day}</div>
        <div style="font-size:1.5rem;">${icon}</div>
        <div>${label}</div>
      </div>`;
    }).join("")}
  </div>
</div>
<!-- Estimated Weekly Volume -->
<div class="weekly-volume-card glass" style="margin-top: 24px; padding: 16px; border-radius: var(--border-radius-lg);">
  <h3 style="margin-bottom:12px; color: var(--text-primary);">Estimated Weekly Volume (cars)</h3>
  <table class="weekly-volume-table" style="width:100%; border-collapse:collapse;">
    <thead>
      <tr><th>Carwash</th><th>Weekly Volume</th></tr>
    </thead>
    <tbody>
      ${washVolumes.map(v => `<tr><td style="color:#fff;">${v.name}</td><td style="color:#fff;">${v.volume}</td></tr>`).join("")}
    </tbody>
  </table>
</div>

        <!-- Wash Operational Status List -->
        <div class="weather-ops-panel glass" style="margin-top: 24px; padding: 24px; border-radius: var(--border-radius-lg);">
          <div class="panel-header" style="margin-bottom: 16px;">
            <h2>Metroplex Wash Operations Status</h2>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Real-time operations, traffic loads, and weather downtime</span>
          </div>

          <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
            <table class="weather-ops-table">
              <thead>
                <tr>
                  <th>Carwash Name</th>
                  <th>Status</th>
                  <th>Current Traffic</th>
                  <th>Wait Time</th>
                  <th>Weather Downtime / Closure Reason</th>
                </tr>
              </thead>
              <tbody>
                ${washes.map(w => {
                  let statusBadge = "";
                  let trafficBadge = "";
                  let downtimeText = "-";

                  if (w.status === "open") {
                    statusBadge = `<span class="status-badge-open">Open</span>`;
                    trafficBadge = `<span class="traffic-${w.traffic}">${w.traffic}</span>`;
                  } else {
                    const isClosed = w.status === "closed";
                    statusBadge = `<span class="status-badge-${isClosed ? 'closed' : 'maint'}">${isClosed ? 'Closed' : 'Maintenance'}</span>`;
                    trafficBadge = `<span class="traffic-low">Low</span>`;
                    downtimeText = w.closureReason || "Offline due to weather safety.";
                    if (currentWeather === "freezing" && w.status === "maintenance") {
                      downtimeText = `❄️ ${w.closureReason} (Est: 24h downtime)`;
                    } else if (currentWeather === "stormy" && w.status === "closed") {
                      downtimeText = `⛈️ ${w.closureReason} (Est: 4h downtime)`;
                    }
                  }

                  return `
                    <tr class="ops-tr">
                      <td style="font-weight: 600; color: #fff;">${w.name}</td>
                      <td>${statusBadge}</td>
                      <td style="text-transform: capitalize;">${trafficBadge}</td>
                      <td>${w.waitTime > 0 ? `${w.waitTime} mins` : "-"}</td>
                      <td style="font-size: 0.82rem; color: var(--text-secondary);">${downtimeText}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Bind event listeners to weather simulator buttons
    const buttons = section.querySelectorAll(".weather-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const weather = btn.dataset.weather;
        state.setWeather(weather);
      });
    });
  }
}

export const weatherComponent = new WeatherComponent();
