import LinkButton from "../../../components/LinkButton";

import lnbits from "/static/assets/icons/lnbits.png";
import lndhub from "/static/assets/icons/lndhub.png";
import lnd from "/static/assets/icons/lnd.png";
import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.jpg";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import eclair from "/static/assets/icons/eclair.jpg";
import alby from "/static/assets/icons/alby.png";

type Props = {
  title: string;
  description?: string;
};

export default function ChooseConnector({ title, description }: Props) {
  const connectors = [
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
      to: "create-wallet",
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you",
      logo: alby,
    },
    {
      to: "galoy-bitcoin-beach",
      title: "Bitcoin Beach Wallet",
      description: "Create or connect to a Bitcoin Beach (Galoy) account",
      logo: galoyBitcoinBeach,
    },
    {
      to: "galoy-bitcoin-jungle",
      title: "Bitcoin Jungle Wallet",
      description: "Create or connect to a Bitcoin Jungle (Galoy) account",
      logo: galoyBitcoinJungle,
    },
  ];

  return (
    <div className="relative mt-14 lg:grid  lg:gap-8 text-center">
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
