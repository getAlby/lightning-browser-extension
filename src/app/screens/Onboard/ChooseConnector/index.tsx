import React from "react";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/outline";

import ConnectLnd from "../ConnectLnd";

function LinkButton({ to, title, description }) {
  return (
    <Link to={to} className="block">
      <div className="p-4 flex justify-between items-center shadow overflow-hidden border-b border-gray-200 rounded-lg">
        <div>
          <span className="block">{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </div>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </div>
    </Link>
  );
}

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
                title="LND"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              />
              <LinkButton
                to={`${url}/lnd-hub`}
                title="LndHub"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              />
              <LinkButton
                to={`${url}/get-a-new-wallet`}
                title="Get a new wallet"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              />
            </div>
          </div>
        </div>
      </Route>
      <Route path={`${path}/lnd`}>
        <ConnectLnd />
      </Route>
      <Route path={`${path}/lnd-hub`}>Lnd Hub</Route>
      <Route path={`${path}/get-a-new-wallet`}>Get a new wallet</Route>
    </Switch>
  );
}
