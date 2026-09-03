# Security Policy

## 🛡️ Supported Versions

We actively provide security updates and bug fixes for the current latest version of the Capybara Discord Bot:

| Version | Supported          |
| :---:   | :---:              |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** create a public GitHub Issue. Publicly disclosing a vulnerability can put all active instances of the bot at risk.

Instead, please report it privately:

1. **Email:** Contact the maintainer directly at the security contact address or via private Discord message.
2. **Discord:** Join the [Weboardies™ Discord Server](https://discord.gg/d8pawxdSqG) and reach out to `@mikroskato62` via direct message or private staff ticket.

Please include:
* A detailed description of the vulnerability.
* Steps to reproduce the issue (proof of concept, payload, or affected endpoint).
* Potential impact and any suggested mitigations.

You will receive an acknowledgement within 48 hours, and we will work with you to test and deploy a fix promptly.

---

## 🔑 Discord Bot Token Security Notice

* **Never share your Discord Bot Token.** The bot authentication token provides full administrative control over your Discord bot application.
* **Keep `.env` private:** Ensure your `.env` file is listed in `.gitignore` and never committed or posted in issues, PRs, or public pastebins.
* **If your token is leaked:**
  1. Immediately visit the [Discord Developer Portal](https://discord.com/developers/applications).
  2. Select your Application $\rightarrow$ **Bot**.
  3. Click **Reset Token**.
  4. Update your local `.env` and hosting environment variables with the new token.
