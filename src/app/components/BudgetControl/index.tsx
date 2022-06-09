import { Transition } from "@headlessui/react";
import { ChangeEventHandler } from "react";

import Checkbox from "../form/Checkbox";
import DualCurrencyField from "../form/DualCurrencyField";

type Props = {
  remember: boolean;
  onRememberChange: ChangeEventHandler<HTMLInputElement>;
  budget: string;
  onBudgetChange: ChangeEventHandler<HTMLInputElement>;
  fiatAmount: string;
};

function BudgetControl({
  remember,
  onRememberChange,
  budget,
  onBudgetChange,
  fiatAmount,
}: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        <Checkbox
          id="remember_me"
          name="remember_me"
          checked={remember}
          onChange={onRememberChange}
        />
        <label
          htmlFor="remember_me"
          className="ml-2 block text-sm text-gray-900 font-medium dark:text-white"
        >
          Remember and set a budget
        </label>
      </div>

      <Transition
        show={remember}
        enter="transition duration-100 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
      >
        <p className="my-3 text-gray-500 text-sm">
          You may set a balance to not be asked for confirmation on payments
          until it is exhausted.
        </p>
        <div>
          <DualCurrencyField
            fiatValue={fiatAmount}
            id="budget"
            label="Budget"
            placeholder="sats"
            value={budget}
            onChange={onBudgetChange}
          />
        </div>
      </Transition>
    </div>
  );
}

export default BudgetControl;
