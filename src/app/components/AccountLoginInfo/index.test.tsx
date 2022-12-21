import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

import LoginSite from ".";
import { LoginSiteProps } from ".";

const defaultProps: LoginSiteProps = {
  accountId: "3a6a8a14-129f-4151-aa3d-e3476e97c496",
};

jest.mock("~/common/lib/msg", () => {
  return {
    request: jest.fn(() => ({
      allowances: [
        {
          host: "makers.bolt.fun",
          name: "makers bolt",
          imageURL: "https://makers.bolt.fun/favicon.ico",
          enabled: true,
          lastPaymentAt: 0,
          totalBudget: 0,
          remainingBudget: 0,
          createdAt: "1671283145263",
          lnurlAuth: true,
          tag: "",
          accountId: "3a6a8a14-129f-4151-aa3d-e3476e97c496",
          id: 52,
          payments: [],
          paymentsAmount: 0,
          paymentsCount: 0,
          percentage: "NaN",
          usedBudget: 0,
        },
        {
          host: "webln.twentyuno.net",
          name: "WebLN Experiments",
          imageURL: "https://webln.twentyuno.net/favicon.png",
          enabled: true,
          lastPaymentAt: 0,
          totalBudget: 0,
          remainingBudget: 0,
          createdAt: "1671282996630",
          lnurlAuth: false,
          tag: "",
          accountId: "3a6a8a14-129f-4151-aa3d-e3476e97c496",
          id: 51,
          payments: [],
          paymentsAmount: 0,
          paymentsCount: 0,
          percentage: "NaN",
          usedBudget: 0,
        },
      ],
    })),
  };
});

describe("AccountLoginInfo", () => {
  test("renders website logo", async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <LoginSite {...defaultProps} />
        </I18nextProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByAltText("makers.bolt.fun")).not.toBe(null);
    });
    act(() => {
      /* fire events that update state */
      userEvent.click(screen.getByAltText("makers.bolt.fun"));
    });
    await waitFor(async () => {
      expect(screen.getAllByAltText("makers.bolt.fun").length).toEqual(2);

      expect(await screen.findByText("makers.bolt.fun")).toBeVisible();
      expect(await screen.findByText("makers bolt")).toBeVisible();
    });
  });
});
