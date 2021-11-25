import { MemoryRouter } from "react-router-dom";
import { Meta } from "@storybook/react/types-6-0";

import AcountMenu from ".";

export const Default = () => (
  <div className="relative bg-gray-100 w-40 flex justify-between pl-3 rounded-md">
    <span>Wallet</span>
    <AcountMenu />
  </div>
);

const metadata: Meta = {
  title: "Components/AcountMenu",
  component: AcountMenu,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default metadata;
