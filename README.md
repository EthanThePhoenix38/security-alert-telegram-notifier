# 🔐 Security Alert Telegram Notifier

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GitHub release](https://img.shields.io/github/v/release/EthanThePhoenix38/security-alert-telegram-notifier)](https://github.com/EthanThePhoenix38/security-alert-telegram-notifier/releases)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?logo=telegram&logoColor=white)](https://telegram.org/)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen?logo=dependabot)](https://github.com/dependabot)
[![CodeQL](https://img.shields.io/badge/CodeQL-enabled-blue?logo=github)](https://codeql.github.com/)
[![Security](https://img.shields.io/badge/Security-hardened-yellow?logo=security)](https://github.com/EthanThePhoenix38/security-alert-telegram-notifier/security)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

GitHub Action that monitors security events (Dependabot alerts, CodeQL, etc.) and sends customizable notifications to Telegram channels

## 📋 Table of Contents
- [How to Use](#how-to-use)
- [Step-by-Step Setup](#step-by-step-setup)
- [Configuration Examples](#configuration-examples)
- [Available Options](#available-options)

---

## 🚀 How to Use

This GitHub Action sends notifications to Telegram when security events occur in your repository (Dependabot alerts, CodeQL scans, secret scanning, etc.).

---

## 📝 Step-by-Step Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send the command `/newbot`
3. Follow the instructions to choose a name and username for your bot
4. **Save the token** you receive (format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Chat ID

**For a personal chat:**
1. Send any message to your bot
2. Open this URL in your browser (replace `YOUR_TOKEN` with your bot token):
   ```
   https://api.telegram.org/botYOUR_TOKEN/getUpdates
   ```
3. Look for `"chat":{"id":123456789}` in the response
4. **Save this number** as your chat ID

**For a channel:**
1. Add your bot as an administrator to your channel
2. Send a message in the channel
3. Use the same URL as above to get the chat ID
4. Channel IDs start with `-100` (e.g., `-1001234567890`)

Or simply use your channel username: `@your_channel_name`

### Step 3: Add Secrets to Your Repository

1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** Your bot token from Step 1
4. Click **New repository secret** again and add:
   - **Name:** `TELEGRAM_CHAT_ID`
   - **Value:** Your chat ID from Step 2

### Step 4: Create a Workflow File

Create a file `.github/workflows/security-notifications.yml` in your repository:

```yaml
name: Security Alert Notification

on:
  dependabot_alert:
    types: [created, reopened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Telegram notification
        uses: EthanThePhoenix38/security-alert-telegram-notifier@v1
        with:
          telegram-token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram-chat-id: ${{ secrets.TELEGRAM_CHAT_ID }}
          message: |
            🚨 Security Alert Detected!
            Repository: ${{ github.repository }}
            Event: ${{ github.event.action }}
```

**That's it!** You will now receive Telegram notifications when Dependabot detects security vulnerabilities.

---

## 💡 Configuration Examples

### Example 1: Dependabot Alerts Only

```yaml
name: Dependabot Security Alerts
on:
  dependabot_alert:
    types: [created, reopened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on Dependabot alert
        uses: EthanThePhoenix38/security-alert-telegram-notifier@v1
        with:
          telegram-token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram-chat-id: ${{ secrets.TELEGRAM_CHAT_ID }}
          message: |
            🚨 **Dependabot Alert**
            Repository: ${{ github.repository }}
            Alert: ${{ github.event.alert.security_advisory.summary }}
            Severity: ${{ github.event.alert.security_vulnerability.severity }}
```

### Example 2: Silent Notifications (for Auto-Merge)

Perfect for automated workflows where you don't want sound/vibration:

```yaml
name: Auto-merge with Silent Notification
on:
  pull_request:
    types: [opened]

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-merge PR
        run: gh pr merge --auto --squash "${{ github.event.pull_request.html_url }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Silent notification
        uses: EthanThePhoenix38/security-alert-telegram-notifier@v1
        with:
          telegram-token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram-chat-id: ${{ secrets.TELEGRAM_CHAT_ID }}
          disable-notification: 'true'
          message: "✅ Auto-merged: ${{ github.event.pull_request.title }}"
```

### Example 3: CodeQL Security Scanning

```yaml
name: CodeQL Security Scan
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # Every Monday

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
      
      - name: Perform Analysis
        uses: github/codeql-action/analyze@v3
      
      - name: Notify if vulnerabilities found
        if: failure()
        uses: EthanThePhoenix38/security-alert-telegram-notifier@v1
        with:
          telegram-token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram-chat-id: ${{ secrets.TELEGRAM_CHAT_ID }}
          parse-mode: 'HTML'
          message: |
            <b>⚠️ CodeQL Found Issues</b>
            Repository: ${{ github.repository }}
            Branch: ${{ github.ref }}
```

### Example 4: Multiple Security Events

```yaml
name: All Security Events
on:
  dependabot_alert:
    types: [created, reopened]
  code_scanning_alert:
    types: [created, reopened]
  secret_scanning_alert:
    types: [created, reopened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send notification
        uses: EthanThePhoenix38/security-alert-telegram-notifier@v1
        with:
          telegram-token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram-chat-id: ${{ secrets.TELEGRAM_CHAT_ID }}
          message: |
            🔔 Security Event: ${{ github.event_name }}
            Repository: ${{ github.repository }}
            Action: ${{ github.event.action }}
```

---

## ⚙️ Available Options

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `telegram-token` | **Yes** | - | Your Telegram bot token (use secrets!) |
| `telegram-chat-id` | **Yes** | - | Chat ID or channel name |
| `message` | No | Default message | Custom message (supports GitHub variables) |
| `disable-notification` | No | `false` | Send silently without sound (`true` or `false`) |
| `parse-mode` | No | `Markdown` | Format: `Markdown`, `MarkdownV2`, or `HTML` |
| `disable-web-preview` | No | `true` | Disable link previews (`true` or `false`) |

---

## 🎯 Tips

- ✅ **Always use GitHub Secrets** for your bot token and chat ID
- ✅ Use `disable-notification: 'true'` for auto-merge workflows to avoid notification spam
- ✅ Test your bot by sending a simple message first
- ✅ You can use `parse-mode: 'HTML'` for richer formatting options

---

## 🤝 Support This Project

If this action helps secure your projects:
- ⭐ **Star this repository**
- 🔀 **Fork it** to customize for your needs
- 🐛 **Report issues** to help improve it

---

**Professional page:** [https://thephoenixagency.github.io](https://thephoenixagency.github.io)
