import { RequestMethodHandler, RequestParams } from "./types";

const addholdinvoice: RequestMethodHandler = {
  alwaysConfirm: true,
  getParams(rawParams): RequestParams {
    const hash = rawParams.hash;

    if (typeof hash === "string" && hash) {
      return { hash };
    }
    return {};
  },
};

export default addholdinvoice;
