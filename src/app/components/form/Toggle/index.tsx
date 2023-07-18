import { Switch } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({ checked, disabled, onChange }: Props) {
  return (
    <Switch
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      className={classNames(
        checked ? "bg-primary-gradient" : "bg-gray-300 dark:bg-surface-00dp",
        "relative inline-flex bg-origin-border shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
