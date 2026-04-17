---
name: hermes-x-posting-guide
description: Schedule X/Twitter posts through Chrome CDP browser automation without requiring the X API.
category: social-media
triggers:
  - schedule x posts
  - schedule tweets
  - post on x
  - twitter browser automation
---

# Hermes X Posting Guide

Use Chrome DevTools Protocol to automate post scheduling in a logged-in X browser session.

## Prerequisites

- Chrome or Chromium running with remote debugging enabled
- A logged-in X tab open in that browser session
- Node.js
- The `ws` package installed

## Core Flow

1. Find the active X tab from the local CDP target list.
2. Connect over WebSocket to that tab.
3. Open the composer with the `SideNav_NewTweet_Button` selector.
4. Focus the editor and insert post text.
5. Open the scheduler via `scheduleOption`.
6. Set the six scheduling selects in order.
7. Confirm the schedule.
8. Click the final schedule button.

## Scheduling Select Order

- `[0]` month
- `[1]` day
- `[2]` year
- `[3]` hour
- `[4]` minute
- `[5]` AM/PM

Always select by index, not by generated element ID.

## Important UI Details

- Generated `SELECTOR_*` IDs are not stable.
- The confirm control is commonly available as `scheduledConfirmationPrimaryAction`.
- The final submit button is often `tweetButton` or `tweetButtonInline`.
- When the schedule is valid, the submit button text typically changes to `Schedule`.

## Implementation Guidance

React-backed selects usually need both:

```javascript
select.value = nextValue;
select.dispatchEvent(new Event("change", { bubbles: true }));
```

For text insertion, focus the editor first and then insert the post text in-page rather than trying to synthesize every keystroke.

## Hard Rules

- Use a dedicated automation browser profile.
- Keep login state local and out of source control.
- Only add new scheduled posts through automation.
- Restart the browser session if the CDP connection becomes stale.
- Validate future timestamps before opening the schedule dialog.

## Gotchas

- The X UI changes often.
- Old tabs and long sessions can cause stale automation behavior.
- Inline shell escaping can break DOM scripts; use a real `.cjs` file for anything non-trivial.
- The browser's local timezone affects the values shown in the scheduler.

## Reference Files

- `README.md`
- `examples/schedule-posts.example.cjs`
- `examples/posts.example.json`
- `SECURITY.md`
