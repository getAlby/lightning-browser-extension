import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";
import api from "~/common/lib/api";

import MnemonicExplanation from "./new";

jest.mock("~/common/lib/api", () => ({
  __esModule: true,
  default: {
    getAccount: jest.fn(),
  },
}));

jest.mock("~/app/utils", () => {
  const actual = jest.requireActual("~/app/utils");

  return {
    ...actual,
    useTheme: jest.fn(() => "light"),
  };
});

describe("MnemonicExplanation", () => {
  beforeEach(() => {
    jest.mocked(api.getAccount).mockResolvedValue({
      hasMnemonic: false,
    } as Awaited<ReturnType<typeof api.getAccount>>);
  });

  test("disables Next until a setup option is selected", async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <MnemonicExplanation />
        </MemoryRouter>
      </I18nextProvider>
    );

    const nextButton = await screen.findByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Create Master Key/ }));

    expect(nextButton).toBeEnabled();
  });
});
