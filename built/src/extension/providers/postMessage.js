"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postMessage = void 0;
const promiseQueue_1 = require("~/extension/providers/promiseQueue");
// global queue object
const queue = new promiseQueue_1.PromiseQueue();
function postMessage(scope, action, args) {
    return queue.add(() => new Promise((resolve, reject) => {
        const id = Math.random().toString().slice(4);
        // post the request to the content script. from there it gets passed to the background script and back
        // in page script can not directly connect to the background script
        window.postMessage({
            id: id,
            application: "LBE",
            prompt: true,
            action: `${scope}/${action}`,
            scope: scope,
            args,
        }, window.location.origin);
        function handleWindowMessage(messageEvent) {
            // check if it is a relevant message
            // there are some other events happening
            if (messageEvent.origin !== window.location.origin ||
                !messageEvent.data ||
                !messageEvent.data.response ||
                messageEvent.data.application !== "LBE" ||
                messageEvent.data.scope !== scope ||
                messageEvent.data.id !== id) {
                return;
            }
            if (messageEvent.data.data.error) {
                reject(new Error(messageEvent.data.data.error));
            }
            else {
                // 1. data: the message data
                // 2. data: the data passed as data to the message
                // 3. data: the actual response data
                resolve(messageEvent.data.data.data);
            }
            // For some reason must happen only at the end of this function
            window.removeEventListener("message", handleWindowMessage);
        }
        window.addEventListener("message", handleWindowMessage);
    }));
}
exports.postMessage = postMessage;
