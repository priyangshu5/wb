// ============================================================
// INDEX.JS — Main WhatsApp Bot Entry Point
// ============================================================
// Starts the WhatsApp client, generates QR, handles messages
// Educational project — not for production use
// ============================================================

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const { getAIReply } = require("./ai");

// ----------------------------------------------------------
// 🖥️ Start the QR Web Server in background
// ----------------------------------------------------------
// We require and start the server inline so both run together

const qrServer = require("./qr-server");

// ----------------------------------------------------------
// 📁 Ensure required directories exist
// ----------------------------------------------------------

const publicDir = path.join(__dirname, "public");
const sessionDir = path.join(__dirname, "session");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log("📁 Created /public directory");
}

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
  console.log("📁 Created /session directory");
}

// ----------------------------------------------------------
// 🤖 Initialize WhatsApp Client
// ----------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("🤖 WhatsApp AI Bot — Educational Project");
console.log("=".repeat(60));
console.log("⚠️  For educational/experimental use only");
console.log("📅 Started at:", new Date().toLocaleString());
console.log("=".repeat(60) + "\n");

const client = new Client({
  // LocalAuth saves session to avoid re-scanning every time
  authStrategy: new LocalAuth({
    dataPath: config.SESSION_PATH,
  }),

  puppeteer: {
    // Required for GitHub Actions / Linux environments
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  },
});

// ----------------------------------------------------------
// 📱 QR Code Event — Save and display QR
// ----------------------------------------------------------

client.on("qr", async (qr) => {
  console.log("\n" + "=".repeat(60));
  console.log("📱 QR CODE GENERATED — Scan with WhatsApp!");
  console.log("=".repeat(60));

  // Print QR in terminal (text fallback for logs)
  try {
    const qrcodeTerminal = require("qrcode-terminal");
    qrcodeTerminal.generate(qr, { small: true });
  } catch (e) {
    // qrcode-terminal is optional, skip if not installed
    console.log("💡 (Install qrcode-terminal for terminal QR display)");
  }

  // Save QR as PNG image for the web UI
  try {
    const qrImagePath = path.join(__dirname, config.QR_IMAGE_PATH);

    await qrcode.toFile(qrImagePath, qr, {
      type: "png",
      width: 400,          // Large enough for easy scanning
      margin: 2,
      color: {
        dark: "#000000",   // Black dots
        light: "#FFFFFF",  // White background
      },
    });

    console.log(`\n✅ QR image saved: ${qrImagePath}`);
    console.log(`\n🌐 Open the QR viewer in your browser:`);
    console.log(`   http://localhost:${config.QR_SERVER_PORT}`);
    console.log(`\n📌 In GitHub Actions: Check the workflow logs`);
    console.log(`   and use ngrok/port forwarding to access the URL`);

  } catch (err) {
    console.error("❌ Failed to save QR image:", err.message);
  }

  console.log("\n⏳ Waiting for you to scan the QR code...");
  console.log("=".repeat(60) + "\n");
});

// ----------------------------------------------------------
// ✅ Ready Event — Bot is connected and ready
// ----------------------------------------------------------

client.on("ready", () => {
  console.log("\n" + "=".repeat(60));
  console.log("✅ WhatsApp Bot is READY!");
  console.log("=".repeat(60));
  console.log("📱 Connected to WhatsApp Web");
  console.log("🤖 AI Model:", config.MODEL);
  console.log("💬 Waiting for incoming messages...");
  console.log("🔇 Group replies:", config.RESPOND_IN_GROUPS ? "ON" : "OFF");
  console.log("=".repeat(60) + "\n");

  // Remove QR image once authenticated (no longer needed)
  const qrImagePath = path.join(__dirname, config.QR_IMAGE_PATH);
  if (fs.existsSync(qrImagePath)) {
    // Keep QR file but overwrite with "connected" indicator
    // (web UI will show connected state)
    console.log("🗑️  QR scan complete — bot is live!");
  }
});

