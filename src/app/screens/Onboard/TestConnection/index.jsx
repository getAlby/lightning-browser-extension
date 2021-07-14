import React from "react";
import Button from "../../../components/button";
import Card from "../../../components/card";
import { useHistory } from "react-router-dom";

export default function TestConnection() {
  const history = useHistory();

  return (
    <div>
      <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="relative">
          <div className="mt-12">
            <h1 className="text-3xl font-bold mt-4">Connection success! 🎉</h1>
            <p className="text-gray-500 mt-6">
              Awesome we were able to connect to your lightning node.
              <br />
              Please check that all details are correct.
            </p>

            <div className="mt-6 shadow p-4 rounded-lg">
              <Card
                Card
                color="red-bitcoin"
                alias="HeroNode"
                satoshis="12350283"
                fiat="32480.56"
                currency="EUR"
              />

              <div className="px-4 py-5 sm:p-0 ">
                <div className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-semibold text-black">
                      Channels
                    </dt>
                    <dd className="mt-1 font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      3
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-semibold text-black">
                      Node URL
                    </dt>
                    <dd className="mt-1 font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      regtest-bob.nomadiclabs.net
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mt-8">
                Now you’ve connected your node would you like to go through a
                tutorial?
              </p>

              <div className="mt-8">
                <span className="underline text-gray-500 mr-4">
                  Skip tutorial
                </span>
                <Button label="GO TO DEMO PUBLISHER" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center"
          aria-hidden="true"
        >
          <img src="https://i.ibb.co/rcLR6MK/Frame-19.png" />
        </div>
      </div>
    </div>
  );
}
