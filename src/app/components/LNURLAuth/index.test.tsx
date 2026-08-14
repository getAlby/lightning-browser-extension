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

const lnurlDetailsFor = (url: string): LNURLAuthServiceResponse => ({
  domain: new URL(url).hostname,
  k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
  tag: "login",
  url,
});

// the service of the website itself
let mockLnurlDetails = lnurlDetailsFor("https://site.com/lnurl-login");

jest.mock("~/app/hooks/useNavigationState", () => ({
  useNavigationState: jest.fn(() => ({
    origin: mockOrigin,
    isPrompt: true,
    args: { lnurlDetails: mockLnurlDetails },
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
    mockLnurlDetails = lnurlDetailsFor("https://site.com/lnurl-login");
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

  test("auto-login is not offered for a service on a different host", async () => {
    mockLnurlDetails = lnurlDetailsFor("https://auth.site.com/lnurl-login");

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
