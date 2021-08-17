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
      title: "Connect to your remote node",
      description: "Currently we only support LND.",
    },
    {
      to: `${url}/lnd-hub`,
      title: "Connect to your mobile wallet",
      description: "Currently we only support BlueWallet.",
    },
    { to: `${url}/create-wallet`, title: "I don’t have a lightning node" },
  ];

  return (
    <Switch>
      <Route exact path={path}>
        <div className="relative mt-20 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative">
            <h1 className="text-3xl font-bold">
              Do you have a lightning node?
            </h1>
            <p className="text-gray-500 my-6">
              You need to first connect to a funded lightning node so that you
              can interact with your favorite publishers that accept bitcoin
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
