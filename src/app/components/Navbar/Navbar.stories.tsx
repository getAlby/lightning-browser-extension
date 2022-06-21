import { Meta } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { AccountsProvider } from "~/app/context/AccountsContext";

import Navbar from ".";

const metadata: Meta = {
  title: "Components/Navbar",
  component: Navbar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AccountsProvider>
          <Story />
        </AccountsProvider>
      </MemoryRouter>
    ),
  ],
};

export default metadata;

export const Default = () => (
  <Navbar
    title="John Doe"
    balances={{ satsBalance: "1000 sats", fiatBalance: "$0.10" }}
  />
);

export const WithLinks = () => (
  <Navbar
    title="John Doe"
    balances={{ satsBalance: "1000 sats", fiatBalance: "$0.10" }}
  >
    <Navbar.Link href="/">Screen 1</Navbar.Link>
    <Navbar.Link href="/screen-2">Screen 2</Navbar.Link>
    <Navbar.Link href="/screen-3">Screen 3</Navbar.Link>
  </Navbar>
);

export const Loading = () => (
  <Navbar title="" balances={{ satsBalance: "", fiatBalance: "" }} />
);
