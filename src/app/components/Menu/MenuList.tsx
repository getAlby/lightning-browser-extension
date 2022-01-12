import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

type Props = {
  position?: string;
  children: React.ReactNode;
};

function List({ position = "left", children }: Props) {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Menu.Items
        className={`${
          position === "left"
            ? "left-0 origin-top-left"
            : "right-0 origin-top-right"
        } absolute z-50 mt-2 py-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:border dark:border-gray-500`}
      >
        {children}
      </Menu.Items>
    </Transition>
  );
}

export default List;
