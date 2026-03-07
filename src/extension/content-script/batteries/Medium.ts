import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/(?:[^/]+\.)?medium\.com\/(?:@([^/]+)|([^/]+))(?:\/.*)?$/;

const battery = (): void => {
  // 1. Suche nach Lightning-Adressen in der Bio (robusterer Ansatz)
  // Wir suchen nach Elementen, die typischerweise die Bio enthalten
  const bioSelectors = [
    'p.be.bf.z', // Aktueller Medium Bio-Selektor (variiert oft)
    '[data-testid="authorBio"]', 
    'meta[name="description"]',
    '.ae.af.ag.ah.ai.aj.ak.al.am.an' // Fallback für generische Klassen
  ];
  
  let address = null;
  let finalBioText = "";
  
  for (const selector of bioSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const bioText = element instanceof HTMLMetaElement ? element.content : (element as HTMLElement).innerText;
      if (bioText) {
        address = findLightningAddressInText(bioText);
        if (address) {
          finalBioText = bioText;
          break;
        }
      }
    }
  }

  if (!address) return;

  // 2. Extrahiere Name und Icon (robust via og-tags)
  const name = 
    document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.split(' – ')[0] ||
    document.querySelector('h1')?.innerText ||
    "Medium Author";

  const icon = 
    document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    document.querySelector('img[src*="/profile/"]')?.getAttribute('src') ||
    "";

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: finalBioText.substring(0, 160),
      name: name,
      icon: icon,
    },
  ]);
};

const Medium = {
  urlMatcher,
  battery,
};

export default Medium;
