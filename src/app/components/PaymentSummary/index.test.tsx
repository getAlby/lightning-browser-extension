import PaymentSummary, { Props } from "@components/PaymentSummary";
import { act, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";
import { SettingsProvider } from "~/app/context/SettingsContext";

// calls in SettingsProvider
jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })),
  };
});

const defaultProps = {
  amount: "1234",
  fiatAmount: "",
};

describe("PaymentSummary", () => {
  const renderComponent = async (props?: Partial<Props>) => {
    await act(async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <SettingsProvider>
              <PaymentSummary {...defaultProps} {...props} />
            </SettingsProvider>
          </I18nextProvider>
        </BrowserRouter>
      );
    });
  };

  test("renders correctly with default props", async () => {
    await renderComponent();

    expect(screen.getByText("1,234 sats")).toBeDefined();
    expect(screen.queryByText("Description")).toBeNull();
    expect(screen.queryByTestId("fiat_amount")).toBeNull();
  });

  test("renders with description", async () => {
    await renderComponent({
      description: "The lovely description",
    });

    expect(screen.getByText("1,234 sats")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("The lovely description")).toBeDefined();
  });

  test("renders with fiat amount", async () => {
    await renderComponent({
      fiatAmount: "$0,02",
    });

    expect(screen.getByTestId("fiat_amount")).toBeDefined();
    expect(screen.getByText(/(~\$0,02)/)).toBeInTheDocument();
  });
});
