import dayjs from "dayjs";
import { Payment, Transaction } from "~/types";

export const convertPaymentToTransaction = (payment: Payment): Transaction => ({
  ...payment,
  id: `${payment.id}`,
  type: "sent",
  date: dayjs(payment.createdAt).fromNow(),
  title: payment.name || payment.description,
  publisherLink: payment.location,
});

export const convertPaymentsToTransactions = (
  payments: Payment[]
): Transaction[] =>
  payments.map((p: Payment) => convertPaymentToTransaction(p));
