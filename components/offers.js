/**
 * WashRadar Offers & Promotions Component
 * Manages rendering of promotion coupon cards, handles coupon code copying,
 * supports category filtering, and implements the new offer creation form.
 */

import { state } from "../state.js";

class OffersComponent {
  constructor() {
    this.activeFilter = "all"; // "all" | "discount" | "subscription" | "combo" | "freebie"
    this.isOperatorMode = false;
  }

  init() {
    this.setupEventListeners();
    this.render();

    state.subscribe(() => {
      this.render();
    });
  }

  setOperatorMode(active) {
    this.isOperatorMode = active;
    this.render();
  }

  setupEventListeners() {
    // 1. Filter tabs
    const filterButtons = document.querySelectorAll(".offers-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Toggle active visual class
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        this.activeFilter = btn.dataset.filter;
        this.render();
      });
    });

    // 2. Submission Form for operator discounts
    const postOfferBtn = document.getElementById("btn-post-offer");
    const modal = document.getElementById("modal-post-offer");
    const closeBtn = document.getElementById("close-post-offer-modal");
    const cancelBtn = document.getElementById("cancel-offer-submit");
    const form = document.getElementById("form-post-offer");

    if (postOfferBtn && modal) {
      postOfferBtn.addEventListener("click", () => {
        // Populating the select element in the form with active washes
        const washSelect = document.getElementById("offer-wash-select");
        if (washSelect) {
          const { washes } = state.getState();
          washSelect.innerHTML = washes.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
        }

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

        const washId = document.getElementById("offer-wash-select").value;
        const title = document.getElementById("offer-title").value;
        const description = document.getElementById("offer-details").value;
        const type = document.getElementById("offer-type").value;
        const code = document.getElementById("offer-code").value.toUpperCase().replace(/\s+/g, "");
        const expires = document.getElementById("offer-expiry").value;

        state.addOffer(washId, title, description, type, code, expires);
        closeModal();
      });
    }
  }

  render() {
    const { washes, offers } = state.getState();
    const container = document.getElementById("offers-grid");

    if (!container) return;

    container.innerHTML = "";

    // Filter offers
    const filteredOffers = offers.filter(o => {
      if (this.activeFilter === "all") return true;
      return o.type === this.activeFilter;
    });

    if (filteredOffers.length === 0) {
      container.innerHTML = `
        <div class="glass" style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 48px; border-radius: var(--border-radius-lg)">
          <h3>No Offers Found</h3>
          <p style="margin-top: 8px;">There are no coupons listed in the "${this.activeFilter}" category.</p>
        </div>
      `;
      return;
    }

    filteredOffers.forEach(o => {
      const parentWash = washes.find(w => w.id === o.washId) || { name: "Unknown Carwash" };

      const card = document.createElement("div");
      card.className = "offer-card glass";

      const showDeleteBtn = this.isOperatorMode 
        ? `<button class="btn-secondary delete-offer-btn" data-id="${o.id}" style="padding: 4px 8px; border-color: rgba(239, 68, 68, 0.4); color: var(--color-red); margin-left: auto;">
             Remove
           </button>`
        : "";

      card.innerHTML = `
        <div class="offer-card-header">
          <span class="offer-type-tag">${o.type}</span>
          <span class="offer-card-expiry">Expires: ${o.expires}</span>
        </div>
        
        <h3 class="offer-title">${o.title}</h3>
        <div class="offer-wash-link" data-wash-id="${o.washId}">
          🚿 ${parentWash.name} ➔
        </div>
        
        <p class="offer-description">${o.description}</p>
        
        <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
          <div class="offer-code-bar" style="flex-grow: 1;">
            <span class="offer-code-text">${o.code}</span>
            <button class="offer-copy-btn" data-code="${o.code}">
              Copy
            </button>
          </div>
          ${showDeleteBtn}
        </div>
      `;

      // Click wash link to view on Map
      const link = card.querySelector(".offer-wash-link");
      if (link) {
        link.addEventListener("click", () => {
          const washId = link.dataset.washId;
          const mapTab = document.querySelector('[data-tab="map"]');
          if (mapTab) {
            mapTab.click();
            // Wait for map tab to become active, then trigger selection
            setTimeout(() => {
              window.appInstance.mapComponent.selectWash(washId, true);
            }, 150);
          }
        });
      }

      // Handle copy coupon code button
      const copyBtn = card.querySelector(".offer-copy-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const code = copyBtn.dataset.code;
          navigator.clipboard.writeText(code).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            copyBtn.style.color = "var(--color-green)";
            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.style.color = "var(--color-primary)";
            }, 2000);
          }).catch(err => {
            console.error("Clipboard copy failed", err);
          });
        });
      }

      // Handle delete promotion (only visible in Operator mode)
      if (this.isOperatorMode) {
        const delBtn = card.querySelector(".delete-offer-btn");
        if (delBtn) {
          delBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this promotion?")) {
              state.deleteOffer(o.id);
            }
          });
        }
      }

      container.appendChild(card);
    });
  }
}

export const offersComponent = new OffersComponent();
