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

describe("useTips", () => {
  test("should not have top up wallet tip when using a non-alby account", async () => {
    tmpAccount = { id: "1", name: "LND account", alias: "" };
    const { tips } = useTips();
    expect(tips.length).toBe(1);
    const hasTopUpWallet = tips.some((tip) => tip === TIPS.TOP_UP_WALLET);
    expect(hasTopUpWallet).toBe(false);
  });
  test("should have top up wallet tip when having alby account", async () => {
    tmpAccount = { id: "2", name: "Alby", alias: "🐝 getalby.com" };
    const { tips } = useTips();
    expect(tips.length).toBe(2);
    const hasTopUpWallet = tips.some((tip) => tip === TIPS.TOP_UP_WALLET);
    expect(hasTopUpWallet).toBe(true);
  });
});
