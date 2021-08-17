import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import LinkButton from "../../../components/LinkButton";

import ConnectLnd from "../ConnectLnd";
import ConnectLndHub from "../ConnectLndHub";

export default function ChooseConnector() {
  let { path, url } = useRouteMatch();
  const connectors = [
    {
      to: `${url}/lnd`,
      title: "LND",
      description: "Connect to your LND node",
    },
    {
      to: `${url}/lnd-hub`,
      title: "LNDHub (Bluewallet)",
      description: "Connect to your Bluewallet mobile wallet",
    },
    {
      to: `${url}/create-wallet`,
      title: "Create a new wallet",
      description: "We create and manage a lightning wallet for you"
    },
  ];

  return (
    <Switch>
      <Route exact path={path}>
        <div className="relative mt-20 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative">
            <h1 className="text-3xl font-bold">
              Do you have a lightning wallet?
            </h1>
            <p className="text-gray-500 my-6">
              You need to first connect to a lightning wallet so that you
              can interact with your favorite websites that accept bitcoin
              lightning payments!
            </p>
            <div className="space-y-4">
              {connectors.map(({ to, title, description }) => (
                <LinkButton to={to} title={title} description={description} />
              ))}
            </div>
          </div>
        </div>
      </Route>
      <Route path={`${path}/lnd`}>
        <ConnectLnd />
      </Route>
      <Route path={`${path}/lnd-hub`}>
        <ConnectLndHub />
      </Route>
      <Route path={`${path}/create-wallet`}>
        <div className="mt-20">Create a new BlueWallet account...</div>
      </Route>
    </Switch>
  );
}
