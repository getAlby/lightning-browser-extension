import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import { useTips } from "~/app/hooks/useTips";
import { TIPS } from "~/common/constants";

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedFiat: jest.fn(),
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(),
  }),
}));

let tmpAccount = { id: "1", name: "LND account", alias: "" };

jest.mock("~/app/context/AccountContext", () => ({
  useAccount: () => ({
    account: tmpAccount,
    loading: false,
    unlock: jest.fn(),
    lock: jest.fn(),
    setAccountId: jest.fn(),
    fetchAccountInfo: jest.fn(),
    balancesDecorated: {
      fiatBalance: "",
      satsBalance: "",
    },
  }),
}));

jest.mock("~/app/utils", () => {
  const original = jest.requireActual("~/app/utils");
  return {
    ...original,
    getBrowserType: () => "chrome",
  };
});

describe("useTips", () => {
  test("should have 2 tips in chrome", async () => {
    tmpAccount = { id: "1", name: "LND account", alias: "" };
    const { tips } = useTips();
    expect(tips.length).toBe(2);
    const hasTopUpWallet = tips.some((tip) => tip === TIPS.TOP_UP_WALLET);
    expect(hasTopUpWallet).toBe(false);
  });
  test("should have 3 tips with top up wallet in chrome when having alby account", async () => {
    tmpAccount = { id: "2", name: "Alby", alias: "🐝 getalby.com" };
    const { tips } = useTips();
    expect(tips.length).toBe(3);
    const hasTopUpWallet = tips.some((tip) => tip === TIPS.TOP_UP_WALLET);
    expect(hasTopUpWallet).toBe(true);
  });
});