// ----------------------------------------------------------
// 🔄 Auth Events
// ----------------------------------------------------------

client.on("authenticated", () => {
  console.log("🔐 Authentication successful! Session saved.");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication failed:", msg);
  console.log("💡 Try deleting the /session folder and restart.");
});

client.on("disconnected", (reason) => {
  console.log("⚠️ WhatsApp disconnected:", reason);
  console.log("🔄 You may need to restart the bot and scan QR again.");
});

// ----------------------------------------------------------
// 💬 Message Event — Core bot logic
// ----------------------------------------------------------

client.on("message", async (message) => {
  try {
    // ── Get basic message info ──────────────────────────
    const sender = message.from;           // e.g. "628123456789@c.us"
    const body = message.body?.trim();     // Message text
    const isGroup = sender.includes("@g.us"); // Group chat check
    const contact = await message.getContact();
    const senderName = contact.pushname || contact.number || "Unknown";

    // ── Skip empty messages ─────────────────────────────
    if (!body || body.length === 0) {
      return;
    }

    // ── Skip status messages ────────────────────────────
    if (message.isStatus) {
      return;
    }

    // ── Skip group messages if configured ───────────────
    if (isGroup && !config.RESPOND_IN_GROUPS) {
      return;
    }

    // ── Skip ignored senders ────────────────────────────
    if (config.IGNORED_SENDERS.includes(sender)) {
      console.log(`🚫 Ignored message from: ${sender}`);
      return;
    }

    // ── Log incoming message ────────────────────────────
    console.log("\n" + "-".repeat(50));
    console.log(`📩 New message from: ${senderName} (${sender})`);
    console.log(`💬 Message: ${body}`);
    console.log(`📍 Chat type: ${isGroup ? "Group" : "Private"}`);
    console.log("-".repeat(50));

    // ── Get AI reply ────────────────────────────────────
    const aiReply = await getAIReply(body, senderName);

    // ── Add natural delay before replying ───────────────
    await sleep(config.REPLY_DELAY_MS);

    // ── Send reply ──────────────────────────────────────
    await message.reply(aiReply);

    console.log(`✅ Replied to ${senderName}: ${aiReply.substring(0, 60)}...`);

  } catch (error) {
    console.error("❌ Error handling message:", error.message);

    // Try to send error message to user
    try {
      await message.reply("⚠️ Sorry, something went wrong. Please try again.");
    } catch (replyError) {
      console.error("❌ Could not send error reply:", replyError.message);
    }
  }
});

// ----------------------------------------------------------
// 🛠️ Helper: Sleep / Delay function
// ----------------------------------------------------------

/**
 * Pauses execution for given milliseconds.
 * Makes bot replies feel more natural (not instant).
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ----------------------------------------------------------
// 🚀 Start the WhatsApp client
// ----------------------------------------------------------

console.log("🚀 Initializing WhatsApp client...");
console.log("⏳ This may take 30-60 seconds on first run...\n");

client.initialize().catch((err) => {
  console.error("❌ Failed to initialize WhatsApp client:", err.message);
  console.log("\n💡 Troubleshooting tips:");
  console.log("   1. Make sure you have Node.js 18+ installed");
  console.log("   2. Run: npm install");
  console.log("   3. Delete /session folder and try again");
  console.log("   4. Check internet connection");
  process.exit(1);
});

// ----------------------------------------------------------
// 🛡️ Handle unexpected errors gracefully
// ----------------------------------------------------------

process.on("uncaughtException", (err) => {
  console.error("\n❌ Uncaught Exception:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("\n❌ Unhandled Rejection:", reason);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n👋 Shutting down bot gracefully...");
  await client.destroy();
  console.log("✅ Bot stopped. Goodbye!");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n👋 SIGTERM received — shutting down...");
  await client.destroy();
  process.exit(0);
});