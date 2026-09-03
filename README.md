# <img src="./assets/emoji.svg" width="32" height="32" alt="Capybara" valign="middle" /> Capybara Discord Bot

<div align="center">

[![CI Tests](https://img.shields.io/github/actions/workflow/status/mikroskato62/capy-discord-bot/test.yml?branch=main&label=CI%20Tests&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/mikroskato62/capy-discord-bot/actions/workflows/test.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14.25-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Wispbyte](https://img.shields.io/badge/Hosted%20On-Wispbyte%2024%2F7-6366f1?style=for-the-badge&logo=server&logoColor=white)](https://wispbyte.com/)
[![Discord](https://img.shields.io/badge/Community-Weboardies™-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/d8pawxdSqG)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./LICENSE)

**A modern, feature-rich, and interactive Discord bot delivering high-quality capybara joy, live web photos, and dynamic UI embeds.**

[Features](#-features) • [Slash Commands](#-slash-commands) • [Hosting 24/7](#-247-cloud-hosting) • [Quick Start](#-quick-start) • [Testing Guide](./TESTING.md) • [Configuration](#-configuration) • [Credits](#-image-credits--fair-use) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

* **⚡ Modern Discord.js v14 Framework**: Built with pure slash commands (`ApplicationCommands`), interactive action rows, and button components.
* **📸 Dual Image Delivery Engine**:
  * **Local Curated Gallery**: Instant, zero-latency delivery of hand-picked capybara images packaged directly with the bot.
  * **Live Web API Integration**: Real-time fetching of infinite high-resolution capybara pictures from `api.capy.lol` with automatic graceful fallback to local storage.
* **🎨 Dynamic & Expressive Embeds**:
  * Randomized vibrant hex color accents for every response.
  * Contextual captions (sleeping, gaming, bathing, family, and more).
  * Informative footers tracking user attribution, request timestamps, and gallery indices (e.g. `Image 05/26`).
  * Automatic custom emoji reactions on command trigger.
* **📖 Interactive Information & Guide**:
  * Comprehensive `/capyinfo` command providing bot details, feature breakdown, and upcoming roadmap with brand visuals.
* **🔄 Interactive In-Place Navigation**:
  * 👍 **Next Photo Button (`capybara_next` / `capyweb_next`)**: Cycles to another random photo smoothly without creating chat clutter.
  * 👎 **Leave Button (`capybara_leave`)**: Dismisses the photo with a humorous animated departure message.
* **🛡️ Rate-Limiting & Anti-Spam**: Built-in 1-second per-user cooldown on commands and button interactions to keep your server clean and prevent Discord API `429 Too Many Requests`.
* **☁️ 24/7 Zero-Maintenance Hosting**: Hosted 24/7 for free with high uptime on **[Wispbyte](https://wispbyte.com/)**.

---

## 🎮 Slash Commands

| Command | Description | Source | Interactive Buttons |
| :--- | :--- | :--- | :--- |
| **`/capybaras`** | Fetches a random capybara from the curated local gallery | Local Storage (`./images`) | <img src="./assets/emoji.svg" width="18" height="18" alt="Capybara" valign="middle" /> **Next Capybara** • ❌ **Leave** |
| **`/capyweb`** | Fetches a live random capybara photo from the web | `api.capy.lol` (Web API) | 🌐 **Next Web Capybara** • ❌ **Leave** |
| **`/capyinfo`** | Displays bot overview, features, and future roadmap | Bot Core & Visual Assets | ⭐ **GitHub Repo** • ❌ **Leave** |

---

## ☁️ 24/7 Cloud Hosting

This bot is configured for **100% free, 24/7 continuous hosting** using **[Wispbyte](https://wispbyte.com/)**.

* 📖 **Full Setup Instructions:** See the **[Wispbyte Hosting & Deployment Guide](./WISPBYTE.md)** for step-by-step instructions on deploying, updating, and managing your 24/7 bot on Wispbyte.
* 🖥️ **Web Console & File Manager:** Easily monitor live logs, restart on demand, and upload new capybara images directly through the Wispbyte panel.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
* A **[Discord Developer Application & Bot](https://discord.com/developers/applications)**

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/mikroskato62/capy-discord-bot.git
cd capy-discord-bot
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
```

### 4. Deploy Slash Commands
Register slash commands with Discord API (only needed once or when commands change):
```bash
npm run deploy
```

### 5. Start the Bot
```bash
npm start
```

You should see:
```text
[!] Capybara: Hello World!
[!] Success :)
[!] Logged in on discord as Capybara#9190 ...
```

---

## 📁 Project Structure

```text
capy-discord-bot/
├── assets/             # Branding assets, banner, background, logo & custom emoji
├── images/             # Curated local capybara image collection (.jpg, .jpeg)
├── .env                # Environment secrets (Protected by .gitignore)
├── .gitignore          # Git exclusion rules (node_modules, .env, temp files)
├── WISPBYTE.md         # Complete guide for Wispbyte 24/7 cloud hosting
├── deploy-commands.js  # Standalone CLI script for deploying slash commands
├── index.js            # Main application entrypoint, client events & buttons
├── package.json        # Dependencies, project metadata & npm scripts
├── package-lock.json   # Deterministic dependency tree lockfile
├── README.md           # Project documentation & landing page
├── LICENSE             # ISC Open-Source License
├── SECURITY.md         # Vulnerability reporting & token security guidelines
├── CONTRIBUTING.md     # Guidelines for contributing photos & code
├── TESTING.md          # Comprehensive local and live testing guide
└── TODO.md             # Development roadmap and completed features
```

---

## 🔐 Environment Configuration (`.env`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `TOKEN` | **Yes** | Secret Discord Bot Authentication Token |
| `CLIENT_ID` | **Yes** | Discord Application (Client) ID |
| `GUILD_ID` | *Optional* | Legacy server ID (cleared automatically if provided to avoid duplicate commands) |
| `CUSTOM_EMOJI_ID` | *Optional* | Custom server emoji ID (defaults gracefully to `🦫` if omitted or unavailable) |

---

## 🛠️ Tech Stack

* **Runtime:** [Node.js](https://nodejs.org/) (CommonJS)
* **Discord API Wrapper:** [Discord.js v14](https://discord.js.org/)
* **Configuration:** [dotenv](https://www.npmjs.com/package/dotenv)
* **Cloud Hosting:** [Wispbyte](https://wispbyte.com/)

---

## 📸 Image Credits & Fair Use

All capybara imagery included in this project is used for non-commercial, educational, and community entertainment purposes:
* **Original Photography:** Photos `bonus1.jpg`, `bonus2.jpg`, and `bonus3.jpg` were captured on Galaxy A50 at Attica Zoological Park by [@mikroskato62](https://github.com/mikroskato62).
* **Curated Gallery:** Sourced from public web archives, photography platforms, and community shares (see [`images/IMAGES.md`](./images/IMAGES.md)).
* **Live Web API:** Real-time web photos fetched dynamically from [`api.capy.lol`](https://api.capy.lol/).

> **Notice to Content Owners:** If you are the copyright holder of any photo included in the curated gallery and wish to have it credited or removed, please [open an issue](https://github.com/mikroskato62/capy-discord-bot/issues) or reach out via our [Discord Server](https://discord.gg/d8pawxdSqG). We will gladly fulfill your request promptly!

---

## 📄 License

This project is open source and available under the [ISC License](./LICENSE).

<div align="center">
  <sub>Built with 💖 and <img src="./assets/emoji.svg" width="18" height="18" alt="Capybara" valign="middle" /> capybaras.</sub>
</div>

