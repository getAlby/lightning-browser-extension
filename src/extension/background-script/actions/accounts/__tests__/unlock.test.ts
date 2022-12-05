import state from "~/extension/background-script/state";
import type { MessageAccountUnlock } from "~/types";

import unlock from "../unlock";

jest.mock("~/extension/background-script/state");

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    config:
      "U2FsdGVkX19YMFK/8YpN5XQbMsmbVmlOJgpZCIRlt25K6ur4EPp4XdRUQC7+ep/m1k8d2yy69QfuGpsgn2SZOv4DQaPsdYTTwjj0mibQG/dkJ9OCp88zXuMpconrmRu5w4uZWEvdg7p5GQfIYJCvTPLUq+1zH3iH0xX7GhlrlQ8=",
    connector: "lndhub",
    id: "1e1e8ea6-493e-480b-9855-303d37506e97",
    name: "Alby",
  }),
  getConnector: jest.fn(),
};

describe("edit account", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("edit existing account", async () => {
    const message: MessageAccountUnlock = {
      application: "LBE",
      args: { password: 1 },
      origin: { internal: true },
      prompt: true,
      action: "unlock",
    };

    state.getState = jest.fn().mockReturnValue(mockState);
    const spy = jest.spyOn(mockState, "password");

    expect(await unlock(message)).toStrictEqual({
      data: {
        unlocked: true,
        currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
      },
    });

    expect(spy).toHaveBeenNthCalledWith(1, "1");

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
