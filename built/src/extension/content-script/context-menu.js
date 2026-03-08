"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
let lastSelectedText = "";
// Timer used to debounce rapid selection changes
let debounceTimer;
// Listens for selected text and updates the context menu accordingly
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("selectionchange", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = (selection === null || selection === void 0 ? void 0 : selection.toString().trim()) || "";
            if (selectedText && selectedText !== lastSelectedText) {
                lastSelectedText = selectedText;
                const isValid = isValidLightningInput(selectedText);
                webextension_polyfill_1.default.runtime.sendMessage({
                    type: "updateContextMenu",
                    isValid,
                    text: selectedText,
                });
            }
        }, 100);
    });
});
/**
 * Check if the provided text matches a valid Lightning-related input.
 * This includes Lightning invoices, LNURLs, Lightning addresses,
 * Bitcoin addresses (mainnet/testnet), and public keys.
 *
 * @param text - The selected text to validate
 * @returns true if the text is recognized as a valid Lightning input
 */
function isValidLightningInput(text) {
    const isInvoice = /^(lightning:)?ln(bc|tb|lntb)[a-zA-HJ-NP-Z0-9]{1,4000}$/i.test(text);
    const isLNURL = /^(lightning:)?lnurl[pwc][a-zA-Z0-9]{1,4000}$/i.test(text);
    const isAddress = /^[\w+-]+@[\w+-.]+\.[a-zA-Z]{2,}$/i.test(text);
    const isPubKey = /^([0-9a-f]{66}|[0-9a-f]{130})$/i.test(text);
    // from https://stackoverflow.com/questions/21683680/regex-to-match-bitcoin-addresses + slightly modified to support testnet addresses
    const isBitcoinAddress = /^(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{25,34}|(bc1|tb1)[a-z0-9]{39,59})$/i.test(text);
    return isInvoice || isLNURL || isAddress || isBitcoinAddress || isPubKey;
}
