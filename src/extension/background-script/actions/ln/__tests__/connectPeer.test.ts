import state from "~/extension/background-script/state";
import type { MessageConnectPeer } from "~/types";

import connectPeer from "../connectPeer";

jest.mock("~/extension/background-script/state");

const mockState = {
  getConnector: () => ({
    connectPeer: () => Promise.resolve({ data: true }),
  }),
};

const message: MessageConnectPeer = {
  application: "LBE",
  prompt: true,
  action: "connectPeer",
  args: {
    host: "34.68.41.206:9735",
    pubkey:
      "03037dc08e9ac63b82581f79b662a4d0ceca8a8ca162b1af3551595b8f2d97b70a",
  },
  origin: {
    internal: true,
  },
};

describe("open connectPeer", () => {
  test("types", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);
    expect(await connectPeer(message)).toStrictEqual({ data: true });
  });
});
