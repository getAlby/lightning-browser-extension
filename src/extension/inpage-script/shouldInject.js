import {
  doctypeCheck,
  documentElementCheck,
  suffixCheck,
} from "../shouldInjectBrowserChecks";
export default function shouldInjectInpage() {
  const isHTML = doctypeCheck();
  const noProhibitedType = suffixCheck();
  const hasDocumentElement = documentElementCheck();
  const injectedBefore = window.webln !== undefined;

  return isHTML && noProhibitedType && hasDocumentElement && !injectedBefore;
}
