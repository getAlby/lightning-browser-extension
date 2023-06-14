import Tips from "@components/Tips";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";
import { TIPS } from "~/common/constants";

jest.mock("~/app/hooks/useTips", () => ({
  useTips: () => ({
    tips: Object.values(TIPS),
  }),
}));

describe("Tips", () => {
  test("should have 3 tips", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Tips />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(await screen.findByText("Buy Bitcoin")).toBeInTheDocument();
    expect(await screen.findByText("Alby Demo")).toBeInTheDocument();
    expect(await screen.findByText("Nostr")).toBeInTheDocument();
  });
});
