import { classNames } from "~/app/utils";

type Props = {
  type: "warn" | "info";
  children: React.ReactNode;
};

export default function Alert({ type, children }: Props) {
  return (
    <div
      className={classNames(
        "rounded-md p-3",
        type == "warn" &&
          "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900 border border-orange-100",
        type == "info" &&
          "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 border border-blue-100"
      )}
    >
      {children}
    </div>
  );
}
