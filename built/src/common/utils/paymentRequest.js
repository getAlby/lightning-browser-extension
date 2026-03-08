"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentRequestDescription = void 0;
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
function getPaymentRequestDescription(paymentRequest) {
    const decodedPaymentRequest = bolt11_signet_1.default.decode(paymentRequest);
    const descriptionTag = decodedPaymentRequest.tags.find((tag) => tag.tagName === "description");
    return descriptionTag ? descriptionTag.data.toString() : "";
}
exports.getPaymentRequestDescription = getPaymentRequestDescription;
