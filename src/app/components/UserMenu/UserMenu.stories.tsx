import { MemoryRouter } from "react-router-dom";
import { Meta } from "@storybook/react/types-6-0";

import UserMenu from ".";

const metadata: Meta = {
  title: "Components/UserMenu",
  component: UserMenu,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default metadata;

export const Default = () => (
  <div className="max-w-xs flex justify-end">
    <UserMenu />
  </div>
);
