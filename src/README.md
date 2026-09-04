# 📂 Capybara Discord Bot — `src/` Source Code Workspace

This directory contains the refactored, modular architecture for the Capybara Discord Bot.

---

## 🏗️ Architecture Overview

```text
src/
├── commands/               # Slash command definitions & execution handlers
│   ├── capybaras.js        # /capybaras command
│   ├── capyweb.js          # /capyweb command
│   ├── capyinfo.js         # /capyinfo command
│   └── index.js            # Command registry, collection loader & export
├── components/             # Discord UI components & action rows
│   └── buttons.js          # Interactive button row builders
├── config/                 # Centralized configuration & environment setup
│   └── index.js            # Paths, emojis, and default parameters
├── events/                 # Discord gateway event handlers
│   ├── ready.js            # ClientReady event (login, pool probe, presence)
│   ├── interactionCreate.js# Interaction routing (commands & buttons)
│   └── index.js            # Gateway event registration engine
├── interactions/           # Interaction business logic
│   └── buttons.js          # Button handlers (capydex, react, leaderboard, leave)
├── services/               # Core domain services & business subsystems
│   ├── capydex.js          # Storage, user tracking, embeds & leaderboard
│   ├── capybaraData.js     # Curated local photos, live web fetcher & info embed
│   └── reactions.js        # Cooldown manager, emoji selector & owner guard
├── capydex.js              # Backward-compatibility bridge to services/capydex.js
├── deploy-commands.js      # Standalone slash command registration CLI script
└── index.js                # Application entry point, orchestrator & unified exports
```

---

## 🧩 Module Responsibilities

| Directory / File | Description |
| :--- | :--- |
| [`config/`](file:///c:/Users/User/Desktop/discord-bot/src/config/index.js) | Centralized environment configuration, paths (`data`, `images`, `assets`), and default parameters. |
| [`commands/`](file:///c:/Users/User/Desktop/discord-bot/src/commands/index.js) | Modular slash command definitions and handlers (`/capybaras`, `/capyweb`, `/capyinfo`). |
| [`components/`](file:///c:/Users/User/Desktop/discord-bot/src/components/buttons.js) | Builders for Discord `ActionRowBuilder` button components. |
| [`events/`](file:///c:/Users/User/Desktop/discord-bot/src/events/index.js) | Discord.js event listeners (`ClientReady`, `InteractionCreate`, `Error`, `Warn`). |
| [`interactions/`](file:///c:/Users/User/Desktop/discord-bot/src/interactions/buttons.js) | Handler functions for interactive button clicks and author security guards. |
| [`services/`](file:///c:/Users/User/Desktop/discord-bot/src/services/) | Subsystems for Capydex collections, media generation, and anti-spam cooldowns. |
| [`deploy-commands.js`](file:///c:/Users/User/Desktop/discord-bot/src/deploy-commands.js) | Standalone deployment script for registering slash commands via Discord REST API. |
| [`index.js`](file:///c:/Users/User/Desktop/discord-bot/src/index.js) | Main bot entry point, gateway client lifecycle, shutdown handlers, and export interface. |

---

## 🎨 Code Conventions & Style Guide

All JavaScript files in `src/` follow the styling established in `archive/code.js`:
- **Header & Footer**: Every file includes the `@mikroskato62` header comment block and closing signature.
- **Section Markers**: Major blocks are demarcated with `// [#N] Title ...`.
- **Brace Placement**: Allman bracket formatting (opening brace `{` placed on a new line for multi-line blocks and functions).
- **Indentation**: Exactly 2 spaces.
- **Quotes**: Double quotes `"` for strings.
- **Console Output**: Consistent logging tags (`[!] Capybara: ...`, `[!] Warning: ...`, `[!] Error: ...`).
