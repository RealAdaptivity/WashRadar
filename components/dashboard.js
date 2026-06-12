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

    // 2. Filter and render sidebar compact wash list
    const sidebarList = document.getElementById("dash-wash-list");
    if (sidebarList) {
      sidebarList.innerHTML = "";
      const filteredWashes = washes.filter(w => {
        if (this.selectedServiceType === "all") return true;
        return w.serviceType === this.selectedServiceType;
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

        let trafficText = "Low Wait";
        let trafficClass = "traffic-low";
        if (w.status !== "open") {
          trafficText = w.status === "closed" ? "Closed" : "Maint.";
          trafficClass = w.status === "closed" ? "status-closed" : "status-maintenance";
        } else if (w.traffic === "moderate") {
          trafficText = "Moderate";
          trafficClass = "traffic-moderate";
        } else if (w.traffic === "high") {
          trafficText = "Busy";
          trafficClass = "traffic-high";
        }

        const bulletColor = w.status === "open" 
          ? (w.traffic === "low" ? "var(--color-green)" : w.traffic === "moderate" ? "var(--color-amber)" : "var(--color-red)")
          : "var(--text-muted)";

        item.innerHTML = `
          <span class="wash-compact-status" style="background-color: ${bulletColor}; box-shadow: 0 0 6px ${bulletColor}"></span>
          <div class="wash-compact-info">
            <div class="wash-compact-name">${w.name} <span style="font-size: 0.72rem; color: var(--color-amber); font-weight: 600; margin-left: 2px;">★ ${w.rating}</span></div>
            <div class="wash-compact-sub">${w.status === "open" ? `${w.waitTime}m wait time` : "Temporarily offline"}</div>
          </div>
          <span class="wash-compact-badge ${w.status === "open" ? "" : trafficClass}" style="color: ${w.status === "open" ? bulletColor : ""}; font-weight: 700; font-size: 0.8rem;">
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

        if (elName) elName.textContent = selectedWash.name;
        if (elAddress) elAddress.textContent = selectedWash.address;
        if (elHours) elHours.textContent = `🕒 ${selectedWash.hours}`;
        if (elPhone) elPhone.textContent = `📞 ${selectedWash.phone}`;
        
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
              div.style.justify = "space-between";
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
            selectedWash.plans.forEach(p => {
              const div = document.createElement("div");
              div.style.display = "flex";
              div.style.justify = "space-between";
              div.style.padding = "10px 14px";
              div.style.background = "rgba(255, 255, 255, 0.02)";
              div.style.border = "1px solid var(--border-color)";
              div.style.borderRadius = "8px";
              div.style.fontSize = "0.85rem";
              div.innerHTML = `
                <span style="font-weight: 500; color: var(--text-primary);">${p.name}</span>
                <span style="font-weight: 700; color: var(--color-cyan);">$${Number(p.price).toFixed(2)}/mo</span>
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

  renderChart(washes) {
    const canvas = document.getElementById("traffic-analytics-chart");
    if (!canvas) return;

    const selectedWash = washes.find(w => w.id === this.selectedWashId) || washes[0];
    if (!selectedWash) return;

    // Update chart title if we have the DOM element
    const chartTitle = document.getElementById("analytics-chart-title");
    if (chartTitle) {
      chartTitle.textContent = `24-Hour Traffic Load: ${selectedWash.name}`;
    }

    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? "AM" : "PM";
      return `${hour} ${ampm}`;
    });

    const dataValues = selectedWash.trafficHistory;

    // Wait until Chart.js is loaded
    if (typeof Chart === "undefined") {
      setTimeout(() => this.renderChart(washes), 200);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (this.chart) {
      // If chart already exists, update data & options
      this.chart.data.datasets[0].label = `${selectedWash.name} Capacity %`;
      this.chart.data.datasets[0].data = dataValues;
      this.chart.update();
    } else {
      // Create a brand new chart
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: `${selectedWash.name} Capacity %`,
              data: dataValues,
              borderColor: "#6366f1",
              borderWidth: 3,
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
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
            legend: {
              display: false
            },
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
                  let percent = context.parsed.y;
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
              grid: {
                color: "rgba(255, 255, 255, 0.03)"
              },
              ticks: {
                color: "#94a3b8",
                font: { family: "Outfit", size: 10 },
                maxTicksLimit: 8
              }
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.03)"
              },
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
}

export const dashboardComponent = new DashboardComponent();
