import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import ResultCard from "./index";

const successProps: Props = {
  isSuccess: true,
  message: "Test Successful!",
};

const failureProps: Props = {
  isSuccess: false,
  message: "Test Successful!",
};

describe("ResultCard", () => {
  test("success render", async () => {
    render(
      <MemoryRouter>
        <ResultCard {...successProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Test Successful!")).toBeInTheDocument();
    expect(screen.getByAltText("success")).toBeInTheDocument();
  });

  test("failure render", async () => {
    render(
      <MemoryRouter>
        <ResultCard {...failureProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Test Successful!")).toBeInTheDocument();
    expect(screen.getByAltText("failure")).toBeInTheDocument();
  });
});
