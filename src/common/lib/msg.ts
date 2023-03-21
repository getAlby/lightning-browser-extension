import browser from "webextension-polyfill";

const msg = {
  request: <T = Record<string, unknown>>(
    action: string,
    args?: Record<string, unknown>,
    overwrites?: Record<string, unknown>
  ) => {
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
