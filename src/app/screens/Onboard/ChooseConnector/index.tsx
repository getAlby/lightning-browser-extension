import LinkButton from "../../../components/LinkButton";

import lnbits from "/static/assets/icons/lnbits.png";
import lndhub from "/static/assets/icons/lndhub.png";
import lnd from "/static/assets/icons/lnd.png";
import alby from "/static/assets/icons/alby.png";

export default function ChooseConnector() {
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
      to: "create-wallet",
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you",
      logo: alby,
    },
  ];

  return (
    <div className="relative mt-14 lg:grid  lg:gap-8 text-center">
      <div className="relative">
        <h1 className="text-3xl font-bold">Do you have a lightning wallet?</h1>
        <p className="text-gray-500 my-6">
          You need to first connect to a lightning wallet so that you can
          interact with <br /> your favorite websites that accept bitcoin
          lightning payments!
        </p>
        <div className="grid grid-cols-4 gap-4">
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
