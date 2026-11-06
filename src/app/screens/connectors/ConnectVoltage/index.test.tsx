import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ConnectVoltage from "./index";

jest.mock("~/common/lib/msg", () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

function renderNodeUrlInput() {
  render(
    <MemoryRouter>
      <ConnectVoltage />
    </MemoryRouter>
  );
  return screen.getByLabelText("Node URL") as HTMLInputElement;
}

describe("ConnectVoltage", () => {
  test("accepts an https node URL", () => {
    const input = renderNodeUrlInput();
    fireEvent.change(input, {
      target: { value: "https://node.m.voltageapp.io:8080" },
    });
    expect(input.validity.patternMismatch).toBe(false);
  });

  test("rejects an http node URL so the macaroon is never sent in cleartext", () => {
    const input = renderNodeUrlInput();
    fireEvent.change(input, {
      target: { value: "http://node.m.voltageapp.io:8080" },
    });
    expect(input.validity.patternMismatch).toBe(true);
  });
});
