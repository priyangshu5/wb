// ============================================================
// SCRIPT.JS — QR Viewer Client-Side JavaScript
// ============================================================
// Handles QR image polling, auto-refresh, and UI state updates
// ============================================================

(function () {
  "use strict";

  // ----------------------------------------------------------
  // Configuration
  // ----------------------------------------------------------

  const REFRESH_INTERVAL_MS = 6000;     // How often to check for new QR
  const QR_IMAGE_URL = "/qr.png";       // QR image endpoint
  const STATUS_URL = "/qr-status";      // Status check endpoint

  // ----------------------------------------------------------
  // DOM element references
  // ----------------------------------------------------------

  const qrImage       = document.getElementById("qrImage");
  const qrPlaceholder = document.getElementById("qrPlaceholder");
  const statusBadge   = document.getElementById("statusBadge");
  const statusDot     = document.getElementById("statusDot");
  const statusText    = document.getElementById("statusText");
  const statusIcon    = document.getElementById("statusIcon");
  const statusLabel   = document.getElementById("statusLabel");
  const countdownEl   = document.getElementById("countdown");
  const connectedOverlay = document.getElementById("connectedOverlay");

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  let countdownValue  = REFRESH_INTERVAL_MS / 1000;
  let countdownTimer  = null;
  let refreshTimer    = null;
  let qrLoadAttempts  = 0;
  let isConnected     = false;

  // ----------------------------------------------------------
  // Initialize on page load
  // ----------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    console.log("🤖 WhatsApp AI Bot — QR Viewer loaded");

    // Initial QR load attempt
    checkAndRefreshQR();

    // Set up auto-refresh interval
    refreshTimer = setInterval(() => {
      checkAndRefreshQR();
      resetCountdown();
    }, REFRESH_INTERVAL_MS);

    // Start countdown display
    startCountdown();

    // Add tap-to-fullscreen on QR image (mobile convenience)
    qrImage.addEventListener("click", toggleFullscreen);
  });

  // ----------------------------------------------------------
  // Check QR status and refresh image
  // ----------------------------------------------------------

  /**
   * Fetches QR status from server and updates UI accordingly.
   * Then refreshes the QR image if available.
   */
  async function checkAndRefreshQR() {
    try {
      // Check server for QR status
      const response = await fetch(STATUS_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.qrAvailable) {
        // QR is ready — load the image
        setStatus("ready", "QR Ready", "📱", "Scan the QR code with WhatsApp");
        loadQRImage();
        qrLoadAttempts = 0;

      } else {
        // QR not yet generated
        qrLoadAttempts++;
        setStatus("waiting", "Generating...", "⏳", "Waiting for QR code...");
        showPlaceholder(`Generating QR... (attempt ${qrLoadAttempts})`);
      }

    } catch (error) {
      console.warn("⚠️ Status check failed:", error.message);

      // Try loading the image directly anyway (fallback)
      loadQRImage();
    }
  }

  // ----------------------------------------------------------
  // Load QR image with cache busting
  // ----------------------------------------------------------

  /**
   * Loads the QR image from the server with a timestamp
   * to prevent browser caching stale images.
   */
  function loadQRImage() {
    // Add timestamp to URL to bust cache
    const timestamp = Date.now();
    const imageUrl  = `${QR_IMAGE_URL}?t=${timestamp}`;

    // Create a new Image object to preload
    const tempImg = new Image();

    tempImg.onload = () => {
      // Image loaded successfully — show it
      qrImage.src = imageUrl;
      qrImage.classList.remove("hidden");
      qrImage.classList.add("fade-in");
      hidePlaceholder();

      // Remove animation class after it plays
      setTimeout(() => {
        qrImage.classList.remove("fade-in");
      }, 400);

      console.log("✅ QR image updated at", new Date().toLocaleTimeString());
    };

    tempImg.onerror = () => {
      // Image failed to load — keep showing placeholder
      console.warn("⚠️ QR image not available yet");
      qrImage.classList.add("hidden");
      showPlaceholder("Waiting for QR code...");
      setStatus("waiting", "Waiting...", "⏳", "QR not yet available");
    };

    // Trigger the load
    tempImg.src = imageUrl;
  }

  // ----------------------------------------------------------
  // UI State helpers
  // ----------------------------------------------------------

  /**
   * Updates the status badge and message area.
   * @param {string} dotClass - CSS class for dot color (waiting/ready/connected/error)
   * @param {string} badgeText - Short text in badge
   * @param {string} icon - Emoji icon for status area
   * @param {string} label - Descriptive text for status area
   */
  function setStatus(dotClass, badgeText, icon, label) {
    // Update badge dot class
    statusDot.className = `badge-dot ${dotClass}`;
    statusText.textContent = badgeText;

    // Update status message area
    statusIcon.textContent = icon;
    statusLabel.textContent = label;
  }

  /**
   * Shows the loading placeholder inside the QR frame.
   * @param {string} message - Message to display
   */
  function showPlaceholder(message = "Generating QR...") {
    const textEl = qrPlaceholder.querySelector(".placeholder-text");
    if (textEl) textEl.textContent = message;
    qrPlaceholder.style.display = "flex";
  }

  /**
   * Hides the loading placeholder.
   */
  function hidePlaceholder() {
    qrPlaceholder.style.display = "none";
  }

  // ----------------------------------------------------------
  // Countdown timer
  // ----------------------------------------------------------

  /**
   * Starts the visual countdown display.
   */
  function startCountdown() {
    countdownValue = REFRESH_INTERVAL_MS / 1000;

    countdownTimer = setInterval(() => {
      countdownValue--;

      if (countdownValue <= 0) {
        countdownValue = REFRESH_INTERVAL_MS / 1000;
      }

      if (countdownEl) {
        countdownEl.textContent = countdownValue;
      }
    }, 1000);
  }

  /**
   * Resets countdown back to full interval.
   */
  function resetCountdown() {
    countdownValue = REFRESH_INTERVAL_MS / 1000;
    if (countdownEl) {
      countdownEl.textContent = countdownValue;
    }
  }

  // ----------------------------------------------------------
  // Fullscreen support (for larger QR view)
  // ----------------------------------------------------------

  /**
   * Toggles fullscreen mode on the QR frame.
   * Useful on small mobile screens.
   */
  function toggleFullscreen() {
    const qrFrame = document.querySelector(".qr-frame");

    if (!document.fullscreenElement) {
      // Enter fullscreen
      const target = qrFrame || document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch((err) => {
          console.log("Fullscreen not available:", err.message);
        });
      } else if (target.webkitRequestFullscreen) {
        // Safari
        target.webkitRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ----------------------------------------------------------
  // Page visibility — pause/resume when tab is hidden
  // ----------------------------------------------------------

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Tab hidden — clear intervals to save resources
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
      console.log("⏸️ Page hidden — pausing QR refresh");

    } else {
      // Tab visible again — resume
      console.log("▶️ Page visible — resuming QR refresh");
      checkAndRefreshQR();
      resetCountdown();

      refreshTimer = setInterval(() => {
        checkAndRefreshQR();
        resetCountdown();
      }, REFRESH_INTERVAL_MS);

      startCountdown();
    }
  });

  // ----------------------------------------------------------
  // Connection simulation check
  // ----------------------------------------------------------
  // Since we can't get real WhatsApp connection events from
  // the client side, we check if QR image stops updating
  // (which usually means user has scanned and connected)

  let lastQRTimestamp = null;
  let sameQRCount     = 0;

  /**
   * Checks if QR has stopped changing (may indicate connection).
   * After QR is scanned, WhatsApp stops generating new QRs.
   */
  async function checkConnectionStatus() {
    try {
      const response = await fetch(STATUS_URL, { cache: "no-store" });
      const data = await response.json();

      if (data.qrAvailable && data.qrAgeSeconds !== null) {
        // If QR is very old (not regenerated), might be connected
        if (data.qrAgeSeconds > 60 && !isConnected) {
          // QR hasn't changed in 60+ seconds — possibly connected
          // (This is approximate — real apps would use WebSocket)
          console.log("💡 QR appears stable — user may have scanned");
        }
      }
    } catch (e) {
      // Ignore status check errors
    }
  }

  // Check connection status less frequently
  setInterval(checkConnectionStatus, 15000);

  // ----------------------------------------------------------
  // Log ready state
  // ----------------------------------------------------------

  console.log("✅ QR Viewer initialized");
  console.log(`🔄 Refreshing every ${REFRESH_INTERVAL_MS / 1000} seconds`);
  console.log("📱 Tap the QR image for fullscreen mode");

})(); // End IIFE