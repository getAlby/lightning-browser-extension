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
          "text-orange-700 bg-orange-50 dark:text-orange-200 dark:bg-orange-900",
        type == "info" &&
          "text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-900"
      )}
    >
      <p>{children}</p>
    </div>
  );
}
