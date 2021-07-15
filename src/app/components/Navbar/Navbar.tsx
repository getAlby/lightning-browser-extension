import React from "react";
import Skeleton from "react-loading-skeleton";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";
import {
  ChevronDownIcon,
  CogIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/solid";

import utils from "../../../common/lib/utils";
import Menu from "../Menu";

type Props = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function Navbar({ title, subtitle, children }: Props) {
  function openOptions() {
    if (window.location.pathname !== "/options.html") {
      utils.openPage("options.html");
      window.close();
    }
  }

  async function lock() {
    try {
      await utils.call("lock");
      window.close();
    } catch (e) {
      console.log(e.message);
    }
  }

  return (
    <div className="px-5 py-2 flex justify-between items-center border-b border-gray-200">
      <div className="w-8/12 md:w-4/12 lg:w-3/12 flex items-center">
        <img
          className="-ml-1 mr-4 w-8 h-8 opacity-50"
          src={WalletIcon}
          alt=""
          aria-hidden="true"
        />
        <div className="flex-auto">
          <div className="text-sm text-gray-500">{title || <Skeleton />}</div>
          <div className="text-sm">{subtitle || <Skeleton />}</div>
        </div>
      </div>
      {children && (
        <div>
          <nav className="flex space-x-8">{children}</nav>
        </div>
      )}
      <div className="md:w-4/12 lg:w-3/12 flex justify-end items-center">
        <Menu>
          <Menu.Button className="inline-flex items-center text-gray-500 hover:text-black transition-color duration-200">
            <UserIcon className="h-6 w-6" aria-hidden="true" />
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
          </Menu.Button>
          <Menu.List>
            <Menu.Item onClick={openOptions}>
              <div className="flex">
                <CogIcon
                  className="h-5 w-5 mr-2 text-gray-500"
                  aria-hidden="true"
                />
                Options
              </div>
            </Menu.Item>
            <Menu.Item onClick={lock}>
              <div className="flex">
                <LockClosedIcon
                  className="h-5 w-5 mr-2 text-gray-500"
                  aria-hidden="true"
                />
                Lock
              </div>
            </Menu.Item>
          </Menu.List>
        </Menu>
      </div>
    </div>
  );
}
