import { classNames } from "~/app/utils";

type Props = {
  type: "warn" | "info";
  children: React.ReactNode;
};

export default function Alert({ type, children }: Props) {
  return (
    <div
      className={classNames(
        "border rounded-md p-3",
        type == "warn" &&
          "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900  border-orange-100 dark:border-orange-900",
        type == "info" &&
          "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-900"
      )}
    >
      {children}
    </div>
  );
}
