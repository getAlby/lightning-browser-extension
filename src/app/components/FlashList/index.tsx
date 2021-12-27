import { classNames } from "../../utils/index";
import flash from "/static/assets/icons/flash.svg";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  prefix: string;
  suffix?: string;
  subtitle?: string;
  used?: boolean;
  image?: string;
};

export default function FlashList({
  prefix,
  suffix,
  subtitle,
  used = false,
  image = flash,
}: Props) {
  return (
    <div>
      <div
        className={classNames(
          used
            ? "flex space-x-2  font-serif font-medium text-xl"
            : `flex space-x-2 font-serif font-medium text-lg text-[#3F3F3F] my-5`
        )}
      >
        <span>{prefix}</span>
        <img src={image} className="w-6 h" />
        <span>{suffix}</span>
      </div>
      <div className="my-1">
        <span className="font-serif text-base font-normal text-light-gray-bitcoin2">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
