import {
  doctypeCheck,
  documentElementCheck,
  suffixCheck,
} from "../shouldInjectBrowserChecks";
export default function shouldInjectInpage() {
  const isHTML = doctypeCheck();
  const noProhibitedType = suffixCheck();
  const hasDocumentElement = documentElementCheck();

  return isHTML && noProhibitedType && hasDocumentElement;
}
