import React from "react";
import { MemoryRouter } from "react-router-dom";

import Navbar from ".";
import UserMenu from "../UserMenu";

const metadata = {
  title: "Components/Navbar",
  component: Navbar,
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
  <Navbar
    title="John Doe"
    subtitle="₿0.0016 7930 €33.57"
    right={<UserMenu />}
  />
);

export const WithLinks = () => (
  <Navbar title="John Doe" subtitle="₿0.0016 7930 €33.57" right={<UserMenu />}>
    <Navbar.Link href="/">Screen 1</Navbar.Link>
    <Navbar.Link href="/screen-2">Screen 2</Navbar.Link>
    <Navbar.Link href="/screen-3">Screen 3</Navbar.Link>
  </Navbar>
);

export const Loading = () => (
  <Navbar title="" subtitle="" right={<UserMenu />} />
);
