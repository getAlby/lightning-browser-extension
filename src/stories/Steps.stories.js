import React from "react";
import Steps from "../app/components/steps";
import { MemoryRouter } from "react-router-dom";

const steps = [
  { id: "Step 1", name: "Job details", status: "complete" },
  { id: "Step 2", name: "Application form", href: "#", status: "current" },
  { id: "Step 3", name: "Preview", href: "#", status: "upcoming" },
];

export const Primary = () => <Steps steps={steps} />;
export const WithoutLinks = () => (
  <Steps steps={steps.map((step) => ({ ...step, href: null }))} />
);

export default {
  title: "Components/Steps",
  component: Steps,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
