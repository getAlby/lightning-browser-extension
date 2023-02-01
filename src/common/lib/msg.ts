import browser from "webextension-polyfill";
import {
  ExtendedRouteArgs,
  ExtendedRouteKey,
  ExtendedRouteResponse,
} from "~/extension/background-script/router";

const msg = {
  request: <K extends ExtendedRouteKey, T = ExtendedRouteResponse[K]>(
    action: K,
    args: ExtendedRouteArgs[K] = {},
    overwrites?: Record<string, unknown>
  ): Promise<T> => {
    return browser.runtime
      .sendMessage({
        application: "LBE",
        prompt: true,
        action: action,
        args: args,
        origin: { internal: true },
        ...overwrites,
      })
      .then((response: { data: T; error?: string }) => {
        if (response.error) {
          throw new Error(response.error);
        }

        return response.data;
      });
  },
  reply: (data: unknown) => {
    return browser.runtime.sendMessage({
      application: "LBE",
      response: true,
      data: data,
      origin: { internal: true },
    });
  },
  error: (error: string) => {
    return browser.runtime.sendMessage({
      application: "LBE",
      response: true,
      error: error,
      origin: { internal: true },
    });
  },
};

export default msg;
