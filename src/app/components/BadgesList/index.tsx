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
      className: "bg-blue-500 text-white",
    });
  }
  if (allowance.lnurlAuth) {
    badges.push({
      label: "auth",
      className: "bg-green-bitcoin text-white",
    });
  }

  return (
    <>
      {badges?.map((b) => {
        return <Badge key={b.label} label={b.label} className={b.className} />;
      })}
    </>
  );
}
