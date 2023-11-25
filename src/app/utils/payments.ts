import dayjs from "dayjs";
import { DbPayment, Transaction } from "~/types";

export const convertPaymentToTransaction = (
  payment: DbPayment,
  publisherLink?: string
): Transaction => ({
  ...payment,
  id: `${payment.id}`,
  type: "sent",
  date: dayjs(+payment.createdAt).fromNow(),
  title: payment.description || payment.name,
  publisherLink: publisherLink || payment.location,
  timestamp: parseInt(payment.createdAt),
});

export const convertPaymentsToTransactions = (
  payments: DbPayment[],
  publisherLink?: string
): Transaction[] =>
  payments.map((p: DbPayment) => convertPaymentToTransaction(p, publisherLink));
