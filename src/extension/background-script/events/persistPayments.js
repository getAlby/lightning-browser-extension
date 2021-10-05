import db from "../db";

const persistSuccessfullPayment = async (message, data) => {
  const recipientName = data.origin.name;
  const host = data.origin.host;
  const paymentResponse = data.response;
  const paymentRequestDetails = data.paymentRequestDetails;
  const route = paymentResponse.data.route;
  const { total_amt, total_fees } = route;

  await db.payments.add({
    host: host,
    location: data.origin.location,
    name: recipientName,
    description: paymentRequestDetails.description,
    preimage: paymentResponse.data.preimage,
    paymentHash: paymentResponse.data.paymentHash,
    destination: paymentRequestDetails.destination,
    totalAmount: total_amt,
    totalFees: total_fees,
    createdAt: Date.now(),
  });
  await db.saveToStorage();
  console.log(`Presisted payment ${paymentResponse.data.paymentHash}`);
  return true;
};

export { persistSuccessfullPayment };
