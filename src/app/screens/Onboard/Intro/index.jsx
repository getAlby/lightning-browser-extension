import React from "react";

import LinkButton from "../../../components/LinkButton";

export default function Intro() {
  const connectors = [
    {
      to: `/connect/lnd`,
      title: "LND",
      description: "Connect to your LND node",
    },
    {
      to: `/connect/lnd-hub`,
      title: "LNDHub (Bluewallet)",
      description: "Connect to your Bluewallet mobile wallet",
    },
    {
      to: `/connect/lnbits`,
      title: "LNbits",
      description: "Connect to your LNbits account",
    },
    {
      to: `/connect/create-wallet`,
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you",
    },
  ];

  return (
    <div className="mt-24 lg:grid lg:grid-cols-2 lg:divide-x-2">
      <div className="mb-16 lg:mb-0 lg:pr-20">
        <div className="max-w-xs">
          <img
            src="assets/icons/satsymbol.svg"
            alt="Sats"
            className="max-w-xs"
          />
        </div>
        <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:max-w-xs">
          The power of lightning in your browser
        </h2>
      </div>
      <div className="lg:pl-20">
        <h1 className="text-3xl font-bold">Let's get started</h1>
        <p className="text-gray-500 my-6">
          You need to first connect to a lightning wallet so that you can
          interact with your favorite websites that accept bitcoin lightning
          payments!
        </p>
        <div className="space-y-4">
          {connectors.map(({ to, title, description }) => (
            <LinkButton to={to} title={title} description={description} />
          ))}
        </div>
      </div>
    </div>
  );
}
