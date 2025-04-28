# Alby Batteries  

Batteries are website-specific enhancements that enable the Alby extension to detect Lightning Network payment information on various websites.  

## What are Batteries?  

Batteries are modules that enhance specific websites with Lightning Network functionality. Each battery targets a specific website (like Twitter, YouTube, Reddit, etc.) and extracts Lightning addresses or payment information from the page's content.  

When you visit a supported website, Alby automatically activates the corresponding battery, which scans the DOM for Lightning payment information and makes it available in the extension popup, allowing for easy tipping.  

## How Batteries Work  

1. The extension checks if the current URL matches any of the supported websites  

2. If a match is found, the corresponding battery is activated  

3. The battery scans the page's DOM for Lightning Network identifiers (addresses, LNURL, etc.)  

4. If payment information is found, the extension icon changes to indicate tipping is available  

5. The user can now send payments directly from the Alby extension  

## Supported Websites  

Currently, Alby supports the following websites through batteries:

- X (formerly Twitter)
- Reddit
- YouTube
- Peertube
- VimeoVideo
- LinkTree
- Medium
- Mixcloud
- GitHub
- SoundCloud
- StackOverflow
- Substack
- GeyserProject
- Vida
- Twitch

## Creating a New Battery  

To create a new battery for a website not yet supported:

1. Create a new file in the `batteries` folder, named after the website (e.g., `NewWebsite.ts`) 

2. Implement the battery with two main exports:  
   - `urlMatcher`: A regex to match the website's URL pattern  
   - `battery`: A function that extracts Lightning payment information from the page  
3. Add your battery to the `enhancements` array in `index.ts`  

### Battery Structure  

A basic battery structure looks like this: 

```typescript  
import getOriginData from "../originData";  
import { setLightningData } from "./helpers";  
  
const urlMatcher = /^https:\/\/website\.com\/.*/;  
  
function battery(): void {  
  // Logic to extract Lightning payment information  
  // ...  
    
  // When payment information is found:  
  setLightningData([  
    {  
      method: "lnurl", // or other method  
      address: "user@domain.com", // or other identifier  
      ...getOriginData(),  
      icon: "https://...", // icon URL  
      name: "Recipient Name",  
    },  
  ]);  
}  
  
const websiteBattery = {  
  urlMatcher,  
  battery,  
};  
  
export default websiteBattery;
```

### Helpful Utilities

The `helpers.ts` file provides useful functions: `helpers.ts:17-49`

## Testing Your Battery

To test a new battery:

1. Build the extension with your new battery

2. Load the extension in your browser

3. Visit the website your battery is designed for

4. Check if the Alby icon changes to indicate available tipping

5. Open the extension popup to see if the payment information was properly extracted


## Contributing 

We welcome contributions for new website batteries! If you'd like to add support for a new website, please check our [contribution guidelines](README.md#-contributing).





