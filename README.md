# Hermes X Posting Skill Guide

Public-safe guide for scheduling X/Twitter posts with Chrome DevTools Protocol (CDP) browser automation instead of the official API.

This repo is a cleaned-up version of an internal Hermes workflow. It intentionally excludes account-specific details, local machine paths, login state, exports, secrets, and any private automation context.

## What Is Included

- `SKILL.md`: a reusable skill-style guide
- `examples/schedule-posts.example.cjs`: a generic CDP automation example
- `examples/posts.example.json`: sample input format
- `SECURITY.md`: privacy and publishing checklist

## What Is Not Included

- Cookies, session tokens, browser profile data, or saved logins
- Email addresses, API keys, passwords, or GitHub tokens
- Private content calendars or production post files
- Personal account handles, internal repo names, or local-only paths

## How The Workflow Works

1. Start Chrome with remote debugging enabled.
2. Log into X manually in that browser session.
3. Connect to the active X tab over CDP.
4. Open the post composer.
5. Insert post text.
6. Open the schedule dialog.
7. Set the month, day, year, hour, minute, and AM/PM values.
8. Confirm and schedule the post.

## Setup

Use a dedicated local Chrome profile for automation work so you never publish personal browsing data.

```bash
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$PWD/chrome-profile"
```

Install the one runtime dependency:

```bash
npm install ws
```

Run the example:

```bash
node examples/schedule-posts.example.cjs examples/posts.example.json
```

## Input Format

```json
{
  "posts": [
    {
      "text": "Example post text",
      "date": "2026-05-01",
      "time": "09:00"
    }
  ]
}
```

Times in the example are interpreted as local browser time. If you need a different timezone, convert your schedule before running the script.

## Reliability Notes

- X is a React app, so `<select>` values should be changed with an event dispatch, not only by setting `.value`.
- The schedule dialog currently exposes six `<select>` elements in a stable order, but that can change at any time.
- `data-testid` selectors are more reliable than button text alone.
- Fresh browser sessions are safer than long-lived CDP sessions.
- Browser automation can break when X changes its UI.

## Safety Rules

- Only add scheduled posts. Do not bulk-delete existing scheduled posts through automation.
- Review content manually before scheduling.
- Keep real post files out of git unless they are explicitly meant to be public.
- Respect X platform rules and your own account security practices.

## Disclaimer

This is an educational guide for browser automation. Use it responsibly and verify it against the current X interface before relying on it in production.
