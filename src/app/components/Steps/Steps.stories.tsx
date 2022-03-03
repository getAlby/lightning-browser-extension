import { MemoryRouter } from "react-router-dom";
import { Meta } from "@storybook/react/types-6-0";

import type { Step } from ".";
import Steps from ".";

const steps: Step[] = [
  { id: "Step 1", href: "#", status: "complete" },
  { id: "Step 2", href: "#", status: "current" },
  { id: "Step 3", status: "upcoming" },
];

export const Primary = () => <Steps steps={steps} />;
export const WithoutLinks = () => (
  <Steps steps={steps.map((s) => ({ ...s, href: "" }))} />
);

const metadata: Meta = {
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

export default metadata;
