import browser from "webextension-polyfill";

const msg = {
  request: (type, args, origin) => {
    return browser.runtime
      .sendMessage({
        application: "Joule",
        prompt: true,
        type: type,
        args: args,
        origin: origin || { internal: true },
      })
      .then((response) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      });
  },
  reply: (data) => {
    return browser.runtime.sendMessage({
      application: "Joule",
      response: true,
      data: data,
      origin: { internal: true },
    });
  },
  error: (error) => {
    return browser.runtime.sendMessage({
      application: "Joule",
      response: true,
      error: error,
      origin: { internal: true },
    });
  },
};

export default msg;
