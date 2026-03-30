# Usage Guide

## Getting Started

1. Open the bot in Telegram.
2. Send `/start`.
3. Add a feed with `/add <name> <url>`.

Example:

```text
/add tech https://example.com/feed.xml
/add python https://www.reddit.com/r/Python/.rss
```

## Public Commands

### Basic

- `/start`
- `/help`
- `/ping`

### Feed Management

- `/add <name> <url>`
- `/list`
- `/remove <name>`
- `/enable <name>`
- `/disable <name>`
- `/discover <url>`
- `/status`

### Filters

Use `/filters` with subcommands:

- `/filters list <feed_name>`
- `/filters add <feed_name> <include|exclude> <pattern> [regex]`
- `/filters remove <feed_name> <filter_id>`
- `/filters clear <feed_name>`
- `/filters test <include|exclude> <pattern> <sample_text> [regex]`
- `/filters stats <feed_name>`

### Templates

Use `/template` with subcommands:

- `/template preview <template>`
- `/template examples`
- `/template variables`

### Statistics

- `/stats`

## What `/discover` Does

`/discover` tries several strategies against a website:

- HTML `<link rel="alternate">`
- common feed paths
- WordPress patterns
- Blogger patterns

If it finds feeds, it shows the candidate URLs and a ready-to-copy `/add` example.

## What `/status` Shows

`/status` is an alias for the internal `feedstatus` command. It reports:

- total feeds
- enabled vs disabled
- recurring jobs found in Redis
- last check and last notification timestamps
- feeds missing scheduled jobs

## Feed Input Behavior

When you add a feed, the bot may:

- keep the URL as-is if it is already a feed
- normalize Reddit subreddit URLs to the public `/.rss` endpoint
- convert supported URLs such as YouTube
- discover a feed automatically from a website

## Hidden or Debug Commands

Some commands exist for debugging or admin workflows, such as `debugfeed`, `reloadfeeds`, `resetfeed` and internal reset commands. They are not part of the normal user flow.
