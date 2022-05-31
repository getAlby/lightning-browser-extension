import AcountMenu from ".";
import { Meta } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { AccountsProvider } from "~/app/context/AccountsContext";

export const Default = () => <AcountMenu title="node" subtitle="1000 sats" />;

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
