import React from "react";
import Tabs from "../app/components/Tabs";

const tabs = [
  { name: "Basics", href: "#", current: true },
  { name: "Details", href: "#", current: false },
];

export const Primary = () => <Tabs tabs={tabs} />;

export default {
  title: "Components/Tabs",
  component: Tabs,
};
