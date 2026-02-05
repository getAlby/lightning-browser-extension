import { Battery, BatteryMetaTagRecipient } from "~/types";

import getOriginData from "../originData";
import { setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/[^/]+\/[^/]+$/i;

// Match Mastodon profile pages (format: https://instance.social/@username or https://instance.social/username)
const isMastodonProfile = (): boolean => {
  const url = document.location.toString();
  // Match patterns like:
  // - https://mastodon.social/@Gargron
  // - https://bitcoinhackers.org/@openoms
  // - https://fosstodon.org/users/Gargron
  return /https?:\/\/[^/]+\/(@[^/]+|\/users\/[^/]+)/i.test(url);
};

// Extract lightning address or lnurl from a string
const extractLightningFromString = (text: string): string | null => {
  // Match lightning address (user@domain)
  const lnAddressMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (lnAddressMatch) {
    return lnAddressMatch[0];
  }
  
  // Match lnurl (lnurl* or pay to lightning address)
  const lnurlMatch = text.match(/lnurl[pc][a-zA-Z0-9]+/i);
  if (lnurlMatch) {
    return lnurlMatch[0];
  }
  
  return null;
};

// Find lightning address in link elements with rel="me"
const findLightningInLinks = (): string | null => {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="me"]');
  
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    const lightning = extractLightningFromString(href);
    if (lightning) {
      return lightning;
    }
  }
  
  return null;
};

// Find lightning address in anchor elements
const findLightningInAnchors = (): string | null => {
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[rel="me"]');
  
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href') || '';
    const text = anchor.textContent || '';
    
    // Check both href and visible text for lightning addresses
    const lightningFromHref = extractLightningFromString(href);
    if (lightningFromHref) {
      return lightningFromHref;
    }
    
    const lightningFromText = extractLightningFromString(text);
    if (lightningFromText) {
      return lightningFromText;
    }
  }
  
  return null;
};

// Check for WebLN provider on the page
const checkForWebLN = (): boolean => {
  return !!(window as unknown as { webln?: { enabled?: boolean } }).webln?.enabled;
};

const battery = (): void => {
  // Only run on Mastodon profile pages
  if (!isMastodonProfile()) {
    return;
  }
  
  // Try to find lightning address from links
  const lightningAddress = findLightningInLinks() || findLightningInAnchors();
  
  if (!lightningAddress) {
    return;
  }
  
  const metaData = getOriginData();
  
  // Determine if it's a lightning address or lnurl
  const recipient: Battery = lightningAddress.startsWith('lnurl')
    ? {
        method: 'lnurl',
        address: lightningAddress.replace(/^lnurl[pc]/i, ''),
        ...metaData,
      }
    : {
        method: 'lnurl',
        address: lightningAddress,
        ...metaData,
      };
  
  setLightningData([recipient]);
};

const Mastodon: Battery = {
  urlMatcher,
  battery,
};

export default Mastodon;
