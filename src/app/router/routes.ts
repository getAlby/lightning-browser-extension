// PATHs names react-router is matched to in path={}
export const PATHS = {
  lnurlPay: "lnurlPay",
} as const;

// URLs which should match the router PATHs to call `navigate(URL)`
export const URLS = {
  lnurlPay: `/${PATHS.lnurlPay}`,
};
