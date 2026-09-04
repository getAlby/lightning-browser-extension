import { RequestMethodHandler, RequestParams } from "./types";

const disconnectpeer: RequestMethodHandler = {
  alwaysConfirm: true,
  getParams(rawParams): RequestParams {
    // LND REST is snake_case; LNC gRPC-web is camelCase
    const pubkey = rawParams.pub_key ?? rawParams.pubKey;

    if (typeof pubkey === "string" && pubkey) {
      return { pubkey };
    }
    return {};
  },
};

export default disconnectpeer;
