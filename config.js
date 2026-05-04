// ============================================================
// CONFIG.JS — All configuration in one place
// ============================================================
// ⚠️  IMPORTANT: Replace placeholder values before running
// ⚠️  This file is for EDUCATIONAL USE ONLY
// ============================================================

const config = {

  // ----------------------------------------------------------
  // 🤖 OpenRouter AI Configuration
  // ----------------------------------------------------------

  // Paste your OpenRouter API key here
  // Get one free at: https://openrouter.ai/keys
  OPENROUTER_API_KEY: "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",

  // OpenRouter base API URL — do not change
  BASE_URL: "https://openrouter.ai/api/v1",

  // AI Model to use (free tier)
  MODEL: "openai/gpt-4o-mini",

  // ----------------------------------------------------------
  // 🤖 Bot Personality / System Prompt
  // ----------------------------------------------------------

  // This is the AI persona — customize freely
  SYSTEM_PROMPT: `You are a helpful, friendly WhatsApp assistant.
Keep your replies short, clear, and conversational.
Avoid long paragraphs. Use simple language.
If you don't know something, say so honestly.`,

  // ----------------------------------------------------------
  // 🌐 QR Web Server Configuration
  // ----------------------------------------------------------

  // Port for the local QR web server
  QR_SERVER_PORT: 3000,

  // How often (ms) the web UI refreshes the QR image
  QR_REFRESH_INTERVAL_MS: 6000,

  // ----------------------------------------------------------
  // 📁 File Paths
  // ----------------------------------------------------------

  // Where to save the QR image
  QR_IMAGE_PATH: "./public/qr.png",

  // Session folder for WhatsApp authentication
  SESSION_PATH: "./session",

  // ----------------------------------------------------------
  // ⏱️ Bot Behavior
  // ----------------------------------------------------------

  // Delay (ms) before replying — feels more natural
  REPLY_DELAY_MS: 1500,

  // Max tokens for AI response
  MAX_TOKENS: 300,

  // Temperature for AI (0 = strict, 1 = creative)
  AI_TEMPERATURE: 0.7,

  // ----------------------------------------------------------
  // 🛡️ Safety — Messages to ignore
  // ----------------------------------------------------------

  // Bot will NOT respond to messages from these JIDs
  IGNORED_SENDERS: [],

  // Bot will NOT respond to group messages if false
  RESPOND_IN_GROUPS: false,

};

module.exports = config;