import React from "react";
import Badge from "../app/components/Shared/badge";
import "../app/styles/index.css";

export const Primary = () => (
  <Badge label="ACTIVE" color="green-bitcoin" textColor="white" />
);

export default {
  title: "Components/Badge",
  component: Badge,
};
