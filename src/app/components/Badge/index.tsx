import { useTranslation } from "react-i18next";

type Props = {
  label: string;
  color: string;
  textColor: string;
  small?: boolean;
};

export default function Badge({
  label = "active",
  color,
  textColor,
  small,
}: Props) {
  const { t: tComponents } = useTranslation("components");

  return (
    <span
      className={`inline-block leading-none rounded font-medium mr-2 bg-${color} text-${textColor} ${
        !small ? "p-1.5 text-xs" : "p-1 text-xxxs"
      }`}
    >
      {tComponents(`badge.label.${label as "active"}`)}
    </span>
  );
}
