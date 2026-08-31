import { installFakeMessageChannel } from "../../../../tests/unit/helpers/fakeMessageChannel";

let restoreMessageChannel: () => void;
beforeAll(() => {
  restoreMessageChannel = installFakeMessageChannel();
});
afterAll(() => {
  restoreMessageChannel();
});

// The inpage side of the provider transport: it asks the isolated world for a
// port, then sends requests over that port and matches replies to callers.

type PortLike = {
  onmessage: ((ev: { data: unknown }) => void) | null;
  postMessage: (data: unknown) => void;
  start: () => void;
};

// Answer the port request the way the content script does: a window message
// carrying one end of a channel. JSDOM's MessageEvent will not take a port in
// its init, so it is attached to the event afterwards.
function serveOnePort(scope: string): Promise<PortLike> {
  return new Promise((resolve) => {
    const onRequest = (ev: MessageEvent) => {
      const data = ev.data as Record<string, string>;
      if (
        !data ||
        data.application !== "LBE" ||
        data.type !== "lbe:port-request" ||
        data.scope !== scope
      ) {
        return;
      }
      window.removeEventListener("message", onRequest);
      const channel = new MessageChannel();
      const event = new MessageEvent("message", {
        data: { application: "LBE", type: "lbe:port", scope },
        source: window,
      });
      Object.defineProperty(event, "ports", { value: [channel.port2] });
      window.dispatchEvent(event);
      resolve(channel.port1 as unknown as PortLike);
    };
    window.addEventListener("message", onRequest);
  });
}

async function loadTransport() {
  let mod!: typeof import("~/extension/providers/postMessage");
  await jest.isolateModulesAsync(async () => {
    mod = await import("~/extension/providers/postMessage");
  });
  return mod;
}

describe("provider message transport", () => {
  test("sends a request over the port and resolves with its reply", async () => {
    const transport = await loadTransport();
    const served = serveOnePort("webln");
    const result = transport.postMessage("webln", "getInfo", { a: 1 });

    const port = await served;
    port.start();
    const request = await new Promise<Record<string, unknown>>((resolve) => {
      port.onmessage = (ev) => resolve(ev.data as Record<string, unknown>);
    });

    expect(request.action).toBe("webln/getInfo");
    expect(request.scope).toBe("webln");
    expect(request.args).toEqual({ a: 1 });

    port.postMessage({
      application: "LBE",
      response: true,
      id: request.id,
      scope: "webln",
      data: { data: { node: "genuine" } },
    });

    await expect(result).resolves.toEqual({ node: "genuine" });
  });

  test("a reply posted on the page window does not resolve the call", async () => {
    const transport = await loadTransport();
    const served = serveOnePort("webln");
    const result = transport.postMessage("webln", "getInfo", undefined);

    const port = await served;
    port.start();
    const request = await new Promise<Record<string, unknown>>((resolve) => {
      port.onmessage = (ev) => resolve(ev.data as Record<string, unknown>);
    });

    // the shape the old transport accepted, replayed on the shared window with
    // the id the request carries
    window.postMessage(
      {
        application: "LBE",
        response: true,
        id: request.id,
        scope: "webln",
        data: { data: { node: "substituted" } },
      },
      "*"
    );

    let settled = false;
    void result.then(() => (settled = true));
    await new Promise((r) => setTimeout(r, 20));
    expect(settled).toBe(false);

    // the call is still live and the genuine reply still resolves it
    port.postMessage({
      application: "LBE",
      response: true,
      id: request.id,
      scope: "webln",
      data: { data: { node: "genuine" } },
    });
    await expect(result).resolves.toEqual({ node: "genuine" });
  });

  test("a second reply for a settled id does not overwrite the result", async () => {
    const transport = await loadTransport();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const served = serveOnePort("webln");
    const result = transport.postMessage("webln", "getInfo", undefined);

    const port = await served;
    port.start();
    const request = await new Promise<Record<string, unknown>>((resolve) => {
      port.onmessage = (ev) => resolve(ev.data as Record<string, unknown>);
    });

    const reply = (node: string) =>
      port.postMessage({
        application: "LBE",
        response: true,
        id: request.id,
        scope: "webln",
        data: { data: { node } },
      });

    reply("genuine");
    reply("second");

    await expect(result).resolves.toEqual({ node: "genuine" });
    await new Promise((r) => setTimeout(r, 20));
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("rejects when the reply carries an error", async () => {
    const transport = await loadTransport();
    const served = serveOnePort("webln");
    const result = transport.postMessage("webln", "getInfo", undefined);

    const port = await served;
    port.start();
    const request = await new Promise<Record<string, unknown>>((resolve) => {
      port.onmessage = (ev) => resolve(ev.data as Record<string, unknown>);
    });

    port.postMessage({
      application: "LBE",
      response: true,
      id: request.id,
      scope: "webln",
      data: { error: "User rejected" },
    });

    await expect(result).rejects.toThrow("User rejected");
  });

  test("delivers events pushed over the port to the scope handler", async () => {
    const transport = await loadTransport();
    const served = serveOnePort("nostr");
    const events: string[] = [];
    transport.onScopeEvent("nostr", (event) => events.push(event));

    const port = await served;
    port.postMessage({
      application: "LBE",
      event: "accountChanged",
      scope: "nostr",
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(events).toEqual(["accountChanged"]);
  });

  test("an event posted on the page window is not delivered", async () => {
    const transport = await loadTransport();
    const served = serveOnePort("nostr");
    const events: string[] = [];
    transport.onScopeEvent("nostr", (event) => events.push(event));
    await served;

    window.postMessage(
      { application: "LBE", event: "accountChanged", scope: "nostr" },
      "*"
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(events).toEqual([]);
  });
});
