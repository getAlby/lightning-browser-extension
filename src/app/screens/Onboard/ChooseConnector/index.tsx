import LinkButton from "../../../components/LinkButton";

import lnbits from "/static/assets/icons/lnbits.png";
import lndhub from "/static/assets/icons/lndhub.png";
import lnd from "/static/assets/icons/lnd.png";
import eclair from "/static/assets/icons/eclair.jpg";
import alby from "/static/assets/icons/alby.png";
import umbrel from "/static/assets/icons/umbrel.png";
import start9 from "/static/assets/icons/start9.png";
import citadel from "/static/assets/icons/citadel.png";
import mynode from "/static/assets/icons/mynode.png";

type Props = {
  title: string;
  description?: string;
};

export default function ChooseConnector({ title, description }: Props) {
  const connectors = [
    {
      to: "create-wallet",
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you",
      logo: alby,
    },
    {
      to: "lnd",
      title: "LND",
      description: "Connect to your LND node",
      logo: lnd,
    },
    {
      to: "lnd-hub",
      title: "LNDHub (Bluewallet)",
      description: "Connect to your Bluewallet mobile wallet",
      logo: lndhub,
    },
    {
      to: "lnbits",
      title: "LNbits",
      description: "Connect to your LNbits account",
      logo: lnbits,
    },
    {
      to: "eclair",
      title: "Eclair",
      description: "Connect to your Eclair node",
      logo: eclair,
    },
    {
      to: "citadel",
      title: "Citadel",
      description: "Connect to your local Citadel",
      logo: citadel,
    },
    {
      to: "umbrel",
      title: "Umbrel",
      description: "Connect to your Umbrel",
      logo: umbrel,
    },
    {
      to: "mynode",
      title: "myNode",
      description: "Connect to your myNode",
      logo: mynode,
    },
    {
      to: "start9",
      title: "Start9",
      description: "Connect to your Embassy",
      logo: start9,
    },
  ];

  return (
    <div className="relative my-14 lg:grid  lg:gap-8 text-center">
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-6 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-5 gap-5">
          {connectors.map(({ to, title, description, logo }) => (
            <LinkButton
              key={to}
              to={to}
              title={title}
              description={description}
              logo={logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
