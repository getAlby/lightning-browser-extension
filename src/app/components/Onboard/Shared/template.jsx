import React from "react";
import Steps  from "../Shared/steps";

const steps = [
  { id: "Step 1", name: "Job details", href: "#", status: "complete" },
  { id: "Step 2", name: "Application form", href: "#", status: "current" },
  { id: "Step 3", name: "Preview", href: "#", status: "upcoming" },
];

export default function Template({ children }) {
  return (
    <div className="bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Steps steps={steps} />
        {children}
      </div>
    </div>
  );
}
