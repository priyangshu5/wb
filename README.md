# 🤖 WhatsApp AI Bot — Educational Project

> **⚠️ DISCLAIMER:** This project is strictly for **educational and experimental
> purposes only**. It uses unofficial WhatsApp Web automation. Using unofficial
> APIs may violate WhatsApp's Terms of Service. Use responsibly at your own risk.

---

## 📖 Table of Contents

1. [What This Project Does](#what-this-project-does)
2. [Project Structure](#project-structure)
3. [How It Works](#how-it-works)
4. [Setup Guide](#setup-guide)
5. [Running the Bot](#running-the-bot)
6. [Viewing the QR Code](#viewing-the-qr-code)
7. [Scanning the QR](#scanning-the-qr)
8. [Configuration Reference](#configuration-reference)
9. [Limitations & Warnings](#limitations--warnings)
10. [Troubleshooting](#troubleshooting)

---

## What This Project Does

This bot:

- 🤖 **Runs entirely on GitHub Actions** — no server needed
- 📱 **Connects to WhatsApp** using WhatsApp Web QR authentication
- 🧠 **Replies intelligently** using OpenRouter AI (GPT model)
- 🖥️ **Shows QR in a web UI** — large, mobile-friendly display
- 🔄 **Auto-refreshes** the QR image every 6 seconds

---

## Project Structure

```
whatsapp-ai-bot/
├── index.js              ← Main bot logic
├── ai.js                 ← OpenRouter AI integration
├── config.js             ← All configuration (edit this!)
├── qr-server.js          ← Express server for QR web viewer
├── package.json          ← Node.js dependencies
├── public/
│   ├── index.html        ← QR viewer web page
│   ├── style.css         ← Styling (dark, mobile-friendly)
│   └── script.js         ← Auto-refresh & UI logic
├── session/              ← WhatsApp session (auto-created)
└── .github/
    └── workflows/
        └── main.yml      ← GitHub Actions workflow
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GitHub Actions                                         │
│       │                                                 │
│       ▼                                                 │
│  node index.js ──→ whatsapp-web.js client               │
│       │                    │                            │
│       │            generates QR code                    │
│       │                    │                            │
│       │            saves as qr.png ──→ /public/qr.png   │
│       │                    │                            │
│       │            qr-server.js ──→ http://localhost:3000│
│       │                    │                            │
│       │            Web UI auto-refreshes QR image       │
│       │                                                 │
│  User scans QR with WhatsApp phone app                  │
│       │                                                 │
│  ✅ WhatsApp connected!                                 │
│       │                                                 │
│  User sends message ──→ bot receives it                 │
│       │                                                 │
│  ai.js ──→ OpenRouter API ──→ GPT response              │
│       │                                                 │
│  Bot replies to user automatically                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Guide

### Step 1: Fork this Repository

1. Click the **Fork** button at the top of this page
2. Fork it to your GitHub account
3. Clone your fork locally (optional, for config editing)

---

### Step 2: Get an OpenRouter API Key

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to **Keys** section
4. Click **"Create Key"**
5. Copy the key (starts with `sk-or-...`)

---

### Step 3: Add Your API Key to config.js

Open `config.js` and replace the placeholder:

```javascript
// BEFORE (placeholder):
OPENROUTER_API_KEY: "PASTE_YOUR_OPENROUTER_API_KEY_HERE",

// AFTER (your real key):
OPENROUTER_API_KEY: "sk-or-v1-abc123yourkeyhere",
```

> **Note:** Since this is educational, the key is in the code directly.
> For any real project, use environment variables or GitHub Secrets.

Save and commit the file to your repository.

---

### Step 4: Verify package.json

Make sure `package.json` lists all dependencies. Run locally to test:

```bash
npm install
node index.js
```

---

## Running the Bot

### Via GitHub Actions (Recommended)

1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. Click **"WhatsApp AI Bot"** in the left sidebar
4. Click the **"Run workflow"** button (top right)
5. Select `main` branch
6. Click **"Run workflow"** (green button)

The workflow will start. Click on the running job to see live logs.

---

### Running Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install

# Start the bot
node index.js
```

The bot will:
1. Start the QR web server at `http://localhost:3000`
2. Print QR code in terminal
3. Save QR image to `public/qr.png`

---

## Viewing the QR Code

### When Running Locally

Open your browser: **http://localhost:3000**

You'll see the full-screen QR viewer. It auto-refreshes every 6 seconds.

### When Running on GitHub Actions

GitHub Actions doesn't expose public URLs by default. You have these options:

**Option A: Read QR from Logs**
- The QR code is printed as text in the workflow logs
- This is the fallback text QR in the terminal

**Option B: Download QR Artifact**
- After the workflow starts, wait ~60 seconds
- Go to the workflow run page
- Scroll down to **"Artifacts"**
- Download **"qr-code-[run-number]"**
- Open the PNG file and scan it

**Option C: Use ngrok (Advanced)**

Add this step to the workflow before running the bot:

```yaml
- name: 🌐 Start ngrok tunnel
  run: |
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xzf ngrok-v3-stable-linux-amd64.tgz
    ./ngrok config add-authtoken YOUR_NGROK_TOKEN
    ./ngrok http 3000 &
    sleep 5
    curl -s localhost:4040/api/tunnels | python3 -c "
    import json,sys
    data = json.load(sys.stdin)
    url = data['tunnels'][0]['public_url']
    print(f'🌐 QR Viewer URL: {url}')
    "
```

---

## Scanning the QR

1. Open **WhatsApp** on your phone
2. **Android:** Tap ⋮ (three dots) → **Linked Devices**
   **iPhone:** Tap ⚙️ Settings → **Linked Devices**
3. Tap **"Link a Device"**
4. Point camera at the QR code
5. Wait for the green checkmark ✅

The bot will show **"WhatsApp Bot is READY!"** in the logs.

---

## Configuration Reference

All settings are in `config.js`:

| Setting | Default | Description |
|---------|---------|-------------|
| `OPENROUTER_API_KEY` | `"PASTE_HERE"` | Your OpenRouter API key |
| `BASE_URL` | `"https://openrouter.ai/api/v1"` | API endpoint |
| `MODEL` | `"openai/gpt-4o-mini"` | AI model to use |
| `SYSTEM_PROMPT` | Friendly assistant | AI personality |
| `QR_SERVER_PORT` | `3000` | Web server port |
| `QR_REFRESH_INTERVAL_MS` | `6000` | QR refresh rate (ms) |
| `REPLY_DELAY_MS` | `1500` | Delay before replying |
| `MAX_TOKENS` | `300` | Max AI response length |
| `AI_TEMPERATURE` | `0.7` | AI creativity (0-1) |
| `RESPOND_IN_GROUPS` | `false` | Reply in group chats |

---

## Limitations & Warnings

### ⏱️ GitHub Actions Time Limits

- Each workflow run has a maximum of **~6 hours**
- After 6 hours, the bot **stops automatically**
- You must **manually restart** by triggering the workflow again

### 🔄 Session Reset

- WhatsApp session is saved to the `session/` folder
- Sessions are uploaded as **GitHub Artifacts** (retained 1 day)
- After workflow ends, you **usually need to scan QR again**
- This is a limitation of the ephemeral GitHub Actions environment

### 🚫 No Persistent Storage

- No database, no Firebase, no external storage
- Conversation history is NOT saved
- Each session starts fresh

### 📡 No Public URL by Default

- The QR web server runs on `localhost:3000` inside Actions
- Not publicly accessible without additional tools (ngrok, etc.)
- Best workaround: use the QR artifact download method

### ⚠️ WhatsApp Terms of Service

- This uses the unofficial `whatsapp-web.js` library
- It automates WhatsApp Web — not an official API
- WhatsApp may block accounts using unofficial automation
- **Use a test/secondary WhatsApp account**

### 🐌 Startup Time

- First run takes 60-90 seconds to initialize
- Puppeteer needs to download/start Chromium
- Be patient after clicking "Run workflow"

---

## Troubleshooting

### ❌ "Authentication failed"

```
Delete the /session folder contents and restart the workflow.
```

### ❌ "Puppeteer failed to launch"

```
The Chromium dependencies may not have installed correctly.
Check the "Install Chromium Dependencies" step in your workflow logs.
```

### ❌ "OpenRouter API 401 Error"

```
Your API key is invalid or not set.
Double-check config.js → OPENROUTER_API_KEY
```

### ❌ QR Not Appearing in Logs

```
Wait 60-90 seconds — Puppeteer startup takes time.
Check the "Run WhatsApp AI Bot" step log.
```

### ❌ Bot Not Replying

```
1. Make sure you scanned the QR and saw "READY" in logs
2. Check RESPOND_IN_GROUPS setting if in a group chat
3. Verify your OpenRouter API key has credits
```

### ❌ npm install fails

```
Try: npm install --legacy-peer-deps
Or update package.json to use compatible versions
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Bot Runtime | Node.js 20 |
| WhatsApp Client | whatsapp-web.js |
| Browser Automation | Puppeteer |
| AI API | OpenRouter (GPT-4o-mini) |
| HTTP Client | Axios |
| QR Generation | qrcode |
| Web Server | Express.js |
| CI/CD | GitHub Actions |
| Frontend | Vanilla HTML/CSS/JS |

---

## License

MIT License — Educational use only.

---

> 💡 **Tip:** Star ⭐ this repo if you found it helpful for learning!
> 
> 🎓 Built as a student learning project to explore WhatsApp automation,
> AI APIs, and GitHub Actions as an execution environment.
