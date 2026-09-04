# 🧪 Comprehensive Testing & Quality Assurance Guide

<div align="center">

[![CI Test Suite](https://img.shields.io/github/actions/workflow/status/mikroskato62/capy-discord-bot/test.yml?branch=main&label=CI%20Tests&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/mikroskato62/capy-discord-bot/actions/workflows/test.yml)
[![Node.js Matrix](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x%20%7C%2022.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14.25-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Test Stages](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)](./tests/capytest.js)
[![Community Support](https://img.shields.io/badge/Community-Weboardies™-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/d8pawxdSqG)

**The complete, zero-knowledge guide to testing, debugging, mocking, and verifying the Capybara Discord Bot locally and in production.**

[Testing Philosophy](#1-the-core-philosophy-of-discord-bot-testing) • [Dev Environment Setup](#2-setting-up-your-private-testing-environment) • [12-Stage Automated Suite](#3-the-12-stage-automated-test-suite-npm-test) • [Local Live Testing](#4-local-live-testing-in-discord) • [Decision Matrix](#5-decision-matrix-what-steps-do-i-need) • [Deploying to Cloud](#6-deploying-verified-code-to-production-wispbyte) • [CI/CD Pipeline](#7-continuous-integration-pipeline-github-actions) • [Troubleshooting](#8-comprehensive-testing-troubleshooting--gotchas) • [Best Practices](#9-testing-best-practices--pre-flight-checklist)

</div>

---

> [!NOTE]
> **Who is this guide for?**  
> Whether you are writing your very first line of JavaScript, contributing new capybara photos to the gallery, or managing an enterprise-grade 24/7 Discord bot deployment, this guide provides a structured, safe roadmap to verify every feature. You will learn how to test your code thoroughly on your own computer without any risk of breaking the live bot running on your cloud server.

---

## 📌 Table of Contents

1. [📐 1. The Core Philosophy of Discord Bot Testing](#1-the-core-philosophy-of-discord-bot-testing)
   * [1.1 Why Testing a Discord Bot is Unique](#11-why-testing-a-discord-bot-is-unique)
   * [1.2 The Golden Rule: Development Bot vs. Production Bot](#12-the-golden-rule-development-bot-vs-production-bot)
   * [1.3 The 3-Tier Testing Architecture](#13-the-3-tier-testing-architecture)
2. [🎒 2. Setting Up Your Private Testing Environment](#2-setting-up-your-private-testing-environment)
   * [2.1 Creating Your Private Discord Testing Sandbox](#21-creating-your-private-discord-testing-sandbox)
   * [2.2 Provisioning Your Dedicated "Capybara Dev" Bot](#22-provisioning-your-dedicated-capybara-dev-bot)
   * [2.3 Configuring Local Environment Variables (`.env`)](#23-configuring-local-environment-variables-env)
   * [2.4 Managing Dependencies with npm](#24-managing-dependencies-with-npm)
3. [🤖 3. The 12-Stage Automated Test Suite (`npm test`)](#3-the-12-stage-automated-test-suite-npm-test)
   * [3.1 Purpose & Execution of the Automated Suite](#31-purpose--execution-of-the-automated-suite)
   * [3.2 Temporary Test Database Isolation](#32-temporary-test-database-isolation)
   * [3.3 Detailed Breakdown of All 12 Automated Verification Stages](#33-detailed-breakdown-of-all-12-automated-verification-stages)
4. [🖥️ 4. Local Live Testing in Discord](#4-local-live-testing-in-discord)
   * [4.1 Step 1: Deploying Slash Commands via REST API (`npm run deploy`)](#41-step-1-deploying-slash-commands-via-rest-api-npm-run-deploy)
   * [4.2 Step 2: Booting the Local Bot Process (`npm start`)](#42-step-2-booting-the-local-bot-process-npm-start)
   * [4.3 Step 3: Interactive Manual Testing Matrix](#43-step-3-interactive-manual-testing-matrix)
   * [4.4 Step 4: Edge Case & Security Guard Testing](#44-step-4-edge-case--security-guard-testing)
5. [📊 5. Decision Matrix: What Steps Do I Need?](#5-decision-matrix-what-steps-do-i-need)
6. [☁️ 6. Deploying Verified Code to Production (Wispbyte)](#6-deploying-verified-code-to-production-wispbyte)
   * [6.1 Staging to Production Workflow](#61-staging-to-production-workflow)
   * [6.2 Production Slash Command Deployment](#62-production-slash-command-deployment)
   * [6.3 Production Smoke Verification Protocol](#63-production-smoke-verification-protocol)
7. [⚙️ 7. Continuous Integration Pipeline (GitHub Actions)](#7-continuous-integration-pipeline-github-actions)
   * [7.1 CI Workflow Architecture (`test.yml`)](#71-ci-workflow-architecture-testyml)
   * [7.2 Node.js Version Matrix Testing (18.x, 20.x, 22.x)](#72-nodejs-version-matrix-testing-18x-20x-22x)
   * [7.3 Pull Request Gates & Branch Protection](#73-pull-request-gates--branch-protection)
8. [🚑 8. Comprehensive Testing Troubleshooting & Gotchas](#8-comprehensive-testing-troubleshooting--gotchas)
   * [8.1 Missing Assets or File Integrity Failures](#81-missing-assets-or-file-integrity-failures)
   * [8.2 Slash Command Schema & Propagation Mismatches](#82-slash-command-schema--propagation-mismatches)
   * [8.3 Race Conditions & "Interaction Already Replied To" Errors](#83-race-conditions--interaction-already-replied-to-errors)
   * [8.4 Remote API Timeouts & Offline Fallback Verification](#84-remote-api-timeouts--offline-fallback-verification)
   * [8.5 Duplicate Commands in Discord (Guild vs. Global Registry)](#85-duplicate-commands-in-discord-guild-vs-global-registry)
   * [8.6 Custom Server Emoji Fallback Behavior](#86-custom-server-emoji-fallback-behavior)
9. [🛡️ 9. Testing Best Practices & Pre-Flight Checklist](#9-testing-best-practices--pre-flight-checklist)

---

## 1. The Core Philosophy of Discord Bot Testing

### 1.1 Why Testing a Discord Bot is Unique

Testing a Discord bot is fundamentally different from testing a traditional website or command-line utility. A modern Discord.js bot is a real-time, distributed application characterized by:

1. **Persistent Asynchronous WebSockets**: The bot maintains an open connection to the Discord Gateway (`wss://gateway.discord.gg`), constantly listening for user interactions and server events.
2. **Strict Time Windows**: When a user clicks a button or issues a slash command, Discord requires the bot to acknowledge the interaction within **3.0 seconds**. If the bot takes 3001 milliseconds, Discord displays `The application did not respond`.
3. **External Dependencies**: The bot communicates with Discord's REST API, queries live web APIs (`api.capy.lol`), loads binary image assets from disk, and writes persistent JSON data to local storage.

Because of this interconnected nature, making edits directly on a live production server is dangerous. One syntax error or missing photo can crash your bot for all users across every server.

---

### 1.2 The Golden Rule: Development Bot vs. Production Bot

> [!CAUTION]
> ### 🛑 NEVER RUN LOCAL CODE WITH YOUR PRODUCTION BOT TOKEN
> If you start the bot locally on your PC using the **exact same `TOKEN`** that is currently running on your 24/7 cloud host ([Wispbyte](https://wispbyte.com/)), disaster strikes:
>
> ```text
>               ┌──────────────────────────────────────────────┐
>               │          Discord Gateway WebSocket           │
>               └──────────────────────┬───────────────────────┘
>                                      │
>                       Random Gateway Event Dispatch
>                                      │
>                     ┌────────────────┴────────────────┐
>                     │                                 │
>                     ▼                                 ▼
>       ┌───────────────────────────┐     ┌───────────────────────────┐
>       │  Local Development PC     │     │  24/7 Production Host     │
>       │  (Running "npm start")    │     │  (Wispbyte Cloud Server)  │
>       └─────────────┬─────────────┘     └─────────────┬─────────────┘
>                     │                                 │
>                     ▼                                 ▼
>         Handled Interaction #1            Late Interaction Token (Expired)
>         "Success :)"                      CRASH: "Interaction already replied to"
> ```
>
> **The Symptoms of Token Collisions**:
> * Discord randomly sends commands to *either* your PC or your cloud host.
> * Buttons become unresponsive or produce `Interaction failed` alerts.
> * Users receive duplicate responses or broken embeds.
> * Both consoles output unhandled rejection errors: `DiscordAPIError[10062]: Unknown interaction`.

**The Industry-Standard Solution:**
* 🏭 **Production Bot ("Capybara Bot")**: Runs 24/7 on Wispbyte using your primary production credentials. It serves your public Discord servers and is never modified directly.
* 🧪 **Development Bot ("Capybara Dev")**: A separate, free bot entity in the Discord Developer Portal with its own private credentials. It runs exclusively on your local computer inside your private testing server.

---

### 1.3 The 3-Tier Testing Architecture

To guarantee 100% stability, this project follows a structured 3-tier testing model:

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      TIER 1: AUTOMATED LOCAL TESTS                          │
 │  Command: npm test                                                          │
 │  • Zero network requirement; runs in under 2 seconds.                       │
 │  • Validates image integrity, branding assets, command schemas, embed       │
 │    builders, and Capydex database round-trips against a test sandbox.       │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                       TIER 2: LOCAL STAGING TESTS                           │
 │  Commands: npm run deploy && npm start                                      │
 │  • Connects "Capybara Dev" to your private sandbox Discord server.          │
 │  • Verifies live slash commands, interactive buttons, ephemeral UI popups,  │
 │    cooldown mechanics, and Author-Only security guards.                     │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                   TIER 3: PRODUCTION SMOKE VERIFICATION                     │
 │  Platform: Wispbyte 24/7 Cloud Host                                         │
 │  • Triggered via Git push to main and 1-click restart on Wispbyte.          │
 │  • Verifies container startup telemetry, Gateway handshake, and production  │
 │    command execution across public guilds.                                  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Setting Up Your Private Testing Environment

### 2.1 Creating Your Private Discord Testing Sandbox

Never test experimental code in a public community server. Setting up a private testing server takes under 30 seconds:

1. Open your Discord desktop or web application.
2. In the server list on the left side, scroll to the bottom and click the green **Add a Server** (`+`) button.
3. Select **Create My Own** $\rightarrow$ **For me and my friends**.
4. Name the server `Capy Testing Lab` (or any custom name).
5. Click **Create**. You now possess an isolated testing sandbox where you can freely test commands, simulate errors, and invite test accounts.

---

### 2.2 Provisioning Your Dedicated "Capybara Dev" Bot

1. Navigate to the **[Discord Developer Portal](https://discord.com/developers/applications)** and log in.
2. Click the **New Application** button in the top-right corner.
3. Enter `Capybara Dev` as the name and click **Create**.
4. **Acquire Client ID**:
   * On the **General Information** page, locate **Application ID**.
   * Click **Copy**. This is your development `CLIENT_ID`.
5. **Acquire Bot Token**:
   * In the left menu, click **Bot**.
   * Click **Reset Token** and confirm.
   * Enter your two-factor authentication (2FA) code if prompted.
   * Click **Copy**. This is your development `TOKEN`.
6. **Generate the Bot Invitation URL**:
   * In the left menu, click **OAuth2** $\rightarrow$ **URL Generator**.
   * Under **Scopes**, select:
     * ☑️ `bot`
     * ☑️ `applications.commands`
   * Under **Bot Permissions**, select:
     * ☑️ **Send Messages**
     * ☑️ **Embed Links**
     * ☑️ **Attach Files**
     * ☑️ **Add Reactions**
     * ☑️ **Use External Emojis**
     * ☑️ **Read Message History**
     * ☑️ **View Channels**
7. Copy the generated URL at the bottom, paste it into your browser, select your `Capy Testing Lab` server, and click **Authorize**.
8. Your `Capybara Dev` bot will now appear in your test server roster.

---

### 2.3 Configuring Local Environment Variables (`.env`)

The project uses a [.env](file:///c:/Users/User/Desktop/discord-bot/.env) file in the root directory to store credentials. This file is excluded from Git tracking by [.gitignore](file:///c:/Users/User/Desktop/discord-bot/.gitignore) so your secrets remain private.

Open or create [.env](file:///c:/Users/User/Desktop/discord-bot/.env) on your local machine and populate it with your **Development Bot** credentials:

```env
TOKEN=your_development_bot_token_here
CLIENT_ID=your_development_client_id_here
CUSTOM_EMOJI_ID=1396104539538460683
```

> [!TIP]
> Ensure there are **no spaces** before or after the `=` sign and **no quotation marks** around the values.

---

### 2.4 Managing Dependencies with npm

Before running tests or launching the application, install all required dependencies:

```bash
npm install
```

This verifies that the packages declared in [package.json](file:///c:/Users/User/Desktop/discord-bot/package.json) (`discord.js`, `dotenv`, and `unicode-emoji-json`) are compiled and ready inside your local `node_modules/` folder.

---

## 3. The 12-Stage Automated Test Suite (`npm test`)

### 3.1 Purpose & Execution of the Automated Suite

The project includes an automated test runner located at [tests/capytest.js](file:///c:/Users/User/Desktop/discord-bot/tests/capytest.js). It performs comprehensive unit and smoke testing against every subsystem of the bot.

To execute the test suite, run:

```bash
npm test
```

A completely healthy test execution produces the following output:

```text
[*] Running Capybara Bot Test Suite...

[*] Test 1: Verifying core branding assets...
[+] Assets verified successfully: 5 branding files validated.

[*] Test 2: Verifying curated images gallery & file integrity...
[+] Local images gallery verified: all 25 curated images verified with valid byte sizes and captions.

[*] Test 3: Verifying slash command definitions & deployment schema...
[+] Commands array validated directly from deploy-commands.js: /capybaras, /capyweb, /capyinfo

[*] Test 4: Testing real production embed generators & anti-spam cooldowns...
[+] Real embed data generators & anti-spam cooldown mechanics verified.

[*] Test 5: Testing real Button Action Rows and Author-Only logic...
[+] Button Action Rows & Author-Only guard validated successfully across all fallback branches.

[*] Test 6: Verifying unicode-emoji-json and reaction generator with exclusion...
[+] Emoji database verified (1914 emojis) with exclusion & guild emoji support.

[*] Test 7: Testing live /capyweb API fetcher & offline fallback resilience...
[+] Live /capyweb engine verified successfully! Image: https://api.capy.lol/v1/capybara/410...
[!] Warning: Live capybara API request failed, falling back to local images: Simulated network offline
[+] Offline fallback resilience verified successfully (hello.jpg attached, friendly error handling).

[*] Test 8: Testing Capydex tracker, Option B progress bars, disk persistence & pool probing...
[!] Dynamic Web Capybara pool verified: 821 total images.
[+] Capydex tracker, Option B progress bars, disk persistence & binary search verified.

[*] Test 9: Verifying graceful shutdown signal listeners...
[+] Graceful shutdown handlers active (SIGTERM: 1, SIGINT: 1).

[*] Test 10: Verifying GitHub community files & issue templates...
[+] All 7 GitHub community templates verified.

[*] Test 11: Validating CI workflow & Dependabot configuration structure...

[*] Test 12: Testing Capydex Leaderboard, gaming tiebreakers, server filtering & empty states...
[+] Weighted random selection verified: 5.92% bonus appearance across 10000 trials.
[+] Capydex Leaderboard, tiebreakers, server filtering & empty states verified successfully.

========================================
🎉 ALL 12 BOT TESTS PASSED SUCCESSFULLY! 
========================================
```

---

### 3.2 Temporary Test Database Isolation

When testing disk storage and player unlock mechanics, the test suite must never corrupt or overwrite real user data stored in `data/capydata.json`. 

To achieve complete isolation, [tests/capytest.js](file:///c:/Users/User/Desktop/discord-bot/tests/capytest.js) dynamically redirects storage to a temporary file:

```javascript
// tests/capytest.js (Line 32 & Line 39)
const TEST_STORAGE_FILE = path.join(__dirname, 'test-capydex.json');
capydex.initStorage(TEST_STORAGE_FILE);
```

During test cleanup, this temporary test database is automatically removed, leaving production files untouched.

---

### 3.3 Detailed Breakdown of All 12 Automated Verification Stages

```text
 ┌───────┬──────────────────────────────────┬────────────────────────────────────────────────────────┐
 │ Stage │ Name                             │ Subsystem Verified                                     │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 1     │ Core Branding Assets             │ Verifies banner.png, logo.png, background.png,         │
 │       │                                  │ emoji.svg, and capybara.png exist with valid sizes.    │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 2     │ Curated Image Gallery Integrity  │ Verifies all 25 JPG files in images/, confirms byte    │
 │       │                                  │ sizes >1KB, validates captions, and checks hello.jpg.  │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 3     │ Slash Command Deployment Schema  │ Directly imports from deploy-commands.js, validating   │
 │       │                                  │ JSON schemas for /capybaras, /capyweb, /capyinfo.      │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 4     │ Embed Generators & Cooldowns     │ Validates getCapybaraData(), getCapyInfoData(), hex    │
 │       │                                  │ color bounds, and 1-second anti-spam rate limiting.    │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 5     │ Button Action Rows & Author-Only │ Tests ActionRowBuilder components, customId author     │
 │       │                                  │ snowflake encoding, and permission guards.             │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 6     │ Emoji Database & Reactions       │ Validates unicode-emoji-json (1900+ emojis), exclusion │
 │       │                                  │ filtering of problematic glyphs, and custom fallback.  │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 7     │ Live Web API & Offline Fallback  │ Queries api.capy.lol live, simulates network outage,   │
 │       │                                  │ and verifies graceful offline fallback to hello.jpg.   │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 8     │ Capydex Tracker & Progress Bars  │ Tests 100-block progress bar generator (Option B),     │
 │       │                                  │ binary search pool probing, and disk persistence.      │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 9     │ Graceful Shutdown Handlers       │ Asserts that SIGTERM and SIGINT signal listeners are   │
 │       │                                  │ registered to cleanly terminate Discord WebSockets.    │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 10    │ GitHub Community Templates       │ Validates issue templates, pull request template, and  │
 │       │                                  │ community configuration in .github/.                   │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 11    │ CI Workflow & Dependabot Syntax  │ Checks YAML structure for GitHub Actions CI and        │
 │       │                                  │ automated dependency management.                       │
 ├───────┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
 │ 12    │ Leaderboard & Gaming Tiebreakers │ Tests top 5 collectors calculation, multi-tier         │
 │       │                                  │ tiebreaker hierarchy, and ~6% bonus drop rate.         │
 └───────┴──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Local Live Testing in Discord

After `npm test` passes, launch your development bot to test real user interactions inside Discord.

### 4.1 Step 1: Deploying Slash Commands via REST API (`npm run deploy`)

Before Discord displays your commands in the chat interface, the command definitions must be published to Discord's REST API:

```bash
npm run deploy
```

*(This executes [src/deploy-commands.js](file:///c:/Users/User/Desktop/discord-bot/src/deploy-commands.js))*.

**What Happens Under the Hood:**
1. Loads `TOKEN` and `CLIENT_ID` from your local `.env`.
2. Connects to Discord REST API v10 (`https://discord.com/api/v10`).
3. If `GUILD_ID` is present, it purges outdated guild-scoped commands to eliminate duplicates.
4. Issues an HTTP `PUT` request to `Routes.applicationCommands(CLIENT_ID)` publishing `/capybaras`, `/capyweb`, and `/capyinfo`.
5. Confirms with:
   ```text
   [*] Started refreshing 3 application (/) commands...
   [+] Successfully registered 3 global application (/) commands! 🎉
   ```

> [!NOTE]
> You only need to run `npm run deploy` **once**, or whenever you add, rename, or change the options of a slash command. You do not need to run it when only changing photos or embed colors!

---

### 4.2 Step 2: Booting the Local Bot Process (`npm start`)

With commands registered, start the application:

```bash
npm start
```

Your terminal will display the active client status:

```text
[!] Capybara: Hello World!
[!] Success :)
[!] Logged in on discord as Capybara Dev#1234 ...
[!] Dynamic Web Capybara pool verified: 821 total images.
```

In Discord, look at your `Capy Testing Lab` server: `Capybara Dev` now shows a green online status! 🟢

---

### 4.3 Step 3: Interactive Manual Testing Matrix

Execute the following actions inside your test server to verify dynamic component behavior:

| Interactive Element | Action | Verification Standard |
| :--- | :--- | :--- |
| **`/capybaras`** | Type `/capybaras` and press Enter. | Embed appears with randomized border color, image attachment, and author footer. |
| 👍 **Next (`capybara_next`)** | Click the **Next** button. | Image, caption, and footer update in-place without generating a new chat message. |
| 🦫 **React (`capybara_react`)** | Click the **React** button. | Bot adds a randomized unicode animal/nature emoji reaction to the message. |
| 📖 **Capydex (`capydex_view`)** | Click the **Capydex** button. | Returns an **ephemeral** (only visible to you) message displaying your personal unlocked photos and 100-block progress bar. |
| 🏆 **Leaderboard (`capyleaderboard_view`)** | Click the **Leaderboard** button. | Returns an **ephemeral** message ranking the top 5 collectors in your test server with medals (🥇🥈🥉). |
| 👎 **Leave (`capybara_leave`)** | Click the **Leave** button. | Message edits to a wave goodbye notice and dismisses all button components. |
| **`/capyweb`** | Type `/capyweb` and press Enter. | Fetches and displays a dynamic live photo from `api.capy.lol`. |
| **`/capyinfo`** | Type `/capyinfo` and press Enter. | Displays technical overview, repository links, and feature breakdown embed. |

---

### 4.4 Step 4: Edge Case & Security Guard Testing

To verify production stability, purposefully trigger edge cases:

#### Test A: Anti-Spam Rate Limit Cooldown
* **Action**: Click the **Next** button rapidly 3 times in less than 1 second.
* **Expected Result**: On rapid clicks, the bot catches the interaction and replies ephemerally:  
  `Slow down! Please wait 0.8s before using buttons again.`
* **Significance**: Prevents users from spamming the Discord Gateway and triggering `HTTP 429 Too Many Requests`.

#### Test B: Author-Only Button Security Guard
* **Action**: Have a second Discord account (or an invited friend) click the **Next** or **Leave** button on a photo generated by your primary account.
* **Expected Result**: Discord displays an ephemeral warning to that secondary user:  
  `Only the user who ran the command can control this interaction.`
* **Significance**: Prevents other members from hijacking or dismissing someone else's capybara session.

#### Test C: Simulated Network Outage (Offline Resilience)
* **Action**: Disconnect your internet connection for 5 seconds and trigger `/capyweb`.
* **Expected Result**: Instead of crashing with an unhandled network error, the bot catches the exception, attaches [images/hello.jpg](file:///c:/Users/User/Desktop/discord-bot/images/hello.jpg), and displays a friendly offline notification.

---

## 5. Decision Matrix: What Steps Do I Need?

Use this quick-reference matrix to determine the exact commands required for different modifications:

| Modification Type | Example Changes | Run `npm test`? | Run `npm run deploy`? | How to Apply Changes? |
| :--- | :--- | :---: | :---: | :--- |
| **Adding New Photos** | Added `chill.jpg` into `images/` | ✅ Recommended | ❌ No | Restart bot (`npm start`) |
| **Embed Styling & Captions** | Changed embed colors or title texts | ✅ Recommended | ❌ No | Restart bot (`npm start`) |
| **Button Interaction Logic** | Modified reaction emoji pool or buttons | ✅ Recommended | ❌ No | Restart bot (`npm start`) |
| **New Slash Command Added** | Added `/capyfacts` in `deploy-commands.js` | ✅ **Required** | ✅ **Required** | `npm run deploy` $\rightarrow$ `npm start` |
| **Command Description Changed**| Edited description text of `/capyinfo` | ✅ **Required** | ✅ **Required** | `npm run deploy` $\rightarrow$ `npm start` |
| **Upgraded Dependencies** | Ran `npm update discord.js` | ✅ **Required** | ❌ No | `npm test` $\rightarrow$ `npm start` |
| **Documentation Updates** | Edited `README.md` or `WISPBYTE.md` | ❌ Optional | ❌ No | No runtime restart needed |

---

## 6. Deploying Verified Code to Production (Wispbyte)

Once your changes pass all 12 automated tests and perform cleanly in your local staging environment, deploy them to your 24/7 cloud host on [Wispbyte](https://wispbyte.com/).

### 6.1 Staging to Production Workflow

```text
  [Local Machine: Capybara Dev]
         │
         │ (1. Pass 12/12 tests via "npm test")
         ▼
  [Git Commit & Push to GitHub]
  git add .
  git commit -m "feat: added new capybara photos and validated tests"
  git push origin main
         │
         │ (2. GitHub Actions CI runs & validates matrix)
         ▼
  [Wispbyte 24/7 Cloud Host]
         │
         │ (3. Click "Restart" in Wispbyte Console)
         ▼
  [Wispbyte automatically runs "git pull" & boots production bot!] 🎉
```

---

### 6.2 Production Slash Command Deployment

If your update introduced a **new slash command** or modified an existing command definition:

1. Open your server on the **[Wispbyte Client Panel](https://wispbyte.com/client/)**.
2. Click on the **Console** tab.
3. In the command prompt at the bottom, execute:
   ```bash
   node src/deploy-commands.js
   ```
4. Confirm the console reports:
   ```text
   [+] Successfully registered 3 global application (/) commands! 🎉
   ```

---

### 6.3 Production Smoke Verification Protocol

Immediately following production deployment, perform a 60-second health check:

1. In the Wispbyte Console, check that the process logged in without errors:
   ```text
   [!] Capybara: Hello World!
   [!] Success :)
   [!] Logged in on discord as Capybara Bot#9190 ...
   ```
2. In your public Discord server, verify that the production bot is online with its rotating status.
3. Execute `/capybaras` and click 👍 **Next** to confirm image streaming and database persistence work in production.

---

## 7. Continuous Integration Pipeline (GitHub Actions)

### 7.1 CI Workflow Architecture (`test.yml`)

Every push and pull request targeting the `main` branch automatically triggers our continuous integration workflow defined in [.github/workflows/test.yml](file:///c:/Users/User/Desktop/discord-bot/.github/workflows/test.yml).

The pipeline executes the following automated steps on GitHub's cloud runners:
1. Checks out the code repository using `actions/checkout@v4`.
2. Sets up Node.js with caching using `actions/setup-node@v4`.
3. Performs a clean, deterministic package installation using `npm ci`.
4. Executes the complete 12-stage test runner via `npm test`.

---

### 7.2 Node.js Version Matrix Testing (18.x, 20.x, 22.x)

To guarantee that the bot operates across all modern Long-Term Support (LTS) environments, the CI workflow tests the codebase across a matrix of Node.js engines:

* **Node.js 18.x (Hydrogen LTS)**: Minimum supported engine declared in `package.json`.
* **Node.js 20.x (Iron LTS)**: Standard enterprise cloud hosting runtime.
* **Node.js 22.x (Jod LTS)**: Modern bleeding-edge runtime.

If any test fails on any of these three versions, the entire build turns red and alerts the development team.

---

### 7.3 Pull Request Gates & Branch Protection

When contributors submit pull requests:
* The CI workflow runs automatically against the contributor's branch.
* If a contributor adds an invalid photo, breaks a command schema, or introduces a syntax error, the PR is blocked with a failing status.
* Only pull requests that achieve a 100% green test pass are merged into `main`.

---

## 8. Comprehensive Testing Troubleshooting & Gotchas

### 8.1 Missing Assets or File Integrity Failures

#### Symptom: `AssertionError [ERR_ASSERTION]: Asset should exist: ./assets/capybara.png`
* **Cause**: A core branding file was accidentally deleted, renamed, or corrupted to 0 bytes.
* **Resolution**: Verify that all 5 branding files exist inside `assets/` and are larger than 1 KB:
  * `banner.png`, `logo.png`, `background.png`, `emoji.svg`, `capybara.png`.

#### Symptom: `AssertionError: capybaraResponses in index.js should match image count in images/`
* **Cause**: You added a new image to `images/` but forgot to register its corresponding entry in the `capybaraResponses` array inside [src/index.js](file:///c:/Users/User/Desktop/discord-bot/src/index.js), or vice versa.
* **Resolution**: Ensure the count of images in `images/` exactly matches `capybaraResponses.length`.

---

### 8.2 Slash Command Schema & Propagation Mismatches

#### Symptom: I added a command to `src/index.js`, but Discord says `Unknown command`
* **Cause**: Slash commands are registered with Discord's REST API, not loaded dynamically on Gateway connect.
* **Resolution**: Run `npm run deploy` (or `node src/deploy-commands.js`) to publish the updated schema to Discord.

#### Symptom: Commands show up in one server but not another
* **Cause**: Global slash commands propagate across Discord's global CDN within 1 to 2 minutes.
* **Resolution**: Completely restart your Discord client (`Ctrl + R` on Windows, `Cmd + R` on Mac, or swipe close mobile app) to invalidate Discord's local UI cache.

---

### 8.3 Race Conditions & "Interaction Already Replied To" Errors

#### Symptom: `DiscordAPIError[10062]: Unknown interaction` or duplicate replies
* **Cause**: You left `npm start` running in a local terminal window while your 24/7 cloud server was also active with the same Token!
* **Resolution**:
  1. Stop your local terminal process with `Ctrl + C`.
  2. Verify your local [.env](file:///c:/Users/User/Desktop/discord-bot/.env) is using your **Development Bot Token**, not your Production Bot Token.

---

### 8.4 Remote API Timeouts & Offline Fallback Verification

#### Symptom: Warning during tests: `Live capybara API request failed, falling back to local images`
* **Status**: **This is intentional and normal!**
* **Explanation**: Test 7 purposefully simulates network failure to verify that the bot falls back gracefully to `images/hello.jpg` without crashing when `api.capy.lol` is unreachable.

---

### 8.5 Duplicate Commands in Discord (Guild vs. Global Registry)

#### Symptom: Two identical `/capybaras` commands appear when typing `/` in Discord
* **Cause**: You previously registered guild-specific commands for your server (`Routes.applicationGuildCommands`), and later registered global commands (`Routes.applicationCommands`).
* **Resolution**:
  1. Open your [.env](file:///c:/Users/User/Desktop/discord-bot/.env) file and add your server ID: `GUILD_ID=your_server_id_here`.
  2. Run `npm run deploy`.
  3. The deployment script automatically detects `GUILD_ID`, clears the legacy guild-specific command registry, and deploys clean global commands.
  4. Remove `GUILD_ID` from `.env`.

---

### 8.6 Custom Server Emoji Fallback Behavior

#### Symptom: The bot reacts with `🦫` instead of your custom server emoji
* **Status**: Normal resilience behavior.
* **Explanation**: If `CUSTOM_EMOJI_ID` in `.env` is omitted, points to an emoji on a server the bot does not belong to, or Discord returns an error, the bot automatically falls back to unicode `🦫`. This prevents `Unknown Emoji` crashes.

---

## 9. Testing Best Practices & Pre-Flight Checklist

Before pushing any commit to GitHub or deploying to production, run through this quick checklist:

- [ ] **Automated Tests**: Did `npm test` execute and report `ALL 12 BOT TESTS PASSED SUCCESSFULLY!`?
- [ ] **No Hardcoded Secrets**: Did you ensure your real `TOKEN` is stored only in `.env` and never in code?
- [ ] **Git Exclusion**: Does `git status` confirm that `.env` and `node_modules` are ignored?
- [ ] **Image Integrity**: Are all new photos compressed reasonably (< 500 KB) and non-corrupted?
- [ ] **Command Schema**: If you added or changed commands, did you run `npm run deploy`?
- [ ] **Dev Bot Isolation**: Did you stop your local bot process before switching focus away from development?

---

<div align="center">

### 🌟 Quality Assurance Complete!
*By following this testing guide, your Capybara Discord Bot will maintain rock-solid uptime, zero interaction crashes, and delighted server communities.*

Questions or need help with a failing test?  
**[Join the Discord Community](https://discord.gg/d8pawxdSqG)** &nbsp;•&nbsp; **[GitHub Repository](https://github.com/mikroskato62/capy-discord-bot)**

<sub>Maintained with 💖 by [@mikroskato62](https://github.com/mikroskato62) • Distributed under the [ISC License](./LICENSE)</sub>

</div>
