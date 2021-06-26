import { Popover } from "@headlessui/react";
import { classNames } from "../../../utils/index";
import { CogIcon, LightningBoltIcon } from "@heroicons/react/outline";
import {
  OfficeBuildingIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/solid";

const tabs = [
  { name: "Publishers", href: "#", icon: UserIcon, current: true },
  { name: "Send", href: "#", icon: OfficeBuildingIcon, current: false },
  { name: "Recieve", href: "#", icon: UsersIcon, current: false },
];


export default function Navbar() {
  return (
    <div className="border-b-2 border-gray-100 h-16">
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? "fixed inset-0 z-40 overflow-y-auto" : "",
            "bg-white lg:static lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
                <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="flex-shrink-0 flex items-center">
                    <a className="text-gray-500">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </a>
                    <div className="relative ml-4">
                      <p className="text-sm font-extralight block text-gray-400">
                        myNode
                      </p>
                      <p className="text-sm font-semibold">
                        ₿ 0.0016 7930 €33.57
                      </p>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6 ml-auto">
                  <div>
                    <div className="sm:hidden">
                      <label htmlFor="tabs" className="sr-only">
                        Select a tab
                      </label>
                      <select
                        id="tabs"
                        name="tabs"
                        className="block w-full focus:ring-orange-bitcoin focus:border-orange-bitcoin border-gray-300 rounded-md"
                        defaultValue={tabs.find((tab) => tab.current).name}
                      >
                        {tabs.map((tab) => (
                          <option key={tab.name}>{tab.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden sm:block">
                      <div className="">
                        <nav
                          className="-mb-px flex space-x-12"
                          aria-label="Tabs"
                        >
                          {tabs.map((tab) => (
                            <a
                              key={tab.name}
                              href={tab.href}
                              className={classNames(
                                tab.current
                                  ? "border-orange-bitcoin text-orange-bitcoin"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm font-semibold"
                              )}
                              aria-current={tab.current ? "page" : undefined}
                            >
                              <span>{tab.name}</span>
                            </a>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                  <a className="ml-5 flex-shrink-0 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">View notifications</span>
                    <CogIcon className="h-6 w-6" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </Popover>
    </div>
  );
}
