import state from "~/extension/background-script/state";

describe("getConnector", () => {
  test("rejects accounts using a connector that no longer exists", async () => {
    state.setState({
      password: jest.fn(() => Promise.resolve("123456")),
      connector: null,
      currentAccountId: "1",
      accounts: {
        "1": {
          id: "1",
          name: "Tor node",
          config: "encrypted",
          connector: "nativelnd" as never,
        },
      },
    });

    await expect(state.getState().getConnector()).rejects.toThrow(
      "The connection type of this wallet (nativelnd) is no longer supported. Please remove this wallet and add it again."
    );
  });
});
