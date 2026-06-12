/**
 * WashRadar Construction Radar Component
 * Tracks new carwashes being built in the region. Renders progress pipelines
 * and manages submission inputs from operators.
 */

import { state } from "../state.js";

const STAGE_PROGRESS = {
  permitting: 20,
  foundation: 40,
  framing: 60,
  equipment: 80,
  opening: 95
};

const STAGE_LABELS = {
  permitting: "Permitting & Approvals",
  foundation: "Foundation & Excavation",
  framing: "Framing & Structure",
  equipment: "Equipment Installation",
  opening: "Grand Opening Phase"
};

class ConstructionRadarComponent {
  init() {
    this.setupFormListeners();
    this.render();

    state.subscribe(() => {
      this.render();
    });
  }

  setupFormListeners() {
    const reportBtn = document.getElementById("btn-report-build");
    const modal = document.getElementById("modal-report-build");
    const closeBtn = document.getElementById("close-report-build-modal");
    const cancelBtn = document.getElementById("cancel-build-submit");
    const form = document.getElementById("form-report-build");

    if (reportBtn && modal) {
      reportBtn.addEventListener("click", () => {
        // Clear any previous form data
        form.reset();
        modal.classList.add("active");
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.remove("active");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("build-name").value;
        const address = document.getElementById("build-address").value;
        const operator = document.getElementById("build-operator").value || "Unknown Developer";
        const stage = document.getElementById("build-stage").value;
        const completion = document.getElementById("build-completion").value;
        const details = document.getElementById("build-details").value;

        // Generate a semi-random latitude/longitude in the Austin area to place on the map
        const lat = (30.22 + Math.random() * 0.08).toFixed(4);
        const lng = (-97.77 - Math.random() * 0.08).toFixed(4);

        state.addConstructionProject(name, lat, lng, address, stage, completion, operator, details);

        closeModal();
      });
    }
  }

  render() {
    const { construction } = state.getState();
    const container = document.getElementById("construction-grid");

    if (!container) return;

    container.innerHTML = "";

    if (construction.length === 0) {
      container.innerHTML = `
        <div class="glass" style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 48px; border-radius: var(--border-radius-lg)">
          <h3>No Construction Projects Tracked</h3>
          <p style="margin-top: 8px;">Click "Report New Wash" to map out a new site.</p>
        </div>
      `;
      return;
    }

    construction.forEach(c => {
      const percentage = STAGE_PROGRESS[c.stage] || 10;
      const stageName = STAGE_LABELS[c.stage] || "Planning";

      const card = document.createElement("div");
      card.className = "construction-card glass";
      card.innerHTML = `
        <div class="construction-card-header">
          <div>
            <h3 class="const-title">${c.name}</h3>
            <div class="const-operator">Developer: ${c.operator}</div>
          </div>
          <span class="const-eta-badge">Est: ${c.completion}</span>
        </div>
        
        <div class="const-address">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>${c.address}</span>
        </div>

        <p class="const-details">${c.details}</p>

        <div class="const-pipeline-container">
          <div class="const-pipeline-label">
            <span style="color: var(--text-secondary)">Build Pipeline Status</span>
            <strong style="color: var(--color-cyan)">${percentage}%</strong>
          </div>
          <div class="const-pipeline-progress">
            <div class="const-pipeline-fill" style="width: ${percentage}%"></div>
          </div>
          
          <div class="pipeline-steps" style="margin-top: 4px;">
            <span class="${c.stage === "permitting" ? "pipeline-step-active" : ""}">Permits</span>
            <span class="${c.stage === "foundation" ? "pipeline-step-active" : ""}">Foundation</span>
            <span class="${c.stage === "framing" ? "pipeline-step-active" : ""}">Framing</span>
            <span class="${c.stage === "equipment" ? "pipeline-step-active" : ""}">Equipment</span>
            <span class="${c.stage === "opening" ? "pipeline-step-active" : ""}">Opening</span>
          </div>
          
          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 4px;">
            Current Phase: <strong style="color: var(--color-cyan); font-weight:600;">${stageName}</strong>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }
}

export const constructionRadarComponent = new ConstructionRadarComponent();
