# 🛡️ Security Policy

## ⚙️ Supported Versions

We actively provide security patches and bug fixes for the current release of the Capybara Discord Bot:

| Version | Supported |
| :---: | :---: |
| 1.0.x | :white_check_mark: |
| < 1.0 | :x: |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or sensitive bug, please **DO NOT** create a public GitHub Issue. \
Publicly disclosing vulnerabilities puts active bot instances at risk.

Instead, please report it privately through either of these channels:

&nbsp;1. **GitHub Security Advisory:** Submit a private report via the repository's **[Security Advisories](https://github.com/mikroskato62/capy-discord-bot/security/advisories/new)** tab. \
&nbsp;2. **Discord:** Join the **[Discord Server](https://discord.gg/d8pawxdSqG)** and reach out directly to `@mikroskato62` via direct message or private staff ticket.

### What to Include:
&nbsp;• &nbsp; A clear summary of the vulnerability. \
&nbsp;• &nbsp; Step-by-step instructions or proof of concept to reproduce it. \
&nbsp;• &nbsp; Affected files, endpoints, or slash commands. \
&nbsp;• &nbsp; Potential impact and any suggested mitigations.

You will receive an acknowledgment within 48 hours, and we will collaborate on testing and deploying a fix promptly.

---

## 🔑 Discord Bot Token Security Notice

&nbsp;• &nbsp; **Never share your bot token:** The bot token grants full control over your Discord bot application. \
&nbsp;• &nbsp; **Keep `.env` private:** Ensure your `.env` file is listed in `.gitignore` and never committed or shared publicly. \
&nbsp;• &nbsp; **If your token is ever exposed:** \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. Visit the **[Discord Developer Portal](https://discord.com/developers/applications)**. \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. Select your Application → **Bot**. \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. Click **Reset Token**. \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. Update your local `.env` and host environment variables immediately.

---

<div align="center">
  <sub>Built with ❤️ for 🦫 by @mikroskato62</sub>
</div>
