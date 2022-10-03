import PaymentSummary, { Props } from "@components/PaymentSummary";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

const defaultProps = {
  amount: "1234",
  fiatAmount: "",
};

describe("PaymentSummary", () => {
  const renderComponent = (props?: Partial<Props>) =>
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <PaymentSummary {...defaultProps} {...props} />
        </I18nextProvider>
      </BrowserRouter>
    );

  test("renders correctly with default props", () => {
    renderComponent();

    expect(screen.getByText("1234 sats")).toBeDefined();
    expect(screen.queryByText("Description")).toBeNull();
    expect(screen.queryByTestId("fiat_amount")).toBeNull();
  });

  test("renders with description", () => {
    renderComponent({
      description: "The lovely description",
    });

    expect(screen.getByText("1234 sats")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("The lovely description")).toBeDefined();
  });

  test("renders with fiat amount", () => {
    renderComponent({
      fiatAmount: "$0,02",
    });

    expect(screen.getByTestId("fiat_amount")).toBeDefined();
    expect(screen.getByText(/(~\$0,02)/)).toBeInTheDocument();
  });
});
