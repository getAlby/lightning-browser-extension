import React from "react";

import UserMenu from ".";

const metadata = {
  title: "Components/UserMenu",
  component: UserMenu,
};

export default metadata;

export const Default = () => (
  <div className="max-w-xs flex justify-end">
    <UserMenu />
  </div>
);
