import { MessageGenericRequest } from "~/types";

export type RequestParams = Record<string, string | number>;

export type RequestMethodHandler = {
  alwaysConfirm?: boolean;
  isPayment?: boolean;
  getParams: (rawParams: Record<string, unknown>) => RequestParams;
  onSuccess?: (
    message: MessageGenericRequest,
    accountId: string,
    response: { data: unknown },
    params: RequestParams
  ) => void | Promise<void>;
};
