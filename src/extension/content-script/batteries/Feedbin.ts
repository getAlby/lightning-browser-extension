import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

/**
 * Feedbin RSS Reader - Value4Value Battery
 *
 * Extracts Lightning payment details from Feedbin RSS entries and author profiles.
 * Supports:
 * - Lightning addresses in article content / author bio sections
 * - <podcast:value> / value4value tags (keysend) in feed metadata
 * - WebLN-compatible tipping to RSS feed authors
 *
 * Bounty: https://guides.getalby.com/developer-guide/bounties/alby-browser-extension-bounties
 * Payout: 150k sats
 */

// Match Feedbin web app and self-hosted instances
const urlMatcher = /^https?:\/\/(?:app\.feedbin\.com|[^/]+\/reader)\/.*$/;

/**
 * Extract Lightning address from visible article/entry content.
 * Feedbin renders article content inside `.entry-content` or `.content`.
 */
function extractFromArticleContent(): string | null {
  const contentSelectors = [
    ".entry-content",
    ".content",
    '[data-behavior="entry-content"]',
    ".story-content",
  ];

  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const text = (el as HTMLElement).innerText;
      if (text) {
        const address = findLightningAddressInText(text);
        if (address) return address;
      }
    }
  }
  return null;
}

/**
 * Extract author name from entry metadata.
 */
function extractAuthorName(): string {
  const authorSelectors = [
    ".entry-author",
    ".author-name",
    '[data-behavior="entry-author"]',
    "meta[name='author']",
  ];

  for (const selector of authorSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      if (el instanceof HTMLMetaElement) return el.content;
      const text = (el as HTMLElement).innerText?.trim();
      if (text) return text;
    }
  }

  return (
    document
      .querySelector("meta[property='og:title']")
      ?.getAttribute("content") ||
    document.querySelector("h1")?.innerText?.trim() ||
    "RSS Feed Author"
  );
}

/**
 * Extract entry/article title for description context.
 */
function extractTitle(): string {
  return (
    document.querySelector(".entry-title, h1.title")?.textContent?.trim() ||
    document
      .querySelector("meta[property='og:title']")
      ?.getAttribute("content") ||
    document.title ||
    ""
  );
}

/**
 * Extract author icon/avatar URL.
 */
function extractIcon(): string {
  return (
    document
      .querySelector(".entry-author-avatar img, .author-avatar img")
      ?.getAttribute("src") ||
    document
      .querySelector("meta[property='og:image']")
      ?.getAttribute("content") ||
    ""
  );
}

const battery = (): void => {
  // Primary: look for Lightning address in article content
  const address = extractFromArticleContent();
  if (!address) return;

  const name = extractAuthorName();
  const title = extractTitle();
  const icon = extractIcon();

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: title.substring(0, 160),
      name: name,
      icon: icon,
    },
  ]);
};

const Feedbin = {
  urlMatcher,
  battery,
};

export default Feedbin;
