import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

import type { Props } from "./index";
import SignOrDeny from "./index";

const props: Props = {
  label: "Sign Test",
  onSign: jest.fn(),
  onDeny: jest.fn(),
};

describe("SignOrDeny", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <SignOrDeny {...props} />
        </I18nextProvider>
      </MemoryRouter>
    );

    expect(await screen.getByText("Sign Test")).toBeInTheDocument();
    expect(await screen.getByText("Deny")).toBeInTheDocument();
  });
});
