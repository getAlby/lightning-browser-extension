import { classNames } from "~/app/utils";

type Props = {
  title: string;
  subtitle: string | React.ReactNode;
  children: React.ReactNode;
  inline?: boolean;
};

function Setting({ title, subtitle, children, inline }: Props) {
  return (
    <div
      className={classNames(
        inline ? "" : "flex-col sm:flex-row",
        "flex justify-between py-4"
      )}
    >
      <div>
        <span className="text-gray-800 dark:text-white font-medium">
          {title}
        </span>
        <p className="text-gray-600 mr-1 dark:text-neutral-400 text-sm">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

export default Setting;
