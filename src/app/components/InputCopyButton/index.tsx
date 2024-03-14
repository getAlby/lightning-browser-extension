import { PopiconsCopyLine } from "@popicons/react";
import { t } from "i18next";
import toast from "~/app/components/Toast";
import { classNames } from "~/app/utils";

type Props = {
  value: string;
  className?: string;
};

function InputCopyButton({ value, className }: Props) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={classNames(
        "flex justify-center items-center h-8 w-10",
        "text-gray-400 dark:text-neutral-600 hover:text-gray-600 hover:dark:text-neutral-400",
        !!className && className
      )}
      onClick={async () => {
        try {
          navigator.clipboard.writeText(value);
          toast.success(t("common:actions.copied_to_clipboard"));
        } catch (e) {
          if (e instanceof Error) {
            toast.error(e.message);
          }
        }
      }}
    >
      <PopiconsCopyLine className="w-6 h-6" />
    </button>
  );
}
export default InputCopyButton;
