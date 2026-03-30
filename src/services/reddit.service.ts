import { sanitizeUrl } from '../utils/url-sanitizer.js';

export class RedditService {
  private readonly canonicalBaseUrl = 'https://www.reddit.com';

  /**
   * Check if URL points to an official Reddit subreddit path.
   */
  isRedditUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      if (hostname.includes('reddit.com.br')) {
        return false;
      }

      const isOfficialReddit =
        hostname === 'reddit.com' ||
        hostname === 'www.reddit.com' ||
        hostname.endsWith('.reddit.com');

      const hasSubreddit = urlObj.pathname.startsWith('/r/') || urlObj.pathname.includes('/r/');

      return isOfficialReddit && hasSubreddit;
    } catch {
      return false;
    }
  }

  /**
   * Extract subreddit name from a Reddit URL.
   */
  extractSubreddit(url: string): string | null {
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) {
      return null;
    }

    try {
      const urlObj = new URL(sanitizedUrl);
      const match = urlObj.pathname.match(/\/r\/([a-zA-Z0-9_]+)/i);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Normalize any subreddit URL to Reddit's public RSS endpoint.
   */
  normalizeFeedUrl(url: string): string | null {
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl || !this.isRedditUrl(sanitizedUrl)) {
      return null;
    }

    const subreddit = this.extractSubreddit(sanitizedUrl);
    if (!subreddit) {
      return null;
    }

    return `${this.canonicalBaseUrl}/r/${subreddit}/.rss`;
  }
}

export const redditService = new RedditService();
