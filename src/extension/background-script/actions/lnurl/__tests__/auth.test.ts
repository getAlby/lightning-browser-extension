import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import state from "~/extension/background-script/state";
import type { LNURLDetails } from "~/types";

import { authFunction } from "../auth";

jest.mock("~/extension/background-script/state");

const mockState = {
  settings: mockSettings,
  getConnector: () => ({
    signMessage: () =>
      Promise.resolve({
        data: {
          signature:
            "rnu5pnhanjs3bfxz33fuyf9ywzrmkm1ns6jxdraxff1irq3hpxcbkce6zk34ee9bh7bamgd891tfy4gq1y119w53qg1ap5zodwi4u51n",
        },
      }),
  }),
};

const lnurlDetails: LNURLDetails = {
  domain: "lnurl.fiatjaf.com",
  k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
  tag: "login",
  url: "https://lnurl.fiatjaf.com/lnurl-login",
};

// skip till this is solved:
// https://github.com/axios/axios/pull/5146
// test works if we do not use:
// https://github.com/getAlby/lightning-browser-extension/blob/refactor/manifest-v3-support/src/extension/background-script/actions/lnurl/auth.ts#L93
describe.skip("auth", () => {
  test("returns success response", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await authFunction({ lnurlDetails })).toStrictEqual({
      success: true,
      status: "OK",
      reason: undefined,
      authResponseData: { status: "OK" },
    });
  });

  test("fails gracefully if no status is set", async () => {
    const lnurlDetails: LNURLDetails = {
      domain: "lnurl.fiatjaf.com",
      k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
      tag: "login",
      url: "https://lnurl.fiatjaf.com/lnurl-login-fail",
    };
    state.getState = jest.fn().mockReturnValue(mockState);

    expect(() => authFunction({ lnurlDetails })).rejects.toThrowError(
      "Auth: Something went wrong"
    );
  });
});
