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
  description: string;
  image: { contentUrl: string } | string;
}

class SubstackLightningRecipient {
  readonly name: string;
  readonly address: string;
  readonly description: string;
  private readonly imageURL: string;

  constructor(
    name: string,
    address: string,
    description: string,
    imageURL: string
  ) {
    this.name = name;
    this.address = address;
    this.description = description;
    this.imageURL = imageURL;
  }

  /**
   * Returns a re-sized version of the Recipients Image URL for the Substack CDN
   */
  getResizedImageURL(): string {
    const match = this.imageURL.match(
      /fetch\/(f_auto,q_auto:good,fl_progressive:steep)\//i
    );
    if (!match) return this.imageURL;

    const originalOptions = match[1].split(",");
    const optionsToAdd = ["w_128", "h_128", "c_limit"];
    const options = Array.from(
      new Set([...originalOptions, ...optionsToAdd])
    ).join(",");

    return this.imageURL.replace(match[1], options);
  }
}

const urlMatcher = /^https:\/\/(.+\.)?substack.com\/(profile|p)\//;

/**
 * Uses Substack's JSON-LD context to extract either a Person (if on Profile page)
 * or an Article's Author (if on Post page).
 *
 * If an Article has multiple Authors, then the first Lightning-enabled author is
 * used for creating Lightning Recipient.
 */
const findRecipient = async (): Promise<SubstackLightningRecipient | null> => {
  const script = await elementReady("script[type='application/ld+json']");
  const context = JSON.parse(script?.textContent ?? "null");
  const recipient = createRecipient(
    context["@type"] === "Person" ? context : null
  );
  if (recipient) return recipient;

  const article: Article = context["@type"] === "NewsArticle" ? context : null;
  const person = article?.author.find((p) =>
    findLightningAddressInText(p.description)
  );
  return createRecipient(person);
};

const createRecipient = (
  person?: Person
): SubstackLightningRecipient | null => {
  if (!person || !person.name || !person.description) return null;

  const address = findLightningAddressInText(person.description);
  if (!address) return null;

  return new SubstackLightningRecipient(
    person.name,
    address,
    person.description,
    extractImageUrl(person)
  );
};

const extractImageUrl = (person: Person): string => {
  if (!person.image) return "";
  if (typeof person.image === "string") return person.image;
  return person.image.contentUrl;
};

const battery = (): void => {
  findRecipient().then((recipient) => {
    if (!recipient) {
      return;
    }
    setLightningData([
      {
        method: "lnurl",
        address: recipient.address,
        ...getOriginData(),
        description: recipient.description,
        name: recipient.name,
        icon: recipient.getResizedImageURL(),
      },
    ]);
  });
};

const Substack = {
  urlMatcher,
  battery,
};

export default Substack;
