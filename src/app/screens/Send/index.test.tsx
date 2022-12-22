import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

import Send from "./index";

describe("Send", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Send (popup)", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Send />
        </I18nextProvider>
      </MemoryRouter>
    );

    expect(await screen.getByLabelText("Recipient")).toBeInTheDocument();

    await act(async () => {
      await user.type(
        screen.getByLabelText("Recipient"),
        "    sampleinvoice  "
      );
    });

    expect(screen.getByLabelText("Recipient")).toHaveValue("sampleinvoice");

    await act(async () => {
      await user.clear(screen.getByLabelText("Recipient"));
      await user.type(
        screen.getByLabelText("Recipient"),
        "lightning:test@getalby.com"
      );
    });

    expect(screen.getByLabelText("Recipient")).toHaveValue("test@getalby.com");
  });
});
