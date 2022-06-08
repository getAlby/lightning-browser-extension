import { Meta } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { AccountsProvider } from "~/app/context/AccountsContext";

import AcountMenu from ".";

export const Default = () => (
  <AcountMenu
    title="node"
    balances={{ satsBalance: "1000 sats", fiatBalance: "$0.10" }}
  />
);

const metadata: Meta = {
  title: "Components/AcountMenu",
  component: AcountMenu,
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
