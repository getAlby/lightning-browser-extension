import { installFakeMessageChannel } from "../../../../tests/unit/helpers/fakeMessageChannel";

let restoreMessageChannel: () => void;
beforeAll(() => {
  restoreMessageChannel = installFakeMessageChannel();
});
afterAll(() => {
  restoreMessageChannel();
});

// The isolated-world side of the provider transport: it hands one end of a
// channel to the inpage world and services requests that arrive over it.

type PortLike = {
  onmessage: ((ev: { data: unknown }) => void) | null;
  postMessage: (data: unknown) => void;
  start: () => void;
};

// Every createScopePort() adds a window listener that lives for the rest of the
// file, so each test uses its own scope name and only its own server answers.
let scopeCounter = 0;
const nextScope = () => `webln-${++scopeCounter}`;

async function loadServer() {
  let mod!: typeof import("../messagePortServer");
  await jest.isolateModulesAsync(async () => {
    mod = await import("../messagePortServer");
  });
  return mod;
}

// Play the inpage side: ask for the port and take the one that is transferred.
function requestPort(scope: string): PortLike {
  const posted: unknown[][] = [];
  const spy = jest
    .spyOn(window, "postMessage")
    .mockImplementation((...args: unknown[]) => {
      posted.push(args);
    });

  window.dispatchEvent(
    new MessageEvent("message", {
      data: { application: "LBE", type: "lbe:port-request", scope },
      source: window,
    })
  );

  spy.mockRestore();
  const transfer = posted.find(
    (args) =>
      (args[0] as Record<string, string>)?.type === "lbe:port" &&
      (args[0] as Record<string, string>)?.scope === scope
  );
  expect(transfer).toBeDefined();
  const ports = transfer?.[2] as PortLike[];
  expect(ports).toHaveLength(1);
  const port = ports[0];
  port.start();
  return port;
}

function nextMessage(port: PortLike): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    port.onmessage = (ev) => resolve(ev.data as Record<string, unknown>);
  });
}

describe("createScopePort", () => {
  test("services a request that arrives over the port and replies on it", async () => {
    const { createScopePort } = await loadServer();
    const scope = nextScope();
    const transport = createScopePort(scope);
    const port = requestPort(scope);

    transport.onRequest(
      (data: Record<string, unknown>, reply: (r: unknown) => void) => {
        expect(data.action).toBe("webln/getInfo");
        reply({ data: { node: "genuine" } });
      }
    );

    const reply = nextMessage(port);
    port.postMessage({ id: "1", application: "LBE", action: "webln/getInfo" });

    await expect(reply).resolves.toMatchObject({
      id: "1",
      scope,
      response: true,
      data: { data: { node: "genuine" } },
    });
  });

  test("buffers requests that arrive before a handler is registered", async () => {
    const { createScopePort } = await loadServer();
    const scope = nextScope();
    const transport = createScopePort(scope);
    const port = requestPort(scope);

    port.postMessage({
      id: "early",
      application: "LBE",
      action: "webln/getInfo",
    });
    await new Promise((r) => setTimeout(r, 10));

    const seen: string[] = [];
    const reply = nextMessage(port);
    transport.onRequest(
      (data: Record<string, unknown>, r: (v: unknown) => void) => {
        seen.push(data.id as string);
        r({ data: {} });
      }
    );

    await expect(reply).resolves.toMatchObject({ id: "early" });
    expect(seen).toEqual(["early"]);
  });

  test("transfers the port only once", async () => {
    const { createScopePort } = await loadServer();
    const scope = nextScope();
    createScopePort(scope);
    requestPort(scope);

    // a second request finds nothing left to transfer
    const posted: unknown[][] = [];
    const spy = jest
      .spyOn(window, "postMessage")
      .mockImplementation((...args: unknown[]) => {
        posted.push(args);
      });
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { application: "LBE", type: "lbe:port-request", scope },
        source: window,
      })
    );
    spy.mockRestore();
    expect(posted).toHaveLength(0);
  });

  test("ignores handshake requests for another scope", async () => {
    const { createScopePort } = await loadServer();
    createScopePort(nextScope());

    const posted: unknown[][] = [];
    const spy = jest
      .spyOn(window, "postMessage")
      .mockImplementation((...args: unknown[]) => {
        posted.push(args);
      });
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          application: "LBE",
          type: "lbe:port-request",
          scope: "a-different-scope",
        },
        source: window,
      })
    );
    spy.mockRestore();
    expect(posted).toHaveLength(0);
  });

  test("sends events over the port", async () => {
    const { createScopePort } = await loadServer();
    const scope = nextScope();
    const transport = createScopePort(scope);
    const port = requestPort(scope);

    const event = nextMessage(port);
    transport.sendEvent("accountChanged");

    await expect(event).resolves.toMatchObject({
      application: "LBE",
      event: "accountChanged",
      scope,
    });
  });
});
