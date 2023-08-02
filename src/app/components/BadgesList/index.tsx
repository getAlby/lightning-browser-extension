import Badge from "@components/Badge";
import type { Allowance, Badge as BadgeType } from "~/types";

type Props = {
  allowance: Allowance;
};

export default function BadgesList({ allowance }: Props) {
  const badges: BadgeType[] = [];
  if (allowance.remainingBudget > 0) {
    badges.push({
      label: "budget",
      color: "green-bitcoin",
      textColor: "white",
    });
  }
  if (allowance.lnurlAuth) {
    badges.push({
      label: "auth",
      color: "green-bitcoin",
      textColor: "white",
    });
  }

  return (
    <>
      {badges?.map((b) => {
        return (
          <Badge
            key={b.label}
            label={b.label}
            color={b.color}
            textColor={b.textColor}
          />
        );
      })}
    </>
  );
}
