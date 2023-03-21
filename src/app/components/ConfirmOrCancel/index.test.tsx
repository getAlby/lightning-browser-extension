import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

import type { Props } from "./index";
import ConfirmOrCancel from "./index";

const props: Props = {
  label: "Confirm Test",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe("ConfirmOrCancel", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <ConfirmOrCancel {...props} />
        </I18nextProvider>
      </MemoryRouter>
    );

    expect(await screen.getByText("Confirm Test")).toBeInTheDocument();
    expect(await screen.getByText("Cancel")).toBeInTheDocument();
  });
});
