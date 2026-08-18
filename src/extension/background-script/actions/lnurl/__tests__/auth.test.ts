import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import Mnemonic from "~/extension/background-script/mnemonic";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type {
  DbAllowance,
  LNURLDetails,
  MessageWebLnLnurl,
  Sender,
} from "~/types";

import { authFunction, getPathSuffix } from "../auth";
import authOrPrompt from "../authOrPrompt";

let fetchedUrl: string;
jest.mock("~/extension/background-script/state");
jest.mock("axios", () => ({
  get: (requestUrl: string) => {
    fetchedUrl = requestUrl;
    return { data: { status: "OK" } };
  },
  isAxiosError: () => false,
}));

let mockAllowance: DbAllowance | undefined;
jest.mock("~/extension/background-script/db", () => ({
  __esModule: true,
  default: {
    allowances: {
      where: () => ({
        equalsIgnoreCase: () => ({
          first: async () => mockAllowance,
        }),
      }),
    },
  },
}));

const mockOpenPrompt = jest.fn((...args: unknown[]) => ({
  success: true,
  args,
}));
jest.mock("~/common/lib/utils", () => ({
  __esModule: true,
  default: {
    ...jest.requireActual("~/common/lib/utils").default,
    openPrompt: (...args: unknown[]) => mockOpenPrompt(...args),
  },
}));

const passwordMock = jest.fn;

describe("auth with mnemonic", () => {
  test("getPathSuffix matches test vector", () => {
    expect(
      getPathSuffix(
        "site.com",
        "7d417a6a5e9a6a4a879aeaba11a11838764c8fa2b959c242d43dea682b3e409b"
      )
    ).toStrictEqual([1588488367, 2659270754, 38110259, 4136336762]);
  });

  test("matches LUD05 test vector", async () => {
    const lnurlDetails: LNURLDetails = {
      domain: "site.com",
      k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
      tag: "login",
      url: "https://site.com/lnurl-login",
    };

    const mockState = {
      password: passwordMock,
      currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
      getAccount: () => ({
        mnemonic: btcFixture.mnemonic,
        bitcoinNetwork: "regtest",
        useMnemonicForLnurlAuth: true,
      }),
      getMnemonic: () => new Mnemonic(btcFixture.mnemonic),
      getConnector: jest.fn(),
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await authFunction({ lnurlDetails })).toStrictEqual({
      success: true,
      status: "OK",
      reason: undefined,
      authResponseData: { status: "OK" },
    });

    // ensure the public key is constant for the given mnemonic
    expect(new URL(fetchedUrl).searchParams.get("key")).toBe(
      "027da5d64331f61260eb8e2b356403446555f525bc7dc35b991ec1447e4f58991f"
    );
  });
});

// FIXME: this test is doing a real API call, and does not
// test if the user logs in to the correct account or not
describe.skip("auth", () => {
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
  test("returns success response", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);

    const lnurlDetails: LNURLDetails = {
      domain: "lnurl.fiatjaf.com",
      k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
      tag: "login",
      url: "https://lnurl.fiatjaf.com/lnurl-login",
    };

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

describe("auto-login", () => {
  const message = {
    action: "lnurl",
    args: { lnurlEncoded: "lnurl1..." },
    origin: { host: "site.com", domain: "https://site.com" },
    application: "LBE",
    prompt: true,
  } as unknown as MessageWebLnLnurl;

  const sender = { origin: "https://site.com" } as Sender;

  const lnurlDetailsFor = (url: string): LNURLDetails => ({
    domain: new URL(url).hostname,
    k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
    tag: "login",
    url,
  });

  const mockState = {
    isUnlocked: async () => true,
    getAccount: async () => ({ useMnemonicForLnurlAuth: false }),
    getConnector: async () => ({
      signMessage: async () => ({
        data: {
          signature:
            "rnu5pnhanjs3bfxz33fuyf9ywzrmkm1ns6jxdraxff1irq3hpxcbkce6zk34ee9bh7bamgd891tfy4gq1y119w53qg1ap5zodwi4u51n",
        },
      }),
    }),
  };

  beforeEach(() => {
    fetchedUrl = "";
    mockOpenPrompt.mockClear();
    mockAllowance = {
      id: 1,
      host: "site.com",
      enabled: true,
      lnurlAuth: true,
    } as DbAllowance;
    state.getState = jest.fn().mockReturnValue(mockState);
  });

  test("logs in without a prompt on the website's own service", async () => {
    const response = await authOrPrompt(
      message,
      sender,
      lnurlDetailsFor("https://site.com/lnurl-login")
    );

    expect(mockOpenPrompt).not.toHaveBeenCalled();
    expect(new URL(fetchedUrl).host).toBe("site.com");
    expect(response).toMatchObject({ success: true });
  });

  test("prompts for a service on a different host", async () => {
    await authOrPrompt(
      message,
      sender,
      lnurlDetailsFor("https://auth.site.com/lnurl-login")
    );

    expect(mockOpenPrompt).toHaveBeenCalled();
    expect(fetchedUrl).toBe("");
  });

  test("offers to remember the login for the website's own service", async () => {
    mockAllowance = { id: 1, host: "site.com", enabled: true } as DbAllowance;

    await authOrPrompt(
      message,
      sender,
      lnurlDetailsFor("https://site.com/lnurl-login")
    );

    expect(mockOpenPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({ rememberLoginHost: "site.com" }),
      })
    );
  });

  test("does not offer to remember the login for a service on a different host", async () => {
    mockAllowance = { id: 1, host: "site.com", enabled: true } as DbAllowance;

    await authOrPrompt(
      message,
      sender,
      lnurlDetailsFor("https://auth.site.com/lnurl-login")
    );

    expect(mockOpenPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({ rememberLoginHost: undefined }),
      })
    );
  });

  test("takes the remembered host from the sender, not the forwarded origin", async () => {
    mockAllowance = { id: 1, host: "site.com", enabled: true } as DbAllowance;

    await authOrPrompt(
      { ...message, origin: { host: "bank.com" } } as MessageWebLnLnurl,
      sender,
      lnurlDetailsFor("https://bank.com/lnurl-login")
    );

    expect(mockOpenPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({ rememberLoginHost: undefined }),
      })
    );
  });

  test("prompts if lnurlAuth is not enabled", async () => {
    mockAllowance = {
      id: 1,
      host: "site.com",
      enabled: true,
      lnurlAuth: false,
    } as DbAllowance;

    await authOrPrompt(
      message,
      sender,
      lnurlDetailsFor("https://site.com/lnurl-login")
    );

    expect(mockOpenPrompt).toHaveBeenCalled();
    expect(fetchedUrl).toBe("");
  });
});
