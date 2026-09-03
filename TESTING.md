# 🧪 Testing & Development Guide

This guide explains how to test, debug, and safely verify updates to the **Capybara Discord Bot**—both **locally on your computer** (without touching the live bot) and **in production** (24/7 online via Wispbyte).

---

## 📌 Table of Contents
1. [The Golden Rule: Dev Bot vs. Production Bot](#1-the-golden-rule-dev-bot-vs-production-bot)
2. [Method 1: Local Testing (Without Deploying Live)](#2-method-1-local-testing-without-deploying-live)
3. [Method 2: Testing While Live on Wispbyte (Cloud Hosting)](#3-method-2-testing-while-live-on-wispbyte-cloud-hosting)
4. [Decision Matrix: What Needs What?](#4-decision-matrix-what-needs-what)
5. [Common Gotchas & Troubleshooting](#5-common-gotchas--troubleshooting)

---

## 1. The Golden Rule: Dev Bot vs. Production Bot

> [!CAUTION]
> **Never run your local code using the same Discord Bot Token that is currently running on your 24/7 cloud host (Wispbyte).**
>
> If you start the bot locally with the **same `TOKEN`**, both your PC and Wispbyte connect to Discord's Gateway simultaneously. When a user runs `/capybaras`:
> * Discord randomly forwards the event to *either* your PC or Wispbyte.
> * Users may experience double messages, non-responsive buttons, or `Interaction already replied to` errors in the console.

**The Solution:**
* **Production Bot ("Capybara Bot")**: Runs 24/7 on Wispbyte for your public servers.
* **Development Bot ("Capybara Dev")**: Runs on your personal computer only when you're writing code and testing.

---

## 2. Method 1: Local Testing (Without Deploying Live)

Testing locally allows you to iterate rapidly, view console outputs instantly, and experiment without risking downtime.

### Step 1: Create a Free Development Bot
1. Navigate to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Click **New Application** $\rightarrow$ Name it `Capybara Dev` (or `Capybara Test`).
3. In the left sidebar, click **Bot**:
   * Click **Reset Token** and copy the secret token.
4. In the left sidebar, click **OAuth2** $\rightarrow$ **URL Generator**:
   * **Scopes:** `bot`, `applications.commands`
   * **Bot Permissions:**
     * *Send Messages*
     * *Embed Links*
     * *Attach Files*
     * *Add Reactions*
     * *Use External Emojis*
5. Copy the generated URL at the bottom, open it in your browser, and invite your Dev bot into your private test Discord server.

### Step 2: Configure Local `.env`
In your local [`.env`](./.env) file, paste your **Dev Bot's** credentials:
```env
TOKEN=your_development_bot_token_here
CLIENT_ID=your_development_client_id_here
CUSTOM_EMOJI_ID=1396104539538460683
```
*(Your live Wispbyte server retains your main bot's credentials, so it stays online uninterrupted).*

### Step 3: Run the Automated Smoke Tests
Before launching the bot, run the built-in test suite to catch syntax errors or missing files:
```bash
npm test
```
This tests:
* ✅ Core branding assets exist (`assets/`).
* ✅ Local images gallery is populated and readable (`images/`).
* ✅ Slash command builder definitions are valid.
* ✅ Real production embed generators and dynamic OAuth links function properly from `index.js`.
* ✅ Button action rows and Author-Only security guards function properly.
* ✅ Unicode emoji dataset is loaded and random reaction selection works.
* ✅ Live `/capyweb` API fetcher and local fallback engine function.
* ✅ Graceful container shutdown signal listeners (`SIGTERM`/`SIGINT`) are active.
* ✅ GitHub community templates (Issue templates, PR template, config) are valid.
* ✅ GitHub Actions CI workflow, Dependabot configuration, and README badges are valid.

### Step 4: Deploy Slash Commands (If Changed)
If you added, renamed, or changed options for any slash commands:
```bash
npm run deploy
```
*Tells Discord's servers to register the commands for your Dev bot. You only need to run this once per command schema change.*

### Step 5: Start the Bot Locally
```bash
npm start
```
Go to your private test Discord server and interact with the bot!

---

## 3. Method 2: Testing While Live on Wispbyte (Cloud Hosting)

Once your code is verified locally, deploy it to your 24/7 cloud server:

### Step 1: Upload the Updated Files
1. Log in to your **[Wispbyte Client Panel](https://wispbyte.com/client/)**.
2. Open your server dashboard and click the **Files** tab.
3. Drag-and-drop your modified files (e.g., [`index.js`](./index.js), new `.jpg` photos into `images/`, or updated [`package.json`](./package.json)).

### Step 2: Deploy Commands (Only If Adding New Commands)
* If your update includes a **brand-new slash command** (e.g., `/capyfacts`):
  1. Go to the **Console** tab on Wispbyte.
  2. Type:
     ```bash
     npm run deploy
     ```
  3. Press Enter. You should see:
     ```text
     [+] Successfully registered 3 global application (/) commands! 🎉
     ```

### Step 3: Reboot the Container
1. On the Wispbyte **Console** tab, click the **Restart** button.
2. Watch the live terminal logs:
   ```text
   [!] Capybara: Hello World!
   [!] Logged in on discord as Capybara#9190 ...
   ```

### Step 4: Perform an Interactive "Smoke Test" in Discord
Open a Discord channel where your live bot has access and verify:
1. **Trigger `/capybaras`:** Does the image and embed appear?
2. **Click 👍 Next:** Does the photo change in-place smoothly?
3. **Click 🦫 React:** Does the bot react with an emoji?
4. **Click 👎 Leave:** Does the dismissal message appear?
5. **Check Wispbyte Console:** Confirm no errors were logged.

---

## 4. Decision Matrix: What Needs What?

Use this quick-reference table to know exactly what steps are required for different types of edits:

| What did you edit? | Example | Need `npm test`? | Need `npm run deploy`? | How to activate? |
| :--- | :--- | :---: | :---: | :--- |
| **New Capybara Photos** | Added photos to `images/` | Recommended | ❌ No | Just restart bot (`npm start`) |
| **Visual Embeds / Captions** | Changed text, embed colors | Recommended | ❌ No | Just restart bot (`npm start`) |
| **Button Behavior / Handlers** | Changed button reaction logic | Recommended | ❌ No | Just restart bot (`npm start`) |
| **Brand New Slash Command** | Created `/capyfacts` or `/capyrate` | Recommended | ✅ **Yes (Once)** | `npm run deploy` $\rightarrow$ `npm start` |
| **Command Description / Options** | Changed command description in code | Recommended | ✅ **Yes (Once)** | `npm run deploy` $\rightarrow$ `npm start` |
| **Full Project Health Check** | Checked code integrity | ✅ **Yes** | ❌ No | Run `npm test` |

---

## 5. Common Gotchas & Troubleshooting

### ❓ "I added a new command to `index.js`, but Discord doesn't show it."
* **Cause:** Discord needs to be told about new slash command schemas via the REST API.
* **Fix:** Run `npm run deploy`. Once deployed, global commands appear in Discord clients within a few moments.

### ❓ "Discord says: `Interaction failed` or `Application did not respond`."
* **Cause:** The bot took longer than 3 seconds to reply without deferring (`interaction.deferReply()`), or crashed before replying.
* **Fix:** Check your terminal / Wispbyte Console output for the specific error stack trace.

### ❓ "The bot reacted with `🦫` instead of my custom capybara emoji."
* **Cause:** The bot is in a server that does not host the custom emoji, or `CUSTOM_EMOJI_ID` in `.env` is invalid.
* **Fix:** This is the automatic safety fallback working as intended! It ensures the bot never crashes or throws `Unknown Emoji` errors.

### ❓ "Why do my commands show up twice in Discord?"
* **Cause:** You previously registered commands for a specific guild (`Routes.applicationGuildCommands`), and now also globally (`Routes.applicationCommands`).
* **Fix:** Add `GUILD_ID=your_server_id` to your `.env` and run `npm run deploy`. The script automatically clears old guild-specific commands.
