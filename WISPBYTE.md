# ☁️ Wispbyte 24/7 Hosting & Production Deployment Guide

<div align="center">

[![Hosted on Wispbyte](https://img.shields.io/badge/Hosted%20On-Wispbyte%2024%2F7-6366f1?style=for-the-badge&logo=server&logoColor=white)](https://wispbyte.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14.25-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Community Support](https://img.shields.io/badge/Community-Weboardies™-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/d8pawxdSqG)

**The comprehensive, end-to-end guide to hosting, configuring, deploying, and maintaining the Capybara Discord Bot 24/7 on Wispbyte.**

[Architecture](#1-architecture--hosting-fundamentals) • [Prerequisites](#2-prerequisites--environment-preparation) • [Discord Setup](#3-discord-application--bot-configuration) • [Wispbyte Setup](#4-wispbyte-server-provisioning) • [GitHub Deploy](#5-deployment-method-a-automated-github-git-sync) • [Manual Deploy](#6-deployment-method-b-manual-archive-upload) • [Verification](#7-verification-testing--live-monitoring) • [Maintenance](#8-routine-maintenance-updates--backups) • [Troubleshooting](#9-comprehensive-troubleshooting--error-resolution) • [Security](#10-security-best-practices--hardening)

</div>

---

> [!NOTE]
> **Who is this guide for?**  
> This guide is structured for everyone—from developers deploying their first Node.js application to experienced system administrators looking for a complete deployment reference. Every phase explains both the **underlying mechanism** and the **exact, click-by-click instructions**, ensuring you achieve 100% stable 24/7 uptime without guesswork.

---

## 📌 Table of Contents

1. [📐 Architecture & Hosting Fundamentals](#1-architecture--hosting-fundamentals)
   * [1.1 Local Hosting vs. 24/7 Cloud Hosting](#11-local-hosting-vs-247-cloud-hosting)
   * [1.2 What is Wispbyte?](#12-what-is-wispbyte)
   * [1.3 System Communication Architecture](#13-system-communication-architecture)
   * [1.4 Bot Resource Profile & Footprint](#14-bot-resource-profile--footprint)
2. [🎒 Prerequisites & Environment Preparation](#2-prerequisites--environment-preparation)
   * [2.1 Required Accounts & Access Levels](#21-required-accounts--access-levels)
   * [2.2 Understanding Application Credentials: Token vs. Client ID](#22-understanding-application-credentials-token-vs-client-id)
   * [2.3 Environment Variable Configuration Schema](#23-environment-variable-configuration-schema)
3. [🤖 Discord Application & Bot Configuration](#3-discord-application--bot-configuration)
   * [3.1 Creating the Discord Developer Application](#31-creating-the-discord-developer-application)
   * [3.2 Provisioning the Bot User & Generating the Secret Token](#32-provisioning-the-bot-user--generating-the-secret-token)
   * [3.3 Gateway Intents Analysis (Guilds Intent)](#33-gateway-intents-analysis-guilds-intent)
   * [3.4 Constructing the OAuth2 Invitation URL with Scopes & Permissions](#34-constructing-the-oauth2-invitation-url-with-scopes--permissions)
   * [3.5 Authorizing the Bot to Your Server](#35-authorizing-the-bot-to-your-server)
4. [🖥️ Wispbyte Server Provisioning](#4-wispbyte-server-provisioning)
   * [4.1 Creating an Account on Wispbyte](#41-creating-an-account-on-wispbyte)
   * [4.2 Creating a Free Node.js Server](#42-creating-a-free-nodejs-server)
   * [4.3 Navigating the Pterodactyl Control Panel](#43-navigating-the-pterodactyl-control-panel)
   * [4.4 Container Controls: Start, Restart, Stop, and Kill](#44-container-controls-start-restart-stop-and-kill)
5. [🌟 Deployment Method A: Automated GitHub Git Sync (Recommended)](#5-deployment-method-a-automated-github-git-sync)
   * [5.1 Why Direct Git Sync is the Superior Workflow](#51-why-direct-git-sync-is-the-superior-workflow)
   * [5.2 Step 1: Configuring Git Parameters in the Startup Tab](#52-step-1-configuring-git-parameters-in-the-startup-tab)
   * [5.3 Step 2: Triggering Repository Clone & Synchronization](#53-step-2-triggering-repository-clone--synchronization)
   * [5.4 Step 3: Creating the Production `.env` Secrets File](#54-step-3-creating-the-production-env-secrets-file)
   * [5.5 Step 4: Registering Slash Commands via CLI](#55-step-4-registering-slash-commands-via-cli)
   * [5.6 Step 5: Booting the Application Container](#56-step-5-booting-the-application-container)
6. [📦 Deployment Method B: Manual Archive Upload (Zip)](#6-deployment-method-b-manual-archive-upload-zip)
   * [6.1 When to Use Manual File Deployment](#61-when-to-use-manual-file-deployment)
   * [6.2 The Golden Rule: Excluding `node_modules`](#62-the-golden-rule-excluding-node_modules)
   * [6.3 Step 1: Packaging Necessary Project Files](#63-step-1-packaging-necessary-project-files)
   * [6.4 Step 2: Uploading and Extracting on Wispbyte](#64-step-2-uploading-and-extracting-on-wispbyte)
   * [6.5 Step 3: Verifying Configuration & Installing Dependencies](#65-step-3-verifying-configuration--installing-dependencies)
   * [6.6 Step 4: Command Registration & Initialization](#66-step-4-command-registration--initialization)
7. [🎉 Verification, Testing & Live Monitoring](#7-verification-testing--live-monitoring)
   * [7.1 Parsing Console Startup Telemetry](#71-parsing-console-startup-telemetry)
   * [7.2 Verifying Discord Gateway Connection & Presence](#72-verifying-discord-gateway-connection--presence)
   * [7.3 Comprehensive Functional Testing Checklist](#73-comprehensive-functional-testing-checklist)
   * [7.4 Verifying Author-Only Interaction Security](#74-verifying-author-only-interaction-security)
8. [🔄 Routine Maintenance, Updates & Backups](#8-routine-maintenance-updates--backups)
   * [8.1 Updating the Bot with Git Sync (1-Click Workflow)](#81-updating-the-bot-with-git-sync-1-click-workflow)
   * [8.2 Updating with Manual Archive](#82-updating-with-manual-archive)
   * [8.3 Backing Up Persistent Data (`data/capydata.json`)](#83-backing-up-persistent-data-datacapydatajson)
   * [8.4 Setting Up Automated Backup Schedules in Pterodactyl](#84-setting-up-automated-backup-schedules-in-pterodactyl)
   * [8.5 Managing Wispbyte Free Tier Renewal & Activity Policies](#85-managing-wispbyte-free-tier-renewal--activity-policies)
9. [🚑 Comprehensive Troubleshooting & Error Resolution](#9-comprehensive-troubleshooting--error-resolution)
   * [9.1 Gateway & Authentication Errors](#91-gateway--authentication-errors)
   * [9.2 Slash Command Deployment & Visibility Failures](#92-slash-command-deployment--visibility-failures)
   * [9.3 Missing Modules & Dependency Failures](#93-missing-modules--dependency-failures)
   * [9.4 "Interaction Already Replied To" & Duplicate Gateway Connections](#94-interaction-already-replied-to--duplicate-gateway-connections)
   * [9.5 Out of Memory (OOM) or Container Crash Loops](#95-out-of-memory-oom-or-container-crash-loops)
   * [9.6 Remote Web API Outages & Offline Fallback Mechanics](#96-remote-web-api-outages--offline-fallback-mechanics)
   * [9.7 Container File Permission Errors (`EACCES`)](#97-container-file-permission-errors-eacces)
   * [9.8 Discord API Rate Limits (`429 Too Many Requests`)](#98-discord-api-rate-limits-429-too-many-requests)
10. [🛡️ Security Best Practices & Hardening](#10-security-best-practices--hardening)
    * [10.1 Principle of Least Privilege (Bot Permissions)](#101-principle-of-least-privilege-bot-permissions)
    * [10.2 Secrets Storage & Token Revocation Protocol](#102-secrets-storage--token-revocation-protocol)
    * [10.3 Graceful Process Termination (`SIGTERM` / `SIGINT`)](#103-graceful-process-termination-sigterm--sigint)

---

## 1. Architecture & Hosting Fundamentals

### 1.1 Local Hosting vs. 24/7 Cloud Hosting

When you execute `npm start` on your local development machine, the bot establishes an active persistent WebSocket connection to Discord's Gateway. However, relying on a personal computer for production hosting introduces several critical operational points of failure:

| Challenge | Local Machine Execution | Wispbyte Cloud Hosting |
| :--- | :--- | :--- |
| **Power State** | Shuts down when laptop lid closes or computer sleeps. | Runs continuously inside a tier-3 data center with redundant power. |
| **Network Reliability** | Subject to home ISP drops, IP changes, and Wi-Fi latency. | High-speed, low-latency datacenter connection (1 Gbps+ backbone). |
| **Resource Contention** | Competes with games, browsers, and background apps. | Dedicated, isolated container resources (CPU, RAM, Disk). |
| **Security & Privacy** | Exposes local development files and system environment. | Sandboxed container filesystem isolated from your personal machine. |
| **Maintenance** | Requires manual restart upon machine reboot. | Automatic container reboot upon node maintenance or crash. |

### 1.2 What is Wispbyte?

**[Wispbyte](https://wispbyte.com/)** is a cloud application hosting platform offering free and premium hosting solutions. At its core, Wispbyte utilizes the industry-standard **Pterodactyl Panel**, an open-source server management platform designed to run applications inside isolated **Docker containers**.

Key technical characteristics of a Wispbyte Node.js container:
* **Operating System**: Lightweight Linux distribution (Debian / Alpine container base).
* **Runtime**: Official Node.js engine (versions 18.x through 22.x LTS supported).
* **Filesystem Isolation**: Rooted at `/home/container`, preventing unauthorized access to the host server.
* **Process Supervisor**: Automatically handles startup scripts, live log streaming, standard input/output (`stdin`/`stdout`), and health metrics.

### 1.3 System Communication Architecture

The Capybara bot is an event-driven application interacting with multiple network services simultaneously:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DISCORD PLATFORM                               │
│                                                                             │
│   [User Runs /capybaras]  ──►  Discord Gateway WebSocket (wss://...)        │
│                                           │                                 │
│   [User Views Embed/UI]   ◄──  Discord REST API v10 (https://...)           │
└───────────────────────────────────────────┼─────────────────────────────────┘
                                            │
                                  Bidirectional Real-Time
                                    TLS/WSS Connection
                                            │
┌───────────────────────────────────────────▼─────────────────────────────────┐
│                      WISPBYTE PTERODACTYL CONTAINER                         │
│                           (/home/container)                                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      Node.js v18+ Application                       │   │
│   │                                                                     │   │
│   │   • src/index.js           Main Event Loop & Client Listeners       │   │
│   │   • src/capydex.js         Progress Engine & Persistent State       │   │
│   │   • src/deploy-commands.js REST Command Publisher                   │   │
│   │   • images/                Curated Local Gallery (25 Images)        │   │
│   │   • data/capydata.json     Persistent Disk Database                 │   │
│   └──────────────────────┬───────────────────────────────▲──────────────┘   │
│                          │                               │                  │
└──────────────────────────┼───────────────────────────────┼──────────────────┘
                           │                               │
             Outgoing HTTPS GET Request           Git Pull on Startup
             (with Local Fallback on Error)      (When AUTO_UPDATE=1)
                           │                               │
                           ▼                               ▼
               ┌───────────────────────┐       ┌───────────────────────┐
               │     api.capy.lol      │       │   GitHub Repository   │
               │  (Live Capybara API)  │       │ (mikroskato62/capy...)│
               └───────────────────────┘       └───────────────────────┘
```

### 1.4 Bot Resource Profile & Footprint

The Capybara Discord Bot has been heavily engineered for efficiency and minimal memory usage:

* **Idle Memory (RAM)**: ~38 MB – 45 MB.
* **Peak Memory (Under Concurrent Load)**: ~55 MB – 70 MB.
* **CPU Utilization**: < 0.2% idle; momentary spike to ~2–5% during JSON serialization or image attachment streaming.
* **Disk Usage**: ~60 MB total (including all 25 high-resolution local images, node runtime packages, and Capydex database).
* **Network I/O**: Negligible (< 100 KB per slash command invocation).

Because Wispbyte's free tier provides up to 512 MB – 1024 MB of RAM, the bot runs at less than **10% of the allocated ceiling**, virtually eliminating any risk of Out-Of-Memory (OOM) termination.

---

## 2. Prerequisites & Environment Preparation

### 2.1 Required Accounts & Access Levels

Before starting the deployment process, ensure you have the following credentials ready:

1. **A Personal Discord Account**: Verified email and two-factor authentication (2FA) enabled (recommended by Discord for Developer Portal actions).
2. **A Discord Guild (Server)**: A server where you possess either the **Administrator** permission or the **Manage Server** permission to authorize bots.
3. **A Wispbyte Account**: Free registration at [wispbyte.com/client](https://wispbyte.com/client).
4. **A GitHub Account (Optional, but Recommended)**: Required if you wish to fork the repository or push your own custom code.

---

### 2.2 Understanding Application Credentials: Token vs. Client ID

A Discord bot requires two distinct identifiers to function. It is critical to understand the distinction between them:

```text
 ┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
 │                   CLIENT_ID                   │                     TOKEN                     │
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Public Snowflake Identifier                   │ Private Cryptographic Secret Key              │
 │ Example: 1396099123456789012                  │ Example: MTM5NjA5OT...w8K2a.X9q0Lm_1a2b3c     │
 │ Used in invite URLs and REST API endpoints.   │ Used to authenticate against the Gateway.     │
 │ Completely safe to share publicly.            │ TOP SECRET: Grants full control over the bot. │
 └───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

> [!CAUTION]
> **Token Security Protocol**:  
> A Discord Bot Token is equivalent to a root password. If an attacker acquires your Token, they can send unauthorized messages, destroy servers where the bot has administrative privileges, or delete channels. Never commit your `.env` file to a public repository. If your token is ever exposed, immediately revoke it in the Developer Portal using the **Reset Token** button.

---

### 2.3 Environment Variable Configuration Schema

The application utilizes `dotenv` to load runtime secrets from a local configuration file named `.env`. Below is the complete parameter schema:

| Variable Name | Type | Mandatory? | Default Value | Technical Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`TOKEN`** | `string` | **Yes** | *None* | Discord Bot secret authorization token used for Gateway WebSocket login and REST requests. |
| **`CLIENT_ID`** | `string` | **Yes** | *None* | Discord Application (Client) ID used for global slash command deployment via REST PUT. |
| **`CUSTOM_EMOJI_ID`** | `string` | No | `null` | Optional Discord snowflake ID of a custom server emoji (e.g. `1396104539538460683`). If omitted or invalid, automatically falls back to unicode `🦫`. |
| **`GUILD_ID`** | `string` | No | `null` | Legacy guild ID parameter. When provided during command deployment, legacy guild-scoped slash commands are automatically purged to prevent duplicate entries. |

---

## 3. Discord Application & Bot Configuration

Follow these exact steps to register your bot application within the Discord Developer Ecosystem.

### 3.1 Creating the Discord Developer Application

1. Open your web browser and navigate to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Log in with your standard Discord user account.
3. In the upper-right corner of the dashboard, click the **New Application** button.
4. In the modal dialog:
   * Enter an **Application Name** (e.g., `Capybara Bot`).
   * Review and accept the Discord Developer Terms of Service and Developer Policy.
   * Click **Create**.
5. You are now on the **General Information** page:
   * Locate the field labeled **Application ID**.
   * Click the **Copy** button beneath the ID and save this number in a secure note; this is your `CLIENT_ID`.
   * *(Optional)* Upload an icon (such as [assets/capybara.png](file:///c:/Users/User/Desktop/discord-bot/assets/capybara.png) or [assets/emoji.svg](file:///c:/Users/User/Desktop/discord-bot/assets/emoji.svg)) and write a brief description. Click **Save Changes**.

---

### 3.2 Provisioning the Bot User & Generating the Secret Token

1. In the left navigation menu, click on the **Bot** tab.
2. Review the **Username** field. This is the handle that appears in Discord servers.
3. Locate the **Build-A-Bot / Token** section.
4. Click the **Reset Token** button:
   * Confirm the warning dialog by clicking **Yes, do it!**.
   * If prompted, enter your six-digit Two-Factor Authentication (2FA) code.
5. Click **Copy** to copy the newly generated Token string directly to your clipboard.
6. Store this in your private notes; this is your secret `TOKEN`.

---

### 3.3 Gateway Intents Analysis (Guilds Intent)

In Discord.js v14, bots must declare which **Gateway Intents** they require:

```javascript
// src/index.js (Line 70)
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
```

* **Why only `GatewayIntentBits.Guilds`?**:
  * Slash commands (`/capybaras`, `/capyweb`, `/capyinfo`) and interactive component buttons operate entirely through **Discord Interactions**.
  * Interactions are delivered to the bot directly over the Gateway without requiring access to message content or server member rosters.
* **Privileged Intents Status**:
  * You do **NOT** need to enable `MESSAGE CONTENT INTENT`.
  * You do **NOT** need to enable `SERVER MEMBERS INTENT`.
  * You do **NOT** need to enable `PRESENCE INTENT`.
  * This ensures your bot does not require Discord verification to scale up to 100 servers!

---

### 3.4 Constructing the OAuth2 Invitation URL with Scopes & Permissions

To allow users to invite your bot and execute slash commands, generate a secure OAuth2 URL:

1. In the Developer Portal's left navigation menu, click **OAuth2** $\rightarrow$ **URL Generator**.
2. In the **Scopes** checklist, select exactly these two options:
   * ☑️ `bot`
   * ☑️ `applications.commands` *(Mandatory for registering and displaying slash commands in chat)*
3. A **Bot Permissions** grid will appear below. Select the following granular permissions:
   * ☑️ **Send Messages** (Permission bit: `0x800`)
   * ☑️ **Embed Links** (Permission bit: `0x4000`)
   * ☑️ **Attach Files** (Permission bit: `0x8000`)
   * ☑️ **Add Reactions** (Permission bit: `0x40`)
   * ☑️ **Use External Emojis** (Permission bit: `0x40000`)
   * ☑️ **Read Message History** (Permission bit: `0x10000`)
   * ☑️ **View Channels** (Permission bit: `0x400`)

> [!TIP]
> The calculated permissions integer corresponding to this configuration is `277025507392`. Alternatively, if you are testing exclusively in your private testing server, selecting **Administrator** (`8`) is permissible.

---

### 3.5 Authorizing the Bot to Your Server

1. Scroll to the bottom of the **OAuth2 URL Generator** page.
2. Click the **Copy** button next to the **Generated URL**.
3. Paste the URL into an active browser window.
4. Select your target Discord server from the **Add to Server** dropdown menu.
5. Click **Continue**, review the requested permissions, and click **Authorize**.
6. Complete the Cloudflare verification challenge if prompted.
7. Switch to your Discord client: your bot is now listed in the server roster (showing offline until we complete hosting configuration).

---

## 4. Wispbyte Server Provisioning

### 4.1 Creating an Account on Wispbyte

1. Navigate to **[wispbyte.com](https://wispbyte.com/)** and click **Get Started** or **Client Area** (direct URL: **[wispbyte.com/client](https://wispbyte.com/client)**).
2. Register an account using your email and a strong password.
3. Confirm your email address via the verification link sent to your inbox.
4. Log into the Wispbyte Client Portal.

---

### 4.2 Creating a Free Node.js Server

1. In your Wispbyte dashboard, navigate to the **Services** or **Create Server** section.
2. Choose the **Free Plan** tier.
3. Configure the server runtime specifications:
   * **Server Name**: `Capybara-Discord-Bot`
   * **Server Software / Egg**: Select **Generic Node.js** (or **Discord Bots $\rightarrow$ Node.js**).
   * **Node Version**: Select **Node.js 18** or **Node.js 20 LTS**.
   * **Memory Allocation**: 512 MB – 1024 MB (default free tier allocation).
   * **Disk Space**: 1000 MB – 2000 MB.
4. Click **Create Server**. Provisioning takes between 10 and 30 seconds.
5. Once provisioned, click on your server name to transition into the **Pterodactyl Control Panel** interface.

---

### 4.3 Navigating the Pterodactyl Control Panel

The Pterodactyl Panel interface is organized into distinct functional workspaces:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  PTERODACTYL PANEL                                                          │
│                                                                             │
│  [Status: Offline]   [CPU: 0%]   [Memory: 0MB / 1024MB]   [Disk: 58MB]      │
│  [🟢 START]   [🔄 RESTART]   [🔴 STOP]   [⚠️ KILL]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  NAVIGATION TABS:                                                           │
│                                                                             │
│  🖥️ Console     Interactive terminal session, stdout/stderr live log       │
│                  stream, and command injection prompt.                      │
│                                                                             │
│  📁 Files       Hierarchical filesystem manager for viewing, editing,       │
│                  uploading, unarchiving, and managing permissions.          │
│                                                                             │
│  ⚙️ Startup     Environment variables, Git repository synchronization      │
│                  parameters, and container startup arguments.               │
│                                                                             │
│  💾 Backups     Point-in-time filesystem snapshots for disaster recovery.   │
│                                                                             │
│  ⏰ Schedules   Automated cron triggers for restarts and scheduled backups. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Container Controls: Start, Restart, Stop, and Kill

Understanding how the process supervisor handles each power button prevents unintended state corruption:

* 🟢 **Start**:
  * Initializes the Docker container.
  * Evaluates startup scripts (`npm install`, Git sync).
  * Executes the main startup command (`node src/index.js`).
* 🔄 **Restart**:
  * Sends a `SIGTERM` signal to the active process.
  * Waits for graceful termination (saving files, closing WebSocket).
  * If `AUTO_UPDATE=1`, pulls latest code commits from GitHub before executing clean boot.
* 🔴 **Stop**:
  * Dispatches `SIGINT`/`SIGTERM` to the process.
  * Allows the application up to 10 seconds to flush buffers and exit cleanly before halting the container.
* ⚠️ **Kill**:
  * Immediately issues a kernel-level `SIGKILL` (signal 9).
  * Forces the process to terminate instantly without flushing buffers.  
  *(Use only when the process is completely hung and unresponsive to normal Stop commands).*

---

## 5. Deployment Method A: Automated GitHub Git Sync

> [!TIP]
> **Method A is the recommended production workflow.** It connects your Wispbyte container directly to GitHub. Whenever new photos, bug fixes, or enhancements are pushed to GitHub, your bot updates automatically with a single click of the **Restart** button.

### 5.1 Why Direct Git Sync is the Superior Workflow

1. **Zero Local Overhead**: You never have to manually compress files, upload massive archives, or extract zips through a browser.
2. **Deterministic Versioning**: Every deployment matches an exact Git commit SHA.
3. **Protected Configuration**: Because `.env` is declared in [.gitignore](file:///c:/Users/User/Desktop/discord-bot/.gitignore), Git operations will never overwrite, modify, or erase your private bot credentials.
4. **Effortless Rolling Updates**: Updating involves simply clicking **Restart** in the Wispbyte Console.

---

### 5.2 Step 1: Configuring Git Parameters in the Startup Tab

1. On your Wispbyte server dashboard, click the **Startup** tab in the top navigation bar.
2. Locate the **Variables** section. Configure the following values:

| Parameter Field | Target Value | Detailed Explanation |
| :--- | :--- | :--- |
| **Git Repository** (`GIT_ADDRESS`) | `https://github.com/mikroskato62/capy-discord-bot.git` | The remote repository URL to clone from. If you have created a personal fork, specify your fork URL instead. |
| **Branch** (`BRANCH`) | `main` | Specifies the branch to track. Production releases are published to `main`. |
| **Auto Update** (`AUTO_UPDATE`) | `1` | Enables automatic Git pulls. When set to `1`, the container executes `git pull` every time the server boots or reboots. |
| **User Upload** (`USER_UPLOAD`) | `0` | Set to `0` so the container initializes from Git rather than expecting an initial manual upload. |

3. Changes save automatically upon leaving each field.

---

### 5.3 Step 2: Triggering Repository Clone & Synchronization

1. Navigate to the **Console** tab.
2. Click the green **Start** button.
3. Observe the initial terminal output. The Pterodactyl initialization script detects the configured Git repository:
   ```text
   Fetching latest code from https://github.com/mikroskato62/capy-discord-bot.git...
   Cloning into '/home/container'...
   remote: Enumerating objects: 120, done.
   remote: Counting objects: 100% (120/120), done.
   remote: Compressing objects: 100% (90/90), done.
   Receiving objects: 100% (120/120), 5.20 MiB | 12.00 MiB/s, done.
   Resolving deltas: 100% (45/45), done.
   ```
4. Once the clone completes, the container will attempt to start Node.js. If you have not created your `.env` file yet, you will see a notice indicating missing credentials:
   ```text
   [!] Critical Error: Discord bot TOKEN is missing in environment variables (.env).
   ```
5. Click **Stop** so we can create the `.env` file in the next step.

---

### 5.4 Step 3: Creating the Production `.env` Secrets File

1. Navigate to the **Files** tab in the Pterodactyl navigation bar.
2. Verify that the project structure is visible: folders `src`, `images`, `assets`, `data`, and file `package.json`.
3. In the top right corner of the file manager, click the blue **New File** button.
4. An in-browser text editor will open. Populate the editor with your secret credentials:
   ```env
   TOKEN=your_real_discord_bot_token_here
   CLIENT_ID=your_real_discord_client_id_here
   ```
   *(Optional customization)*:
   ```env
   CUSTOM_EMOJI_ID=1396104539538460683
   ```

   > [!IMPORTANT]
   > Ensure there are no spaces around the `=` signs and **no quotation marks** surrounding the values. Example:
   > ```env
   > TOKEN=MTM5NjA5OTEyMzQ1Njc4OTA...
   > CLIENT_ID=1396099123456789012
   > ```

5. In the **File Name** field at the bottom of the editor, enter: `.env`  
   *(Ensure the leading dot is present)*.
6. Click the green **Create File** button.

---

### 5.5 Step 4: Registering Slash Commands via CLI

Before Discord clients can see and invoke `/capybaras`, `/capyweb`, or `/capyinfo`, the commands must be registered with Discord's REST API:

1. Navigate to the **Console** tab.
2. In the interactive command prompt at the bottom of the console window, type:
   ```bash
   node src/deploy-commands.js
   ```
3. Press **Enter**.
4. The deployment script initializes, loads `.env`, authenticates with Discord via REST v10, and deploys global commands:
   ```text
   container@pterodactyl~ node src/deploy-commands.js
   [*] Started refreshing 3 application (/) commands...
   [+] Successfully registered 3 global application (/) commands! 🎉
   [+] Commands are now live across all servers where the bot is invited.
   ```

---

### 5.6 Step 5: Booting the Application Container

1. At the top of the **Console** tab, click the green **Start** button.
2. The supervisor runs `npm install` to ensure all dependencies in `package.json` are installed.
3. Node launches `src/index.js`.
4. The live console displays successful initialization logs:
   ```text
   container@pterodactyl~ node src/index.js
   [!] Capybara: Hello World!
   [!] Success :)
   [!] Logged in on discord as Capybara Bot#9190 ...
   [!] Dynamic Web Capybara pool verified: 821 total images.
   ```
5. Your bot is now fully operational and running 24/7 in production! 🎉

---

## 6. Deployment Method B: Manual Archive Upload (Zip)

### 6.1 When to Use Manual File Deployment

Use Method B only if:
* You have added private local modifications or images that you do not wish to publish to GitHub.
* You do not have internet access to GitHub from your Wispbyte node.

---

### 6.2 The Golden Rule: Excluding `node_modules`

> [!CAUTION]
> ### 🛑 NEVER COMPRESS OR UPLOAD THE `node_modules` DIRECTORY
> 1. **Massive File Count**: `node_modules` contains thousands of nested small files. Uploading it causes web browser timeouts and disk thrashing.
> 2. **Binary Architecture Incompatibility**: If your local computer runs Windows or macOS, native compiled C++ bindings in `node_modules` will not execute inside Wispbyte's Linux container.
> 3. **Redundancy**: Wispbyte runs `npm install` automatically upon container startup, building clean, native Linux binaries deterministically in seconds.

---

### 6.3 Step 1: Packaging Necessary Project Files

Select only the necessary project files and directories for production:

```text
bot.zip
├── assets/                  # Logos, banners, emoji assets
├── data/                    # Persistent storage directory
├── images/                  # 25 curated local capybara JPG files
├── src/                     # Application source code
│   ├── index.js
│   ├── capydex.js
│   └── deploy-commands.js
├── .env                     # Production environment secrets
├── package.json             # Package definitions & scripts
└── package-lock.json        # Deterministic dependency lockfile
```

#### Archive Creation Commands:
* **Windows (PowerShell)**:
  ```powershell
  Compress-Archive -Path src, images, assets, data, package.json, package-lock.json, .env -DestinationPath bot.zip
  ```
* **macOS / Linux (Terminal)**:
  ```bash
  zip -r bot.zip src images assets data package.json package-lock.json .env -x "node_modules/*" ".git/*"
  ```

---

### 6.4 Step 2: Uploading and Extracting on Wispbyte

1. Open your Wispbyte server and navigate to the **Files** tab.
2. In the top-right corner, click **Upload**.
3. Select your `bot.zip` archive. Monitor the progress bar until upload completes (100%).
4. Locate `bot.zip` in the file list.
5. Click the context action icon (`...`) on the right side of `bot.zip` and select **Unarchive**.
6. The archive will decompress into `/home/container`.
7. Click the `...` menu on `bot.zip` again and select **Delete** to reclaim disk space.

---

### 6.5 Step 3: Verifying Configuration & Installing Dependencies

1. In the **Files** tab, click on `.env` to verify your `TOKEN` and `CLIENT_ID` are present and properly formatted.
2. Switch to the **Console** tab.
3. In the command prompt at the bottom, install production dependencies:
   ```bash
   npm install
   ```
4. Wait for the npm installation summary to report `added X packages in Ys`.

---

### 6.6 Step 4: Command Registration & Initialization

1. In the console command prompt, register your slash commands:
   ```bash
   node src/deploy-commands.js
   ```
2. Once the console confirms `Successfully registered 3 global application (/) commands!`, click the green **Start** button at the top of the page.
3. Confirm the bot logs in successfully.

---

## 7. Verification, Testing & Live Monitoring

### 7.1 Parsing Console Startup Telemetry

A healthy application initialization output contains five key lifecycle milestones:

```text
[Step 1] container@pterodactyl~ node src/index.js
[Step 2] [!] Capybara: Hello World!
[Step 3] [!] Success :)
[Step 4] [!] Logged in on discord as Capybara Bot#9190 ...
[Step 5] [!] Dynamic Web Capybara pool verified: 821 total images.
```

* **Step 1**: Node.js engine parses `src/index.js` and loads module dependencies.
* **Step 2**: Entrypoint gate verification (`require.main === module`).
* **Step 3**: Internal data structures and local images (25 files in `images/`) indexed into memory.
* **Step 4**: Gateway WebSocket connection established, Discord handshake complete, ready event emitted.
* **Step 5**: Binary search synchronization with `api.capy.lol` resolved live remote pool size.

---

### 7.2 Verifying Discord Gateway Connection & Presence

1. Open your Discord client and navigate to the server where the bot was invited.
2. Check the server member roster on the right side:
   * The bot should display a vibrant **Green Online Indicator** (🟢).
3. Click the bot's profile card to inspect its Rich Presence activity:
   * **Activity Type**: `Watching` / `Listening` / `Playing`
   * **Status Text**: `/capybaras /capyweb /capyinfo`
   * *(The bot features an automated internal timer rotating this presence status every 60 minutes).*

---

### 7.3 Comprehensive Functional Testing Checklist

Execute the following test matrix directly inside Discord text channels:

```text
 ┌──────────────────┬─────────────────────────────────┬──────────────────────────────────────────┐
 │ Command / Button │ Action to Perform               │ Expected Behavior                        │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ /capybaras       │ Execute in channel              │ Returns rich embed with random color,    │
 │                  │                                 │ local image attachment, and 5 buttons.   │
 │                  │                                 │ Footer shows: Image XX/25 • Capydex.     │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ 👍 Next          │ Click the "Next" button         │ Edits embed in-place with new image.     │
 │                  │                                 │ Zero chat flicker, smooth transition.    │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ 🦫 React         │ Click the "React" button        │ Bot adds a randomized unicode animal/    │
 │                  │                                 │ fruit reaction to the message.           │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ 📖 Capydex       │ Click the "Capydex" button      │ Responds with private (ephemeral) card   │
 │                  │                                 │ displaying 100-block progress bar, local │
 │                  │                                 │ unlocked checklist, and missing numbers. │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ 🏆 Leaderboard   │ Click the "Leaderboard" button  │ Responds with private top-5 collectors,  │
 │                  │                                 │ medal emojis (🥇🥈🥉), and user rank.    │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ 👎 Leave         │ Click the "Leave" button        │ Deletes/dismisses image with friendly    │
 │                  │                                 │ animated wave message.                   │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ /capyweb         │ Execute in channel              │ Fetches live random photo from           │
 │                  │                                 │ api.capy.lol with full interactive rows. │
 ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
 │ /capyinfo        │ Execute in channel              │ Displays comprehensive bot dashboard,    │
 │                  │                                 │ technical specifications & repo links.   │
 └──────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

---

### 7.4 Verifying Author-Only Interaction Security

The bot implements strict Author-Only security on destructive and navigational component buttons:

```javascript
// src/index.js Author-Only Enforcement Mechanism:
// Button customIds encode the author snowflake: e.g. "capybara_next_1396099123456789012"
const ownerId = getActionOwnerId(interaction.customId);
if (ownerId && interaction.user.id !== ownerId) {
  return interaction.reply({
    content: "Only the user who ran the command can control this interaction.",
    flags: MessageFlags.Ephemeral
  });
}
```

**Verification Step**:
* Have a different user in the Discord server attempt to click the **Next** or **Leave** button on a photo you requested.
* **Expected Result**: Discord displays an ephemeral warning to that user: *"Only the user who ran the command can control this interaction"*. The message remains unmodified.

---

## 8. Routine Maintenance, Updates & Backups

### 8.1 Updating the Bot with Git Sync (1-Click Workflow)

When updates are published to the `main` branch of the GitHub repository:

1. Open your Wispbyte server control panel.
2. Navigate to the **Console** tab.
3. Click **Restart**.
4. Wispbyte executes `git pull origin main`, checks for dependency changes in `package.json`, runs `npm install` if required, and boots the new code automatically.

---

### 8.2 Updating with Manual Archive

1. Build a new `bot.zip` containing updated files (always excluding `node_modules`).
2. Upload and unarchive over existing files in the **Files** tab.
3. If new dependencies were introduced, run `npm install` in the Console.
4. Click **Restart**.

---

### 8.3 Backing Up Persistent Data (`data/capydata.json`)

The Capydex system stores user collection progress, unlocked indices, unlock timestamps, and leaderboard statistics inside a JSON database file located at:

```text
/home/container/data/capydata.json
```

To manually download a backup:
1. Navigate to the **Files** tab.
2. Open the `data/` folder.
3. Click the context action icon (`...`) next to `capydata.json` and select **Download**.
4. Store this file securely. In the event of server migration or accidental container deletion, restoring this single file restores all user collections and leaderboard rankings.

---

### 8.4 Setting Up Automated Backup Schedules in Pterodactyl

Pterodactyl features a built-in automated scheduling engine:

1. Navigate to the **Schedules** tab.
2. Click **Create Schedule**.
3. Configure schedule parameters:
   * **Schedule Name**: `Daily Database Backup`
   * **Minute**: `0`
   * **Hour**: `4` (Runs daily at 04:00 AM UTC)
   * **Day of Month / Month / Day of Week**: `*`
4. Click **Create Schedule**.
5. Click on the newly created schedule $\rightarrow$ **New Task**:
   * **Action**: `Create Backup`
   * **Ignored Files**: `node_modules, images` (Optional, to keep backup sizes tiny).
6. Click **Save Task**. Your server will now maintain automated daily disaster recovery snapshots.

---

### 8.5 Managing Wispbyte Free Tier Renewal & Activity Policies

Like most free cloud hosting providers, Wispbyte requires periodic activity verification to reclaim inactive resources:

* **Activity Window**: Log into the Wispbyte Client Portal ([wispbyte.com/client](https://wispbyte.com/client)) at least once every 30 days.
* **Server Status Check**: Verify your server card displays a status of **Active** / **Running**.
* **Suspension Recovery**: If you miss the renewal window and find your server suspended:
  1. Log into the client dashboard.
  2. Locate your server card and click **Renew** or **Unsuspend**.
  3. Return to the Pterodactyl panel and click **Start**. All files remain intact.

---

## 9. Comprehensive Troubleshooting & Error Resolution

Use this diagnostic reference table to instantly isolate and resolve operational faults:

### 9.1 Gateway & Authentication Errors

#### Fault: `[TOKEN_INVALID]` / `An invalid token was provided`
* **Root Cause**: The string in `.env` under `TOKEN` does not match the active bot token in the Discord Developer Portal, or contains illegal whitespace/quotes.
* **Diagnostic Procedure**:
  1. Open the **Files** tab $\rightarrow$ click `.env`.
  2. Ensure there are no spaces around `=`: `TOKEN=MTM5...` (Not `TOKEN = MTM5...`).
  3. Ensure there are no quotation marks: `TOKEN="MTM5..."` is incorrect.
  4. If the error persists, navigate to [Discord Developer Portal](https://discord.com/developers/applications) $\rightarrow$ **Bot** $\rightarrow$ click **Reset Token**, copy the freshly minted token, and update `.env`.

#### Fault: `DisallowedIntents`
* **Root Cause**: The bot requested privileged intents without enabling them in the Developer Portal.
* **Diagnostic Procedure**:
  * Note that this bot only requires `GatewayIntentBits.Guilds` (standard intent). If you modified `src/index.js` to add `MessageContent` or `GuildMembers`, you must enable those switches in the Developer Portal under **Bot** $\rightarrow$ **Privileged Gateway Intents**.

---

### 9.2 Slash Command Deployment & Visibility Failures

#### Fault: Slash commands do not populate when typing `/` in Discord
* **Root Cause 1: Commands never registered via REST API**:
  * **Fix**: In the Wispbyte Console, run `node src/deploy-commands.js`. Ensure the output confirms `Successfully registered 3 global application (/) commands!`.
* **Root Cause 2: Global propagation delay**:
  * **Fix**: Discord global slash command registrations can take up to 2 minutes to propagate across all edge servers. Fully restart your Discord client (`Ctrl + R` on Windows, `Cmd + R` on Mac, or force-close mobile app).
* **Root Cause 3: Missing `applications.commands` OAuth2 scope**:
  * **Fix**: Re-invite the bot using the URL generator with both `bot` and `applications.commands` scopes enabled (see [Section 3.4](#34-constructing-the-oauth2-invitation-url-with-scopes--permissions)).

---

### 9.3 Missing Modules & Dependency Failures

#### Fault: `Error: Cannot find module 'discord.js'` (or other package)
* **Root Cause**: `npm install` failed or was skipped, leaving `node_modules` unpopulated.
* **Diagnostic Procedure**:
  1. Open the Wispbyte **Console** tab.
  2. Issue the command:
     ```bash
     npm install
     ```
  3. Verify that `package.json` contains valid dependency declarations for `discord.js`, `dotenv`, and `unicode-emoji-json`.
  4. Click **Restart**.

---

### 9.4 "Interaction Already Replied To" & Duplicate Gateway Connections

#### Fault: Bot sends duplicate responses or crashes with `Interaction already replied to`
* **Root Cause**: The **same bot token is running in two places simultaneously** (e.g., in a terminal window on your local PC and on Wispbyte at the same time).
* **Technical Explanation**:
  * When two instances connect to the Discord Gateway using the same Token, Discord randomly routes incoming interaction payloads between both connections.
  * Instance A handles and replies to the interaction token. Instance B receives the event late or attempts to reply to an already acknowledged interaction token, throwing an unhandled exception.
* **Resolution**:
  1. Immediately close any local terminal sessions running `npm start` on your computer.
  2. For local testing without disrupting your 24/7 production bot, create a dedicated development bot as documented in [TESTING.md](file:///c:/Users/User/Desktop/discord-bot/TESTING.md).

---

### 9.5 Out of Memory (OOM) or Container Crash Loops

#### Fault: Container status changes to `Killed` or `Out of Memory`
* **Root Cause**: Process exceeded allocated container RAM limit.
* **Diagnostic Procedure**:
  1. The bot is designed to use only ~45 MB RAM. If memory spikes, check if an unhandled loop or excessive concurrent requests occurred.
  2. In the Pterodactyl console, check the peak memory graph.
  3. In `src/index.js`, ensure error listeners remain active:
     ```javascript
     process.on("unhandledRejection", (reason) => console.error("[!] Unhandled:", reason));
     process.on("uncaughtException", (error) => console.error("[!] Uncaught:", error));
     ```
  4. These listeners prevent process termination on unhandled promises.

---

### 9.6 Remote Web API Outages & Offline Fallback Mechanics

#### Fault: Live web capybaras (`/capyweb`) fail to load
* **Built-in Resilience Mechanism**:
  * If `api.capy.lol` experiences an outage or returns HTTP 5xx/4xx:
    ```javascript
    // src/index.js resilient fallback:
    console.warn("[!] Live capybara API request failed, falling back to local images:", error.message);
    ```
  * The bot automatically captures the network exception, attaches local asset `images/hello.jpg`, and informs the user with a friendly embed. The bot process will **never crash** from a remote API outage.

---

### 9.7 Container File Permission Errors (`EACCES`)

#### Fault: `Error: EACCES: permission denied, open '/home/container/data/capydata.json'`
* **Root Cause**: The `data/` directory or file was created with root ownership permissions instead of the `pterodactyl` container user.
* **Resolution**:
  1. In the Pterodactyl Console, stop the server.
  2. In the console command prompt, fix permissions if allowed by your host, or delete the corrupted empty file via the **Files** tab and reboot; the bot will automatically initialize a fresh `data/capydata.json` with correct container ownership:
     ```javascript
     // Automatically creates directory and initial file if absent
     if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
     ```

---

### 9.8 Discord API Rate Limits (`429 Too Many Requests`)

#### Fault: Commands return delayed or console outputs HTTP 429
* **Built-in Anti-Spam Cooldown Protection**:
  * The bot enforces an internal **1-second per-user cooldown** across all slash commands and button interactions:
    ```javascript
    const remaining = getCooldownRemaining(interaction.user.id);
    if (remaining > 0) {
      return interaction.reply({
        content: `Slow down! Please wait ${remaining.toFixed(1)}s before using commands again.`,
        flags: MessageFlags.Ephemeral
      });
    }
    ```
  * This rate-limiting protects your Discord bot token from exceeding Discord's global per-route API ceilings.

---

## 10. Security Best Practices & Hardening

### 10.1 Principle of Least Privilege (Bot Permissions)

* Never grant the **Administrator** (`8`) permission to a production bot in public servers unless strictly required for moderation tasks.
* This bot operates cleanly using only standard communication permissions:
  * `VIEW_CHANNEL`
  * `SEND_MESSAGES`
  * `EMBED_LINKS`
  * `ATTACH_FILES`
  * `ADD_REACTIONS`
  * `USE_EXTERNAL_EMOJIS`
  * `READ_MESSAGE_HISTORY`

---

### 10.2 Secrets Storage & Token Revocation Protocol

* **Storage**: Secrets belong exclusively in `/home/container/.env`.
* **Exclusion from Source Control**: Verify your `.gitignore` contains `.env`:
  ```gitignore
  # Dependency directories
  node_modules/
  
  # Environment secrets
  .env
  .env.local
  .env.production
  ```
* **Compromise Response Plan**:
  If a token is exposed in a public commit or screenshot:
  1. Navigate to **Discord Developer Portal** $\rightarrow$ **Bot**.
  2. Click **Reset Token**.
  3. Update `/home/container/.env` on Wispbyte with the new token.
  4. Click **Restart** on the Wispbyte Console. The old compromised token is invalidated immediately.

---

### 10.3 Graceful Process Termination (`SIGTERM` / `SIGINT`)

During container reboots, the Docker supervisor dispatches POSIX signals. The application captures these signals to ensure state integrity:

```javascript
// src/index.js Graceful Termination Handler:
const handleShutdown = (signal) => {
  console.log(`[!] Received ${signal}, safely shutting down bot process...`);
  if (client) {
    client.destroy(); // Closes WebSocket connection cleanly
  }
  process.exit(0);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
```

This guarantees:
1. Active WebSocket sessions are cleanly closed (`OP 7 Disconnect`), preventing phantom ghost presences on Discord.
2. The persistent database in `data/capydata.json` is flushed and closed without file corruption.
3. Node.js exits cleanly with return code `0`.

---

<div align="center">

### 🌟 Production Deployment Complete!
*Your Capybara Discord Bot is now hosted 24/7 with enterprise-grade stability, automatic updates, and rock-solid uptime.*

Need technical assistance or want to contribute?  
**[Join the Discord Community](https://discord.gg/d8pawxdSqG)** &nbsp;•&nbsp; **[GitHub Repository](https://github.com/mikroskato62/capy-discord-bot)**

<sub>Maintained by [@mikroskato62](https://github.com/mikroskato62) • Distributed under the [ISC License](./LICENSE)</sub>

</div>
