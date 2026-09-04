import { RequestMethodHandler, RequestParams } from "./types";

const settleinvoice: RequestMethodHandler = {
  alwaysConfirm: true,
  getParams(rawParams): RequestParams {
    const preimage = rawParams.preimage;

    if (typeof preimage === "string" && preimage) {
      return { preimage };
    }
    return {};
  },
};

export default settleinvoice;
