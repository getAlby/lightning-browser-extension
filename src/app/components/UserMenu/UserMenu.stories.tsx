import UserMenu from ".";
import { Meta } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";

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
