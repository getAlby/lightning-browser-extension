// Isolated-world side of the provider message transport.
//
// The inpage providers and these content scripts previously talked to each
// other with `window.postMessage` on the shared page window, where every
// message — request ids and responses alike — was delivered to every other
// message listener in the frame, and any of them could reply first.
//
// Instead we hand the inpage world one end of a `MessageChannel` per scope.
// MessagePort messages go only to the two ports that make up the channel, so a
// script holding neither port is not part of the conversation.
//
// The port is transferred in response to a window message, so it is only
// private from scripts that are not yet running at that moment.
// `createScopePort` therefore does the channel creation and handshake
// synchronously as soon as it is called; the content script calls it at module
// top, ahead of the asynchronous should-inject/blocklist decision that only
// gates whether requests are actually serviced. On MV2 the inpage script is
// injected inline at document_start and this ordering holds; on MV3 the
// main-world script is registered separately and the ordering is not
// guaranteed. Requests that arrive before a handler is registered are buffered;
// if the content script decides not to service this frame they are simply never
// answered (the same effect the old blocklist bail had).
//
// Each content-script bundle runs in the same isolated world but as a separate
// module instance, so every scope creates and owns its own channel here.

const HANDSHAKE = "LBE";

export function createScopePort(scope) {
  const channel = new MessageChannel();
  const port = channel.port1; // kept here; port2 is transferred to the inpage world
  let transferred = false;
  let requestHandler = null;
  const buffered = [];

  // Transfer port2 to the inpage world in response to its handshake request.
  // We only ever transfer once (a port is neutered after transfer). The inpage
  // side keeps asking until it receives the port, which covers either load
  // order between the isolated and main worlds.
  function handleHandshake(ev) {
    if (
      ev.source !== window ||
      !ev.data ||
      ev.data.application !== HANDSHAKE ||
      ev.data.type !== "lbe:port-request" ||
      ev.data.scope !== scope
    ) {
      return;
    }
    if (transferred) return;
    transferred = true;
    window.postMessage(
      { application: HANDSHAKE, type: "lbe:port", scope },
      window.location.origin,
      [channel.port2]
    );
  }
  window.addEventListener("message", handleHandshake);

  function dispatch(data) {
    const reply = (response) => {
      port.postMessage({
        id: data.id,
        application: HANDSHAKE,
        response: true,
        data: response,
        scope,
      });
    };
    requestHandler(data, reply);
  }

  // Requests from the inpage provider arrive here over the private port.
  port.onmessage = (ev) => {
    const data = ev.data;
    if (!data || data.response) return;
    if (!requestHandler) {
      buffered.push(data);
      return;
    }
    dispatch(data);
  };
  port.start();

  return {
    // register the per-scope request handler; `reply(response)` answers the
    // originating call over the same private port. Any requests received before
    // this point are flushed now.
    onRequest(handler) {
      requestHandler = handler;
      while (buffered.length) dispatch(buffered.shift());
    },
    // push an event (e.g. accountChanged) to the inpage provider over the port
    sendEvent(event) {
      port.postMessage({ application: HANDSHAKE, event, scope });
    },
  };
}
