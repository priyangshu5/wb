// ============================================================
// QR-SERVER.JS — Simple Express Server for QR Web Viewer
// ============================================================
// Serves the web UI and QR image on a local port
// Access it at: http://localhost:3000
// ============================================================

const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config");

// ----------------------------------------------------------
// Create Express app
// ----------------------------------------------------------

const app = express();
const PORT = config.QR_SERVER_PORT || 3000;

// ----------------------------------------------------------
// Serve static files from /public directory
// ----------------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------
// Route: GET /qr-status
// Returns JSON status of QR image availability
// ----------------------------------------------------------

app.get("/qr-status", (req, res) => {
  const qrPath = path.join(__dirname, "public", "qr.png");
  const qrExists = fs.existsSync(qrPath);

  let qrAge = null;

  if (qrExists) {
    const stats = fs.statSync(qrPath);
    // Age in seconds
    qrAge = Math.floor((Date.now() - stats.mtimeMs) / 1000);
  }

  res.json({
    qrAvailable: qrExists,
    qrAgeSeconds: qrAge,
    timestamp: new Date().toISOString(),
    message: qrExists
      ? "QR code is ready — scan now!"
      : "QR not yet generated — please wait...",
  });
});

// ----------------------------------------------------------
// Route: GET /health
// Simple health check endpoint
// ----------------------------------------------------------

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "WhatsApp AI Bot - QR Viewer",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------
// Route: GET /qr.png
// Serve QR image with cache-busting headers
// ----------------------------------------------------------

app.get("/qr.png", (req, res) => {
  const qrPath = path.join(__dirname, "public", "qr.png");

  if (!fs.existsSync(qrPath)) {
    // Return 404 if QR not generated yet
    return res.status(404).json({ error: "QR not generated yet" });
  }

  // Prevent browser caching so refresh always gets latest QR
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Content-Type", "image/png");

  res.sendFile(qrPath);
});

// ----------------------------------------------------------
// Route: GET / (root)
// Serve the QR viewer HTML page
// ----------------------------------------------------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------------------------------------------
// Start server
// ----------------------------------------------------------

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n" + "=".repeat(60));
  console.log(`🌐 QR Web Viewer running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://0.0.0.0:${PORT}`);
  console.log("=".repeat(60));
  console.log("📱 Open this URL in your browser to see the QR code");
  console.log("🔄 QR image auto-refreshes every few seconds");
  console.log("=".repeat(60) + "\n");
});

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`💡 Try changing QR_SERVER_PORT in config.js`);
  } else {
    console.error("❌ QR Server error:", err.message);
  }
});

// Export server instance (so index.js can require it without re-starting)
module.exports = server;