"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shouldInjectBrowserChecks_1 = require("../shouldInjectBrowserChecks");
function shouldInjectInpage() {
    const isHTML = (0, shouldInjectBrowserChecks_1.doctypeCheck)();
    const noProhibitedType = (0, shouldInjectBrowserChecks_1.suffixCheck)();
    const hasDocumentElement = (0, shouldInjectBrowserChecks_1.documentElementCheck)();
    const injectedBefore = window.webln !== undefined;
    return isHTML && noProhibitedType && hasDocumentElement && !injectedBefore;
}
exports.default = shouldInjectInpage;
