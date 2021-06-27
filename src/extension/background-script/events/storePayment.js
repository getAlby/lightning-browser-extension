import PubSub from "pubsub-js";
import db from "../db";

const success = async (message, data) => {
  const recipientName = data.origin.name;
  const host = data.origin.host;
  const paymentResponse = data.response;
  const paymentRequestDetails = data.paymentRequestDetails;
  const route = paymentResponse.data.payment_route;
  const { total_amt } = route;

  await db.payments.add({
    host: host,
    name: recipientName,
    description: paymentRequestDetails.description,
    preimage: paymentResponse.data.payment_preimage,
    destination: paymentRequestDetails.destination,
    totalAmount: total_amt,
    createdAt: Date.now(),
  });
  await db.saveToStorage();
  return true;
};

PubSub.subscribe("ln.sendPayment.success", success);
