import React from "react";
import Button from "../app/components/button";

export const Default = () => <Button label="Button" />;
export const Primary = () => <Button label="Button" primary />;
export const Loading = () => <Button label="Button" primary loading />;

export default {
  title: "Components/Buttons/Button",
  component: Button,
};
