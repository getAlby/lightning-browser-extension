import { RequestMethodHandler, RequestParams } from "./types";

const connectpeer: RequestMethodHandler = {
  alwaysConfirm: true,
  getParams(rawParams): RequestParams {
    const addr = (rawParams.addr ?? {}) as {
      pubkey?: unknown;
      pub_key?: unknown;
    };
    const pubkey = addr.pubkey ?? addr.pub_key;

    if (typeof pubkey === "string" && pubkey) {
      return { pubkey };
    }
    return {};
  },
};

export default connectpeer;
