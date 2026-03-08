"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPaymentsToTransactions = exports.convertPaymentToTransaction = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const convertPaymentToTransaction = (payment, publisherLink) => (Object.assign(Object.assign({}, payment), { id: `${payment.id}`, type: "sent", timeAgo: (0, dayjs_1.default)(+payment.createdAt).fromNow(), title: payment.description || payment.name, publisherLink: publisherLink || payment.location, timestamp: parseInt(payment.createdAt) }));
exports.convertPaymentToTransaction = convertPaymentToTransaction;
const convertPaymentsToTransactions = (payments, publisherLink) => payments.map((p) => (0, exports.convertPaymentToTransaction)(p, publisherLink));
exports.convertPaymentsToTransactions = convertPaymentsToTransactions;
