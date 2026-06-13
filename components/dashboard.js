/**
 * WashRadar Dashboard Component
 * Renders statistical metrics, a side list of washes, and handles Chart.js integrations
 * to display historical traffic loads and comparison graphs.
 */

import { state } from "../state.js";

class DashboardComponent {
  constructor() {
    this.chart = null;
    this.selectedWashId = "wash-1"; // Default wash for traffic history chart
    this.selectedServiceType = "all";
  }

  init() {
    this.render();

    // Listen to type filter buttons
    const filterButtons = document.querySelectorAll(".type-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedServiceType = btn.dataset.type;
        this.render();
      });
    });

    // Re-render when state updates
    state.subscribe(() => {
      this.render();
    });
  }

  render() {
    const { washes, construction, offers } = state.getState();

    // 1. Calculate and render metric numbers
    const openWashes = washes.filter(w => w.status === "open").length;
    const closedWashes = washes.filter(w => w.status === "closed" || w.status === "maintenance").length;
    const buildsCount = construction.length;
    const offersCount = offers.length;

    // Update HTML elements
    const elOpen = document.getElementById("metric-open-count");
    const elClosed = document.getElementById("metric-closed-count");
    const elBuilds = document.getElementById("metric-builds-count");
    const elOffers = document.getElementById("metric-offers-count");

    if (elOpen) elOpen.textContent = openWashes;
    if (elClosed) elClosed.textContent = closedWashes;
    if (elBuilds) elBuilds.textContent = buildsCount;
    if (elOffers) elOffers.textContent = offersCount;

    // AI Insight Generator
    const elAiText = document.getElementById("ai-insight-text");
    if (elAiText) {
      const currentHour = new Date().getHours();
      if (closedWashes > 2) {
        elAiText.innerHTML = `<strong>Opportunity Detected:</strong> ${closedWashes} competitors are currently offline. This is a prime time to capture overflow traffic. Consider launching a flash discount.`;
      } else if (openWashes > 5 && currentHour > 12 && currentHour < 17) {
        elAiText.innerHTML = `<strong>High Competition:</strong> Traffic is heavily distributed among ${openWashes} open washes. Ensure your wash wait time is accurate to attract drivers looking for fast service.`;
      } else {
        elAiText.innerHTML = `<strong>Market Stable:</strong> Conditions are normal for this time of day. Keep an eye on the ${buildsCount} construction projects that may affect future market share.`;
      }
    }

    // AI Action button link to Offers
    const btnAiAction = document.getElementById("btn-ai-action");
    if (btnAiAction) {
      btnAiAction.onclick = () => {
        const offersTab = document.querySelector('.menu-link[data-tab="offers"]');
        if (offersTab) offersTab.click();
      };
    }

    // 2. Filter and render sidebar compact wash list
    const sidebarList = document.getElementById("dash-wash-list");
    if (sidebarList) {
      sidebarList.innerHTML = "";
      const filteredWashes = washes.filter(w => {
        if (this.selectedServiceType === "all") return true;
        const sType = w.serviceType || "express";
        return sType === this.selectedServiceType;
      });

      if (filteredWashes.length === 0) {
        sidebarList.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 24px 16px; font-size: 0.85rem;">
            No washes found for this filter.
          </div>
        `;
      }

      filteredWashes.forEach(w => {
        const item = document.createElement("div");
        item.className = `wash-compact-item ${this.selectedWashId === w.id ? "selected-active" : ""}`;
        item.dataset.id = w.id;
        item.style.cursor = "pointer";
        
        // Custom background style for selected item
        if (this.selectedWashId === w.id) {
          item.style.borderColor = "var(--color-primary)";
          item.style.background = "rgba(99, 102, 241, 0.08)";
        }

        // Dynamic Traffic Logic based on Day and Time
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay(); // 0 is Sun, 6 is Sat
        
        let dayMultiplier = 1.0;
        if (currentDay === 0 || currentDay === 6) dayMultiplier = 1.4; // Weekends busy
        if (currentDay === 1 || currentDay === 2) dayMultiplier = 0.8; // Mon/Tue slow

        let currentTrafficVal = (w.trafficHistory && w.trafficHistory[currentHour]) ? w.trafficHistory[currentHour] * dayMultiplier : 0;
        
        // Parse operating hours
        let oh = 0, ch = 24;
        if (w.hours && !/24\s*hours?/i.test(w.hours)) {
          const m = w.hours.match(/(\d+)(?::(\d+))?\s*(AM|PM)\s*[-–]\s*(\d+)(?::(\d+))?\s*(AM|PM)/i);
          if (m) {
            oh = parseInt(m[1]);
            const op = m[3].toUpperCase();
            ch = parseInt(m[4]);
            const cp = m[6].toUpperCase();
            if (op === "PM" && oh !== 12) oh += 12;
            if (op === "AM" && oh === 12) oh = 0;
            if (cp === "PM" && ch !== 12) ch += 12;
            if (cp === "AM" && ch === 12) ch = 0;
          }
        }

        let trafficText = "Low Wait";
        let trafficClass = "traffic-low";
        let calcWaitTime = 0;

        if (w.status !== "open" || currentHour < oh || currentHour >= ch) {
          trafficText = w.status === "closed" ? "Closed" : (w.status === "maintenance" ? "Maint." : "Closed");
          trafficClass = w.status === "closed" ? "status-closed" : (w.status === "maintenance" ? "status-maintenance" : "status-closed");
          currentTrafficVal = 0;
        } else {
          if (currentTrafficVal > 75) {
            trafficText = "Busy";
            trafficClass = "traffic-high";
            calcWaitTime = Math.floor(currentTrafficVal / 3);
          } else if (currentTrafficVal > 40) {
            trafficText = "Moderate";
            trafficClass = "traffic-moderate";
            calcWaitTime = Math.floor(currentTrafficVal / 4);
          } else {
            trafficText = "Low Wait";
            trafficClass = "traffic-low";
            calcWaitTime = Math.floor(currentTrafficVal / 5) || 2;
          }
        }

        const bulletColor = (w.status === "open" && currentHour >= oh && currentHour < ch)
          ? (trafficClass === "traffic-low" ? "var(--color-green)" : trafficClass === "traffic-moderate" ? "var(--color-amber)" : "var(--color-red)")
          : "var(--text-muted)";

        item.innerHTML = `
          <span class="wash-compact-status" style="background-color: ${bulletColor}; box-shadow: 0 0 6px ${bulletColor}"></span>
          <div class="wash-compact-info">
            <div class="wash-compact-name">${w.name} <span style="font-size: 0.72rem; color: var(--color-amber); font-weight: 600; margin-left: 2px;">★ ${w.rating}</span></div>
            <div class="wash-compact-sub">${(w.status === "open" && currentHour >= oh && currentHour < ch) ? `${calcWaitTime}m wait time` : "Temporarily offline"}</div>
          </div>
          <span class="wash-compact-badge ${(w.status === "open" && currentHour >= oh && currentHour < ch) ? "" : trafficClass}" style="color: ${(w.status === "open" && currentHour >= oh && currentHour < ch) ? bulletColor : ""}; font-weight: 700; font-size: 0.8rem;">
            ${trafficText}
          </span>
        `;

        // Interactive: Click sidebar wash to view its traffic chart
        item.addEventListener("click", () => {
          this.selectedWashId = w.id;
          this.render(); // Re-render to update selected styling and chart
        });

        sidebarList.appendChild(item);
      });
    }

    // 3. Render/Update Chart.js traffic analytics
    this.renderChart(washes);

    // 4. Render Selected Wash Details
    const detailsRow = document.getElementById("dashboard-wash-details-row");
    if (detailsRow) {
      const selectedWash = washes.find(w => w.id === this.selectedWashId) || washes[0];
      if (selectedWash) {
        detailsRow.style.display = "block";
        
        const elName = document.getElementById("details-wash-name");
        const elAddress = document.getElementById("details-wash-address");
        const elRating = document.getElementById("details-wash-rating");
        const elHours = document.getElementById("details-wash-hours");
        const elPhone = document.getElementById("details-wash-phone");
        const elWebsite = document.getElementById("details-wash-website");
        const elWebsiteContainer = document.getElementById("details-wash-website-container");
        const elSummary = document.getElementById("details-wash-summary");
        const elProducts = document.getElementById("details-wash-products");
        const elPlans = document.getElementById("details-wash-plans");
        const elPricingSource = document.getElementById("details-wash-pricing-source");
        const elPricingLink = document.getElementById("details-wash-pricing-link");
        const elEstablished = document.getElementById("details-wash-established");
        const elAcquisition = document.getElementById("details-wash-acquisition");
        const elChemicals = document.getElementById("details-wash-chemicals");
        const elEqSupplier = document.getElementById("details-wash-eq-supplier");
        const elEquipment = document.getElementById("details-wash-equipment");
        const elHolidays = document.getElementById("details-wash-holidays");
        
        if (elEstablished) elEstablished.textContent = `📅 Opened: ${selectedWash.openedDate || "Unknown"}`;
        if (elAcquisition) elAcquisition.textContent = `🏢 Ownership: ${selectedWash.ownership || "Unknown"}`;
        if (elChemicals) elChemicals.textContent = `🧪 Chemicals: ${selectedWash.chemicals || "Unknown"}`;
        if (elEqSupplier) elEqSupplier.textContent = `⚙️ Equipment: ${selectedWash.equipment || "Unknown"}`;

        if (elName) elName.textContent = selectedWash.name;
        if (elAddress) elAddress.textContent = selectedWash.address;
        if (elRating) {
          const rating = selectedWash.rating || "N/A";
          const reviews = selectedWash.reviewCount || 0;
          elRating.innerHTML = `⭐ <span style="font-weight:700;">${rating}</span> <span style="color: var(--text-muted); font-size: 0.75rem;">(${reviews} reviews)</span>`;
        }
        if (elHours) elHours.textContent = `🕒 ${selectedWash.hours}`;
        if (elPhone) elPhone.textContent = `📞 ${selectedWash.phone}`;
        
        const elWeeklyHours = document.getElementById("details-wash-weekly-hours");
        if (elWeeklyHours) {
          elWeeklyHours.innerHTML = "";
          if (selectedWash.weeklyHours) {
            Object.entries(selectedWash.weeklyHours).forEach(([days, time]) => {
              const p = document.createElement("p");
              p.style.margin = "2px 0";
              p.style.fontSize = "0.82rem";
              p.style.display = "flex";
              p.style.justifyContent = "space-between";
              p.innerHTML = `
                <strong style="color: var(--text-secondary); font-weight: 500;">${days}:</strong>
                <span style="color: var(--text-primary); font-weight: 500;">${time}</span>
              `;
              elWeeklyHours.appendChild(p);
            });
          } else {
            elWeeklyHours.innerHTML = `<p style="color: var(--text-muted);">No schedule details available.</p>`;
          }
        }
        
        if (selectedWash.website) {
          const displayUrl = selectedWash.website.replace(/^(https?:\/\/)?(www\.)?/, "");
          if (elWebsite) {
            elWebsite.href = selectedWash.website;
            elWebsite.textContent = displayUrl;
          }
          if (elWebsiteContainer) elWebsiteContainer.style.display = "block";

          if (elPricingLink) {
            elPricingLink.href = selectedWash.website;
            elPricingLink.textContent = displayUrl;
          }
          if (elPricingSource) elPricingSource.style.display = "flex";
        } else {
          if (elWebsiteContainer) elWebsiteContainer.style.display = "none";
          if (elPricingSource) elPricingSource.style.display = "none";
        }

        if (elSummary) elSummary.textContent = selectedWash.summary || "No description available.";
      // New fields population
      if (elEstablished) elEstablished.textContent = `📅 Established: ${selectedWash.established || '-'}`;
      if (elAcquisition) elAcquisition.textContent = `🔄 Acquisition: ${selectedWash.acquired || '-'}`;
      if (elChemicals) elChemicals.textContent = `🧪 Chemicals: ${selectedWash.chemicalSupplier || '-'}`;
      if (elEqSupplier) elEqSupplier.textContent = `⚙️ Equipment Supplier: ${selectedWash.equipmentSupplier || '-'}`;
        if (elHolidays) {
          const holidays = (selectedWash.holidayClosures && selectedWash.holidayClosures.length > 0) ? selectedWash.holidayClosures.join(', ') : (selectedWash.holidays || '-');
          elHolidays.textContent = `🎉 Holidays: ${holidays}`;
        }
      // Equipment list rendering
      if (elEquipment) {
        elEquipment.innerHTML = '';
        if (selectedWash.equipment && selectedWash.equipment.length > 0) {
          selectedWash.equipment.forEach(eq => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.margin = '2px 4px';
            span.style.padding = '4px 8px';
            span.style.background = 'rgba(255,255,255,0.1)';
            span.style.borderRadius = '4px';
            span.textContent = eq;
            elEquipment.appendChild(span);
          });
        } else {
          elEquipment.textContent = 'No equipment info.';
        }
      }

        if (elProducts) {
          elProducts.innerHTML = "";
          if (selectedWash.products && selectedWash.products.length > 0) {
            selectedWash.products.forEach(p => {
              const div = document.createElement("div");
              div.style.display = "flex";
              div.style.justifyContent = "space-between";
              div.style.padding = "10px 14px";
              div.style.background = "rgba(255, 255, 255, 0.02)";
              div.style.border = "1px solid var(--border-color)";
              div.style.borderRadius = "8px";
              div.style.fontSize = "0.85rem";
              div.innerHTML = `
                <span style="font-weight: 500; color: var(--text-primary);">${p.name}</span>
                <span style="font-weight: 700; color: var(--color-primary);">$${Number(p.price).toFixed(2)}</span>
              `;
              elProducts.appendChild(div);
            });
          } else {
            elProducts.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No product pricing details available.</p>`;
          }
        }

        if (elPlans) {
          elPlans.innerHTML = "";
          if (selectedWash.plans && selectedWash.plans.length > 0) {
            
            // Phase 3 Pricing Trend
            let trendHtml = "";
            if (selectedWash.pricingHistory && selectedWash.pricingHistory.length >= 2) {
              const latest = selectedWash.pricingHistory[selectedWash.pricingHistory.length - 1].price;
              const earliest = selectedWash.pricingHistory[0].price;
              if (latest > earliest) {
                trendHtml = `<span style="font-size: 0.7rem; color: var(--color-red); margin-left: 8px;">↑ +$${(latest - earliest).toFixed(2)} (6m)</span>`;
              } else if (latest < earliest) {
                trendHtml = `<span style="font-size: 0.7rem; color: var(--color-green); margin-left: 8px;">↓ -$${(earliest - latest).toFixed(2)} (6m)</span>`;
              } else {
                trendHtml = `<span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 8px;">Stable (6m)</span>`;
              }
            }

            selectedWash.plans.forEach(p => {
              const div = document.createElement("div");
              div.style.display = "flex";
              div.style.justifyContent = "space-between";
              div.style.padding = "10px 14px";
              div.style.background = "rgba(255, 255, 255, 0.02)";
              div.style.border = "1px solid var(--border-color)";
              div.style.borderRadius = "8px";
              div.style.fontSize = "0.85rem";
              div.innerHTML = `
                <span style="font-weight: 500; color: var(--text-primary);">${p.name}</span>
                <span>
                  <span style="font-weight: 700; color: var(--color-cyan);">$${Number(p.price).toFixed(2)}/mo</span>
                  ${trendHtml}
                </span>
              `;
              elPlans.appendChild(div);
            });
          } else {
            elPlans.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No membership club pricing available.</p>`;
          }
        }
      } else {
        detailsRow.style.display = "none";
      }
    }
  }

  /**
   * Parse a hours string like "7:00 AM - 8:00 PM" into { open, close } in 24h integers.
   * Returns { open: 0, close: 24 } for 24-hour or unparseable strings.
   */
  parseOperatingHours(hoursStr) {
    if (!hoursStr || /24\s*hours?/i.test(hoursStr)) return { open: 0, close: 24 };
    const m = hoursStr.match(
      /(\d+)(?::(\d+))?\s*(AM|PM)\s*[-–]\s*(\d+)(?::(\d+))?\s*(AM|PM)/i
    );
    if (!m) return { open: 0, close: 24 };
    let oh = parseInt(m[1]);
    const op = m[3].toUpperCase();
    let ch = parseInt(m[4]);
    const cp = m[6].toUpperCase();
    if (op === "PM" && oh !== 12) oh += 12;
    if (op === "AM" && oh === 12) oh = 0;
    if (cp === "PM" && ch !== 12) ch += 12;
    if (cp === "AM" && ch === 12) ch = 0;
    return { open: oh, close: ch };
  }

  /**
   * Return a 24-element copy of trafficHistory with values outside operating
   * hours forced to 0, so the chart never shows traffic when the wash is closed.
   */
  getMaskedTraffic(wash) {
    if (wash.status === "closed" || wash.status === "maintenance") {
      return Array.from({ length: 24 }, () => 0);
    }
    
    const currentDay = new Date().getDay();
    let dayMultiplier = 1.0;
    if (currentDay === 0 || currentDay === 6) dayMultiplier = 1.4;
    if (currentDay === 1 || currentDay === 2) dayMultiplier = 0.8;

    const raw = Array.from({ length: 24 }, (_, i) =>
      (wash.trafficHistory && wash.trafficHistory[i] != null) ? Math.min(100, wash.trafficHistory[i] * dayMultiplier) : 0
    );
    const { open, close } = this.parseOperatingHours(wash.hours);
    return raw.map((v, i) => (i >= open && i < close) ? v : 0);
  }

  renderChart(washes) {
    const canvas = document.getElementById("traffic-analytics-chart");
    if (!canvas) return;

    const selectedWash = washes.find(w => w.id === this.selectedWashId) || washes[0];
    if (!selectedWash) return;

    // Update chart title
    const chartTitle = document.getElementById("analytics-chart-title");
    if (chartTitle) {
      chartTitle.textContent = `24-Hour Traffic Load: ${selectedWash.name}`;
    }

    // Wait until Chart.js is loaded
    if (typeof Chart === "undefined") {
      setTimeout(() => this.renderChart(washes), 200);
      return;
    }

    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? "AM" : "PM";
      return `${hour} ${ampm}`;
    });

    // Mask traffic to 0 outside operating hours
    const dataValues = this.getMaskedTraffic(selectedWash);
    const { open: openHour, close: closeHour } = this.parseOperatingHours(selectedWash.hours);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Always destroy & recreate so the closed-hours shading plugin
    // has fresh open/close values baked in for the selected wash.
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Custom plugin: shade columns outside operating hours
    const closedShadingPlugin = {
      id: "closedHoursShading",
      beforeDatasetsDraw(chart) {
        const { ctx: c, chartArea, scales } = chart;
        if (!chartArea || !scales.x) return;
        c.save();
        c.fillStyle = "rgba(0, 0, 0, 0.22)";
        const xScale = scales.x;
        const totalPoints = 24;
        const halfStep = (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
        for (let i = 0; i < totalPoints; i++) {
          if (i < openHour || i >= closeHour) {
            const px = xScale.getPixelForValue(i);
            c.fillRect(px - halfStep, chartArea.top, halfStep * 2, chartArea.bottom - chartArea.top);
          }
        }
        c.restore();
      }
    };

    this.chart = new Chart(ctx, {
      type: "line",
      plugins: [closedShadingPlugin],
      data: {
        labels,
        datasets: [
          {
            label: `${selectedWash.name} Capacity %`,
            data: dataValues,
            borderColor: "#6366f1",
            borderWidth: 3,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx: c2, chartArea } = chart;
              if (!chartArea) return null;
              const gradient = c2.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
              gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
              return gradient;
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#6366f1",
            pointBorderColor: "#fff",
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#6366f1",
            pointHoverBorderColor: "#fff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15, 22, 38, 0.9)",
            titleFont: { family: "Space Grotesk", size: 12 },
            bodyFont: { family: "Outfit", size: 12 },
            borderColor: "rgba(255, 255, 255, 0.08)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const percent = context.parsed.y;
                if (percent === 0) {
                  const hour = context.dataIndex;
                  if (hour < openHour || hour >= closeHour) return "Closed (outside operating hours)";
                }
                let load = "Low Traffic";
                if (percent > 75) load = "High Traffic";
                else if (percent > 40) load = "Moderate Traffic";
                return `Occupancy: ${percent}% (${load})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.03)" },
            ticks: {
              color: "#94a3b8",
              font: { family: "Outfit", size: 10 },
              maxTicksLimit: 8
            }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.03)" },
            ticks: {
              color: "#94a3b8",
              font: { family: "Outfit", size: 10 },
              callback: (value) => `${value}%`
            },
            min: 0,
            max: 100
          }
        }
      }
    });
  }
}

export const dashboardComponent = new DashboardComponent();
