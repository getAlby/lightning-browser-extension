import { useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

type Props = {
  label: "budget" | "auth" | "imported";
  className: string;
};

export default function Badge({ label, className }: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "badge",
  });

  return (
    <span
      className={classNames(
        "inline-block leading-none rounded-full font-medium mr-2 py-1 px-2 text-xs",
        className
      )}
    >
      {tComponents(`label.${label}`)}
    </span>
  );
}
