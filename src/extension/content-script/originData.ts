// https://github.com/BetaHuhn/metadata-scraper <3
import { MetaData, OriginData } from "../../types";

type MetadataRule = [string, (el: Element) => string | null];

interface Context {
  url: string;
  options: Options;
}

interface RuleSet {
  rules: MetadataRule[];
  defaultValue?: (context: Context) => string | string[];
  scorer?: (el: Element, score: unknown) => number | undefined;
  processor?: (input: string, context: Context) => string | string[];
}

interface Options {
  maxRedirects?: number;
  ua?: string;
  lang?: string;
  timeout?: number;
  forceImageHttps?: boolean;
  html?: string;
  url?: string;
  customRules?: Record<string, RuleSet>;
}

const metaDataRules: Record<string, RuleSet> = {
  title: {
    rules: [
      [
        'meta[property="og:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="sailthru.title"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="sailthru.title"][content]',
        (element) => element.getAttribute("content"),
      ],
      ["title", (element) => element.textContent],
    ],
  },
  description: {
    rules: [
      [
        'meta[property="og:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="description" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="description" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="sailthru.description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="sailthru.description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:description"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="summary" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="summary" i][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  type: {
    rules: [
      [
        'meta[property="og:type"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:type"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-type"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-type"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="medium"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="medium"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  url: {
    rules: [
      [
        'meta[property="og:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="al:web:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="al:web:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-link"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-link"][content]',
        (element) => element.getAttribute("content"),
      ],
      ["a.amp-canurl", (element) => element.getAttribute("href")],
      [
        'link[rel="canonical"][href]',
        (element) => element.getAttribute("href"),
      ],
    ],
    defaultValue: (context) => context.url,
    processor: (url, context) => makeUrlAbsolute(context.url, url),
  },
  provider: {
    rules: [
      [
        'meta[property="og:site_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:site_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="publisher" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="publisher" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="application-name" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="application-name" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="al:android:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="al:android:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="al:iphone:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="al:iphone:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="al:ipad:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="al:ipad:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="al:ios:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="al:ios:app_name"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:app:name:iphone"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:app:name:iphone"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:app:name:ipad"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:app:name:ipad"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:app:name:googleplay"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:app:name:googleplay"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:app:name:iphone"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:app:name:iphone"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:app:name:ipad"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:app:name:ipad"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:app:name:googleplay"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:app:name:googleplay"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
    defaultValue: (context) => getProvider(new URL(context.url).hostname),
  },
  keywords: {
    rules: [
      [
        'meta[property="keywords" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="keywords" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-tags"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-tags"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="sailthru.tags"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="sailthru.tags"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="article:tag" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="article:tag" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="book:tag" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="book:tag" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="topic" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="topic" i][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
    processor: (keywords) =>
      keywords.split(",").map((keyword: string) => keyword.trim()),
  },
  author: {
    rules: [
      [
        'meta[property="author" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="author" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="article:author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="article:author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="book:author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="book:author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="sailthru.author"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="sailthru.author"][content]',
        (element) => element.getAttribute("content"),
      ],
      ['a[class*="author" i]', (element) => element.textContent],
      ['[rel="author"]', (element) => element.textContent],
      [
        'meta[property="twitter:creator"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:creator"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:creator"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:creator"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="profile:username"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="profile:username"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  copyright: {
    rules: [
      [
        'meta[property="copyright" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="copyright" i][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  email: {
    rules: [
      [
        'meta[property="email" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="email" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reply-to" i][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reply-to" i][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  twitter: {
    rules: [
      [
        'meta[property="twitter:site"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:site"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  reddit: {
    rules: [
      [
        'meta[property="reddit:site"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:site"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  facebook: {
    rules: [
      [
        'meta[property="fb:pages"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="fb:pages"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
  },
  image: {
    rules: [
      [
        'meta[property="og:image:secure_url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:image:secure_url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="og:image:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:image:url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="og:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="og:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="twitter:image:src"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="twitter:image:src"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:image"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="reddit:image:src"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="reddit:image:src"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="thumbnail"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="thumbnail"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="parsely-image-url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="parsely-image-url"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[property="sailthru.image.full"][content]',
        (element) => element.getAttribute("content"),
      ],
      [
        'meta[name="sailthru.image.full"][content]',
        (element) => element.getAttribute("content"),
      ],
    ],
    processor: (imageUrl, context) =>
      context.options.forceImageHttps === true
        ? makeUrlSecure(makeUrlAbsolute(context.url, imageUrl))
        : makeUrlAbsolute(context.url, imageUrl),
  },
  icon: {
    rules: [
      [
        'link[rel="apple-touch-icon"][href]',
        (element) => element.getAttribute("href"),
      ],
      [
        'link[rel="apple-touch-icon-precomposed"][href]',
        (element) => element.getAttribute("href"),
      ],
      ['link[rel="icon" i][href]', (element) => element.getAttribute("href")],
      [
        'link[rel="fluid-icon"][href]',
        (element) => element.getAttribute("href"),
      ],
      [
        'link[rel="shortcut icon"][href]',
        (element) => element.getAttribute("href"),
      ],
      [
        'link[rel="Shortcut Icon"][href]',
        (element) => element.getAttribute("href"),
      ],
      [
        'link[rel="mask-icon"][href]',
        (element) => element.getAttribute("href"),
      ],
    ],
    scorer: (element) => {
      const sizes = element.getAttribute("sizes");
      if (sizes) {
        const sizeMatches = sizes.match(/\d+/g);
        if (sizeMatches) {
          const parsed = parseInt(sizeMatches[0]);
          if (!isNaN(parsed)) {
            return parsed;
          }
        }
      }
    },
    defaultValue: (context) => makeUrlAbsolute(context.url, "/favicon.ico"),
    processor: (iconUrl, context) =>
      context.options.forceImageHttps === true
        ? makeUrlSecure(makeUrlAbsolute(context.url, iconUrl))
        : makeUrlAbsolute(context.url, iconUrl),
  },
  monetization: {
    rules: [
      ['meta[name="lightning"]', (element) => element.getAttribute("content")],
    ],
    processor: (text) => text.toLowerCase(),
  },
};

function makeUrlAbsolute(base: string, path: string) {
  return new URL(path, base).href;
}

function makeUrlSecure(url: string) {
  return url.replace(/^http:/, "https:");
}

function getProvider(host: string) {
  return host
    .replace(/www[a-zA-Z0-9]*\./, "")
    .replace(".co.", ".")
    .split(".")
    .slice(0, -1)
    .join(" ");
}

const runRule = function (ruleSet: RuleSet, doc: Document, context: Context) {
  let maxScore = 0;
  let value;

  for (let currRule = 0; currRule < ruleSet.rules.length; currRule++) {
    const [query, handler] = ruleSet.rules[currRule];

    const elements = Array.from(doc.querySelectorAll(query));
    if (elements.length) {
      for (const element of elements) {
        let score = ruleSet.rules.length - currRule;

        if (ruleSet.scorer) {
          const newScore = ruleSet.scorer(element, score);

          if (newScore) {
            score = newScore;
          }
        }

        if (score > maxScore) {
          maxScore = score;
          value = handler(element);
        }
      }
    }
  }

  if (value) {
    if (ruleSet.processor) {
      value = ruleSet.processor(value, context);
    }

    return value;
  }

  if ((!value || value.length < 1) && ruleSet.defaultValue) {
    return ruleSet.defaultValue(context);
  }

  return undefined;
};

const getMetaData = function () {
  const metadata: MetaData = {};
  Object.keys(metaDataRules).forEach((key) => {
    const ruleSet = metaDataRules[key];
    metadata[key] =
      runRule(ruleSet, document, {
        options: {},
        url: document.location.toString(),
      }) || undefined;
  });

  return metadata;
};

export default function getOriginData(): OriginData {
  if (!window || !document) {
    throw new Error("Must be called in browser context");
  }

  const metaData = getMetaData();

  return {
    location: window.location.toString(),
    domain: window.location.origin,
    host: window.location.host,
    pathname: window.location.pathname,
    name: metaData.provider || metaData.title || "",
    description: metaData.description || "",
    icon: metaData.image || metaData.icon || "",
    metaData: metaData,
    external: true, // indicate that the call is coming from the website (and not made internally within the extension)
  };
}
