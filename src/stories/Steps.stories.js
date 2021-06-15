import React from "react";
import Steps from "../app/components/Onboard/Shared/steps";
import "../app/styles/index.css";

const steps = [
  { id: "Step 1", name: "Job details", href: "#", status: "complete" },
  { id: "Step 2", name: "Application form", href: "#", status: "current" },
  { id: "Step 3", name: "Preview", href: "#", status: "upcoming" },
];

export const Primary = () => <Steps steps={steps} />;

export default {
  title: "Components/Steps",
  component: Steps,
};
