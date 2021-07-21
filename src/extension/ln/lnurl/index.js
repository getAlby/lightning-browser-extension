export default class LNURLProvider {
  pay(lnurlEncoded) {
    return this.execute("lnurlPay", { lnurlEncoded });
  }

  execute(type, args) {
    const p = new Promise((resolve, reject) => {
      // post the request to the content script. from there it gets passed to the background script and back
      // in page script can not directly connect to the background script
      window.postMessage(
        {
          application: "Joule",
          prompt: true,
          //action: `webln/${type}`, // TODO: think about a convention to cal the actions
          type: `${type}`,
          args,
        },
        "*" // TODO use origin
      );

      function handleWindowMessage(messageEvent) {
        console.log({ messageEvent });
        // check if it is a relevant message
        // there are some other events happening
        if (
          !messageEvent.data ||
          !messageEvent.data.response ||
          messageEvent.data.application !== "Joule"
        ) {
          console.log("No response, ignoring");
          return;
        }
        if (messageEvent.data.data.error) {
          reject(messageEvent.data.data.error);
        } else {
          // 1. data: the message data
          // 2. data: the data passed as data to the message
          // 3. data: the actual response data
          resolve(messageEvent.data.data.data);
        }
        // For some reason must happen only at the end of this function
        window.removeEventListener("message", handleWindowMessage);
      }

      window.addEventListener("message", handleWindowMessage);
    });
    console.log(p);
    return p;
  }
}
