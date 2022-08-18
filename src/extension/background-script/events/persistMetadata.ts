import db from "../db";

const persistMetadata = async (_message, data) => {
  const host = data.origin.host;

  const allowance = await db.allowances
  .where("host")
  .equalsIgnoreCase(host)
  .first();

  let metadata = data.metadata;
  let metadataType;
  let contentUrl;
  if (data.metadata != undefined) {
    metadata = JSON.parse(data.metadata);
    metadataType = metadata.type;
    contentUrl = metadata.contentUrl;

  }
  const paymentResponse = data.response;
  
  await db.metadata.add({
    host: host,
    paymentHash: paymentResponse.data.paymentHash,
    metadata: metadata,
    allowanceId: allowance?.id,
    createdAt: Date.now(),
    type: metadataType,
    contentUrl: contentUrl
  });
  await db.saveToStorage();
  console.info(`Persisted metadata ${metadata}`);
  return true;
};

export { persistMetadata };
