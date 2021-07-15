import React from "react";
import {
  ChevronDownIcon,
  CogIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/solid";

import utils from "../../../common/lib/utils";
import Menu from "../Menu";

export default function UserMenu() {
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
  );
}
