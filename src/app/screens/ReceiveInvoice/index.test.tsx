import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import { SettingsProvider } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";

import ReceiveInvoice from "../ReceiveInvoice";

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })),
    makeInvoice: jest.fn(),
    getAccountInfo: jest.fn(() =>
      Promise.resolve({ info: { lightning_address: "hello@getalby.com" } })
    ),
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
          <SettingsProvider>
            <ReceiveInvoice />
          </SettingsProvider>
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
