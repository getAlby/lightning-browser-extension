import type { LNURLDetails, LNURLError } from "~/types";

export const isLNURLDetailsError = (
  res: LNURLError | LNURLDetails
): res is LNURLError => {
  return "status" in res && res.status.toUpperCase() === "ERROR";
};
