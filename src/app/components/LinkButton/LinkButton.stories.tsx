import { MemoryRouter } from "react-router-dom";
import { Meta } from "@storybook/react/types-6-0";

import LinkButton from ".";

const metadata: Meta = {
  title: "Components/Buttons/LinkButton",
  component: LinkButton,
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
  <LinkButton
    to="/"
    title="Title"
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  />
);
