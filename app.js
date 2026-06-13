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
import { analyticsComponent } from "./components/analytics.js";

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
    this.analyticsComponent = analyticsComponent;
  }

  init() {
    this.setupTabNavigation();
    this.setupOperatorMode();
    this.setupOperatorForm();
    this.setupNotifications();
    this.setupBilling();
    this.setupAuth();
    
    // Initialize components
    this.dashboardComponent.init();
    this.mapComponent.init();
    this.constructionRadarComponent.init();
    this.offersComponent.init();
    this.weatherComponent.init();
    this.analyticsComponent.init();

    // Register globally for component cross-communication
    window.appInstance = this;
    
    // Subscribe to state to update general UI highlights
    state.subscribe(() => {
      this.updateOperatorBanner();
      this.renderNotifications();
      this.updateBillingUI();
      this.updateAuthUI();
    });
    
    this.updateOperatorBanner();
    this.renderNotifications();
    this.updateBillingUI();
    this.updateAuthUI();
  }

  setupAuth() {
    const btnOpenAuth = document.getElementById("btn-open-auth");
    const modalAuth = document.getElementById("modal-auth");
    const closeAuthBtn = document.getElementById("close-auth-modal");
    const formAuth = document.getElementById("form-auth");
    const btnSignup = document.getElementById("btn-signup");
    const btnSignin = document.getElementById("btn-signin");
    const authError = document.getElementById("auth-error");
    const btnLogout = document.getElementById("btn-logout");

    if (btnOpenAuth) {
      btnOpenAuth.addEventListener("click", () => {
        modalAuth.classList.add("active");
      });
    }

    if (closeAuthBtn) {
      closeAuthBtn.addEventListener("click", () => {
        modalAuth.classList.remove("active");
        if (authError) authError.style.display = "none";
      });
    }

    const tabSignin = document.getElementById("tab-signin");
    const tabSignup = document.getElementById("tab-signup");
    const signupFields = document.getElementById("signup-fields");
    const btnAuthSubmit = document.getElementById("btn-auth-submit");
    let isSignupMode = false;

    if (tabSignin && tabSignup) {
      tabSignin.addEventListener("click", () => {
        isSignupMode = false;
        signupFields.style.display = "none";
        tabSignin.style.borderBottom = "2px solid var(--color-cyan)";
        tabSignin.style.color = "var(--text-primary)";
        tabSignup.style.borderBottom = "none";
        tabSignup.style.color = "var(--text-muted)";
        btnAuthSubmit.textContent = "Sign In";
        
        // Remove required from extra fields
        document.getElementById("auth-firstname").removeAttribute("required");
        document.getElementById("auth-lastname").removeAttribute("required");
        document.getElementById("auth-wash-name").removeAttribute("required");
        document.getElementById("auth-wash-location").removeAttribute("required");
      });

      tabSignup.addEventListener("click", () => {
        isSignupMode = true;
        signupFields.style.display = "flex";
        tabSignup.style.borderBottom = "2px solid var(--color-cyan)";
        tabSignup.style.color = "var(--text-primary)";
        tabSignin.style.borderBottom = "none";
        tabSignin.style.color = "var(--text-muted)";
        btnAuthSubmit.textContent = "Sign Up";
        
        
        // Make extra fields required conditionally based on type
        document.getElementById("auth-firstname").setAttribute("required", "true");
        document.getElementById("auth-lastname").setAttribute("required", "true");
        
        const isOperator = document.querySelector('input[name="auth-account-type"]:checked').value === 'operator';
        if (isOperator) {
          document.getElementById("auth-wash-name").setAttribute("required", "true");
          document.getElementById("auth-wash-location").setAttribute("required", "true");
        }
      });
      
      const accountTypeRadios = document.querySelectorAll('input[name="auth-account-type"]');
      const opFields = document.getElementById("auth-operator-fields");
      accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === 'operator') {
            opFields.style.display = "flex";
            document.getElementById("auth-wash-name").setAttribute("required", "true");
            document.getElementById("auth-wash-location").setAttribute("required", "true");
          } else {
            opFields.style.display = "none";
            document.getElementById("auth-wash-name").removeAttribute("required");
            document.getElementById("auth-wash-location").removeAttribute("required");
          }
        });
      });
    }

    if (formAuth) {
      formAuth.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formAuth.checkValidity()) {
          formAuth.reportValidity();
          return;
        }
        
        const email = document.getElementById("auth-email").value;
        const password = document.getElementById("auth-password").value;
        
        try {
          if (isSignupMode) {
            const metadata = {
              first_name: document.getElementById("auth-firstname").value,
              last_name: document.getElementById("auth-lastname").value,
              account_type: document.querySelector('input[name="auth-account-type"]:checked').value
            };
            if (metadata.account_type === 'operator') {
              metadata.wash_name = document.getElementById("auth-wash-name").value;
              metadata.wash_location = document.getElementById("auth-wash-location").value;
            }
            await state.signUp(email, password, metadata);
            modalAuth.classList.remove("active");
            state.addNotification("Welcome", "Your account has been created.");
          } else {
            await state.signIn(email, password);
            modalAuth.classList.remove("active");
            state.addNotification("Welcome Back", "You have successfully signed in.");
          }
          if (authError) authError.style.display = "none";
        } catch(err) {
          if (authError) {
            authError.textContent = err.message;
            authError.style.display = "block";
          }
        }
      });
    }



    if (btnLogout) {
      btnLogout.addEventListener("click", async () => {
        try {
          await state.signOut();
          state.addNotification("Signed Out", "You have been signed out.");
        } catch(err) {
          console.error(err);
        }
      });
    }
  }

  updateAuthUI() {
    const { currentUser } = state.getState();
    const btnOpenAuth = document.getElementById("btn-open-auth");
    const userProfile = document.getElementById("user-profile");
    const userEmail = document.getElementById("user-email");

    if (currentUser) {
      if (btnOpenAuth) btnOpenAuth.style.display = "none";
      if (userProfile) userProfile.style.display = "flex";
      if (userEmail) userEmail.textContent = currentUser.email;
    } else {
      if (btnOpenAuth) btnOpenAuth.style.display = "block";
      if (userProfile) userProfile.style.display = "none";
      if (userEmail) userEmail.textContent = "";
    }
  }

  setupBilling() {
    const btnBilling = document.getElementById("btn-billing");
    const modalBilling = document.getElementById("modal-billing");
    const closeBtn = document.getElementById("close-billing-modal");
    
    if (btnBilling) {
      btnBilling.addEventListener("click", () => {
        modalBilling.classList.add("active");
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modalBilling.classList.remove("active");
      });
    }

    const planBtns = document.querySelectorAll(".btn-plan-select");
    planBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tier = e.target.dataset.tier;
        const { currentUser } = state.getState();
        
        if (!currentUser && tier !== 'basic') {
          document.getElementById("modal-billing").classList.remove("active");
          document.getElementById("modal-auth").classList.add("active");
          state.addNotification("Account Required", "Please sign in or create an account to upgrade your plan.");
          return;
        }

        state.updateSubscriptionTier(tier);
        modalBilling.classList.remove("active");
      });
    });
  }

  updateBillingUI() {
    const { subscriptionTier, currentUser } = state.getState();
    const display = document.getElementById("current-tier-display");
    if (display) {
      display.textContent = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);
    }

    // Toggle Operator vs Customer packages
    const opPackages = document.getElementById("operator-packages");
    const custPackages = document.getElementById("customer-packages");
    
    let isCustomer = false;
    if (currentUser && currentUser.user_metadata && currentUser.user_metadata.account_type === 'customer') {
      isCustomer = true;
    }
    
    if (opPackages && custPackages) {
      if (isCustomer) {
        opPackages.style.display = "none";
        custPackages.style.display = "grid";
      } else {
        opPackages.style.display = "grid";
        custPackages.style.display = "none";
      }
    }
    
    // Update plan buttons visually
    document.querySelectorAll(".btn-plan-select").forEach(btn => {
      if (btn.dataset.tier === subscriptionTier) {
        btn.textContent = "Current Plan";
        btn.disabled = true;
        btn.style.opacity = "0.5";
      } else {
        btn.textContent = "Upgrade to " + (btn.dataset.tier.charAt(0).toUpperCase() + btn.dataset.tier.slice(1));
        btn.disabled = false;
        btn.style.opacity = "1";
      }
    });

    // Gate tabs visually
    const constructionTab = document.querySelector('.menu-link[data-tab="construction"]');
    const analyticsTab = document.querySelector('.menu-link[data-tab="analytics"]');
    
    if (constructionTab) {
      if (subscriptionTier === 'basic') {
        constructionTab.style.opacity = "0.4";
        if (!constructionTab.querySelector('.pro-badge')) {
          constructionTab.innerHTML += `<span class="pro-badge" style="font-size:0.6rem;background:var(--color-primary);color:#fff;padding:2px 4px;border-radius:4px;margin-left:auto;">PRO</span>`;
        }
      } else {
        constructionTab.style.opacity = "1";
        const badge = constructionTab.querySelector('.pro-badge');
        if (badge) badge.remove();
      }
    }
    
    if (analyticsTab) {
      if (subscriptionTier !== 'enterprise') {
        analyticsTab.style.opacity = "0.4";
        if (!analyticsTab.querySelector('.ent-badge')) {
          analyticsTab.innerHTML += `<span class="ent-badge" style="font-size:0.6rem;background:var(--color-cyan);color:#fff;padding:2px 4px;border-radius:4px;margin-left:auto;">ENT</span>`;
        }
      } else {
        analyticsTab.style.opacity = "1";
        const badge = analyticsTab.querySelector('.ent-badge');
        if (badge) badge.remove();
      }
    }
  }

  setupNotifications() {
    const btn = document.getElementById("notification-btn");
    const dropdown = document.getElementById("notification-dropdown");
    const markAllReadBtn = document.getElementById("mark-all-read");

    if (btn && dropdown) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === "flex";
        dropdown.style.display = isVisible ? "none" : "flex";
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#notification-wrapper")) {
          dropdown.style.display = "none";
        }
      });
    }

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", () => {
        state.markAllNotificationsRead();
      });
    }
  }

  renderNotifications() {
    const { notifications } = state.getState();
    const badge = document.getElementById("notification-badge");
    const list = document.getElementById("notification-list");
    
    if (!badge || !list) return;

    // Update badge
    const unreadCount = state.getUnreadNotificationCount();
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "block";
    } else {
      badge.style.display = "none";
    }

    // Render list
    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty" style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No new alerts.
        </div>
      `;
      return;
    }

    list.innerHTML = notifications.map(n => {
      const time = new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      return `
        <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notification-title">${n.title}</div>
          <div class="notification-body">${n.body}</div>
          <div class="notification-time">${time}</div>
        </div>
      `;
    }).join("");

    // Add click listeners to mark as read
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        state.markNotificationRead(item.dataset.id);
      });
    });
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

        // Check billing tier locks
        const { subscriptionTier } = state.getState();
        if (targetTab === "construction" && subscriptionTier === "basic") {
          document.getElementById("modal-billing").classList.add("active");
          state.addNotification("Feature Locked", "Upgrade to Pro to access Construction Radar.");
          return;
        }
        if (targetTab === "analytics" && subscriptionTier !== "enterprise") {
          document.getElementById("modal-billing").classList.add("active");
          state.addNotification("Feature Locked", "Upgrade to Enterprise to access Analytics.");
          return;
        }

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
        const sidebar = document.querySelector(".sidebar");
        const mainContent = document.querySelector(".main-content");
        const analyticsTab = document.querySelector('.menu-link[data-tab="analytics"]')?.closest('.menu-item');
        const constructionTab = document.querySelector('.menu-link[data-tab="construction"]')?.closest('.menu-item');
        const weatherTab = document.querySelector('.menu-link[data-tab="weather"]')?.closest('.menu-item');

        if (this.isOperatorMode) {
          opToggleBtn.classList.add("active");
          opToggleBtn.innerHTML = `🏪 Customer Mode`;
          opToggleBtn.style.background = "rgba(6, 182, 212, 0.1)";
          opToggleBtn.style.color = "var(--color-cyan)";
          opToggleBtn.style.borderColor = "rgba(6, 182, 212, 0.2)";
          
          if (analyticsTab) analyticsTab.style.display = "flex";
          if (constructionTab) constructionTab.style.display = "flex";
          if (weatherTab) weatherTab.style.display = "flex";
        } else {
          opToggleBtn.classList.remove("active");
          opToggleBtn.innerHTML = `⚙️ Operator Portal`;
          opToggleBtn.style.background = "rgba(99, 102, 241, 0.1)";
          opToggleBtn.style.color = "var(--color-primary)";
          opToggleBtn.style.borderColor = "rgba(99, 102, 241, 0.2)";
          
          // Driver Mode limits tabs
          if (analyticsTab) analyticsTab.style.display = "none";
          if (constructionTab) constructionTab.style.display = "none";
          if (weatherTab) weatherTab.style.display = "none";
          
          // Force switch to map
          const mapTab = document.querySelector('.menu-link[data-tab="map"]');
          if (mapTab && this.currentTab !== 'map') mapTab.click();
        }

        // Pass mode to map
        if (this.mapComponent) {
          this.mapComponent.isDriverMode = !this.isOperatorMode;
          this.mapComponent.render();
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
          <button class="btn-secondary operator-banner-btn" id="btn-banner-alerts">Alerts</button>
          <button class="btn-secondary operator-banner-btn" id="btn-banner-api">API Hub</button>
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

    document.getElementById("btn-banner-alerts").addEventListener("click", () => {
      const modal = document.getElementById("modal-competitor-alerts");
      if (modal) modal.classList.add("active");
    });

    document.getElementById("btn-banner-api").addEventListener("click", () => {
      const modal = document.getElementById("modal-api-hub");
      if (modal) modal.classList.add("active");
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
    // Competitor Alerts Modal
    const modalAlerts = document.getElementById("modal-competitor-alerts");
    const closeAlerts = document.getElementById("close-competitor-alerts-modal");
    const formAlerts = document.getElementById("form-competitor-alerts");
    if (closeAlerts) closeAlerts.addEventListener("click", () => modalAlerts.classList.remove("active"));
    if (formAlerts) {
      formAlerts.addEventListener("submit", (e) => {
        e.preventDefault();
        modalAlerts.classList.remove("active");
        state.addNotification("Alerts Saved", "Competitor tracking triggers updated.");
      });
    }

    // API Hub Modal
    const modalApi = document.getElementById("modal-api-hub");
    const closeApi = document.getElementById("close-api-hub-modal");
    if (closeApi) closeApi.addEventListener("click", () => modalApi.classList.remove("active"));
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
