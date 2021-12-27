import Features from "./features";
import Button from "../../../components/Button";
import {
  CodeIcon,
  KeyIcon,
  LightningIcon,
  ShieldIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useNavigate } from "react-router-dom";

const features = [
  {
    name: "Send in One Click",
    description:
      "Lightning transactions happen all in your browser. No alt+tab or QR-code scanning needed.",
    icon: LightningIcon,
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
    icon: ShieldIcon,
  },
  {
    name: "Free and Open Source",
    description:
      "Completely open code that can be audited by anyone. No stats or trackers. You are in control.",
    icon: CodeIcon,
  },
];

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-14 bg-white dark:bg-gray-800 px-10 py-12 items-center">
        <div className="lg:col-span-1">
          <div className="max-w-xs">
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
          </div>
        </div>
        <div className="mt-10 lg:mt-0 lg:col-span-2">
          <Features features={features} />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => navigate("/set-password")}
          type="button"
          label="Get Started"
          primary
        />
      </div>
    </div>
  );
}
