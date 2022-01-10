import { Switch } from "@headlessui/react";

import { classNames } from "../../utils/index";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({ checked, onChange }: Props) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className={classNames(
        checked ? "bg-orange-bitcoin" : "bg-gray-200",
        "relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-bitcoin"
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(
          checked ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ease-in-out duration-200"
        )}
      />
    </Switch>
  );
}
