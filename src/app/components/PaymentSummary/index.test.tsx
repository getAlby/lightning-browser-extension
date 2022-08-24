import PaymentSummary, { Props } from "@components/PaymentSummary";
import { render } from "@testing-library/react";

const defaultProps = {
  amount: "1234",
  fiatAmount: "",
};

describe("PaymentSummary", () => {
  const renderComponent = (props?: Partial<Props>) =>
    render(<PaymentSummary {...defaultProps} {...props} />);

  test("renders correctly with default props", () => {
    const { getByText, queryByText, queryByTestId } = renderComponent();

    expect(getByText("1234 sats")).toBeDefined();
    expect(queryByText("Description")).toBeNull();
    expect(queryByTestId("fiat_amount")).toBeNull();
  });

  test("renders with description", () => {
    const { getByText } = renderComponent({
      description: "The lovely description",
    });

    expect(getByText("1234 sats")).toBeDefined();
    expect(getByText("Description")).toBeDefined();
    expect(getByText("The lovely description")).toBeDefined();
  });

  test("renders with fiat amount", () => {
    const { getByText, getByTestId } = renderComponent({
      fiatAmount: "$0,02",
    });

    expect(getByTestId("fiat_amount")).toBeDefined();
    expect(getByText("$0,02")).toBeDefined();
  });
});
