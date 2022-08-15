import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";

import Send from "./index";

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
});

describe("Send", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Send (popup)", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Send />
      </MemoryRouter>
    );

    expect(
      await screen.getByLabelText("Lightning Invoice")
    ).toBeInTheDocument();
    await act(async () => {
      await user.type(
        screen.getByLabelText("Lightning Invoice"),
        "    sampleinvoice  "
      );
    });
    expect(screen.getByLabelText("Lightning Invoice")).toHaveValue(
      "sampleinvoice"
    );
    await act(async () => {
      await user.clear(screen.getByLabelText("Lightning Invoice"));
      await user.type(
        screen.getByLabelText("Lightning Invoice"),
        "lightning:test@getalby.com"
      );
    });
    expect(screen.getByLabelText("Lightning Invoice")).toHaveValue(
      "test@getalby.com"
    );
  });
});
