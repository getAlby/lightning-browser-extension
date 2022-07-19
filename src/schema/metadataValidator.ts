import { audioObjectSchema } from "./audioObjectSchema";

export function isBase64(str: string) {
  if (str === "" || str.trim() === "") {
    return false;
  }
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

export function MetadataValidator(metadata: { [key: string]: string }) {
  let hasValidType = false;
  let hasValidImage = true;
  for (const key in metadata) {
    if (key == "type") {
      if (metadata[key] == "AudioObject") {
        const parsed = audioObjectSchema.safeParse(metadata);
        if (parsed.success) {
          hasValidType = true;
        }
      }
    }
    if (key == "image") {
      hasValidImage = isBase64(metadata[key]);
    }
  }

  return hasValidType && hasValidImage;
}
