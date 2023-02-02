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
