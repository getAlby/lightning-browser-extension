import React from "react";
import Features from "./features";
import Button from "../../../components/button";
import {
  LightningBoltIcon,
  ArrowRightIcon,
  EyeOffIcon,
  CodeIcon,
  KeyIcon,
} from "@heroicons/react/outline";
import { useHistory } from "react-router-dom";

const features = [
  {
    name: "Send in One Click",
    description:
      "Lightning transactions happen all in your browser. No alt+tab or QR-code scanning needed.",
    icon: LightningBoltIcon,
  },
  {
    name: "No more annoying paywalls",
    description:
      "Define individual budgets for websites to enable seamless payment streams. No more annoying paywalls.",
    icon: KeyIcon,
  },
  {
    name: "Privacy first",
    description: "Use lightning to authenticate and control your privacy.",
    icon: EyeOffIcon,
  },
  {
    name: "Free and Open Source",
    description:
      "Completely open code that can be audited by anyone. No stats or trackers. You are in control.",
    icon: CodeIcon,
  },
];

export default function Intro() {
  const history = useHistory();

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-20">
        <div className="lg:col-span-1 ml-12 mt-8">
          <div className="h-32 max-w-xs">
            <img
              src="assets/icons/satsymbol.svg"
              alt="Sats"
              className="max-w-xs"
            />
          </div>
          <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            The power of lightning in your browser
          </h2>
        </div>
        <Features features={features} />
      </div>
      <div className="sm:py-16 sm:px-6 lg:px-8 float-right">
        <Button
          onClick={() => history.push("/set-password")}
          type="button"
          label="Get Started"
        ></Button>
      </div>
    </div>
  );
}
