/**
 * WashRadar Main Controller
 * Coordinates page navigation tabs, operator mode activation, update status modal triggers,
 * and component lifecycle management.
 */

import { state } from "./state.js";
import { dashboardComponent } from "./components/dashboard.js";
import { mapComponent } from "./components/map.js";
import { constructionRadarComponent } from "./components/radar.js";
import { offersComponent } from "./components/offers.js";
import { weatherComponent } from "./components/weather.js";

class AppController {
  constructor() {
    this.currentTab = "dashboard";
    this.isOperatorMode = false;
    this.operatorWashId = "wash-1"; // Default carwash the operator manages
    
    // Components
    this.dashboardComponent = dashboardComponent;
    this.mapComponent = mapComponent;
    this.constructionRadarComponent = constructionRadarComponent;
    this.offersComponent = offersComponent;
    this.weatherComponent = weatherComponent;
  }

  init() {
    this.setupTabNavigation();
    this.setupOperatorMode();
    this.setupOperatorForm();
    
    // Initialize components
    this.dashboardComponent.init();
    this.mapComponent.init();
    this.constructionRadarComponent.init();
    this.offersComponent.init();
    this.weatherComponent.init();

    // Register globally for component cross-communication
    window.appInstance = this;
    
    // Subscribe to state to update general UI highlights
    state.subscribe(() => {
      this.updateOperatorBanner();
    });
    
    this.updateOperatorBanner();
  }

