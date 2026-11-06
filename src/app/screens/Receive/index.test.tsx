import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import api from "~/common/lib/api";
import type { AccountInfo } from "~/types";

import Receive from "./index";

let mockAccount: Partial<AccountInfo> = { id: "1" };

jest.mock("~/app/context/AccountContext", () => ({
  useAccount: () => ({ account: mockAccount, accountLoading: false }),
}));

jest.mock("~/common/lib/api", () => ({
  __esModule: true,
  default: { swr: { getAccountInfo: jest.fn() } },
}));

jest.mock("~/app/components/QRCode", () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <output>{value}</output>,
}));

const renderReceive = () => (
  <MemoryRouter>
    <Receive />
  </MemoryRouter>
);

describe("Receive", () => {
  test("stops offering a lightning address once it is gone", async () => {
    const address = "alice@getalby.com";
    jest
      .mocked(api.swr.getAccountInfo)
      .mockResolvedValueOnce({ lightningAddress: address } as AccountInfo)
      .mockResolvedValueOnce({} as AccountInfo);

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = render(renderReceive());
    });
    expect(screen.getAllByText(address).length).toBeGreaterThan(0);

    mockAccount = { id: "1" };
    await act(async () => {
      view.rerender(renderReceive());
    });
    expect(screen.queryByText(address)).not.toBeInTheDocument();
  });
});
