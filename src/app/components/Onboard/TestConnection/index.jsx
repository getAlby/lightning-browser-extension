import React from "react";
import Template from "../Shared/template";
import Button from '../../Shared/button'
import Card from '../Shared/card'
export default function TestConnection() {
  return (
    <Template>
      <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
        <div className="relative">
          <div className="mt-12">
            <h1 className="text-3xl font-bold mt-4">Connection success!</h1>
            <p className="text-base text-gray-500 mt-6">
              Awesome we were able to connect to your lightning node. Are these
              these correct details?
            </p>
            <Card topLabel="HeroNode" heading="12,350,283 SATS" lastLabel="€ 32,480.56" />

            <div className="px-4 py-5 sm:p-0 ">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-lg font-semibold text-black">Channels</dt>
                  <dd className="mt-1 text-base font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    3
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-lg font-semibold text-black">Node URL</dt>
                  <dd className="mt-1 text-base font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    regtest-bob.nomadiclabs.net
                  </dd>
                </div>
              </dl>
              <div className="float-right">
                <Button label="Yes looks good" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
          <img src="https://i.ibb.co/rcLR6MK/Frame-19.png" />
        </div>
      </div>
    </Template>
  );
}
