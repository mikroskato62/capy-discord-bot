# ☁️ Wispbyte 24/7 Hosting & Deployment Guide

🔗 **Wispbyte Client Panel**: [wispbyte.com/client](https://wispbyte.com/client) \
This guide explains how to host, manage, and update the **Capybara Discord Bot** 24/7 for free using **[Wispbyte](https://wispbyte.com/)**.

---

## 📌 Table of Contents
1. [What is Wispbyte?](#1-what-is-wispbyte)
2. [Why Wispbyte?](#2-why-wispbyte)
3. [How to Deploy via Zip Archive](#3-how-to-deploy-via-zip-archive)
4. [How to Update the Bot](#4-how-to-update-the-bot)
5. [Monitoring & Troubleshooting](#5-monitoring--troubleshooting)
6. [Best Practices for 24/7 Uptime](#6-best-practices-for-247-uptime)

---

## 1. What is Wispbyte?

**[Wispbyte](https://wispbyte.com/)** is a cloud application and game server hosting platform offering a permanent free tier with Node.js support. It runs your Discord bot inside an isolated Pterodactyl container with 24/7 uptime without requiring your personal computer to stay on.

---

## 2. Why Wispbyte?

* **100% Free Forever Plan**: No credit card or payment information required.
* **True 24/7 Uptime**: Keeps your bot online continuously.
* **Full Pterodactyl Web Console**: Real-time access to live terminal logs, command executions, and memory/CPU usage.
* **Integrated File Manager**: Edit code, upload images, or configure `.env` variables directly in your browser.
* **Instant Start & Restart**: One-click start, reboot, and stop controls.

---

## 3. How to Deploy via Zip Archive

### Step 1: Package Your Bot Files
Compress the following project files and folders into a `.zip` archive (e.g. `bot.zip`):
* `index.js`
* `deploy-commands.js`
* `package.json`
* `package-lock.json`
* `.env` *(contains your Discord bot TOKEN and CLIENT_ID)*
* `images/` *(folder with curated capybara photos)*
* `assets/` *(branding and visual assets)*

> [!IMPORTANT]
> **Do NOT include the `node_modules` folder in the zip file!** Wispbyte automatically runs `npm install` to handle clean dependency installation inside the container.

### Step 2: Upload & Launch on Wispbyte
1. Log in to your account at **[wispbyte.com](https://wispbyte.com/)**.
2. Create a new server under the **Free Plan** and select **Node.js** as the environment.
3. Open your server dashboard and navigate to the **Files** / **File Manager** tab.
4. Upload your `.zip` archive and extract/unarchive the files.
5. Make sure your `.env` file exists with your `TOKEN` and `CLIENT_ID`.
6. Switch to the **Console** tab and click **Start**.

---

## 4. How to Update the Bot

Whenever you add new capybara photos or update bot code:

### Method A: Web File Manager (Quickest for Images/Single Files)
1. Go to your server on **[wispbyte.com](https://wispbyte.com/)** $\rightarrow$ **Files**.
2. Navigate to `images/` and drag-and-drop new `.jpg` photos directly into the browser.
3. Restart the server from the **Console** tab.

### Method B: Upload New Zip (For Major Updates)
1. Package your updated project into a new `.zip` (excluding `node_modules`).
2. Upload and unarchive the `.zip` in the **Files** manager.
3. Click **Restart** in the **Console** tab.

---

## 5. Monitoring & Troubleshooting

### Viewing Live Logs
* On the Wispbyte server page, open the **Console** tab.
* You can see live bot startup logs, slash command executions, button clicks, and error traces:
  ```text
  [!] Capybara: Hello World!
  [!] Success :)
  [!] Logged in on discord as Capybara62#9190 ...
  ```

### Controls
* **Start**: Powers on the bot process.
* **Restart**: Cleanly reboots the container and reloads all image files.
* **Stop**: Gracefully shuts down the bot.

---

## 6. Best Practices for 24/7 Uptime

* **Account Activity**: Log in to your Wispbyte dashboard at least once a month to ensure your free server remains active.
* **Token Security**: Never commit or publish your `.env` file publicly.
* **Memory Limits**: The bot consumes only ~40–50 MB RAM, running well within free-tier resource boundaries.

---

*Enjoy your 24/7 online Capybara bot powered by [Wispbyte](https://wispbyte.com/)!*
