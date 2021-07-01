import React from "react";
import Progressbar from "../app/components/Shared/progressbar";

export const Primary = () => (
  <Progressbar
    filledColor="blue-bitcoin"
    notFilledColor="blue-200"
    textColor="white"
  />
);

export default {
  title: "Components/Progressbar",
  component: Progressbar,
};
