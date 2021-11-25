import { Routes, Route } from "react-router-dom";

import LinkButton from "../../../components/LinkButton";

import ConnectLnd from "../ConnectLnd";
import ConnectLndHub from "../ConnectLndHub";
import ConnectLnbits from "../ConnectLnbits";
import NewWallet from "../NewWallet";

export default function ChooseConnector() {
  const connectors = [
    {
      to: "lnd",
      title: "LND",
      description: "Connect to your LND node",
    },
    {
      to: "lnd-hub",
      title: "LNDHub (Bluewallet)",
      description: "Connect to your Bluewallet mobile wallet",
    },
    {
      to: "lnbits",
      title: "LNbits",
      description: "Connect to your LNbits account",
    },
    {
      to: "create-wallet",
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you",
    },
  ];

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="relative mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="relative">
              <h1 className="text-3xl font-bold">
                Do you have a lightning wallet?
              </h1>
              <p className="text-gray-500 my-6">
                You need to first connect to a lightning wallet so that you can
                interact with your favorite websites that accept bitcoin
                lightning payments!
              </p>
              <div className="space-y-4">
                {connectors.map(({ to, title, description }) => (
                  <LinkButton
                    key={to}
                    to={to}
                    title={title}
                    description={description}
                  />
                ))}
              </div>
            </div>
          </div>
        }
      />
      <Route path="lnd" element={<ConnectLnd />} />
      <Route path="lnd-hub" element={<ConnectLndHub />} />
      <Route path="lnbits" element={<ConnectLnbits />} />
      <Route path="create-wallet" element={<NewWallet />} />
    </Routes>
  );
}
