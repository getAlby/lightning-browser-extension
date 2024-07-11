import Badge from "@components/Badge";
import { useTranslation } from "react-i18next";
import type { Allowance, Badge as BadgeType } from "~/types";

type Props = {
  allowance: Allowance;
};

export default function BadgesList({ allowance }: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "badge",
  });
  const badges: BadgeType[] = [];
  if (allowance.remainingBudget > 0) {
    badges.push({
      label: "budget",
      className: "bg-blue-500 text-white mr-2",
    });
  }
  if (allowance.lnurlAuth) {
    badges.push({
      label: "auth",
      className: "bg-green-bitcoin text-white mr-2",
    });
  }

  return (
    <>
      {badges?.map((b) => {
        return (
          <Badge
            key={b.label}
            label={tComponents(`label.${b.label}`)}
            className={b.className}
          />
        );
      })}
    </>
  );
}
