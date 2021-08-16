import React from "react";
import { MemoryRouter } from "react-router-dom";

import LinkButton from ".";

const metadata = {
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
