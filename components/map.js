/**
 * WashRadar Live Map Component
 * Integrates Leaflet.js map with dark mode theme, custom map pins, popups,
 * and search/filtering capabilities.
 */

import { state } from "../state.js";

class MapComponent {
  constructor() {
    this.map = null;
    this.markers = [];
    this.selectedWashId = null;

    // Filters
    this.searchQuery = "";
    this.showOpen = true;
    this.showClosed = true;
    this.showConstruction = true;
    this.showFullService = true;
    this.showExpress = true;
    this.showSelfServe = true;
    this.showHeatmap = false;
    this.heatLayer = null;
    this.isDriverMode = true; // default to customer view until operator logs in
  }

  init() {
    // Check if Leaflet is loaded. If not, wait.
    if (typeof L === "undefined") {
      setTimeout(() => this.init(), 100);
      return;
    }

    this.setupMap();
    this.setupEventListeners();
    this.render();

    // Subscribe to state changes to update the map pins dynamically
    state.subscribe(() => {
      this.render();
    });
  }

  setupMap() {
    // Initialise Map centered on Justin, Roanoke, Northlake, Flower Mound cluster
    this.map = L.map("map-canvas", {
      zoomControl: false,
      attributionControl: false
    }).setView([33.04, -97.18], 11);

    // Zoom controls on top-right
    L.control.zoom({ position: "topright" }).addTo(this.map);

    // Add Dark Mode Tiles (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd"
    }).addTo(this.map);
  }

  setupEventListeners() {
    const searchInput = document.getElementById("map-search");
    const optOpen = document.getElementById("filter-open");
    const optClosed = document.getElementById("filter-closed");
    const optConst = document.getElementById("filter-construction");
    const optTypeFull = document.getElementById("filter-type-full");
    const optTypeExpress = document.getElementById("filter-type-express");
    const optTypeSelf = document.getElementById("filter-type-self");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    if (optOpen) {
      optOpen.addEventListener("change", (e) => {
        this.showOpen = e.target.checked;
        this.render();
      });
    }

    if (optClosed) {
      optClosed.addEventListener("change", (e) => {
        this.showClosed = e.target.checked;
        this.render();
      });
    }

    if (optConst) {
      optConst.addEventListener("change", (e) => {
        this.showConstruction = e.target.checked;
        this.render();
      });
    }

    if (optTypeFull) {
      optTypeFull.addEventListener("change", (e) => {
        this.showFullService = e.target.checked;
        this.render();
      });
    }

    if (optTypeExpress) {
      optTypeExpress.addEventListener("change", (e) => {
        this.showExpress = e.target.checked;
        this.render();
      });
    }

    if (optTypeSelf) {
      optTypeSelf.addEventListener("change", (e) => {
        this.showSelfServe = e.target.checked;
        this.render();
      });
    }

    const optHeatmap = document.getElementById("filter-heatmap");
    if (optHeatmap) {
      optHeatmap.addEventListener("change", (e) => {
        this.showHeatmap = e.target.checked;
        this.render();
      });
    }
  }

  // Triggered when a list card or popup is selected
  selectWash(washId, zoomTo = true) {
    this.selectedWashId = washId;
    
    // Highlight in list
    const cards = document.querySelectorAll(".map-wash-card");
    cards.forEach(card => {
      if (card.dataset.id === washId) {
        card.classList.add("selected");
        if (zoomTo) {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } else {
        card.classList.remove("selected");
      }
    });

    // Zoom/pan map and open popup
    const targetMarker = this.markers.find(m => m.id === washId);
    if (targetMarker) {
      if (zoomTo) {
        this.map.setView(targetMarker.marker.getLatLng(), 14, { animate: true });
      }
      targetMarker.marker.openPopup();
    }
  }

  render() {
    if (!this.map) return;

    const { washes, construction, offers } = state.getState();

    // 1. Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m.marker));
    this.markers = [];
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }

    // 2. Filter data
    const filteredWashes = washes.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(this.searchQuery) || 
                            w.address.toLowerCase().includes(this.searchQuery);
      
      const isOpen = w.status === "open";
      const isClosedOrMaint = w.status === "closed" || w.status === "maintenance";
      
      const matchesStatus = (isOpen && this.showOpen) || (isClosedOrMaint && this.showClosed);
      
      const sType = w.serviceType || "express";
      const matchesType = (sType === "full-service" && this.showFullService) ||
                          (sType === "express" && this.showExpress) ||
                          (sType === "self-serve" && this.showSelfServe);
      
      return matchesSearch && matchesStatus && matchesType;
    });

    const filteredConstruction = construction.filter(c => {
      if (!this.showConstruction) return false;
      return c.name.toLowerCase().includes(this.searchQuery) || 
             c.address.toLowerCase().includes(this.searchQuery);
    });

    // 3. Render side-panel list of washes & construction
    const listContainer = document.getElementById("map-results");
    if (listContainer) {
      listContainer.innerHTML = "";

      if (filteredWashes.length === 0 && filteredConstruction.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 32px 16px; font-size: 0.9rem;">
            No carwashes or builds found matching filters.
          </div>
        `;
      }

      // Add Washes to List
      filteredWashes.forEach(w => {
        const washOffers = offers.filter(o => o.washId === w.id);
        const offerCountText = washOffers.length > 0 
          ? `<span class="status-open" style="font-size:0.7rem; padding: 2px 6px; border-radius:4px; margin-left:8px;">${washOffers.length} Offer${washOffers.length > 1 ? "s" : ""}</span>` 
          : "";

        const card = document.createElement("div");
        card.className = `map-wash-card ${this.selectedWashId === w.id ? "selected" : ""}`;
        card.dataset.id = w.id;
        
        let statusBadge = "";
        if (w.status === "open") {
          statusBadge = `<span class="wash-compact-badge status-open">Open - ${w.waitTime}m wait</span>`;
        } else if (w.status === "closed") {
          statusBadge = `<span class="wash-compact-badge status-closed">Closed</span>`;
        } else {
          statusBadge = `<span class="wash-compact-badge status-maintenance">Maintenance</span>`;
        }

        card.innerHTML = `
          <div class="map-wash-header">
            <div class="map-wash-title">${w.name} ${offerCountText}</div>
            ${statusBadge}
          </div>
          <div class="map-wash-details">
            <div>📍 ${w.address}</div>
            <div>⏱️ Traffic: <span class="traffic-${w.traffic}" style="font-weight: 600; text-transform: capitalize;">${w.traffic}</span></div>
          </div>
        `;

        card.addEventListener("click", () => {
          this.selectWash(w.id, true);
        });

        listContainer.appendChild(card);
      });

      // Add Construction Sites to List
      filteredConstruction.forEach(c => {
        const card = document.createElement("div");
        card.className = `map-wash-card ${this.selectedWashId === c.id ? "selected" : ""}`;
        card.dataset.id = c.id;
        card.innerHTML = `
          <div class="map-wash-header">
            <div class="map-wash-title">${c.name}</div>
            <span class="wash-compact-badge status-open" style="color: var(--color-cyan); background: var(--color-cyan-glow); border-color: rgba(6,182,212,0.2)">Construction</span>
          </div>
          <div class="map-wash-details">
            <div>📍 ${c.address}</div>
            <div>🏗️ Milestones: <span style="color: var(--color-cyan); font-weight: 600; text-transform: capitalize;">${c.stage}</span></div>
          </div>
        `;

        card.addEventListener("click", () => {
          this.selectWash(c.id, true);
        });

        listContainer.appendChild(card);
      });
    }

    // 4. Place markers on Map
    // Active Washes Markers
    filteredWashes.forEach(w => {
      const washOffers = offers.filter(o => o.washId === w.id);
      
      // Determine CSS class based on status/traffic
      let trafficClass = "open-low";
      if (w.status === "closed") trafficClass = "closed";
      else if (w.status === "maintenance") trafficClass = "maintenance";
      else if (w.traffic === "moderate") trafficClass = "open-moderate";
      else if (w.traffic === "high") trafficClass = "open-high";

      // DivIcon uses raw HTML
      const markerIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="carwash-marker-pin ${trafficClass}">🚿</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const cleanWebsite = w.website ? w.website.replace(/^(https?:\/\/)?(www\.)?/, "") : "";

      const popupContent = `
        <div class="popup-container">
          <div class="popup-title">${w.name}</div>
          <div class="popup-meta">📍 ${w.address}</div>
          <div class="popup-meta">📞 ${w.phone}</div>
          <div class="popup-meta">🕒 ${w.hours}</div>
          ${w.website ? `<div class="popup-meta">🌐 <a href="${w.website}" target="_blank" style="color: var(--color-cyan); text-decoration: none; font-weight: 500;">${cleanWebsite}</a></div>` : ""}
          
          <div class="popup-stats">
            <div class="popup-stat-item">
              <span class="popup-stat-label">Status</span>
              <span class="popup-stat-val" style="color: ${w.status === 'open' ? 'var(--color-green)' : w.status === 'closed' ? 'var(--color-red)' : 'var(--color-amber)'}">${w.status.toUpperCase()}</span>
            </div>
            <div class="popup-stat-item" style="border-left: 1px solid var(--border-color); padding-left: 10px;">
              <span class="popup-stat-label">Traffic</span>
              <span class="popup-stat-val traffic-${w.traffic}" style="text-transform: capitalize;">${w.traffic}</span>
            </div>
            <div class="popup-stat-item" style="border-left: 1px solid var(--border-color); padding-left: 10px;">
              <span class="popup-stat-label">Wait Time</span>
              <span class="popup-stat-val">${w.waitTime} mins</span>
            </div>
          </div>

          ${w.closureReason ? `<div style="font-size:0.75rem; color: var(--color-amber); background: var(--color-amber-glow); padding: 4px 8px; border-radius: 4px; margin-top: 4px; border: 1px solid rgba(245, 158, 11, 0.2);">⚠️ ${w.closureReason}</div>` : ""}

          ${
            washOffers.length > 0 
              ? `<div style="font-size: 0.75rem; font-weight: 500; border-top: 1px solid var(--border-color); padding-top: 6px; margin-top: 6px;">
                  🎁 Promo: <strong style="color: var(--color-amber)">${washOffers[0].title}</strong>
                 </div>`
              : ""
          }

          <div style="display: flex; gap: 8px; margin-top: 8px;">
            ${this.isDriverMode ? `<button class="popup-action btn-buy-ticket" data-id="${w.id}" style="flex: 1; padding: 6px; font-size: 0.8rem; background: var(--color-primary); color: #fff;">🚙 Buy Ticket</button>` : ""}
            <button class="popup-action btn-view-details" data-id="${w.id}" style="flex: 1; padding: 6px; font-size: 0.8rem;">⚙️ View Details</button>
          </div>
        </div>
      `;

      const marker = L.marker([w.lat, w.lng], { icon: markerIcon }).addTo(this.map);
      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        this.selectWash(w.id, false);
        // Add click listener on details button inside popup
        setTimeout(() => {
          // Buy Ticket Button Logic
          const btnBuy = document.querySelector(`.btn-buy-ticket[data-id="${w.id}"]`);
          if (btnBuy) {
            btnBuy.addEventListener("click", () => {
              // Draw polyline route on map
              if (this.currentRoute) {
                this.map.removeLayer(this.currentRoute);
              }
              
              // Simulate current location slightly off from the wash
              const simLat = w.lat - 0.05;
              const simLng = w.lng + 0.05;
              
              // Add simulated driver location marker if not exists
              if (!this.driverMarker) {
                const driverIcon = L.divIcon({
                  className: "custom-div-icon",
                  html: `<div style="font-size: 24px;">📍</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                this.driverMarker = L.marker([simLat, simLng], { icon: driverIcon }).addTo(this.map);
                this.driverMarker.bindPopup("Your Location").openPopup();
              } else {
                this.driverMarker.setLatLng([simLat, simLng]);
              }
              
              // Create animated polyline
              const latlngs = [
                [simLat, simLng],
                [simLat + 0.02, simLng - 0.02],
                [w.lat, w.lng]
              ];
              
              this.currentRoute = L.polyline(latlngs, {
                color: 'var(--color-cyan)',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                lineJoin: 'round'
              }).addTo(this.map);
              
              this.map.fitBounds(this.currentRoute.getBounds(), { padding: [50, 50] });
              
              // Show Checkout Modal
              setTimeout(() => {
                const checkoutModal = document.getElementById("modal-checkout");
                if (checkoutModal) {
                  document.getElementById("checkout-item-name").textContent = `Single Wash (${w.name})`;
                  document.getElementById("checkout-item-price").textContent = "$15.00";
                  
                  // Reset steps
                  document.getElementById("checkout-step-1").style.display = "block";
                  document.getElementById("checkout-step-2").style.display = "none";
                  document.getElementById("checkout-step-3").style.display = "none";
                  
                  checkoutModal.classList.add("active");
                }
              }, 800);
            });
          }

          // View Details Button Logic
          const btnDetails = document.querySelector(`.btn-view-details[data-id="${w.id}"]`);
          if (btnDetails) {
            btnDetails.addEventListener("click", () => {
              // Switch to dashboard and highlight this wash
              const dashTab = document.querySelector('[data-tab="dashboard"]');
              if (dashTab) {
                dashTab.click();
                // Find and highlight/scroll in dashboard
                setTimeout(() => {
                  const items = document.querySelectorAll(".wash-compact-item");
                  items.forEach(it => {
                    if (it.dataset.id === w.id) {
                      it.click(); // Triggers the dashboard logic to update details
                      it.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  });
                }, 100);
              }
            });
          }
        }, 10);
      });

      this.markers.push({ id: w.id, marker });
    });

    // Construction Site Markers
    filteredConstruction.forEach(c => {
      const markerIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="radar-pulse-marker">🏗️</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const popupContent = `
        <div class="popup-container">
          <div class="popup-title">${c.name}</div>
          <div class="popup-meta" style="color: var(--color-cyan); font-weight: 600;">🏗️ Under Construction</div>
          <div class="popup-meta">📍 ${c.address}</div>
          <div class="popup-meta">🏢 Builder: ${c.operator}</div>
          
          <div class="popup-stats" style="border-color: rgba(6, 182, 212, 0.2); background: var(--color-cyan-glow);">
            <div class="popup-stat-item">
              <span class="popup-stat-label" style="color: rgba(6, 182, 212, 0.7)">Milestone</span>
              <span class="popup-stat-val" style="color: var(--color-cyan); text-transform: capitalize;">${c.stage}</span>
            </div>
            <div class="popup-stat-item" style="border-left: 1px solid rgba(6, 182, 212, 0.2); padding-left: 12px;">
              <span class="popup-stat-label" style="color: rgba(6, 182, 212, 0.7)">Est. Opening</span>
              <span class="popup-stat-val" style="color: var(--color-cyan);">${c.completion}</span>
            </div>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; line-height:1.4;">${c.details}</p>
          
          <button class="btn-drone-imagery" data-name="${c.name}" style="margin-top: 12px; width: 100%; padding: 8px; background: rgba(6, 182, 212, 0.15); border: 1px solid var(--color-cyan); border-radius: 4px; color: var(--color-cyan); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            View Aerial Drone Progress
          </button>
        </div>
      `;

      const marker = L.marker([c.lat, c.lng], { icon: markerIcon }).addTo(this.map);
      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        this.selectWash(c.id, false);
        
        // Setup drone button
        const droneBtn = document.querySelector('.btn-drone-imagery');
        if (droneBtn) {
          droneBtn.addEventListener('click', () => {
             const siteName = droneBtn.getAttribute('data-name');
             document.getElementById('drone-site-name').textContent = siteName;
             document.getElementById('modal-drone-imagery').style.display = 'flex';
          });
        }
      });

      this.markers.push({ id: c.id, marker });
    });

    // 5. Heatmap Layer
    if (this.showHeatmap && typeof L.heatLayer !== 'undefined') {
      const heatPoints = filteredWashes.map(w => {
        let intensity = 0.2;
        if (w.traffic === "moderate") intensity = 0.6;
        if (w.traffic === "high") intensity = 1.0;
        return [w.lat, w.lng, intensity];
      });
      
      this.heatLayer = L.heatLayer(heatPoints, {
        radius: 45,
        blur: 35,
        maxZoom: 14,
        gradient: {
          0.2: 'rgba(6, 182, 212, 0.5)',  // Cyan/Blue (Low load)
          0.5: 'rgba(16, 185, 129, 0.8)', // Green (Medium load)
          0.8: 'rgba(245, 158, 11, 0.9)', // Amber/Yellow (High load)
          1.0: 'rgba(239, 68, 68, 1.0)'   // Red (Peak Load)
        }
      }).addTo(this.map);
    }
  }
}

export const mapComponent = new MapComponent();
