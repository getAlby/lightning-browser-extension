import { InfoIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import { classNames } from "~/app/utils";

type Props = {
  type: "warn" | "info";
  children: React.ReactNode;
};

export default function Alert({ type, children }: Props) {
  return (
    <div
      className={classNames(
        "rounded-md p-4",
        type == "warn" &&
          "text-orange-700 bg-orange-50 dark:text-orange-200 dark:bg-orange-900",
        type == "info" &&
          "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900"
      )}
    >
      {type == "info" && (
        <InfoIcon className="w-6 h-6 float-left rounded-full border border-1 border-blue-700  dark:border-blue-300 mr-2 " />
      )}
      <p className={type == "info" ? "ml-8" : ""}>{children}</p>
    </div>
  );
}