  setupTabNavigation() {
    const tabLinks = document.querySelectorAll(".menu-link");
    const sections = document.querySelectorAll(".view-section");

    tabLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        
        const parentLi = link.closest(".menu-item");
        const targetTab = link.dataset.tab;

        if (!targetTab) return;

        // Visual states of menu
        document.querySelectorAll(".sidebar-menu .menu-item").forEach(li => {
          li.classList.remove("active");
        });
        parentLi.classList.add("active");

        // View panels
        sections.forEach(sec => {
          sec.classList.remove("active");
          if (sec.id === `${targetTab}-section`) {
            sec.classList.add("active");
          }
        });

        this.currentTab = targetTab;

        // Force Map to recalculate bounds if switching to Map tab
        if (targetTab === "map" && this.mapComponent.map) {
          setTimeout(() => {
            this.mapComponent.map.invalidateSize();
          }, 100);
        }
      });
    });
  }

  setupOperatorMode() {
    const opToggleBtn = document.getElementById("operator-toggle");
    
    if (opToggleBtn) {
      opToggleBtn.addEventListener("click", () => {
        this.isOperatorMode = !this.isOperatorMode;
        
        // Update styling and states
        if (this.isOperatorMode) {
          opToggleBtn.classList.add("active");
          opToggleBtn.innerHTML = `🏪 Customer Mode`;
          opToggleBtn.style.background = "rgba(6, 182, 212, 0.1)";
          opToggleBtn.style.color = "var(--color-cyan)";
          opToggleBtn.style.borderColor = "rgba(6, 182, 212, 0.2)";
        } else {
          opToggleBtn.classList.remove("active");
          opToggleBtn.innerHTML = `⚙️ Operator Portal`;
          opToggleBtn.style.background = "rgba(99, 102, 241, 0.1)";
          opToggleBtn.style.color = "var(--color-primary)";
          opToggleBtn.style.borderColor = "rgba(99, 102, 241, 0.2)";
        }

        // Toggle components operator states
        this.offersComponent.setOperatorMode(this.isOperatorMode);
        this.updateOperatorBanner();
      });
    }
  }

  updateOperatorBanner() {
    const banner = document.getElementById("operator-banner-container");
    if (!banner) return;

    if (!this.isOperatorMode) {
      banner.style.display = "none";
      return;
    }

    const { washes } = state.getState();
    const currentWash = washes.find(w => w.id === this.operatorWashId) || washes[0];
    if (!currentWash) return;

    let statusText = "";
    if (currentWash.status === "open") {
      statusText = `<span style="color: var(--color-green)">Open (${currentWash.waitTime}m wait)</span>`;
    } else if (currentWash.status === "closed") {
      statusText = `<span style="color: var(--color-red)">Closed</span>`;
    } else {
      statusText = `<span style="color: var(--color-amber)">Maintenance</span>`;
    }

    banner.innerHTML = `
      <div class="operator-active-banner">
        <div class="operator-banner-info">
          ⚙️ <strong>Operator Mode Active</strong>: Managing <strong>${currentWash.name}</strong> — Status: ${statusText}
        </div>
        <div class="operator-banner-actions">
          <button class="btn-primary operator-banner-btn" id="btn-banner-status">Update Status</button>
          <button class="btn-cyan operator-banner-btn" id="btn-banner-switch-wash">Switch Wash</button>
        </div>
      </div>
    `;
    banner.style.display = "block";

    // Bind events inside the dynamic banner
    document.getElementById("btn-banner-status").addEventListener("click", () => {
      this.openStatusModal();
    });

    document.getElementById("btn-banner-switch-wash").addEventListener("click", () => {
      this.openSwitchWashModal();
    });
  }

  openStatusModal() {
    const modal = document.getElementById("modal-operator-update");
    if (!modal) return;

    const { washes } = state.getState();
    const currentWash = washes.find(w => w.id === this.operatorWashId) || washes[0];
    
    // Set form fields to current values
    document.getElementById("op-update-status").value = currentWash.status;
    document.getElementById("op-update-traffic").value = currentWash.traffic;
    document.getElementById("op-update-wait").value = currentWash.waitTime;
    document.getElementById("op-update-reason").value = currentWash.closureReason || "";

    // Show/hide closure reason depending on status selection
    const reasonGroup = document.getElementById("op-reason-group");
    const statusSelect = document.getElementById("op-update-status");
    
    const checkStatus = () => {
      if (statusSelect.value !== "open") {
        reasonGroup.style.display = "flex";
      } else {
        reasonGroup.style.display = "none";
      }
    };
    
    statusSelect.onchange = checkStatus;
    checkStatus();

    modal.classList.add("active");
  }

  openSwitchWashModal() {
    const modal = document.getElementById("modal-switch-wash");
    if (!modal) return;

    const select = document.getElementById("switch-wash-select");
    if (select) {
      const { washes } = state.getState();
      select.innerHTML = washes.map(w => `<option value="${w.id}" ${w.id === this.operatorWashId ? "selected" : ""}>${w.name}</option>`).join("");
    }

    modal.classList.add("active");
  }

  setupOperatorForm() {
    // 1. Status Update Modal Form
    const modalUpdate = document.getElementById("modal-operator-update");
    const closeBtnUpdate = document.getElementById("close-operator-update-modal");
    const cancelBtnUpdate = document.getElementById("cancel-operator-update");
    const formUpdate = document.getElementById("form-operator-update");

    const closeUpdate = () => {
      if (modalUpdate) modalUpdate.classList.remove("active");
    };

    if (closeBtnUpdate) closeBtnUpdate.addEventListener("click", closeUpdate);
    if (cancelBtnUpdate) cancelBtnUpdate.addEventListener("click", closeUpdate);

    if (formUpdate) {
      formUpdate.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const status = document.getElementById("op-update-status").value;
        const traffic = document.getElementById("op-update-traffic").value;
        const waitTime = document.getElementById("op-update-wait").value;
        const reason = document.getElementById("op-update-reason").value;

        state.updateWashStatus(this.operatorWashId, status, traffic, waitTime, reason);
        closeUpdate();
      });
    }

    // 2. Switch Wash Modal Form
    const modalSwitch = document.getElementById("modal-switch-wash");
    const closeBtnSwitch = document.getElementById("close-switch-wash-modal");
    const cancelBtnSwitch = document.getElementById("cancel-switch-wash");
    const formSwitch = document.getElementById("form-switch-wash");

    const closeSwitch = () => {
      if (modalSwitch) modalSwitch.classList.remove("active");
    };

    if (closeBtnSwitch) closeBtnSwitch.addEventListener("click", closeSwitch);
    if (cancelBtnSwitch) cancelBtnSwitch.addEventListener("click", closeSwitch);

    if (formSwitch) {
      formSwitch.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const newWashId = document.getElementById("switch-wash-select").value;
        this.operatorWashId = newWashId;
        this.updateOperatorBanner();
        closeSwitch();
      });
    }
  }
}

// Instantiate and initialize on document ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AppController();
  app.init();
});
