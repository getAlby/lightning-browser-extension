import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";
import api from "~/common/lib/api";

import Receive from "./index";

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
  getFormattedFiat: jest.fn(),
});

jest.mock("~/common/lib/api", () => {
  return {
    getSettings: jest.fn(() => ({
      currency: "USD",
      exchange: "coindesk",
    })),
    makeInvoice: jest.fn(),
  };
});

describe("Receive", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("call createInvoice if form is filled and submitted", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <MemoryRouter>
          <Receive />
        </MemoryRouter>
      );
    });

    const makeInvoiceSpy = jest.spyOn(api, "makeInvoice");

    const amountField = await screen.getByLabelText("Amount");
    expect(amountField).toBeInTheDocument();
    await act(async () => {
      await user.type(amountField, "250");
    });

    const descriptionField = await screen.getByLabelText("Description");
    expect(descriptionField).toBeInTheDocument();
    await act(async () => {
      await user.type(descriptionField, "It's a description");
    });

    await act(async () => {
      await user.click(
        await screen.getByRole("button", { name: "Create Invoice" })
      );
    });

    expect(makeInvoiceSpy).toHaveBeenCalledWith({
      amount: "250",
      memo: "It's a description",
    });
  });
});
