type Props = {
  label: string;
  color: string;
  textColor: string;
  small?: boolean;
};

export default function Badge({ label, color, textColor, small }: Props) {
  return (
    <span
      className={`inline-block leading-none rounded font-medium bg-${color} text-${textColor} ${
        !small ? "p-1.5 text-xs" : "p-1 text-xxxs"
      }`}
    >
      {label}
    </span>
  );
}
