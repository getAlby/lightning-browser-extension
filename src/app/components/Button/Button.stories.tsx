import React from "react";

import Button from ".";

export const Default = () => <Button label="Button" />;
export const Primary = () => <Button label="Button" primary />;
export const Loading = () => <Button label="Button" primary loading />;

export default {
  title: "Components/Buttons/Button",
  component: Button,
};
