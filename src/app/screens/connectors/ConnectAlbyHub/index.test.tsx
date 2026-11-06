import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ConnectAlbyHub from "./index";

jest.mock("~/common/lib/msg", () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

describe("ConnectAlbyHub", () => {
  test("masks the NWC connection secret input", () => {
    render(
      <MemoryRouter>
        <ConnectAlbyHub />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("NWC connection secret")).toHaveAttribute(
      "type",
      "password"
    );
  });
});
