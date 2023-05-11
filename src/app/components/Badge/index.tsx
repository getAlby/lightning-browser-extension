import { useTranslation } from "react-i18next";

type Props = {
  label: "active" | "auth";
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
      className={`inline-block leading-none rounded-full font-medium mr-2 py-1 bg-${color} text-${textColor} ${
        !small ? "px-2 text-xs" : "px-1.5 text-xxxs"
      }`}
    >
      {tComponents(`label.${label}`)}
    </span>
  );
}
