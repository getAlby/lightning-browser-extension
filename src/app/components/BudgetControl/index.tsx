import Checkbox from "@components/form/Checkbox";
import DualCurrencyField from "@components/form/DualCurrencyField";
import { Transition } from "@headlessui/react";
import { ChangeEventHandler } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  remember: boolean;
  onRememberChange: ChangeEventHandler<HTMLInputElement>;
  budget: string;
  onBudgetChange: ChangeEventHandler<HTMLInputElement>;
  fiatAmount: string;
  disabled?: boolean;
};

function BudgetControl({
  remember,
  onRememberChange,
  budget,
  onBudgetChange,
  fiatAmount,
  disabled = false,
}: Props) {
  const { t } = useTranslation("components", {
    keyPrefix: "budget_control",
  });

  const { t: tCommon } = useTranslation("common");

  return (
    <div className="mb-4">
      <div className={`flex items-center`}>
        <Checkbox
          id="remember_me"
          name="remember_me"
          checked={remember}
          onChange={onRememberChange}
          disabled={disabled}
        />
        <label
          htmlFor="remember_me"
          className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
        >
          {t("remember.label")}
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
          {t("remember.description")}
        </p>

        <div>
          <DualCurrencyField
            autoFocus
            fiatValue={fiatAmount}
            id="budget"
            min={0}
            label={t("budget.label")}
            placeholder={tCommon("sats", { count: 0 })}
            value={budget}
            onChange={onBudgetChange}
          />
        </div>
      </Transition>
    </div>
  );
}

export default BudgetControl;
