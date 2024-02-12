import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { classNames } from "~/app/utils";

type Props = {
  position?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
};

function List({ position = "left", fullWidth, children }: Props) {
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
        className={classNames(
          position === "left"
            ? "left-0 origin-top-left"
            : "right-0 origin-top-right",
          fullWidth ? "w-full" : "w-56",
          "absolute z-50 mt-2 overflow-hidden rounded-xl shadow-lg bg-white focus:outline-none dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700"
        )}
      >
        {children}
      </Menu.Items>
    </Transition>
  );
}

export default List;
