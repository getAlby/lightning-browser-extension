import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ConnectUmbrel from "./index";

jest.mock("~/common/lib/msg", () => ({
  __esModule: true,
  default: { request: jest.fn().mockResolvedValue({}) },
}));

describe("ConnectUmbrel", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test.each([
    ["malformed URI", "lndconnect//other-node.example:8080?macaroon=BQYHCA"],
    [
      "invalid macaroon encoding",
      "lndconnect://other-node.example:8080?macaroon=BQYHCA!",
    ],
  ])("does not keep the previous connection after an %s", (_, replacement) => {
    render(
      <MemoryRouter>
        <ConnectUmbrel />
      </MemoryRouter>
    );
    const input = screen.getByLabelText("lndconnect REST URL");
    const submit = screen.getByRole("button", { name: "Continue" });

    fireEvent.change(input, {
      target: { value: "lndconnect://node.example:8080?macaroon=AQIDBA" },
    });
    expect(submit).toBeEnabled();

    fireEvent.change(input, { target: { value: replacement } });
    expect(submit).toBeDisabled();
  });
});
