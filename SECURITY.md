# Security And Privacy Checklist

Use this checklist before publishing or sharing changes from this repo.

## Never Commit

- Browser profile folders
- Cookies, session storage, or login exports
- `.env` files
- API keys or access tokens
- Personal email addresses
- Account handles that should stay private
- Real production posting calendars unless they are intentionally public

## Before Pushing

1. Search for emails:

```bash
rg -n "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}" -i .
```

2. Search for common token patterns:

```bash
rg -n "ghp_|gho_|sk-|api[_-]?key|secret|token|password" -i .
```

3. Search for machine-specific paths:

```bash
rg -n "/Users/|C:\\\\Users\\\\|/Volumes/" .
```

4. Review `git diff --cached` before every public push.

## Recommended Practice

- Use a throwaway automation profile instead of a personal browser profile.
- Keep real post files outside the repo or in ignored local-only files.
- Treat CDP browser automation as sensitive because it operates inside a logged-in session.
