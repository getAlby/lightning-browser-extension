import React from "react";

import Appbar from ".";

const metadata = {
  title: "Components/Appbar",
  component: Appbar,
};

export default metadata;

export const Default = () => (
  <Appbar
    title="John Doe"
    subtitle="₿0.0016 7930 €33.57"
    onOptionsClick={() => alert("Options clicked!")}
  />
);

export const Loading = () => (
  <Appbar
    title=""
    subtitle=""
    onOptionsClick={() => alert("Options clicked!")}
  />
);
