import browser from "webextension-polyfill";

const msg = {
  request: (
    type: string,
    args?: { [key: string]: string | number },
    overwrites?: { [key: string]: string }
  ) => {
    return browser.runtime
      .sendMessage({
        application: "LBE",
        prompt: true,
        type: type,
        args: args,
        origin: { internal: true },
        ...overwrites,
      })
      .then((response) => {
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
