import type { LNURLDetails, LNURLError } from "~/types";

export const isLNURLDetailsError = (
  res: LNURLError | LNURLDetails
): res is LNURLError => {
  return "status" in res && res.status.toUpperCase() === "ERROR";
};

// from https://stackoverflow.com/a/50375286/4562693
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
