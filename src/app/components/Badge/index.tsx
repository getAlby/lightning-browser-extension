import { useTranslation } from "react-i18next";

type Props = {
  label: "active" | "auth" | "imported";
  color: string;
  textColor: string;
  small?: boolean;
};

export default function Badge({ label, color, textColor, small }: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "badge",
  });

  return (
    <span
      className={`inline-block leading-none rounded font-medium mr-2 bg-${color} text-${textColor} ${
        !small ? "p-1.5 text-xs" : "p-1 text-xxxs"
      }`}
    >
      {tComponents(`label.${label}`)}
    </span>
  );
}
