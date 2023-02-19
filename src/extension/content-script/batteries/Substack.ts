import getOriginData from "../originData";
import {
  elementReady,
  findLightningAddressInText,
  setLightningData,
} from "./helpers";

interface Article {
  author: Person[];
}
interface Person {
  name: string;
  description?: string;
  image?: { contentUrl: string } | string;
}

interface Recipient {
  name: string;
  address: string;
  description: string;
  imageURL: string;
}

const urlMatcher = /^https:\/\/(.+\.)?substack.com\/(profile|p)\//;

/**
 * Uses Substack's JSON-LD context to extract either a Person (if on Profile page)
 * or an Article's Author (if on Post page).
 *
 * If an Article has multiple Authors, then the first Lightning-enabled author is
 * used for creating Lightning Recipient.
 */
const findRecipient = async (): Promise<Recipient | null> => {
  const script = await elementReady("script[type='application/ld+json']");
  const context = JSON.parse(script?.textContent ?? "null");

  const recipient =
    context["@type"] === "Person" ? createRecipient(context) : null;
  if (recipient) return recipient;

  const article: Article = context["@type"] === "NewsArticle" ? context : null;
  const person = article?.author.find((p) =>
    findLightningAddressInText(p.description ?? "")
  );
  return person ? createRecipient(person) : null;
};

const createRecipient = (person: Person): Recipient | null => {
  const address = findLightningAddressInText(person.description ?? "");
  if (!address) return null;

  return {
    name: person.name,
    address,
    description: person.description ?? "",
    imageURL: extractImageUrl(person),
  };
};

const extractImageUrl = (person: Person): string => {
  if (typeof person.image === "string") {
    return getResizedImageURLForCDN(person.image);
  }
  return getResizedImageURLForCDN(person.image?.contentUrl ?? "");
};

const getResizedImageURLForCDN = (imageURL: string): string => {
  const match = imageURL.match(/fetch\/(.*)\//i);
  if (!match) return imageURL;

  const originalOptions = match[1].split(",");
  const optionsToAdd = ["w_128", "h_128", "c_limit"];
  const options = Array.from(
    new Set([...originalOptions, ...optionsToAdd])
  ).join(",");

  return imageURL.replace(match[1], options);
};

const battery = async (): Promise<void> => {
  const recipient = await findRecipient();
  if (!recipient) return;

  setLightningData([
    {
      method: "lnurl",
      address: recipient.address,
      ...getOriginData(),
      description: recipient.description,
      name: recipient.name,
      icon: recipient.imageURL,
    },
  ]);
};

const Substack = {
  urlMatcher,
  battery,
};

export default Substack;
