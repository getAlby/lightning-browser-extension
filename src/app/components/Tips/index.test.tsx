import Tips from "@components/Tips";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";
import { TIPS } from "~/common/constants";

jest.mock("~/app/hooks/useTips", () => ({
  useTips: () => ({
    tips: [TIPS.TOP_UP_WALLET, TIPS.DEMO],
  }),
}));

describe("Tips", () => {
  test("should have 2 tips", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Tips />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(
      await screen.findByText("⚡️ Top up your wallet")
    ).toBeInTheDocument();
    expect(await screen.findByText("🕹️ Try out Alby Demo")).toBeInTheDocument();
  });
});
