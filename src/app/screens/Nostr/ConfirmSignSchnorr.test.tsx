import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import type { OriginData } from "~/types";

import ConfirmSignSchnorr from "./ConfirmSignSchnorr";

const mockOrigin = {
  host: "example.com",
  name: "Example",
  icon: "",
} as OriginData;

jest.mock("~/app/hooks/useNavigationState", () => ({
  useNavigationState: jest.fn(),
}));

const renderWithArgs = async (args: Record<string, unknown>) => {
  (useNavigationState as jest.Mock).mockReturnValue({
    origin: mockOrigin,
    args,
  });
  await act(async () => {
    render(
      <MemoryRouter>
        <ConfirmSignSchnorr />
      </MemoryRouter>
    );
  });
};

describe("ConfirmSignSchnorr", () => {
  test("shows the sigHash in hash mode", async () => {
    await renderWithArgs({ sigHash: "abcd" });
    expect(screen.getByText("abcd")).toBeInTheDocument();
  });

  test("does not show the sigHash when an (empty) message is signed", async () => {
    await renderWithArgs({ message: "", sigHash: "I authorize this login" });
    expect(
      screen.queryByText("I authorize this login")
    ).not.toBeInTheDocument();
  });
});
