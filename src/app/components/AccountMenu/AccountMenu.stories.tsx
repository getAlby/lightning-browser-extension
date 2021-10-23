import React from "react";

import AcountMenu from ".";

export const Default = () => (
  <div className="relative bg-gray-100 w-40 flex justify-between pl-3 rounded-md">
    <span>Wallet</span>
    <AcountMenu />
  </div>
);

const metadata = {
  title: "Components/AcountMenu",
  component: AcountMenu,
};

export default metadata;
