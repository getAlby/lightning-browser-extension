import db from "../db";

const persistSuccessfullPayment = async (message, data) => {
  const recipientName = data.origin.name;
  const host = data.origin.host;
  const paymentResponse = data.response;
  const paymentRequestDetails = data.paymentRequestDetails;
  const route = paymentResponse.data.payment_route;
  const { total_amt, total_fees } = route;

  await db.payments.add({
    host: host,
    name: recipientName,
    description: paymentRequestDetails.description,
    preimage: paymentResponse.data.payment_preimage,
    paymentHash: paymentResponse.data.payment_hash,
    destination: paymentRequestDetails.destination,
    totalAmount: total_amt,
    totalFees: total_fees,
    createdAt: Date.now(),
  });
  await db.saveToStorage();
  console.log(`Presisted payment ${paymentResponse.data.payment_hash}`);
  return true;
};

export { persistSuccessfullPayment };
