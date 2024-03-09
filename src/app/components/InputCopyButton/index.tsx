import { PopiconsCopyLine, PopiconsCopySolid } from "@popicons/react";
import { useState } from "react";
import toast from "~/app/components/Toast";
import { classNames } from "~/app/utils";

type Props = {
  value: string;
  className?: string;
};

function InputCopyButton({ value, className }: Props) {
  const [copied, setCopied] = useState(false);
  const CurrentIcon = copied ? PopiconsCopySolid : PopiconsCopyLine;
  return (
    <button
      type="button"
      tabIndex={-1}
      className={classNames(
        "flex justify-center items-center h-8 w-10",
        !!className && className
      )}
      onClick={async () => {
        try {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        } catch (e) {
          if (e instanceof Error) {
            toast.error(e.message);
          }
        }
      }}
    >
      <CurrentIcon className="w-6 h-6" />
    </button>
  );
}
export default InputCopyButton;
