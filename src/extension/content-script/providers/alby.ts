export default class AlbyProvider {

    lnurl(lnurl: string, amount: number, comment?: string) {
      return this.execute("lnurl", { lnurl, amount, comment });
    }
  
    // NOTE: new call `action`s must be specified also in the content script
    execute(
      action: string,
      args?: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
      return new Promise((resolve, reject) => {
        // post the request to the content script. from there it gets passed to the background script and back
        // in page script can not directly connect to the background script
        window.postMessage(
          {
            application: "LBE",
            prompt: false,
            action: `alby/${action}`,
            args,
          },
          "*" // TODO use origin
        );
  
        function handleWindowMessage(messageEvent: MessageEvent) {
          // check if it is a relevant message
          // there are some other events happening
          if (
            !messageEvent.data ||
            !messageEvent.data.response ||
            messageEvent.data.application !== "LBE" ||
            !messageEvent.data.action.startsWith("alby")
          ) {
            return;
          }
          if (messageEvent.data.data.error) {
            reject(new Error(messageEvent.data.data.error));
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
    }
  }
  