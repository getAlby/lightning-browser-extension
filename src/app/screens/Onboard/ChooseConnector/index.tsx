import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import LinkButton from "../../../components/LinkButton";

import ConnectLnd from "../ConnectLnd";
import ConnectLndHub from "../ConnectLndHub";

export default function ChooseConnector() {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative">
            <h1 className="text-3xl font-bold mt-4">
              Do you have a lightning node?
            </h1>
            <p className="text-gray-500 my-6">
              You need to first connect to a funded lightning node so that you
              can interact with your favorite publishers that accept bitcoin
              lightning payments!
            </p>
            <div className="space-y-4">
              <LinkButton
                to={`${url}/lnd`}
                title="Connect to your remote node"
                description="Currently we only support LND."
              />
              <LinkButton
                to={`${url}/lnd-hub`}
                title="Connect to your mobile wallet"
                description="Currently we only support BlueWallet."
              />
              <LinkButton
                to={`${url}/create-wallet`}
                title="I don’t have a lightning node"
              />
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
        Create a new BlueWallet account...
      </Route>
    </Switch>
  );
}
