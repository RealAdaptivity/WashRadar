import { state } from "../state.js";

class AnalyticsComponent {
  constructor() {
    this.chart = null;
  }

  init() {
    this.renderChart();
    this.setupExport();
    
    // Subscribe to state updates to refresh analytics numbers
    state.subscribe(() => {
      this.updateMetrics();
    });
    
    this.updateMetrics();
  }

  updateMetrics() {
    const { washes, construction, offers } = state.getState();
    
    // Mock capacity
    const totalCapacity = washes.length * 40; // Approx 40 cars/hr per wash
    
    // Avg wait
    const openWashes = washes.filter(w => w.status === 'open');
    const avgWait = openWashes.length > 0 
      ? Math.round(openWashes.reduce((acc, w) => acc + w.waitTime, 0) / openWashes.length) 
      : 0;

    const elCapacity = document.getElementById("analytics-total-capacity");
    const elWait = document.getElementById("analytics-avg-wait");
    const elPromos = document.getElementById("analytics-total-promos");
    const elBuilds = document.getElementById("analytics-total-builds");

    if (elCapacity) elCapacity.innerText = totalCapacity.toLocaleString();
    if (elWait) elWait.innerText = `${avgWait}m`;
    if (elPromos) elPromos.innerText = offers.length;
    if (elBuilds) elBuilds.innerText = construction.length;
  }

  renderChart() {
    const canvas = document.getElementById("weekly-trend-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Mock 7 day data for regional traffic
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dataExpress = [1200, 1150, 1300, 1400, 1800, 2200, 2100];
    const dataFull = [800, 750, 850, 900, 1100, 1500, 1400];

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Express Conveyor Traffic',
            data: dataExpress,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Full Service Detail Traffic',
            data: dataFull,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });

    // 2. Revenue Chart (Bar)
    const revCanvas = document.getElementById("revenue-chart");
    if (revCanvas) {
      new Chart(revCanvas.getContext("2d"), {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Est. MRR ($)',
            data: [45000, 48000, 41000, 52000, 61000, 68000],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // 3. Churn Chart (Doughnut)
    const churnCanvas = document.getElementById("churn-chart");
    if (churnCanvas) {
      new Chart(churnCanvas.getContext("2d"), {
        type: 'doughnut',
        data: {
          labels: ['Retained', 'At-Risk (Wait Times)', 'Churned'],
          datasets: [{
            data: [85, 10, 5],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
          },
          cutout: '75%'
        }
      });
    }
  }

  setupExport() {
    const btn = document.getElementById("btn-export-csv");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const { washes } = state.getState();
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Name,Status,Traffic,Wait Time (m),Address\\n";
      
      washes.forEach(w => {
        const row = [
          w.id,
          `"${w.name}"`,
          w.status,
          w.traffic,
          w.waitTime,
          `"${w.address}"`
        ].join(",");
        csvContent += row + "\\r\\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "washradar_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Notify
      state.addNotification("Export Complete", "Your CSV data export has been downloaded.");
    });
    
    // Setup Export to PDF (Print View)
    const btnPdf = document.getElementById("btn-export-pdf");
    if (btnPdf) {
      btnPdf.addEventListener("click", () => {
        window.print();
        state.addNotification("Export Started", "Printing Weekly Intelligence Brief...");
      });
    }

    // Setup AI Auto-Replies
    const aiBtns = document.querySelectorAll(".btn-ai-reply");
    aiBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const replyBox = e.target.parentElement.querySelector(".ai-reply-box");
        if (replyBox) {
          e.target.disabled = true;
          e.target.innerHTML = "⏳ Generating AI Reply...";
          
          setTimeout(() => {
            e.target.style.display = "none";
            replyBox.style.display = "block";
            replyBox.innerHTML = `<strong>Drafted Response:</strong> "Hi there! We are so sorry to hear about the vacuum suction issue. We have dispatched our maintenance team to check the lines immediately. Please DM us your plate number and we will add a free wash to your Garage!" <br><button class="btn-primary" style="margin-top: 8px; font-size: 0.7rem; padding: 4px 8px;">Post to Google Maps</button>`;
          }, 1500);
        }
      });
    });
  }
}

export const analyticsComponent = new AnalyticsComponent();
