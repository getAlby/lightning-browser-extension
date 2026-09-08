import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { LNURLAuthServiceResponse, OriginData } from "~/types";

import LNURLAuthComponent from "./index";

const mockOrigin: OriginData = {
  location: "https://site.com/login",
  domain: "https://site.com",
  host: "site.com",
  pathname: "/login",
  name: "Site",
  description: "",
  icon: "https://site.com/favicon.ico",
  metaData: {},
  external: true,
};

const mockLnurlDetails: LNURLAuthServiceResponse = {
  domain: "site.com",
  k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
  tag: "login",
  url: "https://site.com/lnurl-login",
};

// set by the background script only for a service on the requesting host
let mockRememberLoginHost: string | undefined = "site.com";

jest.mock("~/app/hooks/useNavigationState", () => ({
  useNavigationState: jest.fn(() => ({
    origin: mockOrigin,
    isPrompt: true,
    args: {
      lnurlDetails: mockLnurlDetails,
      rememberLoginHost: mockRememberLoginHost,
    },
  })),
}));

const mockGetAllowance = jest.fn(() =>
  Promise.resolve({ id: 1, lnurlAuth: false })
);
jest.mock("~/common/lib/api", () => ({
  __esModule: true,
  default: {
    lnurlAuth: () => Promise.resolve({ success: true }),
    getAllowance: () => mockGetAllowance(),
  },
}));

const mockRequest = jest.fn((...args: unknown[]) => Promise.resolve(args));
jest.mock("~/common/lib/msg", () => ({
  __esModule: true,
  default: {
    request: (...args: unknown[]) => mockRequest(...args),
    reply: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LNURLAuth", () => {
  beforeEach(() => {
    mockRequest.mockClear();
    mockRememberLoginHost = "site.com";
  });

  test("a login does not enable the auto-login on its own", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <MemoryRouter>
          <LNURLAuthComponent />
        </MemoryRouter>
      );
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Login" }));
    });

    expect(await screen.findByText(/Login successful/)).toBeInTheDocument();
    expect(mockRequest).not.toHaveBeenCalledWith(
      "updateAllowance",
      expect.anything()
    );
  });

  test("confirming the checkbox enables the auto-login for the service", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <MemoryRouter>
          <LNURLAuthComponent />
        </MemoryRouter>
      );
    });

    await act(async () => {
      await user.click(
        screen.getByLabelText("Remember my choice and don't ask again")
      );
      await user.click(screen.getByRole("button", { name: "Login" }));
    });

    expect(mockRequest).toHaveBeenCalledWith("updateAllowance", {
      id: 1,
      lnurlAuth: true,
    });
  });

  test("auto-login is not offered without a remember host from the background", async () => {
    mockRememberLoginHost = undefined;

    await act(async () => {
      render(
        <MemoryRouter>
          <LNURLAuthComponent />
        </MemoryRouter>
      );
    });

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
