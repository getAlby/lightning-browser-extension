import { PromiseQueue } from "~/extension/providers/promiseQueue";

// global queue object
const queue = new PromiseQueue();

const HANDSHAKE = "LBE";

// One private MessageChannel per scope connects this inpage world to the
// isolated-world content script. Provider traffic travels over that port rather
// than over the shared page window, so it is not delivered to the frame's other
// message listeners.
//
// The handover is the limit of that: it is negotiated with window messages,
// which every listener in the frame receives, so the port is private only from
// scripts that are not yet running when it is transferred. See
// messagePortServer.js for the isolated-world side.
type ScopeEventHandler = (event: string) => void;

const ports = new Map<string, MessagePort>();
const portPromises = new Map<string, Promise<MessagePort>>();
const eventHandlers = new Map<string, ScopeEventHandler>();

// Ask the isolated world for this scope's port and keep asking until it
// arrives. Either world may reach document_start first, so a single request can
// be missed; the retry closes that gap. Once we hold the port, requests stop.
function acquirePort(scope: string): Promise<MessagePort> {
  const existing = ports.get(scope);
  if (existing) return Promise.resolve(existing);
  const pending = portPromises.get(scope);
  if (pending) return pending;

  const promise = new Promise<MessagePort>((resolve, reject) => {
    let settled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 200; // ~10s at 50ms; covers a slow isolated-world start

    function onMessage(ev: MessageEvent) {
      if (
        ev.source !== window ||
        !ev.data ||
        ev.data.application !== HANDSHAKE ||
        ev.data.type !== "lbe:port" ||
        ev.data.scope !== scope ||
        !ev.ports[0]
      ) {
        return;
      }
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      const port = ev.ports[0];
      port.onmessage = (msg) => handlePortMessage(scope, msg);
      port.start();
      ports.set(scope, port);
      portPromises.delete(scope);
      resolve(port);
    }
    window.addEventListener("message", onMessage);

    const request = () => {
      if (settled) return;
      if (attempts++ >= MAX_ATTEMPTS) {
        window.removeEventListener("message", onMessage);
        portPromises.delete(scope);
        reject(new Error("Alby: provider transport unavailable"));
        return;
      }
      window.postMessage(
        { application: HANDSHAKE, type: "lbe:port-request", scope },
        window.location.origin
      );
      setTimeout(request, 50);
    };
    request();
  });
  portPromises.set(scope, promise);
  return promise;
}

// Pending request callbacks, keyed by scope+id, so responses can be routed and
// duplicate/unexpected responses for the same id can be detected.
type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  settled: boolean;
};
const pending = new Map<string, Pending>();
const noop = () => undefined;
const key = (scope: string, id: string) => `${scope}:${id}`;

function handlePortMessage(scope: string, msg: MessageEvent) {
  const data = msg.data;
  if (!data || data.application !== HANDSHAKE) return;

  // events pushed from the extension (e.g. accountChanged)
  if (data.event) {
    eventHandlers.get(scope)?.(data.event);
    return;
  }

  if (!data.response) return;
  const p = pending.get(key(scope, data.id));
  if (!p) return;

  // Only the isolated-world content script holds the other end of this port, so
  // a second response for an id we have already settled is never expected. Do
  // not silently trust it — surface it instead of overwriting the result.
  if (p.settled) {
    console.error(
      "Alby: ignoring unexpected duplicate provider response",
      scope,
      data.id
    );
    return;
  }
  // The entry stays behind, marked settled, so that a later reply for the same
  // id is recognised as unexpected instead of being taken for an unknown id.
  // The callbacks are dropped so the caller's closures are not retained.
  p.settled = true;
  const { resolve, reject } = p;
  p.resolve = noop;
  p.reject = noop;

  if (data.data?.error) {
    reject(new Error(data.data.error));
  } else {
    // data.data is the background response; data.data.data is the payload
    resolve(data.data?.data);
  }
}

export function onScopeEvent(scope: string, handler: ScopeEventHandler): void {
  eventHandlers.set(scope, handler);
  // Kick the handshake now so the port is transferred at document_start (before
  // page scripts can intercept it) and events can be delivered before the first
  // call. If no content script services this frame (e.g. a blocklisted page)
  // the handshake never completes and the promise rejects after its retry cap;
  // swallow that here since there is nothing to deliver anyway.
  acquirePort(scope).catch(() => {
    /* no content-script transport in this frame */
  });
}

export function postMessage<T>(
  scope: string,
  action: string,
  args: T | undefined
): Promise<T> {
  return queue.add(
    () =>
      new Promise((resolve, reject) => {
        const id = Math.random().toString().slice(4);

        acquirePort(scope)
          .then((port) => {
            pending.set(key(scope, id), {
              resolve: resolve as (value: unknown) => void,
              reject,
              settled: false,
            });
            // sent over the private port; the isolated content script forwards
            // it to the background script and replies on the same port
            port.postMessage({
              id,
              application: HANDSHAKE,
              prompt: true,
              action: `${scope}/${action}`,
              scope,
              args,
            });
          })
          .catch(reject);
      })
  );
}
